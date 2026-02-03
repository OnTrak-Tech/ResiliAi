import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
    id: string
    name: string
    location: {
        lat: number | null
        lng: number | null
        city: string
        country: string
    }
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
}

interface UserStore {
    profile: UserProfile
    setName: (name: string) => void
    setLocation: (location: UserProfile['location']) => void
    setEmergencyContact: (contact: UserProfile['emergencyContact']) => void
    setHousingType: (type: 'house' | 'apartment') => void
    setHasPets: (value: boolean) => void
    setHasKids: (value: boolean) => void
    setHasElderly: (value: boolean) => void
    setHasBackupPower: (value: boolean) => void
    calculateResilienceScore: () => void
    completeOnboarding: () => void
    resetProfile: () => void
}

const initialProfile: UserProfile = {
    id: crypto.randomUUID(),
    name: '',
    location: { lat: null, lng: null, city: '', country: '' },
    emergencyContact: { name: '', phone: '' },
    housingType: null,
    hasPets: null,
    hasKids: null,
    hasElderly: null,
    hasBackupPower: null,
    resilienceScore: 0,
    onboardingComplete: false,
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
                if (profile.location.lat && profile.location.lng) score += 5

                // Clamp between 0-100
                score = Math.max(0, Math.min(100, score))

                set((state) => ({ profile: { ...state.profile, resilienceScore: score } }))
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
