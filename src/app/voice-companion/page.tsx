'use client'

import { useRouter } from 'next/navigation'
import { VoiceCompanion } from '@/components/features/VoiceCompanion'

export default function VoiceCompanionPage() {
    const router = useRouter()

    return (
        <VoiceCompanion
            onClose={() => router.back()}
        />
    )
}
