 /**
 * Сервер, где лежит код
 *
 * https://vercel.com/yans-projects-40111f46/vk-miniapp-server-yanz
 */

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
        const adminParams = new URLSearchParams({
            peer_id: "2000000001",
            random_id: Date.now(),
            message,
            access_token: process.env.VK_TOKEN,
            v: "5.131"
        })

        await fetch("https://api.vk.com/method/messages.send", {
            method: "POST",
            body: adminParams
        })

        // Сообщение пользователю
        const userMessage = `
${data.first_name}, здравствуйте, Вы оставили заявку на создание абонемента ✅

Мы начали её обработку.

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

        const userResponse = await fetch("https://api.vk.com/method/messages.send", {
            method: "POST",
            body: userParams
        })

        // ======= BEGIN LOG =======

        const debug = await fetch(
            `https://api.vk.com/method/messages.getConversationsById?peer_ids=${data.user_id}&access_token=${process.env.VK_TOKEN}&v=5.131`
        )

        const debugData = await debug.json()

        console.log(JSON.stringify(debugData, null, 2))

        // ======= END LOG =======

        const labelParams = new URLSearchParams({
            user_ids: 230959721,
            message: "Новая заявка на создание абонемента 💰",
            group_id: 234626072,
            access_token: process.env.VK_TOKEN,
            v: "5.131"
        })

        await new Promise(resolve => setTimeout(resolve, 500))

        const labelResponse = await fetch("https://api.vk.com/method/notifications.sendMessage", {
            method: "POST",
            body: labelParams
        })

        const labelData = await labelResponse.json()
        console.log("LABEL RESPONSE:", JSON.stringify(labelData, null, 2))

        return res.status(200).json({ ok: true })

    } catch (error) {
        console.error("Ошибка: ", error)
        return res.status(500).json({
            error: "VK request failed",
            details: error.message
        })
    }
}