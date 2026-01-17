import { db } from "./db"
import { getSetting } from "./db/queries"

export async function getNotificationSettings() {
    const token = await getSetting('telegram_bot_token')
    const chatId = await getSetting('telegram_chat_id')
    return {
        token,
        chatId
    }
}

export async function sendTelegramMessage(text: string) {
    try {
        const { token, chatId } = await getNotificationSettings()

        if (!token || !chatId) {
            console.log('[Notification] Skipped: Missing token or chat_id')
            return { success: false, error: 'Missing configuration' }
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('[Notification] Telegram API Error:', error)
            return { success: false, error }
        }

        return { success: true }
    } catch (e: any) {
        console.error('[Notification] Send Error:', e)
        return { success: false, error: e.message }
    }
}

export async function notifyAdminPaymentSuccess(order: {
    orderId: string,
    productName: string,
    amount: string,
    email?: string | null,
    username?: string | null,
    tradeNo?: string | null
}) {
    const text = `
<b>💰 New Payment Received!</b>

<b>Order:</b> <code>${order.orderId}</code>
<b>Product:</b> ${order.productName}
<b>Amount:</b> ${order.amount} Credits
<b>User:</b> ${order.username || 'Guest'} (${order.email || 'No email'})
<b>Trade No:</b> <code>${order.tradeNo || 'N/A'}</code>
`.trim()

    // Send without waiting (fire-and-forget for caller, but we await here to catch errors if needed by caller)
    // Actually best pattern for Cloudflare Workers is ctx.waitUntil, but here we don't have ctx access easily.
    // We just return the promise.
    return sendTelegramMessage(text)
}

export async function notifyAdminRefundRequest(order: {
    orderId: string,
    productName: string,
    amount: string,
    username?: string | null,
    reason?: string | null
}) {
    const text = `
<b>↩️ Refund Requested</b>

<b>Order:</b> <code>${order.orderId}</code>
<b>Product:</b> ${order.productName}
<b>Amount:</b> ${order.amount} Credits
<b>User:</b> ${order.username || 'Guest'}
<b>Reason:</b> ${order.reason || 'No reason provided'}

<a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/refunds">Manage Refunds</a>
`.trim()

    return sendTelegramMessage(text)
}
