import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = "vk1.a.8LP2h__WR2PC6SmUQqji3tS99GdXkj9dW1oWfjFpI78_yUEXEgd_QtWzCrebbcvBWOTPUB0eTHLWX_26S3CCmiS1DrjFkA3LhTLXfeg1pJ-ivY800nba28oRa7hzfUyagkptGqYK-AYwJ8E_PqRRCo6zVvA9wgLDL89Rqm-NFh9enlxjhSvMKx-3mP5RbcD2fgqb6eeSt37KHC6gfvyBBQ"; // токен с правами messages
const CHAT_ID = 2000000001; // id чата администраторов группы (для диалогов с сообществом)

app.post("/send", async (req, res) => {
    const { user_id, months, groupSessions, personalSessions, total } = req.body;

    const message = `
🔥 Новая заявка на абонемент

👤 Пользователь: https://vk.com/id${user_id}

📅 Срок: ${months} мес
👥 Групповые: ${groupSessions}
👤 Индивидуальные: ${personalSessions}

💰 Стоимость: ${total} ₽
`;

    try {
        await axios.post("https://api.vk.com/method/messages.send", null, {
            params: {
                peer_id: CHAT_ID,
                random_id: Date.now(),
                message: message,
                access_token: TOKEN,
                v: "5.131"
            }
        });

        console.error("message send, ok");
        res.json({ status: "ok" });
    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ error: err.response?.data || err.message });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});