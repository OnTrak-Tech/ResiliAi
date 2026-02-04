'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Shield, Sun, CheckCircle, Home, Activity, User, Settings, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/userStore'
import { motion } from 'framer-motion'

// --- Nav Items ---
const NAV_ITEMS = [
    { id: 'home', icon: Home, active: true },
    { id: 'stats', icon: Activity, active: false },
    { id: 'profile', icon: User, active: false },
    { id: 'settings', icon: Settings, active: false },
]

// --- Custom Components ---

// Status Card for Bento Grid
const StatusCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-orange-500/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                {icon}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-xl font-bold font-antonio tracking-wide">{value}</p>
        </CardContent>
    </Card>
)

export default function DashboardPage() {
    const router = useRouter()
    const { profile } = useUserStore()

    useEffect(() => {
        if (!profile.onboardingComplete) {
            router.push('/onboarding')
        }
    }, [profile.onboardingComplete, router])

    const getScoreColor = () => {
        if (profile.resilienceScore >= 70) return 'text-green-500'
        if (profile.resilienceScore >= 40) return 'text-orange-500'
        return 'text-red-500'
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 relative overflow-hidden font-sans">
            {/* Background Reuse */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

            <header className="flex justify-between items-center py-4 mb-6 relative z-10">
                <div className="relative h-8 w-32">
                    <Image
                        src="/icons/resiliai-logo.png"
                        alt="ResiliAi"
                        fill
                        className="object-contain object-left"
                    />
                </div>
                <div className="w-10 h-10 rounded-full border border-white/20 bg-gray-800 flex items-center justify-center overflow-hidden">
                    {/* Avatar Placeholder */}
                    <span className="font-bold text-gray-400">{profile.name ? profile.name[0] : 'U'}</span>
                </div>
            </header>

            <main className="grid grid-cols-2 gap-4 relative z-10">
                {/* Score Card - Gauge Style */}
                <Card className="col-span-2 bg-gradient-to-b from-gray-900/80 to-black/80 border-white/10 backdrop-blur-xl relative overflow-hidden">
                    <CardContent className="flex items-center gap-6 p-6">
                        <div className="relative w-28 h-28 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                {/* Defs for Gradient */}
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="50%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#22c55e" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="56"
                                    cy="56"
                                    r="48"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-gray-800"
                                />
                                <circle
                                    cx="56"
                                    cy="56"
                                    r="48"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_currentColor]"
                                    strokeDasharray={2 * Math.PI * 48}
                                    strokeDashoffset={(1 - profile.resilienceScore / 100) * 2 * Math.PI * 48}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-bold font-antonio ${getScoreColor()} drop-shadow-md`}>
                                    {profile.resilienceScore}
                                </span>
                                <span className="text-[10px] uppercase text-gray-500 tracking-wider">Score</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-antonio tracking-wide text-white uppercase mb-1">Resilience Level</h3>
                            <p className="text-gray-400 text-xs">Based on location & profile.</p>
                            <div className="mt-3 flex gap-2">
                                <Badge variant="outline" className="text-[10px] border-white/20 text-gray-300">
                                    Prepared
                                </Badge>
                                <Badge variant="outline" className="text-[10px] border-orange-500/50 text-orange-400">
                                    Action Needed
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Widgets */}
                <StatusCard
                    title="Weather"
                    value="22°C Clear"
                    icon={<Sun className="text-yellow-400 h-4 w-4" />}
                    color="yellow"
                />
                <StatusCard
                    title="Alerts"
                    value="None"
                    icon={<Shield className="text-green-400 h-4 w-4" />}
                    color="green"
                />

                {/* Main Action Area - Daily Task */}
                <Card className="col-span-2 bg-orange-600/10 border-orange-500/40 flex flex-col justify-center items-center p-6 backdrop-blur-sm hover:bg-orange-600/20 transition-colors">
                    <div className="mb-2 bg-orange-500/20 p-2 rounded-full">
                        <CheckCircle className="text-orange-500 h-6 w-6" />
                    </div>
                    <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">Daily Task</p>
                    <p className="text-center font-bold text-lg font-antonio tracking-wide text-white">Secure Balcony Items</p>
                    <p className="text-white/50 text-xs mt-2 text-center uppercase tracking-wider">High wind warning in effect</p>
                </Card>

                {/* Vision Audit - Scan Home Button */}
                <Card
                    onClick={() => router.push('/vision-audit')}
                    className="col-span-2 bg-cyan-600/10 border-cyan-500/40 flex flex-col justify-center items-center p-6 backdrop-blur-sm hover:bg-cyan-600/20 transition-colors cursor-pointer group"
                >
                    <div className="mb-2 bg-cyan-500/20 p-3 rounded-full group-hover:bg-cyan-500/30 transition-colors">
                        <Camera className="text-cyan-400 h-8 w-8" />
                    </div>
                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">Vision Audit</p>
                    <p className="text-center font-bold text-lg font-antonio tracking-wide text-white">Scan Your Home</p>
                    <p className="text-white/50 text-xs mt-2 text-center uppercase tracking-wider">AI-powered hazard detection</p>
                </Card>
            </main>

            {/* Footer Nav Dock (Reused) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="fixed bottom-8 w-full flex justify-center px-12 z-20 pointer-events-none"
            >
                <div className="flex items-center justify-between w-full max-w-xs pointer-events-auto">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.id} className="relative flex flex-col items-center group cursor-pointer" onClick={() => item.id === 'home' ? router.push('/') : null}>
                            <item.icon
                                size={24}
                                className={`transition-colors duration-300 ${item.active ? 'text-gray-500 hover:text-gray-300' : 'text-cyan-400' // Inverted for dashboard demo since we are technically "Home" but user might want active state logic
                                    } ${item.id === 'stats' ? 'text-cyan-400' : 'text-gray-500'}`} // Hacky logic to show 'Stats/Activity' as active for Dashboard
                                strokeWidth={1.5}
                            />

                            {/* Active Indicator for Stats (Dashboard) */}
                            {item.id === 'stats' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-4 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
