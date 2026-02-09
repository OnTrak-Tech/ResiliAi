'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GuardianLive } from '@/components/features/GuardianLive'

// Simulation scenario configurations
const SIMULATION_ALERTS: Record<string, { event: string; description: string }> = {
    tornado: {
        event: 'Tornado Warning',
        description: 'A tornado has been spotted in your area. Take shelter immediately in an interior room on the lowest floor.',
    },
    earthquake: {
        event: 'Earthquake Alert',
        description: 'Strong earthquake activity detected. Drop, cover, and hold on. Stay away from windows and heavy objects.',
    },
    flood: {
        event: 'Flash Flood Warning',
        description: 'Flash flooding is occurring or imminent. Move to higher ground immediately. Avoid walking or driving through flood waters.',
    },
}

function GuardianContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [showGuardian, setShowGuardian] = useState(true)

    // Check for simulation mode
    const simulationId = searchParams.get('simulation')
    const isSimulation = !!simulationId && simulationId in SIMULATION_ALERTS
    const simulationAlert = isSimulation ? SIMULATION_ALERTS[simulationId] : null

    const handleClose = () => {
        setShowGuardian(false)
        router.push('/dashboard')
    }

    if (!showGuardian) return null

    return (
        <GuardianLive
            onClose={handleClose}
            simulationAlert={simulationAlert}
            isSimulation={isSimulation}
        />
    )
}

export default function GuardianPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
            <GuardianContent />
        </Suspense>
    )
}
