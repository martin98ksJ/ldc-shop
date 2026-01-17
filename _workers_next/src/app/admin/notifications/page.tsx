import { checkAdmin } from "@/actions/admin"
import { NotificationsContent } from "@/components/admin/notifications-content"
import { AdminLayout } from "@/components/layout/admin-layout"
import { getNotificationSettings } from "@/lib/notifications"

export const runtime = 'edge';

export default async function NotificationsPage() {
    await checkAdmin()
    const settings = await getNotificationSettings()

    return (
        <AdminLayout>
            <NotificationsContent settings={{
                telegramBotToken: settings.token || '',
                telegramChatId: settings.chatId || ''
            }} />
        </AdminLayout>
    )
}
