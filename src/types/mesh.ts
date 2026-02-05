// Community Mesh Types

export interface Neighbor {
    id: string
    name: string
    distance: number // in meters
    status: NeighborStatus
    lastSeen: Date
    hashedLocation?: string // For privacy
    skills: string[]
    resources: Resource[]
    needs: Need[]
    isOnline: boolean
}

export type NeighborStatus =
    | 'safe'        // All good
    | 'needs_help'  // Requesting assistance
    | 'offering'    // Has resources to share
    | 'evacuating'  // Leaving area
    | 'unknown'     // No recent status

export interface Resource {
    id: string
    type: ResourceType
    description: string
    quantity?: number
    available: boolean
}

export type ResourceType =
    | 'water'
    | 'food'
    | 'power'       // Generator, batteries
    | 'medical'     // First aid, medications
    | 'shelter'     // Space for people
    | 'transport'   // Vehicle
    | 'tools'
    | 'communication'
    | 'other'

export interface Need {
    id: string
    type: ResourceType
    description: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
    fulfilled: boolean
}

export interface MeshMessage {
    id: string
    senderId: string
    senderName: string
    type: MessageType
    content: string
    timestamp: Date
    isRead: boolean
}

export type MessageType =
    | 'status_update'
    | 'resource_offer'
    | 'help_request'
    | 'info_share'
    | 'check_in'

// Resource icons mapping
export const RESOURCE_ICONS: Record<ResourceType, string> = {
    water: '💧',
    food: '🍞',
    power: '🔋',
    medical: '🏥',
    shelter: '🏠',
    transport: '🚗',
    tools: '🔧',
    communication: '📡',
    other: '📦',
}

// Status colors
export const STATUS_CONFIG: Record<NeighborStatus, { color: string; bgColor: string; label: string }> = {
    safe: { color: 'text-green-400', bgColor: 'bg-green-600/20', label: 'Safe' },
    needs_help: { color: 'text-red-400', bgColor: 'bg-red-600/20', label: 'Needs Help' },
    offering: { color: 'text-blue-400', bgColor: 'bg-blue-600/20', label: 'Offering Aid' },
    evacuating: { color: 'text-yellow-400', bgColor: 'bg-yellow-600/20', label: 'Evacuating' },
    unknown: { color: 'text-gray-400', bgColor: 'bg-gray-600/20', label: 'Unknown' },
}
