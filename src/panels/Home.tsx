import React, { useState, useEffect } from "react";
import {
    Alert,
    Accordion,
    Panel,
    PanelHeader,
    PanelHeaderButton,
    Group,
    Cell,
    Slider,
    Button,
    ButtonGroup,
    FixedLayout,
    Card,
    Spinner,
    SegmentedControl,
    Text,
    Title,
    Separator,
    Link,
    Div,
    ModalRoot,
    ModalPage,
    ModalPageHeader,
    ModalCard,
    Subhead,
    Paragraph
} from "@vkontakte/vkui";
import { Icon16HelpOutline, Icon28FireOutline, Icon28FireCircleFillRed, Icon24Rocket, Icon24User, Icon24Users, Icon56ClockCircleDashedOutline } from "@vkontakte/icons";

import LogoImage from '../assets/logo_lotos_2.png';
import bridge from "@vkontakte/vk-bridge";

interface HomeProps {
    id: string;
}

export const Home: React.FC<HomeProps> = ({ id }) => {

    const [months, setMonths] = useState<number>(1);
    const [groupSessions, setGroupSessions] = useState<number>(10);
    const [personalSessions, setPersonalSessions] = useState<number>(5);

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [user, setUser] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [activeModal, setActiveModal] = useState<string | null>(null);

    const [hasPermission, setHasPermission] = useState(false);

    const requestMessagesPermission = async () => {
        try {
            await bridge.send("VKWebAppAllowMessagesFromGroup", {
                group_id: 234626072
            });
            setHasPermission(true);
            return true;
        } catch {
            return false;
        }
    };

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

    // Анимированная галочка
    const AnimatedSuccessIcon: React.FC<{ loading: boolean; success: boolean }> = ({ loading, success }) => {
        const [draw, setDraw] = useState(false);

        useEffect(() => {
            if (success) {
                const timer = setTimeout(() => setDraw(true), 200);
                return () => clearTimeout(timer);
            } else {
                setDraw(false);
            }
        }, [success]);

        // Loader состояние
        if (loading) {
            return (
                <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner size="xl" style={{ color: "#dc9f50" }} />
                </div>
            );
        }

        // Анимация успеха
        if (success) {
            return (
                <div style={{ width: 64, height: 64, margin: "0 auto" }}>
                    <svg viewBox="0 0 52 52" style={{ width: 64, height: 64 }}>

                        <circle
                            cx="26"
                            cy="26"
                            r="22"
                            fill="none"
                            stroke="#4BB34B"
                            strokeWidth="2"
                            strokeDasharray="138.2"
                            strokeDashoffset={draw ? 0 : 138.2}
                            strokeLinecap="round"
                            style={{
                                transition: "stroke-dashoffset 0.6s ease"
                            }}
                        />

                        <path
                            d="M16 27 L23 34 L36 20"
                            fill="none"
                            stroke="#4BB34B"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="30"
                            strokeDashoffset={draw ? 0 : 30}
                            style={{
                                transition: "stroke-dashoffset 0.3s 0.6s ease"
                            }}
                        />

                    </svg>
                </div>
            );
        }

        return null;
    };

    const sendRequest = async () => {

        setLoading(true);

        const payload = {
            user_id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            first_name: `${user.first_name}`,
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

                    <Separator style={{ margin: "16px 0" }} />

                    {/*TODO => На тестирование, убрать если не работает*/}
                    <Link href="https://vk.com/afterrr_me">Написать разработчику</Link>

                </Div>

            </ModalPage>

            <ModalCard
                id="confirm"
                icon={
                    loading || success
                        ? <AnimatedSuccessIcon loading={loading} success={success} />
                        : <Icon56ClockCircleDashedOutline style={{ color: "#dc9f50" }} />
                }
                onClose={() => setActiveModal(null)}
                title={success ? "Заявка оформлена" : "Подтверждение заявки"}
                actions={
                    success ? (
                        <Button
                            size="l"
                            stretched
                            mode="primary"
                            onClick={() => setActiveModal(null)}
                        >
                            Закрыть
                        </Button>
                    ) : (
                        <ButtonGroup mode="horizontal" gap="s" stretched>
                            <Button
                                size="l"
                                mode="primary"
                                stretched
                                disabled={loading}
                                onClick={async () => {
                                    await sendRequest();
                                }}
                            >
                                Подтвердить
                            </Button>

                            <Button
                                size="l"
                                mode="secondary"
                                stretched
                                onClick={() => setActiveModal(null)}
                            >
                                Отмена
                            </Button>
                        </ButtonGroup>
                    )
                }
            >
                {success ? (

                    <Div style={{ textAlign: "center" }}>
                        <Paragraph>
                            {user?.first_name}, Ваш абонемент почти готов 💖
                        </Paragraph><br/>

                        <Paragraph>
                            Администратор скоро свяжется с Вами для уточнения деталей ☎
                        </Paragraph>
                    </Div>

                ) : (
                    <Div style={{ textAlign: "center" }}>
                        <Paragraph>Срок действия абонемента: {months} мес</Paragraph><br/>
                        <Paragraph weight="3">Кол-во групповых тренировок: {groupSessions}</Paragraph><br/>
                        <Paragraph>Кол-во индивидуальных занятий: {personalSessions}</Paragraph><br/><br/>
                        <Title level="3">{formattedTotal} ₽</Title>
                    </Div>
                )}
            </ModalCard>

            <ModalCard
                id="messagesPermission"
                onClose={() => setActiveModal(null)}
                icon={<Icon56ClockCircleDashedOutline style={{ color: "#5181B8" }} />}
                title="Разрешите сообщения"
                actions={
                    <ButtonGroup mode="horizontal" gap="s" stretched>

                        <Button
                            size="l"
                            mode="primary"
                            stretched
                            onClick={async () => {
                                const ok = await requestMessagesPermission();

                                if (ok) {
                                    setTimeout(() => {
                                        setActiveModal("confirm");
                                    }, 200);
                                } else {
                                    setAlertMessage("Без разрешения мы не сможем написать Вам 😔");
                                }
                            }}
                        >
                            Разрешить
                        </Button>

                        <Button
                            size="l"
                            mode="secondary"
                            stretched
                            onClick={() => {
                                setActiveModal(null);
                                setAlertMessage("Без разрешения мы не сможем написать Вам 😔");
                            }}
                        >
                            Отмена
                        </Button>

                    </ButtonGroup>
                }
            >
                <Div style={{ textAlign: "center" }}>
                    <Paragraph>
                        Чтобы мы могли отправить вам детали заявки на создание абонемента и связаться с Вами,
                        нужно разрешить сообщения от сообщества 🌸<br/>
                        Не пугайтесь, это обычная практика 💜
                    </Paragraph>
                </Div>
            </ModalCard>

        </ModalRoot>
    );

    return (
        <Panel id={id} style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
            <PanelHeader
                before={
                    <PanelHeaderButton aria-label="Логотип">
                        <img src={LogoImage} width={35} height={24} />
                    </PanelHeaderButton>
                }
            >
                Собери свой абонемент
            </PanelHeader>

            {modal}

            <Div style={{ paddingBottom: 300 }}>

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

                    <Separator style={{ margin: "10px 0" }} />

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

                <Separator style={{ margin: "10px 0" }} />

                <Accordion>
                    <Accordion.Summary iconPosition="before"><Text weight="2">Заморозка абонемента</Text></Accordion.Summary>
                    <Accordion.Content>
                        <Div>
                            <Paragraph>В качестве заморозки абонемента используются стандартные расчёты относительно выбранного срока действия.</Paragraph>
                            <Separator style={{ margin: "15px auto", width: "80%",  }} />
                            <ul style={{ padding: "0 0 0 0" }}>
                                <li><Subhead> -&gt; 1 месяц - заморозка не входит <br/></Subhead></li>
                                <li><Subhead> -&gt; 3 месяца - включена заморозка на 14 дней<br/></Subhead></li>
                                <li><Subhead> -&gt; 6 месяцев - включена заморозка на 21 день<br/></Subhead></li>
                                <li><Subhead> -&gt; 12 месяцев - включена заморозка на 30 дней<br/></Subhead></li>
                            </ul>
                        </Div>
                    </Accordion.Content>
                </Accordion>

            </Div>

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
                        onClick={() => {

                            if (loading || success) return;

                            const totalSessions = groupSessions + personalSessions;

                            if (totalSessions < minSessionsByMonths[months]) {
                                setAlertMessage(
                                    `Минимум ${minSessionsByMonths[months]} занятий из общего числа для абонемента на ${months} мес`
                                );
                                return;
                            }

                            if (hasPermission) {
                                setActiveModal("confirm");
                                return;
                            }

                            setActiveModal("messagesPermission");
                        }}
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

                <Div style={{ textAlign: "center" }}>

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
        </Panel>
    );
};