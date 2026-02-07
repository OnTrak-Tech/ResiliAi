'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    AlertTriangle,
    Flame,
    Droplets,
    Wind,
    Shield,
    Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnalysisResult, Hazard, DisasterType } from '@/services/geminiVision'

// --- Disaster Category Config ---
const DISASTER_CONFIG: Record<DisasterType, { icon: typeof AlertTriangle; label: string; color: string }> = {
    EARTHQUAKE: { icon: AlertTriangle, label: 'Earthquake Risks', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    FIRE: { icon: Flame, label: 'Fire Risks', color: 'text-red-600 bg-red-50 border-red-200' },
    FLOOD: { icon: Droplets, label: 'Flood Vulnerabilities', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    STORM: { icon: Wind, label: 'Storm Hazards', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    GENERAL: { icon: Shield, label: 'General Safety', color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

const SEVERITY_ORDER: Record<Hazard['severity'], number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
}

interface FortificationPlanProps {
    result: AnalysisResult
    onBack: () => void
}

export function FortificationPlan({ result, onBack }: FortificationPlanProps) {
    // --- State ---
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

    // --- Load from localStorage on mount ---
    useEffect(() => {
        const saved = localStorage.getItem('resiliai-fortification')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setCompletedItems(new Set(parsed.completedItems || []))
            } catch {
                // Ignore parse errors
            }
        }
    }, [])

    // --- Save to localStorage on change ---
    useEffect(() => {
        localStorage.setItem('resiliai-fortification', JSON.stringify({
            lastScanTimestamp: Date.now(),
            completedItems: Array.from(completedItems),
        }))
    }, [completedItems])

    // --- Toggle item completion ---
    const toggleItem = (itemId: string) => {
        setCompletedItems((prev) => {
            const next = new Set(prev)
            if (next.has(itemId)) {
                next.delete(itemId)
            } else {
                next.add(itemId)
            }
            return next
        })
    }

    // --- Group hazards by disaster type ---
    const groupedHazards = result.hazards.reduce((acc, hazard, index) => {
        const type = hazard.disasterType || 'GENERAL'
        if (!acc[type]) acc[type] = []
        acc[type].push({ ...hazard, id: `hazard-${index}` })
        return acc
    }, {} as Record<DisasterType, (Hazard & { id: string })[]>)

    // Sort each group by severity
    Object.keys(groupedHazards).forEach((key) => {
        groupedHazards[key as DisasterType].sort(
            (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
        )
    })

    // --- Calculate readiness score ---
    const totalItems = result.hazards.length
    const completedCount = result.hazards.filter((_, i) => completedItems.has(`hazard-${i}`)).length
    const readinessScore = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 100

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-50 bg-gray-50 flex flex-col font-sans"
        >
            {/* Header */}
            <header className="bg-white border-b border-gray-100 pt-8 pb-4 px-4 flex items-center gap-4 shadow-sm">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Button>
                <h1 className="text-lg font-bold text-gray-900">Fortification Plan</h1>
            </header>

            {/* Readiness Score */}
            <div className="bg-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Disaster Readiness</span>
                    <span className={`text-lg font-bold ${readinessScore >= 80 ? 'text-green-600' : readinessScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {readinessScore}%
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${readinessScore}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${readinessScore >= 80 ? 'bg-green-500' : readinessScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {completedCount} of {totalItems} hazards addressed
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {/* Hazard Groups */}
                {(Object.keys(DISASTER_CONFIG) as DisasterType[]).map((disasterType) => {
                    const hazards = groupedHazards[disasterType]
                    if (!hazards || hazards.length === 0) return null

                    const config = DISASTER_CONFIG[disasterType]
                    const Icon = config.icon

                    return (
                        <section key={disasterType} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Section Header */}
                            <div className={`flex items-center gap-3 px-4 py-3 border-b ${config.color}`}>
                                <Icon className="w-5 h-5" />
                                <span className="font-semibold text-sm">{config.label}</span>
                                <span className="ml-auto text-xs opacity-70">{hazards.length} item{hazards.length > 1 ? 's' : ''}</span>
                            </div>

                            {/* Hazard Items */}
                            <div className="divide-y divide-gray-100">
                                {hazards.map((hazard) => {
                                    const isCompleted = completedItems.has(hazard.id)
                                    return (
                                        <button
                                            key={hazard.id}
                                            onClick={() => toggleItem(hazard.id)}
                                            className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${isCompleted ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                    {hazard.recommendation}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <span className="font-medium">{hazard.item}</span>
                                                    {hazard.disasterContext && (
                                                        <> — {hazard.disasterContext}</>
                                                    )}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${hazard.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                    hazard.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                        hazard.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                }`}>
                                                {hazard.severity}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}

                {/* Assets Section */}
                {result.assets.length > 0 && (
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 border-b bg-green-50 text-green-700 border-green-200">
                            <Package className="w-5 h-5" />
                            <span className="font-semibold text-sm">Emergency Assets Found</span>
                        </div>
                        <ul className="p-4 space-y-2">
                            {result.assets.map((asset, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {asset}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Empty State */}
                {result.hazards.length === 0 && result.assets.length === 0 && (
                    <div className="text-center py-12">
                        <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
                        <p className="text-sm text-gray-500 mt-1">No hazards detected in this area.</p>
                    </div>
                )}
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
                <Button
                    onClick={onBack}
                    className="w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl"
                >
                    Done
                </Button>
            </div>
        </motion.div>
    )
}
