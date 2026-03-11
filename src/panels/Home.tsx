import React, { useState, useEffect } from "react";
import {
    Alert,
    Panel,
    PanelHeader,
    PanelHeaderButton,
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
    Image,
    ModalRoot,
    ModalPage,
    ModalPageHeader
} from "@vkontakte/vkui";
import { Icon16HelpOutline, Icon28FireOutline, Icon28FireCircleFillRed, Icon24Rocket, Icon24User, Icon24Users } from "@vkontakte/icons";

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

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [activeModal, setActiveModal] = useState<string | null>(null);

    const groupPrice = 600;
    const personalPrice = 1300;

    // Минимум занятий для срока
    const minSessionsByMonths: Record<number, number> = {
        1: 5,
        3: 20,
        6: 30,
        12: 50
    };

    // функция скидки
    const getDiscount = (sessionsPerMonth: number) => {
        if (sessionsPerMonth >= 26) return 0.12;
        if (sessionsPerMonth >= 16) return 0.08;
        if (sessionsPerMonth >= 10) return 0.05;
        if (sessionsPerMonth >= 6) return 0.03;
        return 0;
    };

    const totalSessions = groupSessions + personalSessions;
    const sessionsPerMonth = totalSessions / months;

    const discount = getDiscount(sessionsPerMonth);
    const discountPercent = Math.round(discount * 100);
    const isDiscount = discountPercent > 0;

    const groupTotal = groupSessions * groupPrice;
    const personalTotal = personalSessions * personalPrice;

    const total =
        groupTotal * (1 - discount) +
        personalTotal * (1 - discount / 2);

    const formattedTotal = new Intl.NumberFormat("ru-RU").format(Math.round(total));

    useEffect(() => {

        setUser({
            id: 230959721,
            first_name: "Test",
            last_name: "User",
            photo_200: "https://via.placeholder.com/200"
        });

        bridge.send("VKWebAppGetUserInfo")
            .then((data) => {
                setUser(data);
            })
            .catch(() => {

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

    const getButtonText = () => {

        if (success) return "Заявка отправлена ✓";
        if (loading) return "Отправляем...";
        return "Оформить заявку";

    };

    const sendRequest = async () => {

        if (loading || success) return;

        const totalSessions = groupSessions + personalSessions;

        if (totalSessions < minSessionsByMonths[months]) {
            setAlertMessage(
                `Минимум ${minSessionsByMonths[months]} занятий для абонемента на ${months} мес`
            );
            return;
        }

        setLoading(true);

        const payload = {
            user_id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            months,
            groupSessions,
            personalSessions,
            total: formattedTotal
        };

        try {

            const res = await fetch(
                "https://vk-miniapp-server-yanz.vercel.app/api/send",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (!res.ok) throw new Error("API error");

            setSuccess(true);

            setAlertShown(true);

            /*setTimeout(() => {
                bridge.send("VKWebAppClose", { status: "success" });
            }, 3500);*/

        } catch (err) {

            console.error(err);
            setAlertMessage("Ошибка отправки заявки");

        } finally {

            setLoading(false);

        }
    };

    const modal = (
        <ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>

            <ModalPage
                id="instruction"
                onClose={() => setActiveModal(null)}
                header={
                    <ModalPageHeader>
                        Как пользоваться?
                    </ModalPageHeader>
                }
            >

                <Div>

                    <Title level="3">Инструкция</Title>

                    <Text style={{ marginTop: 8 }}>
                        1. Выберите подходящий Вам срок абонемента
                    </Text>

                    <Text style={{ marginTop: 8 }}>
                        2. Укажите количество групповых тренировок
                    </Text>

                    <Text style={{ marginTop: 8 }}>
                        3. Добавьте индивидуальные занятия
                    </Text>

                    <Text style={{ marginTop: 8 }}>
                        4. Нажмите "Оформить заявку"
                    </Text>

                    <Separator style={{ margin: "16px 0" }} />

                    <Text style={{ opacity: 0.7 }}>
                        После отправки с вами свяжется администратор ☎
                    </Text>

                </Div>

            </ModalPage>

        </ModalRoot>
    );

    return (
        <Panel id={id} style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
            <PanelHeader
                before={
                    <PanelHeaderButton>
                        <img src={LogoImage} width={35} height={24} />
                    </PanelHeaderButton>
                }
            >
                Собери свой абонемент
            </PanelHeader>

            {modal}

            <Group>

                <Cell
                    before={<Icon24Rocket />}
                    after={
                        isDiscount && discountPercent >= 3 && discountPercent < 5 ? (
                            <Text weight="2" style={{ color: "#f390ff" }}>
                                <Icon28FireOutline />
                            </Text>
                        ) : isDiscount && discountPercent >= 5 && discountPercent < 8 ? (
                            <Text weight="2" style={{ color: "#f390ff" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <Icon28FireOutline /><Icon28FireOutline />
                                </div>
                            </Text>
                        ) : isDiscount && discountPercent >= 8 && discountPercent < 12 ? (
                            <Text weight="2" style={{ color: "#f390ff" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <Icon28FireCircleFillRed />
                                </div>
                            </Text>
                        ) : isDiscount && discountPercent >= 12 ? (
                            <Text weight="2" style={{ color: "#f390ff" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <Icon28FireCircleFillRed /><Icon28FireCircleFillRed />
                                </div>
                            </Text>
                        ) : null
                    }
                    multiline
                >
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

                    <Text weight="2" style={{ marginTop: 8, marginBottom: 8 }}>
                        Групповые тренировки
                    </Text>

                    <Slider
                        min={5}
                        max={150}
                        step={5}
                        value={groupSessions}
                        onChange={handleGroupSessionsChange}
                    />

                    <Text weight="2" style={{ marginTop: 8 }}>
                        {groupSessions} занятий
                    </Text>

                </Cell>

                <Cell before={<Icon24User />}>

                    <Text weight="2" style={{ marginTop: 8, marginBottom: 8 }}>
                        Индивидуальные занятия
                    </Text>

                    <Slider
                        min={0}
                        max={50}
                        step={1}
                        value={personalSessions}
                        onChange={handlePersonSessionsChange}
                    />

                    <Text weight="2" style={{ marginTop: 8 }}>
                        {personalSessions} занятий
                    </Text>

                </Cell>

            </Group>

            <Group>

                <Banner
                    before={<Image size={96} src={LogoImageMin} />}
                    title="Подпишись на нас"
                    subtitle="Следи за новостями и акциями в VK"
                    after="dismiss"
                    actions={
                        <Button
                            rounded
                            appearance="accent"
                            mode="outline"
                            onClick={() => window.open('https://vk.com/lotos_studio_mgn')}
                        >
                            Подробнее
                        </Button>
                    }
                />

            </Group>

            <FixedLayout vertical="bottom">

                <Div style={{ padding: "16px" }}>

                    <Card style={{
                        background: "linear-gradient(90deg, #9370DB 0%, #FF69B4 100%)",
                        color: "white",
                        marginBottom: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        padding: "16px",
                        borderRadius: "16px"
                    }}>

                        <Text weight="2" style={{ fontSize: 14, opacity: 0.9 }}>
                            Итоговая стоимость
                        </Text>

                        <Title level="3" style={{ margin: "8px 0", fontSize: 28 }}>
                            {formattedTotal} ₽
                        </Title>

                        {isDiscount &&
                            <Text style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                                Скидка {discountPercent}% за активность
                            </Text>
                        }

                    </Card>

                    <Button
                        size="l"
                        stretched
                        mode="primary"
                        loading={loading}
                        disabled={loading || success}
                        onClick={sendRequest}
                        style={{
                            background: success
                                ? "#4BB34B"
                                : "linear-gradient(90deg, #9370DB 0%, #FF69B4 100%)",
                            color: "white",
                            borderRadius: "12px",
                            height: "56px",
                            fontSize: "16px",
                            fontWeight: 600,
                            transition: "all .3s ease"
                        }}
                    >
                        {getButtonText()}
                    </Button>

                </Div>

                <Div style={{ textAlign: "center", marginTop: 8 }}>

                    <Text
                        style={{
                            fontSize: 12,
                            opacity: 0.7,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >

                        <Icon16HelpOutline
                            style={{ cursor: "pointer" }}
                            onClick={() => setActiveModal("instruction")}
                        />

                        <span
                            onClick={() => setActiveModal("instruction")}
                            style={{
                                cursor: "pointer",
                                fontWeight: 500
                            }}
                        >
                            Возникли проблемы?{" "}
                        </span>

                        <span
                            onClick={() => window.open("https://vk.com/afterrr_me")}
                            style={{
                                color: "#5181B8",
                                cursor: "pointer",
                                fontWeight: 500
                            }}
                        >
                            Написать разработчику
                        </span>

                    </Text>

                </Div>

            </FixedLayout>

            {alertMessage &&
                <Alert
                    actions={[{ title: "Ок", mode: "cancel" }]}
                    onClose={() => setAlertMessage("")}
                >
                    <p>{alertMessage}</p>
                </Alert>
            }

            {alertShown &&
                <Alert
                    actions={[{ title: "Ок", mode: "cancel" }]}
                    onClose={() => setAlertShown(false)}
                >
                    <h2>Заявка оформлена ✅</h2>
                    <h4>Ваш абонемент уже создается</h4>
                    <p>Ожидайте 💖</p>
                    <p>С Вами свяжется администратор для уточнения деталей ☎</p>
                </Alert>
            }

        </Panel>
    );
};