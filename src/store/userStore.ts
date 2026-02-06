import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
    id: string
    name: string
    location: string
    emergencyContact: {
        name: string
        phone: string
    }
    housingType: 'house' | 'apartment' | null
    hasPets: boolean | null
    hasKids: boolean | null
    hasElderly: boolean | null
    hasBackupPower: boolean | null
    resilienceScore: number
    onboardingComplete: boolean
    theme: 'light' | 'dark' | 'system'
}

interface UserStore {
    profile: UserProfile
    setName: (name: string) => void
    setLocation: (location: string) => void
    setEmergencyContact: (contact: UserProfile['emergencyContact']) => void
    setHousingType: (type: 'house' | 'apartment') => void
    setHasPets: (value: boolean) => void
    setHasKids: (value: boolean) => void
    setHasElderly: (value: boolean) => void
    setHasBackupPower: (value: boolean) => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    calculateResilienceScore: () => void
    completeOnboarding: () => void
    resetProfile: () => void
    detectLocation: () => Promise<void>
}

const initialProfile: UserProfile = {
    id: crypto.randomUUID(),
    name: '',
    location: '',
    emergencyContact: { name: '', phone: '' },
    housingType: null,
    hasPets: null,
    hasKids: null,
    hasElderly: null,
    hasBackupPower: null,
    resilienceScore: 0,
    onboardingComplete: false,
    theme: 'system' // Default to system
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            profile: initialProfile,

            setName: (name) =>
                set((state) => ({ profile: { ...state.profile, name } })),

            setLocation: (location) =>
                set((state) => ({ profile: { ...state.profile, location } })),

            setEmergencyContact: (emergencyContact) =>
                set((state) => ({ profile: { ...state.profile, emergencyContact } })),

            setHousingType: (housingType) =>
                set((state) => ({ profile: { ...state.profile, housingType } })),

            setHasPets: (hasPets) =>
                set((state) => ({ profile: { ...state.profile, hasPets } })),

            setHasKids: (hasKids) =>
                set((state) => ({ profile: { ...state.profile, hasKids } })),

            setHasElderly: (hasElderly) =>
                set((state) => ({ profile: { ...state.profile, hasElderly } })),

            setHasBackupPower: (hasBackupPower) =>
                set((state) => ({ profile: { ...state.profile, hasBackupPower } })),

            setTheme: (theme) =>
                set((state) => ({ profile: { ...state.profile, theme } })),

            calculateResilienceScore: () => {
                const profile = get().profile
                let score = 20 // Base score

                // Housing type scoring
                if (profile.housingType === 'house') score += 10
                if (profile.housingType === 'apartment') score += 5

                // Vulnerability modifiers
                if (profile.hasPets) score -= 5
                if (profile.hasKids) score -= 10
                if (profile.hasElderly) score -= 10

                // Preparedness bonuses
                if (profile.hasBackupPower) score += 15
                if (profile.emergencyContact.phone) score += 10
                if (profile.location.length > 0) score += 5

                // Clamp between 0-100
                score = Math.max(0, Math.min(100, score))

                set((state) => ({ profile: { ...state.profile, resilienceScore: score } }))
            },

            detectLocation: async () => {
                if (!navigator.geolocation) return

                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject)
                    })

                    const { latitude, longitude } = position.coords
                    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

                    if (!API_KEY) {
                        console.warn("Missing API Key for reverse geocoding")
                        return
                    }

                    // Reverse Geocoding to get City Name
                    const res = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`)
                    const data = await res.json()

                    if (data && data.length > 0) {
                        const city = data[0].name
                        set((state) => ({ profile: { ...state.profile, location: city } }))
                    }
                } catch (error) {
                    // Silently fail, forcing user to enter manually
                    console.log("Location detection denied or failed:", error)
                }
            },

            completeOnboarding: () => {
                get().calculateResilienceScore()
                set((state) => ({ profile: { ...state.profile, onboardingComplete: true } }))
            },

            resetProfile: () => set({ profile: initialProfile }),
        }),
        {
            name: 'resiliai-user-storage',
        }
    )
)
