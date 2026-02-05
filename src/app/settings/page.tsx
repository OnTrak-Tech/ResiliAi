'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    ChevronLeft,
    User,
    Bell,
    Shield,
    FileText,
    Scale,
    HelpCircle,
    LogOut,
    ChevronRight,
    Home,
    Scan,
    Settings as SettingsIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch' // Or custom toggle if needed
import { motion } from 'framer-motion'

export default function SettingsPage() {
    const router = useRouter()
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')

    const menuItems = {
        account: [
            { icon: User, label: 'Profile Details', href: '/profile' },
            { icon: Bell, label: 'Notification Preferences', href: '/settings/notifications' },
            { icon: Shield, label: 'Security & Privacy', href: '/settings/security' },
        ],
        legal: [
            { icon: FileText, label: 'Privacy Policy', href: '/privacy' },
            { icon: Scale, label: 'Terms of Service', href: '/terms' },
            { icon: HelpCircle, label: 'Help Center', href: '/help' },
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans flex flex-col items-center">

            {/* Header */}
            <header className="w-full pt-8 pb-4 px-6 flex items-center relative bg-gray-50">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-6"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </Button>
                <h1 className="w-full text-center text-xl font-bold text-gray-900">Settings</h1>
            </header>

            <main className="w-full max-w-md px-6 space-y-8 mt-4">

                {/* APP THEME Section */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">App Theme</h2>
                    <div className="bg-gray-200/50 p-1 rounded-xl flex items-center justify-between relative">
                        {/* Animated background pill could go here, but simple conditional formatting works for now */}
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setTheme(mode)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${theme === mode
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ACCOUNT & SECURITY Section */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Account & Security</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {menuItems.account.map((item, index) => (
                            <MenuItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                isLast={index === menuItems.account.length - 1}
                            />
                        ))}
                    </div>
                </section>

                {/* LEGAL & SUPPORT Section */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Legal & Support</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {menuItems.legal.map((item, index) => (
                            <MenuItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                isLast={index === menuItems.legal.length - 1}
                            />
                        ))}
                    </div>
                </section>

                {/* Sign Out & Version */}
                <div className="flex flex-col items-center gap-6 pt-4">
                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>

                    <span className="text-xs text-gray-400 font-medium">
                        ResiliAI v2.4.0
                    </span>
                </div>

            </main>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <NavIcon icon={Home} label="Home" onClick={() => router.push('/dashboard')} />
                <NavIcon icon={Scan} label="Scan" onClick={() => router.push('/vision-audit')} />
                {/* <NavIcon icon={User} label="Profile" onClick={() => router.push('/profile')} /> */}
                {/* Using User icon for profile in dashboard, keeping consistent set */}
                <NavIcon icon={User} label="Profile" />
                <NavIcon icon={SettingsIcon} label="Settings" active />
            </div>

        </div>
    )
}

function MenuItem({ icon: Icon, label, isLast }: { icon: any, label: string, isLast?: boolean }) {
    return (
        <div className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
    )
}

function NavIcon({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 ${active ? 'text-[#1e40af]' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}
