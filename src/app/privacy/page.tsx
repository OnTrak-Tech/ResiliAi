'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicyPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-24 font-sans">
            {/* Header */}
            <header className="w-full pt-8 pb-4 px-6 flex items-center relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-6"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <h1 className="w-full text-center text-xl font-bold">Privacy Policy</h1>
            </header>

            <main className="w-full max-w-md mx-auto px-6 mt-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-bold">ResiliAI Privacy Policy</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: February 2026</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Information We Collect</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Profile information (name, email, household details)</li>
                                <li>Location data for weather alerts (when permitted)</li>
                                <li>Voice data during Guardian conversations (not stored)</li>
                                <li>Emergency contact information</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How We Use Your Data</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Provide personalized emergency guidance</li>
                                <li>Send weather alerts for your location</li>
                                <li>Improve our AI assistant responses</li>
                                <li>Contact your emergency contacts when needed</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Storage</h3>
                            <p>Your data is stored locally on your device. We use Google's Gemini API for voice conversations - audio is processed in real-time and not stored.</p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Access your data at any time in Settings</li>
                                <li>Delete all your data by signing out</li>
                                <li>Control permissions for location and microphone</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h3>
                            <p>Questions about privacy? Email us at privacy@resiliai.site</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
