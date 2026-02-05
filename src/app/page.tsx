'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { Shield } from 'lucide-react'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const { profile } = useUserStore()

  useEffect(() => {
    if (profile.onboardingComplete) {
      router.push('/dashboard')
    }
  }, [profile.onboardingComplete, router])

  const handleStart = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center relative overflow-hidden font-sans">

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 max-w-md mx-auto space-y-12">

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col items-center"
        >
          <div className="relative w-64 h-24 mb-6">
            <Image
              src="/icons/ResiliAi.png"
              alt="ResiliAi Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-[280px]">
            AI-Powered Disaster Preparedness & Resilience.
          </p>
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full"
        >
          <Button
            onClick={handleStart}
            className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-lg font-medium rounded-xl shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02]"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
