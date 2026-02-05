'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Dog, Baby, Users, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import Image from 'next/image'

interface QuizStepProps {
    onComplete: () => void
}

export function QuizStep({ onComplete }: QuizStepProps) {
    const {
        profile,
        setHousingType,
        setHasPets,
        setHasKids,
        setHasElderly,
        setHasBackupPower
    } = useUserStore()

    // Local state for the form to allow visual toggling before committing if needed,
    // though directing binding to store is fine here as per previous pattern.
    // Using direct store access for simplicity and consistency.

    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        // Validation: Must select a housing type
        setIsValid(profile.housingType !== 'apartment' && profile.housingType !== 'house' ? false : true)
    }, [profile.housingType])

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto relative bg-white text-gray-900 font-sans px-6 pt-4 pb-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="icon" className="text-gray-900 -ml-2">
                    <ArrowLeft className="h-6 w-6" strokeWidth={2} />
                </Button>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                {/* 1. Housing Type Section */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 leading-tight">What is your housing type?</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* House Option */}
                        <div
                            onClick={() => setHousingType('house')}
                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${profile.housingType === 'house'
                                ? 'ring-4 ring-blue-500 scale-[1.02]'
                                : 'hover:opacity-90'
                                }`}
                        >
                            <Image
                                src="/icons/house-card.png"
                                alt="House"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute bottom-4 left-4 text-white font-bold text-lg">House</span>

                            {/* Selected Checkmark */}
                            {profile.housingType === 'house' && (
                                <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* Apartment Option */}
                        <div
                            onClick={() => setHousingType('apartment')}
                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${profile.housingType === 'apartment'
                                ? 'ring-4 ring-blue-500 scale-[1.02]'
                                : 'hover:opacity-90'
                                }`}
                        >
                            <Image
                                src="/icons/apartment-card.png"
                                alt="Apartment"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute bottom-4 left-4 text-white font-bold text-lg">Apartment</span>

                            {/* Selected Checkmark */}
                            {profile.housingType === 'apartment' && (
                                <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. Household Details Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 leading-snug px-1">
                        Do you have pets, kids, or elderly family?
                    </h2>

                    <div className="space-y-4">
                        {/* Pets Toggle */}
                        <ToggleCard
                            icon={Dog}
                            iconColor="text-blue-500"
                            bgIcon="bg-blue-100"
                            label="Pets"
                            sublabel="Dogs, cats, or other animals"
                            checked={profile.hasPets}
                            onChange={setHasPets}
                        />

                        {/* Children Toggle */}
                        <ToggleCard
                            icon={Baby}
                            iconColor="text-blue-500"
                            bgIcon="bg-blue-100"
                            label="Children"
                            sublabel="Kids under 12 years old"
                            checked={profile.hasKids}
                            onChange={setHasKids}
                        />

                        {/* Elderly Toggle */}
                        <ToggleCard
                            icon={Users}
                            iconColor="text-blue-500"
                            bgIcon="bg-blue-100"
                            label="Elderly Family"
                            sublabel="Seniors needing assistance"
                            checked={profile.hasElderly}
                            onChange={setHasElderly}
                        />

                        {/* Backup Power Toggle - NEW */}
                        <ToggleCard
                            icon={Zap}
                            iconColor="text-yellow-500"
                            bgIcon="bg-yellow-100"
                            label="Backup Power"
                            sublabel="Generators or battery storage"
                            checked={profile.hasBackupPower}
                            onChange={setHasBackupPower}
                        />
                    </div>
                </section>
            </div>

            {/* Sticky Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12 z-10 w-full max-w-md mx-auto">
                <Button
                    onClick={onComplete}
                    disabled={!isValid}
                    className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-lg rounded-full shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
                >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

// Sub-component for clean toggle cards
function ToggleCard({
    icon: Icon,
    iconColor,
    bgIcon,
    label,
    sublabel,
    checked,
    onChange
}: {
    icon: any,
    iconColor: string,
    bgIcon: string,
    label: string,
    sublabel: string,
    checked: boolean,
    onChange: (val: boolean) => void
}) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${checked ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
        >
            {/* Icon Box */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 ${bgIcon}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            {/* Text Content */}
            <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base">{label}</h3>
                <p className="text-gray-500 text-sm leading-tight">{sublabel}</p>
            </div>

            {/* Checkbox Visual */}
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </div>
        </div>
    )
}
