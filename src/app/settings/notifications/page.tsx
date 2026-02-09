'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, AlertTriangle, CloudRain, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'

export default function NotificationsPage() {
    const router = useRouter()
    const { profile, setNotificationPreferences } = useUserStore()

    const preferences = profile.notificationPreferences || {
        pushEnabled: true,
        emailEnabled: false,
        alertSeverity: 'moderate', // 'extreme' | 'severe' | 'moderate' | 'all'
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
    }

    const updatePreference = (key: string, value: any) => {
        setNotificationPreferences({ ...preferences, [key]: value })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-24 font-sans">
            {/* Header */}
            <header className="w-full pt-8 pb-4 px-6 flex items-center relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-6"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <h1 className="w-full text-center text-xl font-bold">Notifications</h1>
            </header>

            <main className="w-full max-w-md mx-auto px-6 space-y-6 mt-4">
                {/* Push Notifications */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium">Push Notifications</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts on your device</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={preferences.pushEnabled}
                            onChange={(v) => updatePreference('pushEnabled', v)}
                        />
                    </div>
                </div>

                {/* Alert Severity */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="font-medium">Alert Severity Level</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Minimum severity to notify</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {['extreme', 'severe', 'moderate', 'all'].map((level) => (
                            <button
                                key={level}
                                onClick={() => updatePreference('alertSeverity', level)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${preferences.alertSeverity === level
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quiet Hours */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-medium">Quiet Hours</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Silence non-critical alerts</p>
                            </div>
                        </div>
                        <ToggleSwitch
                            enabled={preferences.quietHoursEnabled}
                            onChange={(v) => updatePreference('quietHoursEnabled', v)}
                        />
                    </div>
                    {preferences.quietHoursEnabled && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>From</span>
                            <input
                                type="time"
                                value={preferences.quietHoursStart}
                                onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                                className="bg-gray-100 dark:bg-slate-800 rounded-lg px-2 py-1"
                            />
                            <span>to</span>
                            <input
                                type="time"
                                value={preferences.quietHoursEnd}
                                onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                                className="bg-gray-100 dark:bg-slate-800 rounded-lg px-2 py-1"
                            />
                        </div>
                    )}
                </div>

                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-6">
                    Extreme weather alerts will always be delivered regardless of these settings.
                </p>
            </main>
        </div>
    )
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean, onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
        >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
        </button>
    )
}
