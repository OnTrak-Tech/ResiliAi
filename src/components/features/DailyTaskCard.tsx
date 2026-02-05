'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertTriangle, Loader2, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTaskStore } from '@/store/taskStore'
import { useUserStore } from '@/store/userStore'
import { generateDailyTask, getTaskReason } from '@/services/dailyTasks'
import { getCurrentWeather } from '@/services/weather'
import { WeatherData } from '@/types/weather'
import { motion, AnimatePresence } from 'framer-motion'

export function DailyTaskCard() {
    const { currentTask, setCurrentTask, completeTask, shouldGenerateNewTask, completedTaskIds } = useTaskStore()
    const { profile } = useUserStore()
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [reason, setReason] = useState<string>('Daily preparedness check')

    useEffect(() => {
        async function initializeTask() {
            setLoading(true)

            // Try to get weather for context-aware task generation
            let weatherData: WeatherData | null = null
            try {
                if ('geolocation' in navigator) {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    })
                    weatherData = await getCurrentWeather(
                        position.coords.latitude,
                        position.coords.longitude
                    )
                    setWeather(weatherData)
                }
            } catch {
                // Weather not available, continue without it
            }

            // Generate new task if needed
            if (shouldGenerateNewTask()) {
                const newTask = generateDailyTask(weatherData, profile, completedTaskIds)
                setCurrentTask(newTask)
                setReason(getTaskReason(newTask, weatherData))
            } else if (currentTask) {
                setReason(getTaskReason(currentTask, weatherData))
            }

            setLoading(false)
        }

        initializeTask()
    }, [])

    const handleComplete = () => {
        completeTask()
    }

    if (loading) {
        return (
            <Card className="col-span-2 bg-orange-600/10 border-orange-500/40 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 text-orange-400 animate-spin" />
                <p className="text-xs text-orange-400 mt-2">Generating your task...</p>
            </Card>
        )
    }

    if (!currentTask) {
        return (
            <Card className="col-span-2 bg-green-600/10 border-green-500/40 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
                <CheckCircle className="text-green-500 h-8 w-8" />
                <p className="text-xs text-green-400 mt-2 uppercase tracking-widest">All tasks complete!</p>
            </Card>
        )
    }

    const priorityColors = {
        low: 'text-gray-400 border-gray-500/40 bg-gray-600/10',
        medium: 'text-orange-400 border-orange-500/40 bg-orange-600/10',
        high: 'text-red-400 border-red-500/40 bg-red-600/10',
        urgent: 'text-red-500 border-red-600/50 bg-red-600/20',
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentTask.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-2"
            >
                <Card className={`${priorityColors[currentTask.priority]} flex flex-col justify-center items-center p-6 backdrop-blur-sm transition-all ${currentTask.completed ? 'opacity-60' : ''}`}>
                    {currentTask.completed ? (
                        <div className="text-center">
                            <CheckCircle className="text-green-500 h-8 w-8 mx-auto mb-2" />
                            <p className="text-green-400 font-bold uppercase tracking-widest">Completed!</p>
                            <p className="text-white/50 text-xs mt-1">{currentTask.title}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-orange-500/20 p-2 rounded-full">
                                    {currentTask.priority === 'urgent' ? (
                                        <AlertTriangle className="text-red-500 h-5 w-5 animate-pulse" />
                                    ) : (
                                        <CheckCircle className="text-orange-500 h-5 w-5" />
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1">
                                Daily Task
                            </p>
                            <p className="text-center font-bold text-lg font-antonio tracking-wide text-white">
                                {currentTask.title}
                            </p>
                            <p className="text-white/50 text-xs mt-2 text-center uppercase tracking-wider">
                                {reason}
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-1 text-white/40 text-xs">
                                    <Clock className="h-3 w-3" />
                                    {currentTask.estimatedMinutes} min
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleComplete}
                                    className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Done
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>
        </AnimatePresence>
    )
}
