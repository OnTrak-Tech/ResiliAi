// OpenWeatherMap API Types

export interface WeatherData {
    temperature: number
    feelsLike: number
    description: string
    icon: string
    humidity: number
    windSpeed: number
    city: string
    country: string
}

export interface WeatherAlert {
    event: string
    sender: string
    description: string
    start: Date
    end: Date
}

export interface WeatherResponse {
    current: WeatherData
    alerts: WeatherAlert[]
}

// OpenWeatherMap API Response Types
export interface OWMCurrentResponse {
    main: {
        temp: number
        feels_like: number
        humidity: number
    }
    weather: Array<{
        id: number
        main: string
        description: string
        icon: string
    }>
    wind: {
        speed: number
    }
    name: string
    sys: {
        country: string
    }
}

export interface OWMOneCallResponse {
    current: {
        temp: number
        feels_like: number
        humidity: number
        wind_speed: number
        weather: Array<{
            id: number
            main: string
            description: string
            icon: string
        }>
    }
    alerts?: Array<{
        sender_name: string
        event: string
        description: string
        start: number
        end: number
    }>
}
