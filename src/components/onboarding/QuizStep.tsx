'use client'

import { useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Home, Building2, Dog, Baby, Users, Zap, X, Check } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface QuizStepProps {
    onComplete: () => void
}

interface QuizQuestion {
    id: string
    question: string
    options: {
        value: string | boolean
        label: string
        icon: React.ReactNode
    }[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setter: (value: any) => void
}

export function QuizStep({ onComplete }: QuizStepProps) {
    const { setHousingType, setHasPets, setHasKids, setHasElderly, setHasBackupPower } = useUserStore()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    const questions: QuizQuestion[] = [
        {
            id: 'housing',
            question: 'Do you live in a house or apartment?',
            options: [
                { value: 'house', label: 'House', icon: <Home className="h-12 w-12" /> },
                { value: 'apartment', label: 'Apartment', icon: <Building2 className="h-12 w-12" /> },
            ],
            setter: setHousingType,
        },
        {
            id: 'pets',
            question: 'Do you have pets?',
            options: [
                { value: true, label: 'Yes', icon: <Dog className="h-12 w-12" /> },
                { value: false, label: 'No', icon: <X className="h-12 w-12" /> },
            ],
            setter: setHasPets,
        },
        {
            id: 'kids',
            question: 'Do you have children at home?',
            options: [
                { value: true, label: 'Yes', icon: <Baby className="h-12 w-12" /> },
                { value: false, label: 'No', icon: <X className="h-12 w-12" /> },
            ],
            setter: setHasKids,
        },
        {
            id: 'elderly',
            question: 'Do you care for elderly family members?',
            options: [
                { value: true, label: 'Yes', icon: <Users className="h-12 w-12" /> },
                { value: false, label: 'No', icon: <X className="h-12 w-12" /> },
            ],
            setter: setHasElderly,
        },
        {
            id: 'power',
            question: 'Do you have backup power?',
            options: [
                { value: true, label: 'Yes', icon: <Zap className="h-12 w-12" /> },
                { value: false, label: 'No', icon: <X className="h-12 w-12" /> },
            ],
            setter: setHasBackupPower,
        },
    ]

    const currentQuestion = questions[currentIndex]

    const handleSelect = (value: string | boolean) => {
        currentQuestion.setter(value)
        setDirection(1)

        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300)
        } else {
            setTimeout(onComplete, 300)
        }
    }

    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 100) {
            const isRight = info.offset.x > 0
            const options = currentQuestion.options
            // Swipe right = first option, left = second option
            handleSelect(isRight ? options[0].value : options[1].value)
        }
    }

    return (
        <div className="flex flex-col items-center">
            {/* Question counter */}
            <div className="text-orange-500 mb-4 text-sm">
                {currentIndex + 1} / {questions.length}
            </div>

            {/* Card stack */}
            <div className="relative h-80 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ scale: 0.9, opacity: 0, x: direction * 100 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 0.9, opacity: 0, x: -direction * 100 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={handleDrag}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center shadow-xl">
                            <h2 className="text-xl font-semibold mb-8">{currentQuestion.question}</h2>

                            <div className="flex gap-6">
                                {currentQuestion.options.map((option) => (
                                    <motion.button
                                        key={String(option.value)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelect(option.value)}
                                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-orange-500 transition-all"
                                    >
                                        <div className="text-orange-500">{option.icon}</div>
                                        <span className="text-sm font-medium">{option.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Swipe hint */}
            <p className="text-gray-500 text-sm mt-4">
                Swipe or tap to answer
            </p>

            {/* Action buttons */}
            <div className="flex gap-8 mt-6">
                <button
                    onClick={() => handleSelect(currentQuestion.options[1].value)}
                    className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition-all"
                >
                    <X className="h-8 w-8 text-red-500" />
                </button>
                <button
                    onClick={() => handleSelect(currentQuestion.options[0].value)}
                    className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center hover:bg-green-500/30 transition-all"
                >
                    <Check className="h-8 w-8 text-green-500" />
                </button>
            </div>
        </div>
    )
}
