import { Neighbor, Resource, Need, MeshMessage, ResourceType } from '@/types/mesh'

// Simulated neighbors for demo purposes
// In production, this would come from P2P mesh network or backend
const MOCK_NEIGHBORS: Neighbor[] = [
    {
        id: 'neighbor-1',
        name: 'Sarah M.',
        distance: 45,
        status: 'offering',
        lastSeen: new Date(),
        skills: ['First Aid', 'Ham Radio'],
        resources: [
            { id: 'r1', type: 'water', description: 'Extra bottled water (12 gallons)', quantity: 12, available: true },
            { id: 'r2', type: 'communication', description: 'Ham radio with backup battery', available: true },
        ],
        needs: [],
        isOnline: true,
    },
    {
        id: 'neighbor-2',
        name: 'Marcus T.',
        distance: 120,
        status: 'safe',
        lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
        skills: ['Generator Operation', 'Basic Repairs'],
        resources: [
            { id: 'r3', type: 'power', description: 'Portable generator (2000W)', available: true },
            { id: 'r4', type: 'tools', description: 'Basic tool kit', available: true },
        ],
        needs: [],
        isOnline: true,
    },
    {
        id: 'neighbor-3',
        name: 'Elena R.',
        distance: 200,
        status: 'needs_help',
        lastSeen: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
        skills: ['Nursing'],
        resources: [
            { id: 'r5', type: 'medical', description: 'First aid kit', available: true },
        ],
        needs: [
            { id: 'n1', type: 'power', description: 'Need to charge medical equipment', urgency: 'high', fulfilled: false },
        ],
        isOnline: true,
    },
    {
        id: 'neighbor-4',
        name: 'David K.',
        distance: 350,
        status: 'evacuating',
        lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        skills: ['Driving'],
        resources: [
            { id: 'r6', type: 'transport', description: 'SUV with roof rack, can fit 3 extra people', available: true },
        ],
        needs: [],
        isOnline: false,
    },
]

const MOCK_MESSAGES: MeshMessage[] = [
    {
        id: 'msg-1',
        senderId: 'neighbor-1',
        senderName: 'Sarah M.',
        type: 'resource_offer',
        content: 'I have extra water bottles if anyone needs them. Also have a working ham radio for emergency comms.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isRead: true,
    },
    {
        id: 'msg-2',
        senderId: 'neighbor-3',
        senderName: 'Elena R.',
        type: 'help_request',
        content: 'Need power source to charge CPAP machine. Battery dying in about 2 hours.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
    },
    {
        id: 'msg-3',
        senderId: 'neighbor-4',
        senderName: 'David K.',
        type: 'info_share',
        content: 'Highway 101 southbound is clear. Heading to evacuation shelter at Lincoln High.',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        isRead: true,
    },
]

/**
 * Get nearby neighbors (mock implementation)
 * In production: P2P mesh network discovery
 */
export async function getNearbyNeighbors(): Promise<Neighbor[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return MOCK_NEIGHBORS
}

/**
 * Get mesh messages (mock implementation)
 * In production: P2P message sync
 */
export async function getMeshMessages(): Promise<MeshMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_MESSAGES.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Find neighbors with specific resources
 */
export function findNeighborsWithResource(neighbors: Neighbor[], resourceType: ResourceType): Neighbor[] {
    return neighbors.filter(n =>
        n.resources.some(r => r.type === resourceType && r.available) && n.isOnline
    )
}

/**
 * Find neighbors who need help
 */
export function findNeighborsNeedingHelp(neighbors: Neighbor[]): Neighbor[] {
    return neighbors.filter(n => n.status === 'needs_help' || n.needs.some(need => !need.fulfilled))
}

/**
 * Match resources to needs (AI-assisted in production)
 */
export function matchResourceToNeed(neighbors: Neighbor[]): Array<{ provider: Neighbor; receiver: Neighbor; resource: ResourceType }> {
    const matches: Array<{ provider: Neighbor; receiver: Neighbor; resource: ResourceType }> = []

    const providers = neighbors.filter(n => n.status === 'offering' || n.resources.length > 0)
    const receivers = neighbors.filter(n => n.needs.some(need => !need.fulfilled))

    for (const receiver of receivers) {
        for (const need of receiver.needs.filter(n => !n.fulfilled)) {
            const provider = providers.find(p =>
                p.id !== receiver.id &&
                p.resources.some(r => r.type === need.type && r.available)
            )
            if (provider) {
                matches.push({ provider, receiver, resource: need.type })
            }
        }
    }

    return matches
}

/**
 * Get unread message count
 */
export function getUnreadCount(messages: MeshMessage[]): number {
    return messages.filter(m => !m.isRead).length
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${meters}m away`
    }
    return `${(meters / 1000).toFixed(1)}km away`
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}
