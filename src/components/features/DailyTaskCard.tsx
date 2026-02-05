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
    const { currentTask, generateDailyTasks, completeTask, completedTaskIds, tasks } = useTaskStore()
    const { profile } = useUserStore()
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    // const [reason, setReason] = useState<string>('Daily preparedness check') // Simplifying to avoid complex prop drilling for now

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
            // Use store logic instead of local checks
            if (!currentTask || currentTask.completed) {
                generateDailyTasks(profile, weatherData)
            }

            setLoading(false)
        }

        initializeTask()
    }, [currentTask, generateDailyTasks, profile]) // Dependencies updated

    const handleComplete = () => {
        if (currentTask) {
            completeTask(currentTask.id)
        }
    }

    if (loading) {
        return (
            // Matching the new light theme style even in loading
            <Card className="col-span-1 aspect-[4/5] bg-white border-gray-100 flex flex-col justify-center items-center p-3 shadow-sm rounded-2xl">
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            </Card>
        )
    }

    if (!currentTask) {
        return (
            <Card className="col-span-1 aspect-[4/5] bg-white border-gray-100 flex flex-col justify-center items-center p-3 shadow-sm rounded-2xl">
                <CheckCircle className="text-green-500 h-6 w-6" />
                <p className="text-[10px] text-gray-500 mt-2 font-medium">All done!</p>
            </Card>
        )
    }

    // Reuse the layout from the main dashboard refactor plan for consistency if used there, 
    // OR keep this as the "Detailed" view if this component is used elsewhere?
    // The previous file content shows this is used in the Bento Grid (DailyTaskCard).
    // The Dashboard Page refactor I just did replaces this usage with an inline card.
    // However, to fix the BUILD, I must fix this component regardless of usage.

    // I will simplify this to match the inline style I put in dashboard/page.tsx to be safe and consistent
    // IF it is being used.

    return (
        <Card className="aspect-[4/5] p-3 flex flex-col items-center justify-center text-center bg-white border-none shadow-sm rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase mb-auto pt-1">Daily Task</span>
            <div className="flex flex-col items-center my-auto w-full">
                <div className="bg-green-500 rounded-full p-1 mb-2">
                    {currentTask.completed ? (
                        <CheckCircle className="text-white h-5 w-5" strokeWidth={3} />
                    ) : (
                        <AlertTriangle className="text-white h-5 w-5" strokeWidth={3} /> // Or CheckCircle as target
                    )}
                </div>
                <p className="text-[10px] font-medium text-gray-900 leading-tight line-clamp-3 px-1">
                    {currentTask.title}
                </p>
                {/* Visual Checkbox */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={`mt-2 h-6 w-6 p-0 border-2 rounded ${currentTask.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                    onClick={handleComplete}
                >
                    {currentTask.completed && <CheckCircle className="h-4 w-4 text-white" />}
                </Button>
            </div>
        </Card>
    )
}
