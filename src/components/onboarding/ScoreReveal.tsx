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

    // Fixed blue color for the "Professional" theme, regardless of score
    // The gauge logic remains (strokeDashoffset)

    const circumference = 2 * Math.PI * 90 // radius = 90
    const strokeDashoffset = circumference - (displayScore / 100) * circumference

    return (
        <div className="flex flex-col items-center text-center font-sans px-6 pt-12">
            {/* Progress Bar (Visual Only for this step as per mockup) */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-white">
                <div className="max-w-md mx-auto flex gap-2">
                    <div className="h-1 flex-1 rounded-full bg-blue-500" />
                    <div className="h-1 flex-1 rounded-full bg-blue-500" />
                    <div className="h-1 flex-1 rounded-full bg-blue-500" />
                </div>
            </div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-6 mt-8"
            >
                <Shield className="h-14 w-14 text-blue-600 fill-white" strokeWidth={1.5} />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2 text-gray-900">Your Resilience Score</h2>
            <p className="text-gray-500 mb-12 font-medium">Based on your household profile</p>

            {/* Circular progress */}
            <div className="relative w-64 h-64 mb-12">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r="90"
                        stroke="#f3f4f6"
                        strokeWidth="16"
                        fill="none"
                        className="opacity-50"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="90"
                        stroke="#2563eb"
                        strokeWidth="16"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        style={{ strokeDasharray: circumference }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                    />
                </svg>
                {/* Score number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-bold text-blue-600 tracking-tighter">
                        {displayScore}
                    </span>
                    <span className="text-gray-400 text-lg font-medium mt-1">/ 100</span>
                </div>
            </div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="text-lg text-gray-600 mb-12 max-w-xs font-medium"
            >
                Let&apos;s work on your preparedness.
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="w-full max-w-md mt-auto mb-8"
            >
                <Button
                    onClick={onContinue}
                    className="w-full h-14 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </motion.div>
        </div>
    )
}
