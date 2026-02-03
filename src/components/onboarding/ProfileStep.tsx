'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/userStore'

interface ProfileStepProps {
    onComplete: () => void
}

export function ProfileStep({ onComplete }: ProfileStepProps) {
    const { profile, setName, setLocation, setEmergencyContact } = useUserStore()
    const [isLocating, setIsLocating] = useState(false)
    const [localName, setLocalName] = useState(profile.name)
    const [localCity, setLocalCity] = useState(profile.location.city)
    const [emergencyName, setEmergencyName] = useState(profile.emergencyContact.name)
    const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyContact.phone)

    const handleGetLocation = async () => {
        setIsLocating(true)
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                })
            })

            // Reverse geocode (simplified - in production use a service)
            const { latitude, longitude } = position.coords
            setLocation({
                lat: latitude,
                lng: longitude,
                city: 'Detected Location',
                country: 'Auto',
            })
            setLocalCity('📍 Location Detected')
        } catch (error) {
            console.error('Location error:', error)
            alert('Could not get location. Please enter manually.')
        } finally {
            setIsLocating(false)
        }
    }

    const handleSubmit = () => {
        if (!localName.trim()) {
            alert('Please enter your name')
            return
        }

        setName(localName)
        if (localCity && !localCity.includes('Detected')) {
            setLocation({ ...profile.location, city: localCity })
        }
        setEmergencyContact({ name: emergencyName, phone: emergencyPhone })
        onComplete()
    }

    return (
        <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Your Identity</CardTitle>
                <p className="text-gray-400 text-center text-sm">
                    Help ResiliAi personalize your safety plan
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Full Name</label>
                    <Input
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        placeholder="Enter your name"
                        className="bg-gray-800 border-orange-500/50 focus:border-orange-500"
                    />
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Location</label>
                    <div className="flex gap-2">
                        <Input
                            value={localCity}
                            onChange={(e) => setLocalCity(e.target.value)}
                            placeholder="City or region"
                            className="bg-gray-800 border-gray-700 flex-1"
                        />
                        <Button
                            variant="outline"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                        >
                            <MapPin className="h-4 w-4 mr-1" />
                            {isLocating ? '...' : 'GPS'}
                        </Button>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Emergency Contact</label>
                    <Input
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Contact name"
                        className="bg-gray-800 border-gray-700 mb-2"
                    />
                    <Input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="Phone number"
                        className="bg-gray-800 border-gray-700"
                    />
                </div>

                {/* Continue Button */}
                <Button
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                >
                    Continue
                </Button>
            </CardContent>
        </Card>
    )
}
