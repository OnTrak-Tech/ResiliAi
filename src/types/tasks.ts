// Daily Task Types

export interface DailyTask {
    id: string
    title: string
    description: string
    category: TaskCategory
    priority: 'low' | 'medium' | 'high' | 'urgent'
    estimatedMinutes: number
    completed: boolean
    completedAt?: Date
    createdAt: Date
    expiresAt: Date
    triggers: TaskTrigger[]
}

export type TaskCategory =
    | 'supplies'      // Stock up on essentials
    | 'safety'        // Safety checks and preparations
    | 'communication' // Emergency contacts, family plans
    | 'shelter'       // Home fortification
    | 'evacuation'    // Route planning, go-bags
    | 'knowledge'     // Learning and drills
    | 'seasonal'      // Weather-specific preparations

export interface TaskTrigger {
    type: 'weather' | 'date' | 'profile' | 'random' | 'streak'
    condition?: string
}

// Predefined task templates
export interface TaskTemplate {
    id: string
    title: string
    description: string
    category: TaskCategory
    priority: 'low' | 'medium' | 'high' | 'urgent'
    estimatedMinutes: number
    triggers: TaskTrigger[]
    applicableHousing?: ('house' | 'apartment')[]
    requiresPets?: boolean
    requiresKids?: boolean
    requiresElderly?: boolean
}

export const TASK_TEMPLATES: TaskTemplate[] = [
    // Weather-triggered tasks
    {
        id: 'secure-outdoor-items',
        title: 'Secure Outdoor Items',
        description: 'Move or tie down patio furniture, plants, and decorations that could become projectiles.',
        category: 'shelter',
        priority: 'high',
        estimatedMinutes: 15,
        triggers: [{ type: 'weather', condition: 'wind' }],
        applicableHousing: ['house'],
    },
    {
        id: 'close-storm-shutters',
        title: 'Check Storm Shutters',
        description: 'Ensure all storm shutters or window protections are functional and ready to deploy.',
        category: 'shelter',
        priority: 'high',
        estimatedMinutes: 20,
        triggers: [{ type: 'weather', condition: 'storm' }],
        applicableHousing: ['house'],
    },
    {
        id: 'stock-water',
        title: 'Stock Emergency Water',
        description: 'Ensure you have at least 1 gallon of water per person per day for 3 days.',
        category: 'supplies',
        priority: 'medium',
        estimatedMinutes: 10,
        triggers: [{ type: 'weather', condition: 'storm' }, { type: 'random' }],
    },
    {
        id: 'charge-devices',
        title: 'Charge All Devices',
        description: 'Fully charge phones, tablets, power banks, and flashlights.',
        category: 'supplies',
        priority: 'high',
        estimatedMinutes: 5,
        triggers: [{ type: 'weather', condition: 'storm' }],
    },
    {
        id: 'review-evacuation-route',
        title: 'Review Evacuation Route',
        description: 'Check your planned evacuation route and identify at least one alternate path.',
        category: 'evacuation',
        priority: 'medium',
        estimatedMinutes: 10,
        triggers: [{ type: 'random' }, { type: 'streak' }],
    },
    {
        id: 'update-emergency-contacts',
        title: 'Update Emergency Contacts',
        description: 'Verify all emergency contact numbers are current and saved offline.',
        category: 'communication',
        priority: 'medium',
        estimatedMinutes: 10,
        triggers: [{ type: 'random' }],
    },
    {
        id: 'check-first-aid-kit',
        title: 'Check First Aid Kit',
        description: 'Verify supplies are stocked and medications are not expired.',
        category: 'supplies',
        priority: 'medium',
        estimatedMinutes: 10,
        triggers: [{ type: 'random' }],
    },
    {
        id: 'pet-emergency-supplies',
        title: 'Check Pet Emergency Supplies',
        description: 'Ensure pet food, medications, carriers, and ID tags are ready.',
        category: 'supplies',
        priority: 'medium',
        estimatedMinutes: 15,
        triggers: [{ type: 'profile' }],
        requiresPets: true,
    },
    {
        id: 'child-safety-drill',
        title: 'Practice Family Safety Drill',
        description: 'Run through emergency procedures with your children so they know what to do.',
        category: 'knowledge',
        priority: 'medium',
        estimatedMinutes: 20,
        triggers: [{ type: 'profile' }],
        requiresKids: true,
    },
    {
        id: 'elderly-medication-check',
        title: 'Check Elderly Medication Supply',
        description: 'Ensure at least 7 days of essential medications are available.',
        category: 'supplies',
        priority: 'high',
        estimatedMinutes: 10,
        triggers: [{ type: 'profile' }],
        requiresElderly: true,
    },
    {
        id: 'test-smoke-detectors',
        title: 'Test Smoke Detectors',
        description: 'Press test buttons on all smoke and CO detectors to verify they work.',
        category: 'safety',
        priority: 'medium',
        estimatedMinutes: 10,
        triggers: [{ type: 'random' }],
    },
    {
        id: 'apartment-exit-routes',
        title: 'Know Your Exit Routes',
        description: 'Walk through both stairwells and locate fire extinguishers on your floor.',
        category: 'evacuation',
        priority: 'medium',
        estimatedMinutes: 15,
        triggers: [{ type: 'random' }],
        applicableHousing: ['apartment'],
    },
    {
        id: 'flashlight-batteries',
        title: 'Check Flashlight Batteries',
        description: 'Test all flashlights and replace batteries if needed.',
        category: 'supplies',
        priority: 'low',
        estimatedMinutes: 5,
        triggers: [{ type: 'random' }],
    },
    {
        id: 'review-insurance',
        title: 'Review Insurance Documents',
        description: 'Ensure you have digital copies of insurance policies accessible offline.',
        category: 'communication',
        priority: 'low',
        estimatedMinutes: 15,
        triggers: [{ type: 'random' }],
    },
]
