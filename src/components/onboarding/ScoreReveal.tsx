'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScoreRevealProps {
    score: number
    onContinue: () => void
}

export function ScoreReveal({ score, onContinue }: ScoreRevealProps) {
    const [displayScore, setDisplayScore] = useState(0)

    useEffect(() => {
        // Animate score counting up
        const duration = 2000 // 2 seconds
        const steps = 60
        const increment = score / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= score) {
                setDisplayScore(score)
                clearInterval(timer)
            } else {
                setDisplayScore(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [score])

    const getScoreColor = () => {
        if (score >= 70) return 'text-green-500'
        if (score >= 40) return 'text-orange-500'
        return 'text-red-500'
    }

    const getScoreMessage = () => {
        if (score >= 70) return 'Great! You\'re well prepared.'
        if (score >= 40) return 'Good start. Room for improvement.'
        return 'Let\'s work on your preparedness.'
    }

    const circumference = 2 * Math.PI * 90 // radius = 90
    const strokeDashoffset = circumference - (displayScore / 100) * circumference

    return (
        <div className="flex flex-col items-center text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-6"
            >
                <Shield className="h-12 w-12 text-orange-500" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Your Resilience Score</h2>
            <p className="text-gray-400 mb-8">Based on your household profile</p>

            {/* Circular progress */}
            <div className="relative w-52 h-52 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="104"
                        cy="104"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="104"
                        cy="104"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        className={getScoreColor()}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        style={{ strokeDasharray: circumference }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                    />
                </svg>
                {/* Score number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor()}`}>
                        {displayScore}
                    </span>
                    <span className="text-gray-500 text-sm">/100</span>
                </div>
            </div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="text-lg text-gray-300 mb-8"
            >
                {getScoreMessage()}
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
            >
                <Button
                    onClick={onContinue}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8"
                >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>
        </div>
    )
}
