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

        const userData = await userResponse.json()

        if (userData.response) {
            const chatId = userData.response.peer_id
            console.log("Chat ID:", chatId)

            const labelParams = new URLSearchParams({
                group_id: 234626072,
                peer_id: chatId,
                topic_ids: "1",
                access_token: process.env.VK_TOKEN,
                v: "5.131"
            })

            console.log("Label params:", labelParams.toString())

            const labelResponse = await fetch("https://api.vk.com/method/messages.editChat", {
                method: "POST",
                body: labelParams
            })

            const labelData = await labelResponse.json()
            console.log("Label response:", JSON.stringify(labelData, null, 2))

            if (labelData.error) {
                console.error("Label error:", labelData.error)
            } else {
                console.log("Метка успешно применена!")
            }
        }

        return res.status(200).json({ ok: true })

    } catch (error) {
        console.error("Ошибка: ", error)
        return res.status(500).json({
            error: "VK request failed",
            details: error.message
        })
    }
}