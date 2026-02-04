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
    if (profile.onboardingComplete) {
      router.push('/dashboard')
    }
  }, [profile.onboardingComplete, router])

  const handleStart = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Texture/Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Pulsating Shield Logo */}
        <div className="relative mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-red-600 rounded-full blur-xl"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="h-24 w-24 text-orange-500 fill-orange-500/10 stroke-[1.5]" />
          </motion.div>
        </div>

        {/* Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-orange-500 font-bold tracking-widest text-sm mb-2 uppercase">ResiliAi System</h2>
          <h1 className="font-oswald text-6xl font-bold leading-none mb-1 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
            DISASTERS
          </h1>
          <h1 className="font-oswald text-6xl font-bold leading-none text-white">
            DON&apos;T WAIT
          </h1>
          <p className="mt-6 text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
            Your AI-powered survival intelligence. Audit your home. Train for emergencies. Stay prepared.
          </p>
        </motion.div>

        {/* Cyberpunk Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <Button
            onClick={handleStart}
            className="w-full h-16 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-oswald text-xl uppercase tracking-wider rounded-none relative group overflow-hidden border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] clip-path-slant"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start Scan <span className="text-xs opacity-70">///</span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Button>
        </motion.div>
      </div>

      {/* Footer Nav Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 flex gap-8 text-gray-600 text-xs font-medium tracking-wider uppercase"
      >
        <span>Home</span>
        <span>Map</span>
        <span>Alerts</span>
        <span>Profile</span>
      </motion.div>
    </div>
  )
}
