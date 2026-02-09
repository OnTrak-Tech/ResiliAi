import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
    id: string
    name: string
    email: string
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
}

interface UserStore {
    profile: UserProfile
    setName: (name: string) => void
    setEmail: (email: string) => void
    setLocation: (location: string) => void
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
    email: '',
    location: '',
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

            setEmail: (email) =>
                set((state) => ({ profile: { ...state.profile, email } })),

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
                if (profile.location.length > 0) score += 5

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
