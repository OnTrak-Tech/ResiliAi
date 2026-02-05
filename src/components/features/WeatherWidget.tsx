'use client'

import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentWeather, isSevereWeather } from '@/services/weather'
import { WeatherData } from '@/types/weather'

// Icon mapping based on weather condition
function getWeatherIcon(iconCode: string) {
    const iconMap: Record<string, React.ReactNode> = {
        '01d': <Sun className="text-yellow-400 h-5 w-5" />,
        '01n': <Sun className="text-yellow-300 h-5 w-5" />,
        '02d': <Cloud className="text-gray-300 h-5 w-5" />,
        '02n': <Cloud className="text-gray-400 h-5 w-5" />,
        '03d': <Cloud className="text-gray-400 h-5 w-5" />,
        '03n': <Cloud className="text-gray-500 h-5 w-5" />,
        '04d': <Cloud className="text-gray-500 h-5 w-5" />,
        '04n': <Cloud className="text-gray-600 h-5 w-5" />,
        '09d': <CloudRain className="text-blue-400 h-5 w-5" />,
        '09n': <CloudRain className="text-blue-500 h-5 w-5" />,
        '10d': <CloudRain className="text-blue-400 h-5 w-5" />,
        '10n': <CloudRain className="text-blue-500 h-5 w-5" />,
        '11d': <CloudLightning className="text-yellow-500 h-5 w-5" />,
        '11n': <CloudLightning className="text-yellow-600 h-5 w-5" />,
        '13d': <CloudSnow className="text-blue-200 h-5 w-5" />,
        '13n': <CloudSnow className="text-blue-300 h-5 w-5" />,
        '50d': <Wind className="text-gray-400 h-5 w-5" />,
        '50n': <Wind className="text-gray-500 h-5 w-5" />,
    }
    return iconMap[iconCode] || <Sun className="text-yellow-400 h-5 w-5" />
}

interface WeatherWidgetProps {
    compact?: boolean
}

export function WeatherWidget({ compact = true }: WeatherWidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchWeather() {
            try {
                setLoading(true)
                setError(null)

                // Use browser geolocation
                if (!('geolocation' in navigator)) {
                    setError('Geolocation not supported')
                    setLoading(false)
                    return
                }

                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        maximumAge: 300000, // 5 minutes cache
                    })
                })

                const data = await getCurrentWeather(
                    position.coords.latitude,
                    position.coords.longitude
                )
                setWeather(data)
            } catch (err) {
                if (err instanceof GeolocationPositionError) {
                    setError('Location access denied')
                } else {
                    setError(err instanceof Error ? err.message : 'Failed to load weather')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()

        // Refresh weather every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    if (compact) {
        // Compact version for Dashboard StatusCard
        if (loading) {
            return (
                <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Weather
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold font-antonio tracking-wide text-gray-500">Loading...</p>
                    </CardContent>
                </Card>
            )
        }

        if (error || !weather) {
            return (
                <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                            Weather
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-antonio tracking-wide text-gray-500">Unavailable</p>
                    </CardContent>
                </Card>
            )
        }

        const isSevere = isSevereWeather(weather.icon)

        return (
            <Card className={`bg-white/5 backdrop-blur-md border-white/10 hover:border-orange-500/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col justify-between ${isSevere ? 'border-orange-500/50' : ''}`}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                        {getWeatherIcon(weather.icon)}
                        Weather
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-bold font-antonio tracking-wide">
                        {weather.temperature}°C {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                    </p>
                    {isSevere && (
                        <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Severe conditions
                        </p>
                    )}
                </CardContent>
            </Card>
        )
    }

    // Full version (for future weather details page)
    return (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {weather && getWeatherIcon(weather.icon)}
                    Weather in {weather?.city || 'Unknown'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading && <p className="text-gray-400">Loading weather data...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {weather && (
                    <>
                        <div className="text-4xl font-bold font-antonio">
                            {weather.temperature}°C
                        </div>
                        <p className="text-gray-300 capitalize">{weather.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4" />
                                Humidity: {weather.humidity}%
                            </div>
                            <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4" />
                                Wind: {weather.windSpeed} km/h
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
