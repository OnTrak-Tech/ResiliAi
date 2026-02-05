// Alert Types

export interface Alert {
    id: string
    type: AlertType
    severity: AlertSeverity
    title: string
    description: string
    source: AlertSource
    isActive: boolean
    createdAt: Date
    expiresAt?: Date
    actionRequired?: string
}

export type AlertType =
    | 'weather'      // Weather warnings
    | 'earthquake'   // Seismic activity
    | 'fire'         // Wildfire or fire danger
    | 'flood'        // Flood warnings
    | 'system'       // App notifications
    | 'reminder'     // User reminders

export type AlertSeverity =
    | 'info'         // Informational
    | 'advisory'     // Be aware
    | 'watch'        // Conditions favorable
    | 'warning'      // Event imminent or occurring
    | 'emergency'    // Life-threatening

export type AlertSource =
    | 'weather_api'
    | 'user_generated'
    | 'system'

// Severity colors and icons mapping
export const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; bgColor: string; borderColor: string }> = {
    info: {
        color: 'text-blue-400',
        bgColor: 'bg-blue-600/10',
        borderColor: 'border-blue-500/40',
    },
    advisory: {
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-600/10',
        borderColor: 'border-cyan-500/40',
    },
    watch: {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-600/10',
        borderColor: 'border-yellow-500/40',
    },
    warning: {
        color: 'text-orange-400',
        bgColor: 'bg-orange-600/10',
        borderColor: 'border-orange-500/40',
    },
    emergency: {
        color: 'text-red-500',
        bgColor: 'bg-red-600/20',
        borderColor: 'border-red-500/50',
    },
}
