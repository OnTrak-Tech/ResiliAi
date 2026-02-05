import { create } from 'zustand'

interface WeatherData {
    temp: number
    condition: string
    humidity: number
    windSpeed: number
}

interface WeatherStore {
    weather: WeatherData | null
    loading: boolean
    error: string | null
    fetchWeather: (location: string) => Promise<void>
}

// Mock weather data or simple fetch logic
export const useWeatherStore = create<WeatherStore>((set) => ({
    weather: null,
    loading: false,
    error: null,
    fetchWeather: async (location: string) => {
        set({ loading: true, error: null })
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Return mock data based on location or default
            // In a real app, calls OpenWeatherMap or similar
            set({
                weather: {
                    temp: 26,
                    condition: 'Clear Sky',
                    humidity: 45,
                    windSpeed: 12
                },
                loading: false
            })
        } catch (error) {
            set({ error: 'Failed to fetch weather', loading: false })
        }
    }
}))
