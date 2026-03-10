import React, { useState, useEffect } from "react";
import {
    Alert,
    Panel,
    PanelHeader,
    Group,
    Cell,
    Slider,
    Button,
    FixedLayout,
    Card,
    Banner,
    SegmentedControl,
    Text,
    Title,
    Separator,
    Div,
    Image
} from "@vkontakte/vkui";
import { Icon24Rocket, Icon24User, Icon24Users } from "@vkontakte/icons";

import LogoImage from '../assets/logo_lotos_2.png';
import LogoImageMin from '../assets/logo_lotos.png';
import bridge from "@vkontakte/vk-bridge";

interface HomeProps {
    id: string;
}

export const Home: React.FC<HomeProps> = ({ id }) => {
    const [months, setMonths] = useState<number>(1);
    const [groupSessions, setGroupSessions] = useState<number>(10);
    const [personalSessions, setPersonalSessions] = useState<number>(5);

    const [alertShown, setAlertShown] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [user, setUser] = useState<any>(null);

    const groupPrice = 580;
    const personalPrice = 1250;

    const coefficients: Record<number, number> = {
        1: 1,
        3: 0.95,
        6: 0.90,
        12: 0.85
    };

    const discountPercent = Math.round((1 - coefficients[months]) * 100);
    const isDiscount = discountPercent > 0;

    const total =
        (groupSessions * groupPrice + personalSessions * personalPrice) *
        coefficients[months];

    const formattedTotal = new Intl.NumberFormat("ru-RU").format(Math.round(total));

    // Получаем данные пользователя VK при загрузке
    useEffect(() => {
        setUser({
            id: 230959721,
            first_name: "Test",
            last_name: "User",
            photo_200: "https://via.placeholder.com/200"
        });
        console.log("Запуск useEffect")
        bridge.send("VKWebAppGetUserInfo")
            .then((data) => {
                setUser(data);
                console.log(data)
            })
            .catch((error) => {
                console.log(error);
                // локальная разработка
                console.log("Получили локально")
                setUser({
                    id: 230959721,
                    first_name: "Test",
                    last_name: "User",
                    photo_200: "https://via.placeholder.com/200"
                });
        });
    }, []);

    const handlePersonSessionsChange = (value: number) => {
        if (value >= 6 && months < 3) {
            setAlertMessage("Для более 5 индивидуальных занятий минимальный срок 3 месяца");
            setPersonalSessions(5);
            return;
        }
        if (value >= 16 && months < 6) {
            setAlertMessage("Для более 15 индивидуальных занятий минимальный срок 6 месяцев");
            setPersonalSessions(15);
            return;
        }
        if (value >= 31 && months < 12) {
            setAlertMessage("Для более 30 индивидуальных занятий минимальный срок 12 месяцев");
            setPersonalSessions(30);
            return;
        }
        setPersonalSessions(value);
    };

    const handleGroupSessionsChange = (value: number) => {
        if (value >= 21 && months < 3) {
            setAlertMessage("Для более 20 групповых занятий минимальный срок 3 месяца");
            setGroupSessions(20);
            return;
        }
        if (value >= 41 && months < 6) {
            setAlertMessage("Для более 40 групповых занятий минимальный срок 6 месяцев");
            setGroupSessions(40);
            return;
        }
        if (value >= 81 && months < 12) {
            setAlertMessage("Для более 80 групповых занятий минимальный срок 12 месяцев");
            setGroupSessions(80);
            return;
        }
        setGroupSessions(value);
    };

    const handleMonthsChange = (value: number) => {
        setMonths(value);

        if ((groupSessions >= 81 || personalSessions >= 31) && value < 12) {
            setAlertMessage("Для более 80 групповых занятий и более 30 индивидуальных занятий минимальный срок 12 месяцев");
            setMonths(12);
        } else if ((groupSessions >= 41 || personalSessions >= 16) && value < 6) {
            setAlertMessage("Для более 40 групповых занятий и более 15 индивидуальных занятий минимальный срок 6 месяцев");
            setMonths(6);
        } else if ((groupSessions >= 21 || personalSessions >= 6) && value < 3) {
            setAlertMessage("Для более 20 групповых занятий и более 5 индивидуальных занятий минимальный срок 3 месяца");
            setMonths(3);
        }
    };

    const sendRequest = async () => {

        const payload = {
            user_id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            months,
            groupSessions,
            personalSessions,
            total: formattedTotal
        }

        try {
            const res = await fetch(
                "https://vk-miniapp-server-yanz.vercel.app/api/send",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            )

            if (!res.ok) throw new Error("VK API error")

            setAlertShown(true)
        } catch (err) {
            console.error(err)
            setAlertMessage("Ошибка отправки заявки")
        }
    }

    return (
        <Panel id={id} style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
            <PanelHeader before={<img src={LogoImage} style={{ width: 28, height: 28, objectFit: "contain" }} />}>
                Собери свой абонемент
            </PanelHeader>

            <Group>
                <Cell before={<Icon24Rocket />} after={months === 6 ? <Text weight="2" style={{ color: "#818c99" }}>Выгодно</Text> : null} multiline>
                    Срок действия абонемента
                </Cell>
                <SegmentedControl
                    options={[
                        { value: 1, label: "1 мес" },
                        { value: 3, label: "3 мес" },
                        { value: 6, label: "6 мес" },
                        { value: 12, label: "12 мес" },
                    ]}
                    value={months}
                    onChange={(value) => handleMonthsChange(Number(value))}
                />

                <Separator />

                <Cell before={<Icon24Users />}>
                    <Text weight="2" style={{ marginTop: 8, marginBottom: 8 }}>Групповые тренировки</Text>
                    <Slider min={5} max={150} step={5} value={groupSessions} onChange={handleGroupSessionsChange} />
                    <Text weight="2" style={{ marginTop: 8 }}>{groupSessions} занятий</Text>
                </Cell>

                <Cell before={<Icon24User />}>
                    <Text weight="2" style={{ marginTop: 8, marginBottom: 8 }}>Индивидуальные занятия</Text>
                    <Slider min={0} max={50} step={1} value={personalSessions} onChange={handlePersonSessionsChange} />
                    <Text weight="2" style={{ marginTop: 8 }}>{personalSessions} занятий</Text>
                </Cell>
            </Group>

            <Group>
                <Banner
                    before={<Image size={96} src={LogoImageMin} />}
                    title="Подпишись на нас"
                    subtitle="Следи за новостями и акциями в VK"
                    after="dismiss"
                    actions={<Button rounded appearance="accent" mode="outline" onClick={() => window.open('https://vk.com/lotos_studio_mgn')}>Подробнее</Button>}
                />
            </Group>

            <FixedLayout vertical="bottom">
                <Div style={{ padding: "16px" }}>
                    <Card style={{ background: "linear-gradient(90deg, #9370DB 0%, #FF69B4 100%)", color: "white", marginBottom: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: "16px", borderRadius: "16px" }}>
                        <Text weight="2" style={{ fontSize: 14, opacity: 0.9 }}>Итоговая стоимость</Text>
                        <Title level="3" style={{ margin: "8px 0", fontSize: 28 }}>{formattedTotal} ₽</Title>
                        {isDiscount && <Text style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Скидка {discountPercent}% за выбор срока</Text>}
                    </Card>

                    <Button size="l" stretched mode="primary" onClick={sendRequest} style={{ background: "linear-gradient(90deg, #9370DB 0%, #FF69B4 100%)", color: "white", borderRadius: "12px", height: "56px", fontSize: "16px", fontWeight: 600 }}>
                        Оформить заявку
                    </Button>
                </Div>
            </FixedLayout>

            {alertMessage && <Alert actions={[{ title: "Ок", mode: "cancel" }]} onClose={() => setAlertMessage("")}><p>{alertMessage}</p></Alert>}

            {alertShown && <Alert actions={[{ title: "Ок", mode: "cancel"}]} onClose={() => setAlertShown(false)}>
                <h2>Заявка оформлена ✅</h2>
                <h4>Ваш абонемент уже создается</h4>
                <p>Ожидайте 💖</p>
                <p>С Вами свяжется администратор для уточнения деталей ☎</p>
            </Alert>}
        </Panel>
    );
};