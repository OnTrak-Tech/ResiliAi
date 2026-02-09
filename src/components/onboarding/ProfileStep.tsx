'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'

export function ProfileStep({ onComplete }: { onComplete: () => void }) {
    const { profile, setName, setEmail, setLocation, setEmergencyContact, setVerificationHash } = useUserStore()
    const [isValid, setIsValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setIsValid(
            profile.name.length > 0 &&
            (profile.email || '').length > 0 &&
            profile.location.length > 0 &&
            profile.emergencyContact.name.length > 0 &&
            profile.emergencyContact.phone.length > 0
        )
    }, [profile])

    const handleInitialize = async () => {
        if (!isValid) return

        setIsLoading(true)
        setError(null)

        try {
            // Send OTP verification
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email || '' })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send verification code')
            }

            // Save the signature hash to the store
            setVerificationHash(data.hash)
            onComplete()
        } catch (err: any) {
            console.error('OTP Error:', err)
            setError(err.message || 'Failed to send verification code. Please try again.')
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
                <span className="text-gray-500 text-sm font-medium block mb-2 text-center">Step 1</span>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-blue-100 rounded-full mb-8 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#1e40af] rounded-full" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Profile Setup</h2>
            </motion.div>

            <div className="space-y-6 flex-1 overflow-y-auto pb-24">
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

                {/* Email (New Field) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <Input
                        placeholder="Enter your email"
                        type="email"
                        value={profile.email || ''}
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

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Footer / Next Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-10">
                <div className="max-w-md mx-auto w-full">
                    <Button
                        onClick={handleInitialize}
                        disabled={!isValid || isLoading}
                        className="w-full h-12 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending Code...
                            </>
                        ) : (
                            'Next Step'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}