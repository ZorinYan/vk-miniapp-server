export default async function handler(req, res) {

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    // preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {

        const data = req.body

        const message = `
🚀 Новая заявка на создание абонемента

📍  ${data.name}
🔗 https://vk.com/id${data.user_id}

📅 ${data.months} мес
👥 Групповые: ${data.groupSessions}
👤 Индивидуальные: ${data.personalSessions}

💰 Стоимость: ${data.total} ₽
`
        // сообщение админу
        const params = new URLSearchParams({
            peer_id: "2000000001",
            random_id: Date.now(),
            message,
            access_token: process.env.VK_TOKEN,
            v: "5.131"
        })

        await fetch("https://api.vk.com/method/messages.send", {
            method: "POST",
            body: params
        })

        // сообщение пользователю
        const userMessage = `
✅ Вы оставили заявку на создание абонемента

Мы получили вашу заявку и начали её обработку.

📩 Все дальнейшие уточнения и детали будут отправлены в этот диалог.

Спасибо, что выбрали нас 💜
`

        const userParams = new URLSearchParams({
            user_id: data.user_id,
            random_id: Date.now() + 1,
            message: userMessage,
            access_token: process.env.VK_TOKEN,
            v: "5.131"
        })

        await fetch("https://api.vk.com/method/messages.send", {
            method: "POST",
            body: userParams
        })

        return res.status(200).json({ ok: true })

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            error: "VK request failed"
        })

    }
}