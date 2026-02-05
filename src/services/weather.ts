import { WeatherData, WeatherAlert, WeatherResponse, OWMCurrentResponse } from '@/types/weather'

const API_BASE = 'https://api.openweathermap.org/data/2.5'

/**
 * Get the OpenWeatherMap API key from environment variables
 */
function getApiKey(): string {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
    if (!apiKey) {
        throw new Error('OpenWeatherMap API key not configured. Set NEXT_PUBLIC_OPENWEATHERMAP_API_KEY in your .env.local file.')
    }
    return apiKey
}

/**
 * Fetch current weather data for a location
 * Uses the free Current Weather endpoint
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const apiKey = getApiKey()

    const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

    const response = await fetch(url)

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your OpenWeatherMap API key.')
        }
        throw new Error(`Weather API error: ${response.statusText}`)
    }

    const data: OWMCurrentResponse = await response.json()

    return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        city: data.name,
        country: data.sys.country,
    }
}

/**
 * Get weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

/**
 * Get weather by city name (fallback if geolocation not available)
 */
export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
    const apiKey = getApiKey()

    const url = `${API_BASE}/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`)
    }

    const data: OWMCurrentResponse = await response.json()

    return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        city: data.name,
        country: data.sys.country,
    }
}

/**
 * Weather condition to emoji mapping for display
 */
export function getWeatherEmoji(iconCode: string): string {
    const iconMap: Record<string, string> = {
        '01d': '☀️', '01n': '🌙',  // Clear
        '02d': '⛅', '02n': '☁️',  // Few clouds
        '03d': '☁️', '03n': '☁️',  // Scattered clouds
        '04d': '☁️', '04n': '☁️',  // Broken clouds
        '09d': '🌧️', '09n': '🌧️', // Shower rain
        '10d': '🌦️', '10n': '🌧️', // Rain
        '11d': '⛈️', '11n': '⛈️', // Thunderstorm
        '13d': '❄️', '13n': '❄️', // Snow
        '50d': '🌫️', '50n': '🌫️', // Mist
    }
    return iconMap[iconCode] || '🌡️'
}

/**
 * Check if weather conditions are severe (for alerts)
 */
export function isSevereWeather(iconCode: string): boolean {
    const severeIcons = ['09d', '09n', '10d', '10n', '11d', '11n', '13d', '13n']
    return severeIcons.includes(iconCode)
}
