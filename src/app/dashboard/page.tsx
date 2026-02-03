'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Sun, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/userStore'

export default function DashboardPage() {
    const router = useRouter()
    const { profile } = useUserStore()

    useEffect(() => {
        // Redirect to onboarding if not complete
        if (!profile.onboardingComplete) {
            router.push('/onboarding')
        }
    }, [profile.onboardingComplete, router])

    const getScoreColor = () => {
        if (profile.resilienceScore >= 70) return 'text-green-500'
        if (profile.resilienceScore >= 40) return 'text-orange-500'
        return 'text-red-500'
    }

    return (
        <div className="min-h-screen bg-black text-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">
                        Resili<span className="text-orange-500">Ai</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Welcome, {profile.name || 'User'}</p>
                </div>
                <Badge variant="outline" className="border-green-500 text-green-500">
                    <Sun className="h-3 w-3 mr-1" />
                    Clear Skies
                </Badge>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Resilience Score - Large */}
                <Card className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                    <CardContent className="flex items-center gap-6 p-6">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-gray-700"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    className={getScoreColor()}
                                    strokeDasharray={2 * Math.PI * 40}
                                    strokeDashoffset={(1 - profile.resilienceScore / 100) * 2 * Math.PI * 40}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-2xl font-bold ${getScoreColor()}`}>
                                    {profile.resilienceScore}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Resilience Score</h3>
                            <p className="text-gray-400 text-sm">Keep improving your preparedness</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Weather Card */}
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                            <Sun className="h-4 w-4 text-yellow-500" />
                            Weather
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">22°C</p>
                        <p className="text-gray-500 text-sm">Clear Skies</p>
                    </CardContent>
                </Card>

                {/* Threat Level */}
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            Threat Level
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-500">LOW</p>
                        <p className="text-gray-500 text-sm">No active alerts</p>
                    </CardContent>
                </Card>

                {/* Daily Mission */}
                <Card className="col-span-2 bg-gray-900 border-orange-500/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-orange-500 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Daily Mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-medium mb-2">Secure Balcony Furniture</p>
                        <p className="text-gray-500 text-sm mb-3">
                            High winds expected tomorrow. Secure loose items.
                        </p>
                        <Progress value={0} className="h-2" />
                        <p className="text-orange-500 text-xs mt-2">+5 Resilience Points</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Nav Placeholder */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
                <div className="flex justify-around text-gray-500 text-sm">
                    <span className="text-orange-500">Home</span>
                    <span>Scan</span>
                    <span>Drill</span>
                    <span>Profile</span>
                </div>
            </div>
        </div>
    )
}
