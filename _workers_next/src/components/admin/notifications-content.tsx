'use client'

import { useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { saveNotificationSettings, testNotification } from "@/actions/admin"

interface NotificationsContentProps {
    settings: {
        telegramBotToken: string
        telegramChatId: string
    }
}

export function NotificationsContent({ settings }: NotificationsContentProps) {
    const { t } = useI18n()
    const [token, setToken] = useState(settings.telegramBotToken || '')
    const [chatId, setChatId] = useState(settings.telegramChatId || '')
    const [isLoading, setIsLoading] = useState(false)
    const [isTesting, setIsTesting] = useState(false)

    async function handleSave(formData: FormData) {
        setIsLoading(true)
        try {
            await saveNotificationSettings(formData)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message || t('common.error'))
        } finally {
            setIsLoading(false)
        }
    }

    async function handleTest() {
        setIsTesting(true)
        try {
            const res = await testNotification()
            if (res.success) {
                toast.success(t('admin.notifications.testSuccess'))
            } else {
                toast.error(t('admin.notifications.testFailed', { error: res.error }))
            }
        } catch (e: any) {
            toast.error(t('common.error'))
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">{t('admin.notifications.title')}</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Telegram Bot</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('admin.notifications.telegramBotToken')}</Label>
                            <Input
                                name="telegramBotToken"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder={t('admin.notifications.telegramBotTokenPlaceholder') || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('admin.notifications.telegramChatId')}</Label>
                            <Input
                                name="telegramChatId"
                                value={chatId}
                                onChange={e => setChatId(e.target.value)}
                                placeholder={t('admin.notifications.telegramChatIdPlaceholder') || ''}
                            />
                        </div>

                        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground space-y-2">
                            <p className="font-semibold">{t('admin.notifications.guide')}</p>
                            <p>{t('admin.notifications.guideCreateBot')}</p>
                            <p>{t('admin.notifications.guideGetChatId')}</p>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? t('common.processing') : t('admin.notifications.save')}
                            </Button>

                            {token && chatId && (
                                <Button type="button" variant="secondary" onClick={handleTest} disabled={isTesting}>
                                    {isTesting ? t('common.processing') : t('admin.notifications.test')}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
