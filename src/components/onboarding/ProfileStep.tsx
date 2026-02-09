'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'
import { MapPin } from 'lucide-react'

export function ProfileStep({ onComplete }: { onComplete: () => void }) {
    const { profile, setName, setLocation, setEmergencyContact, setEmail, setVerificationHash } = useUserStore()
    const [isValid, setIsValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        // Allows +, spaces, dashes, parentheses and numbers. Min 10 digits/chars.
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/

        setIsValid(
            profile.name.length > 0 &&
            profile.location.length > 0 &&
            emailRegex.test(profile.email) &&
            profile.emergencyContact.name.length > 0 &&
            phoneRegex.test(profile.emergencyContact.phone)
        )
    }, [profile])

    const handleInitialize = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send verification code')
            }

            // Save the signature hash to the store
            setVerificationHash(data.hash)
            onComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto relative px-6 font-sans">

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 mt-4"
            >

                {/* Progress Bar */}
                <div className="h-2 w-full bg-blue-100 rounded-full mb-8 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#1e40af] rounded-full" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup</h2>
            </motion.div>

            <div className="space-y-6 flex-1">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                        placeholder="Enter your full name"
                        value={profile.name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-all"
                    />
                </div>

                {/* Email (Synced to Store) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <Input
                        placeholder="Enter your email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-all"
                    />
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="relative">
                        <Input
                            placeholder="Enter city or region"
                            value={profile.location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-all pr-10"
                        />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="pt-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Emergency Contact</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Contact Name</label>
                        <Input
                            placeholder="Emergency contact name"
                            value={profile.emergencyContact.name}
                            onChange={(e) => setEmergencyContact({ ...profile.emergencyContact, name: e.target.value })}
                            className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <Input
                            placeholder="Emergency contact phone"
                            type="tel"
                            value={profile.emergencyContact.phone}
                            onChange={(e) => setEmergencyContact({ ...profile.emergencyContact, phone: e.target.value })}
                            className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-all"
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>

            <div className="py-8 mt-auto">
                <Button
                    onClick={handleInitialize}
                    disabled={!isValid || isLoading}
                    className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:shadow-none transition-all duration-300 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        'Initialize Protocol'
                    )}
                </Button>
            </div>
        </div>
    )
}