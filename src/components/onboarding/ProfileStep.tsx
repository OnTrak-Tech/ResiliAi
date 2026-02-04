'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, User, Phone, Crosshair, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'

export function ProfileStep({ onComplete }: { onComplete: () => void }) {
    const { profile, setName, setLocation, setEmergencyContact } = useUserStore()
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        setIsValid(profile.name.length > 0 && profile.location.length > 0)
    }, [profile])

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto relative px-2">


            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <span className="text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase">Step 1</span>
                <h2 className="font-oswald text-4xl font-bold text-white mb-2">Your Identity</h2>
                <div className="h-1 w-12 bg-orange-600 mt-2" />
            </motion.div>

            <div className="space-y-8 flex-1">
                {/* Tactical Input Group */}
                <div className="space-y-4">
                    <div className="relative">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</p>
                        <div className="group relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500" />
                            <Input
                                placeholder="FULL NAME"
                                value={profile.name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-12 h-14 bg-white/5 backdrop-blur-xl border-white/10 text-white font-bold placeholder:text-gray-700 rounded-none border-l-2 focus:border-l-orange-500 transition-all uppercase"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Location</p>
                        <div className="flex gap-1">
                            <div className="relative flex-1 group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500" />
                                <Input
                                    placeholder="CITY / REGION"
                                    value={profile.location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-12 h-14 bg-white/5 backdrop-blur-xl border-white/10 text-white font-bold placeholder:text-gray-700 rounded-none border-l-2 focus:border-l-orange-500 transition-all uppercase"
                                />
                            </div>
                            <Button className="h-14 w-14 bg-white/5 border border-white/10 hover:bg-orange-500/20 group">
                                <Crosshair className="text-gray-500 group-hover:text-orange-500 transition-colors" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Emergency Card */}
                <div className="p-4 bg-orange-600/5 border-l-2 border-orange-600/50 space-y-4">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Emergency Contact</p>
                    <Input
                        placeholder="CONTACT NAME"
                        value={profile.emergencyContact.name}
                        onChange={(e) => setEmergencyContact({ ...profile.emergencyContact, name: e.target.value })}
                        className="h-12 bg-black/40 border-white/5 rounded-none uppercase text-sm"
                    />
                    <Input
                        placeholder="SECURE LINE (PHONE)"
                        value={profile.emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...profile.emergencyContact, phone: e.target.value })}
                        className="h-12 bg-black/40 border-white/5 rounded-none uppercase text-sm"
                    />
                </div>
            </div>

            <div className="py-8">
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