'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { Home, Activity, User, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', icon: Home, active: true },
  { id: 'stats', icon: Activity, active: false },
  { id: 'profile', icon: User, active: false },
  { id: 'settings', icon: Settings, active: false },
]

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
        className="absolute top-6 left-6 flex items-center gap-3 z-20"
      >
        <div className="relative h-25 w-35">
          <Image
            src="/icons/resiliai-logo.png"
            alt="ResiliAi Logo"
            fill
            className="object-contain"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center mt-[-80px]"> {/* Visual weight adjustment */}

        {/* Typography - Updated to Antonio + Tighter Leading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-16"
        >
          {/* Changed from font-oswald to font-antonio and adjusted sizes/leading */}
          <h1 className="font-antonio text-6xl md:text-8xl font-bold leading-[0.85] mb-4 uppercase tracking-tighter">
            <span className="block text-white">Disasters</span>
            <span className="block text-white">Don&apos;t Wait</span>
          </h1>
        </motion.div>

        {/* Pulsating Logo / Heartbeat - Moved Below Typography */}
        <div className="relative mb-12 flex items-center justify-center">
          {/* Concentric Rings (Orbitals) */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute border border-red-500/20 rounded-full"
              style={{
                width: `${100 + i * 40}%`,
                height: `${100 + i * 40}%`,
                left: `-${i * 20}%`,
                top: `-${i * 20}%`
              }}
            />
          ))}

          {/* Central Orb with Heavy Bloom */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(220,38,38,1) 0%, rgba(153,27,27,0.8) 40%, rgba(0,0,0,0) 70%)',
              boxShadow: '0 0 50px 15px rgba(220,38,38,0.5), inset 0 0 30px rgba(255,100,100,0.4)'
            }}
          >
            {/* Larger Heartbeat Line */}
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>

        {/* Glassmorphism Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <Button
            onClick={handleStart}
            // Glassmorphism style: Transparent bg + Blur + Gradient Border + Cyan Glow
            className="w-full h-14 bg-black/40 backdrop-blur-md border border-transparent hover:bg-white/10 text-white font-antonio text-xl uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 group relative bg-clip-padding"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box'
            }}
          >
            <span className="flex items-center justify-center gap-2">
              Start Scan
            </span>
          </Button>
        </motion.div>
      </div>

      {/* Footer Nav Hint */}
      {/* Footer Nav Dock */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 w-full flex justify-center px-12 z-20"
      >
        <div className="flex items-center justify-between w-full max-w-xs">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className="relative flex flex-col items-center group cursor-pointer">
              <item.icon
                size={24}
                className={`transition-colors duration-300 ${item.active ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                strokeWidth={1.5}
              />

              {/* The Active Indicator (The small blue dot/glow from the mockup) */}
              {item.active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-4 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
