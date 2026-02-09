'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield, Trash2, Download, MapPin, Mic, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { useState } from 'react'

export default function SecurityPage() {
    const router = useRouter()
    const { resetProfile } = useUserStore()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Check permissions status
    const [permissions, setPermissions] = useState({
        location: 'unknown',
        microphone: 'unknown',
        notifications: 'unknown',
    })

    // Check permissions on mount
    useState(() => {
        if (typeof navigator !== 'undefined') {
            navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then(result => {
                setPermissions(p => ({ ...p, location: result.state }))
            })
            navigator.permissions?.query({ name: 'microphone' as PermissionName }).then(result => {
                setPermissions(p => ({ ...p, microphone: result.state }))
            })
            navigator.permissions?.query({ name: 'notifications' as PermissionName }).then(result => {
                setPermissions(p => ({ ...p, notifications: result.state }))
            })
        }
    })

    const handleDeleteAccount = () => {
        localStorage.removeItem('resiliai-user-storage')
        resetProfile()
        router.push('/')
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'granted': return 'text-green-600 dark:text-green-400'
            case 'denied': return 'text-red-600 dark:text-red-400'
            default: return 'text-yellow-600 dark:text-yellow-400'
        }
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
                <h1 className="w-full text-center text-xl font-bold">Security & Privacy</h1>
            </header>

            <main className="w-full max-w-md mx-auto px-6 space-y-6 mt-4">
                {/* Permissions Status */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Permissions</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <PermissionRow icon={MapPin} label="Location" status={permissions.location} statusColor={statusColor} />
                        <PermissionRow icon={Mic} label="Microphone" status={permissions.microphone} statusColor={statusColor} />
                        <PermissionRow icon={Eye} label="Notifications" status={permissions.notifications} statusColor={statusColor} isLast />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Manage permissions in your browser or device settings.
                    </p>
                </section>

                {/* Data Management */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Your Data</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Export My Data</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Download your profile and settings</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs">
                                Export
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Delete Account</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Permanently remove all data</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Privacy Info */}
                <section className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Your Privacy Matters</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                ResiliAI stores your data locally on your device. We don't share your personal information with third parties.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            This will permanently delete all your data including your profile, preferences, and emergency contacts. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 h-11 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function PermissionRow({ icon: Icon, label, status, statusColor, isLast }: {
    icon: any, label: string, status: string, statusColor: (s: string) => string, isLast?: boolean
}) {
    return (
        <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}>
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className={`text-xs font-medium capitalize ${statusColor(status)}`}>
                {status === 'unknown' ? 'Not checked' : status}
            </span>
        </div>
    )
}
