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
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Progress indicator */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4">
                <div className="max-w-md mx-auto flex gap-2">
                    {['profile', 'quiz', 'score'].map((step, index) => (
                        <div
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${index <= ['profile', 'quiz', 'score'].indexOf(currentStep)
                                ? 'bg-orange-500'
                                : 'bg-gray-800'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center p-4 pt-16">
                <AnimatePresence mode="wait">
                    {currentStep === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full h-full"
                        >
                            <ProfileStep onComplete={handleProfileComplete} />
                        </motion.div>
                    )}

                    {currentStep === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-md"
                        >
                            <QuizStep onComplete={handleQuizComplete} />
                        </motion.div>
                    )}

                    {currentStep === 'score' && (
                        <motion.div
                            key="score"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md"
                        >
                            <ScoreReveal score={profile.resilienceScore} onContinue={handleFinish} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
