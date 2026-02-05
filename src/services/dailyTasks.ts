import { DailyTask, TaskTemplate, TASK_TEMPLATES } from '@/types/tasks'
import { WeatherData } from '@/types/weather'
import { UserProfile } from '@/store/userStore'

/**
 * Generate a daily task based on weather, user profile, and randomness
 */
export function generateDailyTask(
    weather: WeatherData | null,
    profile: UserProfile,
    completedTaskIds: string[]
): DailyTask {
    // Get applicable tasks based on profile and weather
    const applicableTasks = TASK_TEMPLATES.filter(template =>
        isTaskApplicable(template, weather, profile, completedTaskIds)
    )

    // Prioritize weather-triggered tasks if conditions match
    const weatherTasks = applicableTasks.filter(t =>
        t.triggers.some(trigger => trigger.type === 'weather') &&
        isWeatherTriggered(t, weather)
    )

    // Prioritize profile-specific tasks
    const profileTasks = applicableTasks.filter(t =>
        t.triggers.some(trigger => trigger.type === 'profile')
    )

    // Select task with priority: weather > profile > random
    let selectedTemplate: TaskTemplate
    if (weatherTasks.length > 0) {
        selectedTemplate = weatherTasks[Math.floor(Math.random() * weatherTasks.length)]
    } else if (profileTasks.length > 0) {
        selectedTemplate = profileTasks[Math.floor(Math.random() * profileTasks.length)]
    } else if (applicableTasks.length > 0) {
        selectedTemplate = applicableTasks[Math.floor(Math.random() * applicableTasks.length)]
    } else {
        // Fallback to a default task
        selectedTemplate = TASK_TEMPLATES[0]
    }

    // Create the daily task
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    return {
        id: `${selectedTemplate.id}-${now.toISOString().split('T')[0]}`,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        priority: determinePriority(selectedTemplate, weather),
        estimatedMinutes: selectedTemplate.estimatedMinutes,
        completed: false,
        createdAt: now,
        expiresAt: endOfDay,
        triggers: selectedTemplate.triggers,
    }
}

/**
 * Check if a task is applicable based on profile and recent history
 */
function isTaskApplicable(
    template: TaskTemplate,
    weather: WeatherData | null,
    profile: UserProfile,
    completedTaskIds: string[]
): boolean {
    // Don't repeat recently completed tasks
    const today = new Date().toISOString().split('T')[0]
    if (completedTaskIds.includes(`${template.id}-${today}`)) {
        return false
    }

    // Check housing type
    if (template.applicableHousing && profile.housingType) {
        if (!template.applicableHousing.includes(profile.housingType)) {
            return false
        }
    }

    // Check profile requirements
    if (template.requiresPets && !profile.hasPets) return false
    if (template.requiresKids && !profile.hasKids) return false
    if (template.requiresElderly && !profile.hasElderly) return false

    return true
}

/**
 * Check if weather conditions trigger this task
 */
function isWeatherTriggered(template: TaskTemplate, weather: WeatherData | null): boolean {
    if (!weather) return false

    const weatherTriggers = template.triggers.filter(t => t.type === 'weather')

    for (const trigger of weatherTriggers) {
        switch (trigger.condition) {
            case 'wind':
                // High wind (>30 km/h) or storm conditions
                if (weather.windSpeed > 30 || isStormWeather(weather)) return true
                break
            case 'storm':
                if (isStormWeather(weather)) return true
                break
            case 'rain':
                if (weather.icon.includes('09') || weather.icon.includes('10')) return true
                break
            case 'snow':
                if (weather.icon.includes('13')) return true
                break
        }
    }

    return false
}

/**
 * Check if current weather indicates a storm
 */
function isStormWeather(weather: WeatherData): boolean {
    // Thunderstorm icons: 11d, 11n
    // Heavy rain: 09d, 09n
    const stormIcons = ['09d', '09n', '10d', '10n', '11d', '11n']
    return stormIcons.includes(weather.icon) || weather.windSpeed > 40
}

/**
 * Determine task priority based on weather urgency
 */
function determinePriority(
    template: TaskTemplate,
    weather: WeatherData | null
): 'low' | 'medium' | 'high' | 'urgent' {
    // If triggered by severe weather, bump priority
    if (weather && isStormWeather(weather)) {
        if (template.priority === 'low') return 'medium'
        if (template.priority === 'medium') return 'high'
        if (template.priority === 'high') return 'urgent'
    }
    return template.priority
}

/**
 * Get a contextual reason for why this task was assigned
 */
export function getTaskReason(task: DailyTask, weather: WeatherData | null): string {
    const weatherTrigger = task.triggers.find(t => t.type === 'weather')

    if (weatherTrigger && weather) {
        if (isStormWeather(weather)) {
            return 'Storm conditions detected'
        }
        if (weather.windSpeed > 30) {
            return 'High wind warning'
        }
        if (weather.icon.includes('13')) {
            return 'Snow expected'
        }
    }

    const profileTrigger = task.triggers.find(t => t.type === 'profile')
    if (profileTrigger) {
        return 'Based on your household'
    }

    return 'Daily preparedness check'
}
