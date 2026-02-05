'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, AlertCircle, Info, Bell, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertSeverity, SEVERITY_CONFIG } from '@/types/alerts'
import { generateWeatherAlerts, getAlertSummary, getHighestSeverity } from '@/services/alerts'
import { getCurrentWeather } from '@/services/weather'
import { WeatherData } from '@/types/weather'
import { motion, AnimatePresence } from 'framer-motion'

function getSeverityIcon(severity: AlertSeverity) {
    switch (severity) {
        case 'emergency':
        case 'warning':
            return <AlertTriangle className="h-4 w-4" />
        case 'watch':
        case 'advisory':
            return <AlertCircle className="h-4 w-4" />
        default:
            return <Info className="h-4 w-4" />
    }
}

interface AlertsWidgetProps {
    compact?: boolean
    onClick?: () => void
}

export function AlertsWidget({ compact = true, onClick }: AlertsWidgetProps) {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAlerts() {
            setLoading(true)
            setError(null)

            try {
                // Get weather data for alert generation
                let weather: WeatherData | null = null

                if ('geolocation' in navigator) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                        })
                        weather = await getCurrentWeather(
                            position.coords.latitude,
                            position.coords.longitude
                        )
                    } catch {
                        // Geolocation not available
                    }
                }

                // Generate alerts from weather
                const weatherAlerts = generateWeatherAlerts(weather)
                setAlerts(weatherAlerts)
            } catch (err) {
                setError('Failed to load alerts')
            } finally {
                setLoading(false)
            }
        }

        fetchAlerts()

        // Refresh every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    if (compact) {
        // Compact version for Dashboard
        if (loading) {
            return (
                <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">Loading...</p>
                    </CardContent>
                </Card>
            )
        }

        const hasAlerts = alerts.length > 0
        const severity = hasAlerts ? getHighestSeverity(alerts) : 'info'
        const config = SEVERITY_CONFIG[severity]
        const summary = getAlertSummary(alerts)

        return (
            <Card
                className={`${hasAlerts ? config.bgColor : 'bg-white/5'} backdrop-blur-md ${hasAlerts ? config.borderColor : 'border-white/10'} hover:border-opacity-60 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-between cursor-pointer`}
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${hasAlerts ? config.color : 'text-gray-400'} flex items-center gap-2`}>
                        {hasAlerts ? (
                            <motion.div
                                animate={{ scale: severity === 'warning' || severity === 'emergency' ? [1, 1.2, 1] : 1 }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                {getSeverityIcon(severity)}
                            </motion.div>
                        ) : (
                            <Shield className="h-4 w-4 text-green-400" />
                        )}
                        Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={`text-xl font-bold font-antonio tracking-wide ${hasAlerts ? config.color : 'text-green-400'}`}>
                        {hasAlerts ? summary : 'All Clear'}
                    </p>
                    {hasAlerts && (
                        <p className="text-white/50 text-xs mt-1 flex items-center gap-1">
                            Tap for details <ChevronRight className="h-3 w-3" />
                        </p>
                    )}
                </CardContent>
            </Card>
        )
    }

    // Expanded version (for modal or dedicated page)
    return (
        <div className="space-y-4">
            {loading && <p className="text-gray-400">Loading alerts...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!loading && alerts.length === 0 && (
                <Card className="bg-green-600/10 border-green-500/40 p-6 text-center">
                    <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-400 font-bold text-lg">All Clear</p>
                    <p className="text-white/50 text-sm mt-1">No active alerts in your area</p>
                </Card>
            )}
            <AnimatePresence>
                {alerts.map((alert) => {
                    const config = SEVERITY_CONFIG[alert.severity]
                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Card className={`${config.bgColor} ${config.borderColor}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className={`text-sm ${config.color} flex items-center gap-2`}>
                                        {getSeverityIcon(alert.severity)}
                                        {alert.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80 text-sm">{alert.description}</p>
                                    {alert.actionRequired && (
                                        <div className="mt-3 p-2 bg-black/20 rounded-lg">
                                            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Action Required</p>
                                            <p className={`text-sm font-medium ${config.color}`}>{alert.actionRequired}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
