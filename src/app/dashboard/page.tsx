'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sun, CheckCircle, Home, Camera, Phone, Users, Scan, User, Settings, Cloud, CloudRain, CloudSnow, Zap, AlertTriangle, Waves, Mic } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useTaskStore } from '@/store/taskStore'
import { useGuardianWorker } from '@/hooks/useGuardianWorker'

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

const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

export default function DashboardPage() {
    const router = useRouter()
    const { profile } = useUserStore()
    const { weather, alerts, fetchWeather } = useWeatherStore()
    const { tasks, generateDailyTasks } = useTaskStore()

    // Register Guardian service worker for background alerts
    useGuardianWorker()

    // Simulation Mode State
    const [showSimModal, setShowSimModal] = useState(false)
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

    const SIMULATION_SCENARIOS = [
        { id: 'tornado', name: 'Tornado Warning', icon: Zap, color: 'bg-red-500', description: 'Tornado approaching your area' },
        { id: 'earthquake', name: 'Earthquake', icon: AlertTriangle, color: 'bg-orange-500', description: 'Strong earthquake activity detected' },
        { id: 'flood', name: 'Flash Flood', icon: Waves, color: 'bg-blue-500', description: 'Flash flood warning in effect' },
    ]

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
    }, [profile.location, tasks.length])

    // Get the first incomplete task for display
    const currentTask = tasks.find(t => !t.completed) || tasks[0]

    // API-Driven Alert Status
    const hasAlerts = alerts.length > 0
    const topAlert = hasAlerts ? alerts[0] : null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-24 font-sans flex flex-col items-center transition-colors duration-300">

            {/* Greeting Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md pt-10 pb-6 px-6"
            >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getGreeting()}, {profile.name || 'there'} 👋
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Stay safe and prepared today
                </p>
            </motion.div>

            <main className="w-full max-w-md px-6 space-y-4">

                {/* 1. Resilience Score Card */}
                <Card className="p-6 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 transition-colors">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Resilience Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{profile.resilienceScore}</span>
                            <span className="text-gray-400 text-sm font-medium">/100</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-[#2563eb] dark:bg-[#3b82f6] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${profile.resilienceScore}%` }}
                        />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-300">
                        {profile.resilienceScore >= 70 ? 'Excellent Preparedness' :
                            profile.resilienceScore >= 40 ? 'Good Start' : 'Action Needed'}
                    </p>
                </Card>

                {/* 2. Status Row (Weather, Alerts, Daily Task) */}
                <div className="grid grid-cols-3 gap-3">

                    {/* Weather Card */}
                    <Card className="aspect-[4/5] p-3 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl transition-colors">
                        <span className="text-[10px] font-bold uppercase mb-auto pt-1 text-gray-900 dark:text-gray-400">Weather</span>
                        <div className="flex flex-col items-center my-auto">
                            {weather ? (
                                <>
                                    {/* Enforcing w-8 h-8 to match other cards */}
                                    {weather.icon ?
                                        <div className="h-8 w-8 mb-2 relative">
                                            <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} className="object-contain w-full h-full transform scale-125 saturate-150" />
                                        </div>
                                        : getWeatherIcon(weather.temp, weather.condition)
                                    }
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(weather.temp)}°C</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-1 line-clamp-2 px-1">
                                        {weather.condition}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Sun className="text-gray-300 dark:text-gray-600 h-8 w-8 mb-2 animate-pulse" />
                                    <span className="text-sm text-gray-400 dark:text-gray-500">Wait...</span>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Alerts Card */}
                    <Card className={`aspect-[4/5] p-3 flex flex-col items-center justify-center text-center border-none shadow-sm rounded-2xl transition-colors ${hasAlerts ? 'bg-red-50 dark:bg-red-950/30' : 'bg-white dark:bg-slate-900'}`}>
                        <span className={`text-[10px] font-bold uppercase mb-auto pt-1 ${hasAlerts ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-400'}`}>Alerts</span>
                        <div className="flex flex-col items-center my-auto">
                            {hasAlerts ? (
                                <Shield className="text-red-500 h-8 w-8 mb-2 fill-red-100 dark:fill-red-900/50 animate-pulse" />
                            ) : (
                                <Shield className="text-green-500 h-8 w-8 mb-2 fill-green-100 dark:fill-green-900/50" />
                            )}
                            <span className={`text-sm font-medium ${hasAlerts ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-gray-300'} leading-tight line-clamp-2`}>
                                {hasAlerts ? topAlert?.event : 'All Clear'}
                            </span>
                        </div>
                    </Card>

                    {/* Daily Task Card */}
                    <Card className="aspect-[4/5] p-3 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl relative overflow-hidden transition-colors">
                        <span className="text-[10px] font-bold uppercase mb-auto pt-1 text-gray-900 dark:text-gray-400">Daily Task</span>
                        <div className="flex flex-col items-center my-auto w-full">
                            {/* Standardized Icon Container to match others (h-8 w-8) */}
                            <div className="h-8 w-8 mb-2 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <CheckCircle className="h-5 w-5" strokeWidth={3} />
                            </div>
                            <p className="text-[10px] font-medium text-gray-900 dark:text-gray-300 leading-tight line-clamp-3 px-1">
                                {currentTask ? currentTask.title : 'Check Supplies'}
                            </p>
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
                    onClick={() => router.push('/guardian')}
                >
                    <div className="mr-6 border-2 border-white/30 rounded-full p-2">
                        <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-start text-white">
                        <span className="text-lg font-bold uppercase tracking-wide">Guardian Live</span>
                        <span className="text-xs text-red-100 font-medium tracking-wider">Voice Assistant</span>
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

                {/* Practice Mode */}
                <Button
                    variant="outline"
                    className="w-full h-14 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center gap-3"
                    onClick={() => setShowSimModal(true)}
                >
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Practice Mode</span>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">Simulation</span>
                </Button>

            </main>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <NavIcon icon={Home} label="Home" active />
                <NavIcon icon={Scan} label="Scan" onClick={() => router.push('/vision-audit')} />
                <NavIcon icon={User} label="Profile" onClick={() => router.push('/onboarding')} />
                <NavIcon icon={Settings} label="Settings" onClick={() => router.push('/settings')} />
            </div>

            {/* Simulation Mode Modal */}
            <AnimatePresence>
                {showSimModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
                        onClick={() => setShowSimModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Practice Mode</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Train with simulated emergencies</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Select a scenario to practice with Guardian. No real alerts will be triggered.
                            </p>

                            <div className="space-y-2 mb-6">
                                {SIMULATION_SCENARIOS.map((scenario) => (
                                    <button
                                        key={scenario.id}
                                        onClick={() => setSelectedScenario(scenario.id)}
                                        className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${selectedScenario === scenario.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${scenario.color} flex items-center justify-center`}>
                                            <scenario.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{scenario.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{scenario.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSimModal(false)}
                                    className="flex-1 h-11 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedScenario) {
                                            router.push(`/guardian?simulation=${selectedScenario}`)
                                        }
                                    }}
                                    disabled={!selectedScenario}
                                    className="flex-1 h-11 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                                >
                                    Start Practice
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
