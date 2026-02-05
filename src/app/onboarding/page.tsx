'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfileStep } from '@/components/onboarding/ProfileStep'
import { QuizStep } from '@/components/onboarding/QuizStep'
import { ScoreReveal } from '@/components/onboarding/ScoreReveal'
import { useUserStore } from '@/store/userStore'

type OnboardingStep = 'profile' | 'quiz' | 'score'

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile')
    const router = useRouter()
    const { profile, completeOnboarding } = useUserStore()

    const handleProfileComplete = () => {
        setCurrentStep('quiz')
    }

    const handleQuizComplete = () => {
        completeOnboarding()
        setCurrentStep('score')
    }

    const handleFinish = () => {
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
            {/* Step content */}
            <div className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    {currentStep === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1"
                        >
                            <ProfileStep onComplete={handleProfileComplete} />
                        </motion.div>
                    )}

                    {currentStep === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex items-center justify-center p-4"
                        >
                            <QuizStep onComplete={handleQuizComplete} />
                        </motion.div>
                    )}

                    {currentStep === 'score' && (
                        <motion.div
                            key="score"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 flex items-center justify-center p-4"
                        >
                            <ScoreReveal score={profile.resilienceScore} onContinue={handleFinish} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
