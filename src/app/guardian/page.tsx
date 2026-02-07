'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GuardianLive } from '@/components/features/GuardianLive'

export default function GuardianPage() {
    const router = useRouter()
    const [showGuardian, setShowGuardian] = useState(true)

    const handleClose = () => {
        setShowGuardian(false)
        router.push('/dashboard')
    }

    if (!showGuardian) return null

    return <GuardianLive onClose={handleClose} />
}
