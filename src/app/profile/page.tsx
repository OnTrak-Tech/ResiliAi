'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, User, MapPin, Home, Phone, Users, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'

export default function ProfilePage() {
    const router = useRouter()
    const { profile } = useUserStore()

    const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | null | undefined }) => (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-gray-900 font-semibold">{value || 'Not set'}</p>
            </div>
        </div>
    )

    const BooleanItem = ({ label, value }: { label: string, value: boolean | null }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-gray-700 font-medium">{label}</span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {value ? 'Yes' : 'No'}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans flex flex-col items-center">
            {/* Header */}
            <header className="w-full pt-8 pb-4 px-6 flex items-center relative bg-gray-50">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-6"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </Button>
                <h1 className="w-full text-center text-xl font-bold">Profile Details</h1>
            </header>

            <main className="w-full max-w-md px-6 space-y-6 mt-4">

                {/* Personal Info */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Personal Information</h2>
                    <InfoItem icon={User} label="Full Name" value={profile.name} />
                    <InfoItem icon={Mail} label="Email Address" value={profile.email} />
                    <InfoItem icon={MapPin} label="Location" value={profile.location} />
                    <InfoItem icon={Home} label="Housing Type" value={profile.housingType ? profile.housingType.charAt(0).toUpperCase() + profile.housingType.slice(1) : null} />
                </section>

                {/* Emergency Contact */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Emergency Contact</h2>
                    <InfoItem icon={Users} label="Contact Name" value={profile.emergencyContact?.name} />
                    <InfoItem icon={Phone} label="Phone Number" value={profile.emergencyContact?.phone} />
                </section>

                {/* Household Details */}
                <section className="space-y-3">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Household Details</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <BooleanItem label="Has Pets" value={profile.hasPets} />
                        <BooleanItem label="Has Children" value={profile.hasKids} />
                        <BooleanItem label="Has Elderly Members" value={profile.hasElderly} />
                        <BooleanItem label="Backup Power Source" value={profile.hasBackupPower} />
                    </div>
                </section>

            </main>
        </div>
    )
}
