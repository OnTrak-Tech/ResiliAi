'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsOfServicePage() {
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
                <h1 className="w-full text-center text-xl font-bold">Terms of Service</h1>
            </header>

            <main className="w-full max-w-md mx-auto px-6 mt-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="font-bold">Terms of Service</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: February 2026</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Acceptance of Terms</h3>
                            <p>By using ResiliAI, you agree to these terms. If you don't agree, please don't use the app.</p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Service Description</h3>
                            <p>ResiliAI provides weather alerts, emergency guidance, and an AI voice companion. Our service is designed to help you prepare for and respond to emergencies.</p>
                        </section>

                        <section className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-900/30">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Disclaimer</h3>
                            <p className="text-yellow-700 dark:text-yellow-300">
                                ResiliAI is NOT a substitute for emergency services. In life-threatening situations, always call 911 or your local emergency number first.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Responsibilities</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Provide accurate information</li>
                                <li>Keep your emergency contacts updated</li>
                                <li>Use the app responsibly</li>
                                <li>Follow official emergency guidance</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Limitation of Liability</h3>
                            <p>ResiliAI provides information as-is. We are not liable for actions taken based on our guidance. Always verify information with official sources.</p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Changes to Terms</h3>
                            <p>We may update these terms. Continued use after changes means you accept the new terms.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
