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

      {/* Top Left Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 flex items-center gap-2 z-20"
      >
        <Shield className="h-6 w-6 text-orange-500 fill-orange-500/10" />
        <span className="font-oswald text-lg tracking-wide text-gray-200">ResiliAi</span>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center mt-[-80px]"> {/* Visual weight adjustment */}

        {/* Pulsating Shield / Heartbeat */}
        <div className="relative mb-12">
          {/* Outer ripples */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-red-600/30 rounded-full blur-xl"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
            className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl"
          />

          {/* Center Circle */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            {/* Heartbeat Line Graphic (CSS or SVG) */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </motion.div>
        </div>

        {/* Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-16"
        >
          <h1 className="font-oswald text-5xl md:text-6xl font-bold leading-tight mb-2 uppercase tracking-tight">
            <span className="block text-white">Disasters</span>
            <span className="block text-white">Don&apos;t Wait</span>
          </h1>
        </motion.div>

        {/* Glassmorphism Button - Matched to Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <Button
            onClick={handleStart}
            // Glassmorphism style: Transparent bg + Blur + Border + Glow
            className="w-full h-14 bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 hover:border-white/40 text-white font-oswald text-lg uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 group"
          >
            <span className="flex items-center justify-center gap-2">
              Start Scan
            </span>
          </Button>
        </motion.div>
      </div>

      {/* Footer Nav Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 w-full flex justify-between px-8 text-gray-500 text-[10px] font-medium tracking-widest uppercase"
      >
        <div className="flex gap-6 mx-auto">
          <span className="text-white border-b border-orange-500 pb-1">Home</span>
          <span>Map</span>
          <span>Alerts</span>
          <span>Profile</span>
        </div>
      </motion.div>
    </div>
  )
}
