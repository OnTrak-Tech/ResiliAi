'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'

export default function HomePage() {
  const router = useRouter()
  const { profile } = useUserStore()

  useEffect(() => {
    // If already onboarded, go to dashboard
    if (profile.onboardingComplete) {
      router.push('/dashboard')
    }
  }, [profile.onboardingComplete, router])

  const handleStart = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="mb-8"
      >
        <div className="relative">
          <Shield className="h-20 w-20 text-orange-500" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      {/* Brand */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-2"
      >
        Resili<span className="text-orange-500">Ai</span>
      </motion.h1>

      {/* Tagline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-bold text-center mb-4 leading-tight"
      >
        DISASTERS<br />DON&apos;T WAIT
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-gray-400 text-center mb-12 max-w-sm"
      >
        Your AI-powered survival intelligence. Audit your home. Train for emergencies. Stay prepared.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-black font-bold px-12 py-6 text-lg rounded-xl shadow-lg shadow-orange-500/20"
        >
          START SCAN
        </Button>
      </motion.div>

      {/* Footer nav hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 flex gap-8 text-gray-600 text-sm"
      >
        <span>Home</span>
        <span>Map</span>
        <span>Alerts</span>
        <span>Profile</span>
      </motion.div>
    </div>
  )
}
