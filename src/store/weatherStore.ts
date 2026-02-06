import { create } from 'zustand'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

interface WeatherData {
    temp: number
    condition: string
    humidity: number
    windSpeed: number
    icon: string
}

interface AlertData {
    sender_name: string
    event: string
    start: number
    end: number
    description: string
}

interface WeatherStore {
    weather: WeatherData | null
    alerts: AlertData[]
    loading: boolean
    error: string | null
    fetchWeather: (location: string) => Promise<void>
}

export const useWeatherStore = create<WeatherStore>((set) => ({
    weather: null,
    alerts: [],
    loading: false,
    error: null,
    fetchWeather: async (location: string) => {
        set({ loading: true, error: null })
        try {
            if (!API_KEY) {
                console.warn("OpenWeatherMap API Key is missing. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.")
                set({
                    weather: {
                        temp: 22,
                        condition: 'Partly Cloudy (Mock)',
                        humidity: 60,
                        windSpeed: 5,
                        icon: '02d'
                    },
                    loading: false
                })
                return
            }

            // 1. Geocoding (OpenWeatherMap)
            const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`)
            const geoData = await geoRes.json()

            if (!geoData || geoData.length === 0) {
                throw new Error('Location not found')
            }

            const { lat, lon } = geoData[0]

            // 2. Current Weather (OpenWeatherMap)
            const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
            const weatherData = await weatherRes.json()

            // 3. Alerts (Open-Meteo Hybrid)
            // Fetching additional data from Open-Meteo to derive alerts since OWM standard doesn't provide them
            const meteoRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,wind_speed_10m,precipitation`
            )
            const meteoData = await meteoRes.json()
            const meteoCurrent = meteoData.current

            // Logic to generate "Alerts" based on Open-Meteo data
            const generatedAlerts: AlertData[] = []

            // Severe Weather Codes (Thunderstorm / Heavy Snow / Heavy Rain)
            if (meteoCurrent.weather_code >= 95) {
                generatedAlerts.push({
                    sender_name: 'Open-Meteo (Derived)',
                    event: 'Thunderstorm Warning',
                    start: Date.now(),
                    end: Date.now() + 3600000,
                    description: 'Thunderstorm detected in your area. Please stay indoors.'
                })
            } else if (meteoCurrent.weather_code >= 66 && meteoCurrent.weather_code <= 67) {
                generatedAlerts.push({
                    sender_name: 'Open-Meteo (Derived)',
                    event: 'Freezing Rain Alert',
                    start: Date.now(),
                    end: Date.now() + 3600000,
                    description: 'Freezing rain detected. Road conditions may be hazardous.'
                })
            }

            // High Wind Alert
            if (meteoCurrent.wind_speed_10m > 60) { // >60 km/h
                generatedAlerts.push({
                    sender_name: 'ResiliAi System',
                    event: 'High Wind Warning',
                    start: Date.now(),
                    end: Date.now() + 7200000,
                    description: `High winds of ${meteoCurrent.wind_speed_10m} km/h detected.`
                })
            }

            set({
                weather: {
                    temp: weatherData.main.temp,
                    condition: weatherData.weather[0].main,
                    humidity: weatherData.main.humidity,
                    windSpeed: weatherData.wind.speed,
                    icon: weatherData.weather[0].icon
                },
                alerts: generatedAlerts
            })

            set({ loading: false })
        } catch (error) {
            console.error("Weather Fetch Error:", error)
            set({ error: 'Failed to fetch weather data', loading: false })
        }
    }
}))
