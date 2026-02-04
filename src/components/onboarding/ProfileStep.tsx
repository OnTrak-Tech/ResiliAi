'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, User, Phone, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'

interface ProfileStepProps {
    onComplete: () => void
}

export function ProfileStep({ onComplete }: ProfileStepProps) {
    const { profile, setName, setLocation, setEmergencyContact } = useUserStore()
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        setIsValid(
            profile.name.length > 0 &&
            profile.location.length > 0 &&
            profile.emergencyContact.name.length > 0
        )
    }, [profile])


    const handleGetLocation = () => {
        setIsLoadingLocation(true)
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    // In a real app, reverse geocode here. 
                    // For now, simulating "City, Country"
                    setTimeout(() => {
                        setLocation("San Francisco, CA")
                        setIsLoadingLocation(false)
                    }, 1000)
                } catch (error) {
                    setIsLoadingLocation(false)
                }
            })
        }
    }

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-orange-500 rounded-full" />
                    <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Step 01</span>
                </div>
                <h2 className="font-oswald text-4xl font-bold text-white mb-2">IDENTITY</h2>
                <p className="text-gray-400 text-sm">
                    Initialize your profile for local threat assessment.
                </p>
            </motion.div>

            <div className="space-y-6 flex-1">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <Input
                            placeholder="Enter your name"
                            value={profile.name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-12 h-14 bg-gray-900/50 border-gray-800 text-lg focus:border-orange-500 focus:ring-0 rounded-xl transition-all"
                        />
                    </div>
                </div>

                {/* Location Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input
                                placeholder="City or Region"
                                value={profile.location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="pl-12 h-14 bg-gray-900/50 border-gray-800 text-lg focus:border-orange-500 focus:ring-0 rounded-xl transition-all"
                            />
                        </div>
                        <Button
                            onClick={handleGetLocation}
                            disabled={isLoadingLocation}
                            className={`h-14 px-6 font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/50 rounded-xl transition-all ${isLoadingLocation ? 'opacity-50' : ''}`}
                        >
                            {isLoadingLocation ? '...' : 'GPS'}
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-gray-800 my-6" />

                {/* Emergency Contact */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Emergency Contact</label>

                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <Input
                            placeholder="Contact Name"
                            value={profile.emergencyContact.name}
                            onChange={(e) => setEmergencyContact({ ...profile.emergencyContact, name: e.target.value })}
                            className="pl-12 h-14 bg-gray-900/50 border-gray-800 text-base focus:border-orange-500 focus:ring-0 rounded-xl transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <Input
                            placeholder="Phone Number"
                            value={profile.emergencyContact.phone}
                            onChange={(e) => setEmergencyContact({ ...profile.emergencyContact, phone: e.target.value })}
                            className="pl-12 h-14 bg-gray-900/50 border-gray-800 text-base focus:border-orange-500 focus:ring-0 rounded-xl transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 pb-4">
                <Button
                    onClick={onComplete}
                    disabled={!isValid}
                    className="w-full h-16 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-oswald text-xl uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:shadow-none transition-all duration-300"
                >
                    Initialize Protocol
                </Button>
            </div>
        </div>
    )
}
