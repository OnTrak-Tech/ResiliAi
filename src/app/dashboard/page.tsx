'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Sun, CheckCircle, Home, Camera, Phone, Users, Scan, User, Settings, Cloud, CloudRain, CloudSnow } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useTaskStore } from '@/store/taskStore'

// --- Helper Functions ---
const getWeatherIcon = (temp: number, condition: string) => {
    // Simple logic mapping
    const c = condition.toLowerCase()
    if (c.includes('rain')) return <CloudRain className="text-orange-400 h-8 w-8 mb-2" fill="currentColor" />
    if (c.includes('cloud')) return <Cloud className="text-orange-400 h-8 w-8 mb-2" fill="currentColor" />
    if (c.includes('snow')) return <CloudSnow className="text-orange-400 h-8 w-8 mb-2" fill="currentColor" />
    if (c.includes('clear') || c.includes('sun')) return <Sun className="text-orange-400 h-8 w-8 mb-2" fill="currentColor" />
    return <Sun className="text-orange-400 h-8 w-8 mb-2" fill="currentColor" />
}

export default function DashboardPage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const { weather, fetchWeather } = useWeatherStore()
    const { tasks, generateDailyTasks } = useTaskStore()

    useEffect(() => {
        if (!profile.onboardingComplete) {
            router.push('/onboarding')
        }
    }, [profile.onboardingComplete, router])

    useEffect(() => {
        if (profile.location) {
            fetchWeather(profile.location)
        }
        // Generate daily tasks based on profile if empty
        if (tasks.length === 0) {
            generateDailyTasks(profile, weather)
        }
    }, [profile, weather, tasks.length, fetchWeather, generateDailyTasks])

    // Get the first incomplete task for display
    const currentTask = tasks.find(t => !t.completed) || tasks[0]

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans flex flex-col items-center">

            {/* Header: Centered Logo Text */}
            <header className="w-full pt-8 pb-4 flex justify-center items-center relative bg-gray-50">
                <h1 className="text-3xl font-bold text-[#2563eb] tracking-tight">ResiliAI</h1>
            </header>

            <main className="w-full max-w-md px-6 space-y-4">

                {/* 1. Resilience Score Card */}
                <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Resilience Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">{profile.resilienceScore}</span>
                            <span className="text-gray-400 text-sm font-medium">/100</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-[#2563eb] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${profile.resilienceScore}%` }}
                        />
                    </div>
                    <p className="text-xs font-medium text-gray-900">
                        {profile.resilienceScore >= 70 ? 'Excellent Preparedness' :
                            profile.resilienceScore >= 40 ? 'Good Start' : 'Action Needed'}
                    </p>
                </Card>

                {/* 2. Status Row (Weather, Alerts, Daily Task) */}
                <div className="grid grid-cols-3 gap-3">

                    {/* Weather Card */}
                    <Card className="aspect-[4/5] p-3 flex flex-col items-center justify-center text-center bg-white border-none shadow-sm rounded-2xl">
                        <span className="text-[10px] font-bold uppercase mb-auto pt-1">Weather</span>
                        <div className="flex flex-col items-center my-auto">
                            {weather ? getWeatherIcon(weather.temp, weather.condition) : <Sun className="text-orange-400 h-8 w-8 mb-2" fill="currentColor" />}
                            <span className="text-xl font-bold text-gray-900">{weather ? Math.round(weather.temp) : '--'}°C</span>
                            <span className="text-[10px] text-gray-500 font-medium leading-tight mt-1 line-clamp-2">
                                {weather ? weather.condition : 'Loading...'}
                            </span>
                        </div>
                    </Card>

                    {/* Alerts Card */}
                    <Card className="aspect-[4/5] p-3 flex flex-col items-center justify-center text-center bg-white border-none shadow-sm rounded-2xl">
                        <span className="text-[10px] font-bold uppercase mb-auto pt-1">Alerts</span>
                        <div className="flex flex-col items-center my-auto">
                            <Shield className="text-green-500 h-8 w-8 mb-2 fill-green-100" />
                            <span className="text-sm font-medium text-gray-900">All Clear</span>
                        </div>
                    </Card>

                    {/* Daily Task Card */}
                    <Card className="aspect-[4/5] p-3 flex flex-col items-center justify-center text-center bg-white border-none shadow-sm rounded-2xl relative overflow-hidden">
                        <span className="text-[10px] font-bold uppercase mb-auto pt-1">Daily Task</span>
                        <div className="flex flex-col items-center my-auto w-full">
                            <div className="bg-green-500 rounded-full p-1 mb-2">
                                <CheckCircle className="text-white h-5 w-5" strokeWidth={3} />
                            </div>
                            <p className="text-[10px] font-medium text-gray-900 leading-tight line-clamp-3 px-1">
                                {currentTask ? currentTask.title : 'Check Supplies'}
                            </p>
                            {/* Checkbox Placeholder for visual */}
                            <div className="w-4 h-4 border-2 border-gray-300 rounded mt-2" />
                        </div>
                    </Card>
                </div>

                {/* 3. High Priority Action Buttons */}

                {/* Vision Audit */}
                <Button
                    variant="default"
                    className="w-full h-20 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl flex items-center justify-start px-6 shadow-lg shadow-blue-500/20 relative group overflow-hidden"
                    onClick={() => router.push('/vision-audit')}
                >
                    <div className="mr-6 border-2 border-white/30 rounded-lg p-2">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-start text-white">
                        <span className="text-lg font-bold uppercase tracking-wide">Vision Audit</span>
                        <span className="text-xs text-blue-100 font-medium tracking-wider">Scan Home</span>
                    </div>
                </Button>

                {/* SOS Guardian */}
                <Button
                    variant="default"
                    className="w-full h-20 bg-[#ef4444] hover:bg-[#dc2626] rounded-xl flex items-center justify-start px-6 shadow-lg shadow-red-500/20 relative group overflow-hidden"
                    onClick={() => router.push('/sos-guardian')}
                >
                    <div className="mr-6 border-2 border-white/30 rounded-full p-2">
                        <Phone className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-start text-white">
                        <span className="text-lg font-bold uppercase tracking-wide">SOS Guardian</span>
                        <span className="text-xs text-red-100 font-medium tracking-wider">Guardian</span>
                    </div>
                </Button>

                {/* Community Mesh */}
                <Button
                    variant="default"
                    className="w-full h-20 bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl flex items-center justify-start px-6 shadow-lg shadow-purple-500/20 relative group overflow-hidden"
                    onClick={() => router.push('/community-mesh')}
                >
                    <div className="mr-6 border-2 border-white/30 rounded-lg p-2">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-start text-white">
                        <span className="text-lg font-bold uppercase tracking-wide">Community Mesh</span>
                        <span className="text-xs text-purple-100 font-medium tracking-wider">Mesh Network</span>
                    </div>
                </Button>

            </main>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <NavIcon icon={Home} label="Home" active />
                <NavIcon icon={Scan} label="Scan" onClick={() => router.push('/vision-audit')} />
                <NavIcon icon={User} label="Profile" onClick={() => router.push('/onboarding')} />
                <NavIcon icon={Settings} label="Settings" onClick={() => router.push('/settings')} />
            </div>
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
