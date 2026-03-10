export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const data = req.body

    const message = `
🔥 Новая заявка

👤 ${data.name}
https://vk.com/id${data.user_id}

📅 ${data.months} мес
👥 Групповые: ${data.groupSessions}
👤 Индивидуальные: ${data.personalSessions}

💰 ${data.total} ₽
`

    const params = new URLSearchParams({
        peer_id: "2000000176",
        random_id: Date.now(),
        message: message,
        access_token: process.env.VK_TOKEN,
        v: "5.131"
    })

    await fetch("https://api.vk.com/method/messages.send", {
        method: "POST",
        body: params
    })

    res.status(200).json({ ok: true })
}