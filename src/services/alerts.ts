import { Alert, AlertSeverity } from '@/types/alerts'
import { WeatherData } from '@/types/weather'

/**
 * Generate alerts based on current weather conditions
 */
export function generateWeatherAlerts(weather: WeatherData | null): Alert[] {
    if (!weather) return []

    const alerts: Alert[] = []
    const now = new Date()

    // Check for severe weather conditions based on icon codes
    const { icon, windSpeed, description, temperature } = weather

    // Thunderstorm
    if (icon.startsWith('11')) {
        alerts.push({
            id: `weather-thunderstorm-${now.getTime()}`,
            type: 'weather',
            severity: 'warning',
            title: 'Thunderstorm Alert',
            description: `Thunderstorm conditions detected in ${weather.city}. Seek indoor shelter immediately.`,
            source: 'weather_api',
            isActive: true,
            createdAt: now,
            actionRequired: 'Stay indoors and away from windows',
        })
    }

    // Heavy rain / shower
    if (icon.startsWith('09') || icon.startsWith('10')) {
        alerts.push({
            id: `weather-rain-${now.getTime()}`,
            type: 'weather',
            severity: 'advisory',
            title: 'Rain Advisory',
            description: `${description.charAt(0).toUpperCase() + description.slice(1)} expected. Roads may be slippery.`,
            source: 'weather_api',
            isActive: true,
            createdAt: now,
        })
    }

    // Snow
    if (icon.startsWith('13')) {
        alerts.push({
            id: `weather-snow-${now.getTime()}`,
            type: 'weather',
            severity: 'watch',
            title: 'Winter Weather Watch',
            description: 'Snow conditions detected. Prepare for potential travel disruptions.',
            source: 'weather_api',
            isActive: true,
            createdAt: now,
            actionRequired: 'Stock up on supplies and limit travel',
        })
    }

    // High winds (> 40 km/h)
    if (windSpeed > 40) {
        alerts.push({
            id: `weather-wind-${now.getTime()}`,
            type: 'weather',
            severity: windSpeed > 60 ? 'warning' : 'watch',
            title: 'High Wind Alert',
            description: `Wind speeds of ${windSpeed} km/h detected. Secure loose outdoor items.`,
            source: 'weather_api',
            isActive: true,
            createdAt: now,
            actionRequired: 'Secure outdoor furniture and avoid exposed areas',
        })
    }

    // Extreme heat (> 35°C)
    if (temperature > 35) {
        alerts.push({
            id: `weather-heat-${now.getTime()}`,
            type: 'weather',
            severity: temperature > 40 ? 'warning' : 'advisory',
            title: 'Extreme Heat Advisory',
            description: `Temperature of ${temperature}°C. Stay hydrated and avoid prolonged sun exposure.`,
            source: 'weather_api',
            isActive: true,
            createdAt: now,
            actionRequired: 'Stay cool, drink water, check on elderly neighbors',
        })
    }

    // Extreme cold (< -10°C)
    if (temperature < -10) {
        alerts.push({
            id: `weather-cold-${now.getTime()}`,
            type: 'weather',
            severity: temperature < -20 ? 'warning' : 'advisory',
            title: 'Extreme Cold Advisory',
            description: `Temperature of ${temperature}°C. Risk of frostbite and hypothermia.`,
            source: 'weather_api',
            isActive: true,
            createdAt: now,
            actionRequired: 'Limit outdoor exposure, dress in layers',
        })
    }

    // Fog/Mist
    if (icon.startsWith('50')) {
        alerts.push({
            id: `weather-fog-${now.getTime()}`,
            type: 'weather',
            severity: 'info',
            title: 'Visibility Advisory',
            description: 'Foggy conditions reducing visibility. Drive carefully.',
            source: 'weather_api',
            isActive: true,
            createdAt: now,
        })
    }

    return alerts
}

/**
 * Get the highest severity from a list of alerts
 */
export function getHighestSeverity(alerts: Alert[]): AlertSeverity {
    const severityOrder: AlertSeverity[] = ['info', 'advisory', 'watch', 'warning', 'emergency']

    let highest: AlertSeverity = 'info'
    for (const alert of alerts) {
        if (severityOrder.indexOf(alert.severity) > severityOrder.indexOf(highest)) {
            highest = alert.severity
        }
    }
    return highest
}

/**
 * Get a summary text for multiple alerts
 */
export function getAlertSummary(alerts: Alert[]): string {
    if (alerts.length === 0) return 'No active alerts'
    if (alerts.length === 1) return alerts[0].title

    const severity = getHighestSeverity(alerts)
    if (severity === 'emergency' || severity === 'warning') {
        const severeCount = alerts.filter(a => a.severity === 'warning' || a.severity === 'emergency').length
        return `${severeCount} urgent alert${severeCount > 1 ? 's' : ''}`
    }

    return `${alerts.length} active alert${alerts.length > 1 ? 's' : ''}`
}
