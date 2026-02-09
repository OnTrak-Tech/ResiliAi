'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'
import { MapPin } from 'lucide-react'

export function ProfileStep({ onComplete }: { onComplete: () => void }) {
    const { profile, setName, setEmail, setLocation, setEmergencyContact } = useUserStore()
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        setIsValid(
            profile.name.length > 0 &&
            profile.email.length > 0 &&
            profile.location.length > 0 &&
            profile.emergencyContact.name.length > 0 &&
            profile.emergencyContact.phone.length > 0
        )
    }, [profile])

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

                {/* Email (New Field) */}
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
            </div>

            <div className="py-8 mt-auto">
                <Button
                    onClick={onComplete}
                    disabled={!isValid}
                    className="w-full h-14 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:shadow-none transition-all duration-300 uppercase tracking-wide"
                >
                    Initialize Protocol
                </Button>
            </div>
        </div>
    )
}