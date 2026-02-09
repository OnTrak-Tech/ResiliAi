'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, HelpCircle, MessageCircle, Book, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HelpCenterPage() {
    const router = useRouter()

    const faqs = [
        {
            icon: Shield,
            question: "How does Guardian work?",
            answer: "Guardian is your AI voice companion that provides real-time emergency guidance. It listens to your situation and gives step-by-step instructions tailored to your needs."
        },
        {
            icon: AlertTriangle,
            question: "What types of alerts will I receive?",
            answer: "You'll receive weather alerts from the National Weather Service including tornado warnings, severe thunderstorms, flash floods, and other hazardous conditions in your area."
        },
        {
            icon: MessageCircle,
            question: "Is my voice data stored?",
            answer: "No. Voice conversations with Guardian are processed in real-time and are not stored. Your privacy is our priority."
        },
        {
            icon: Book,
            question: "How accurate is the weather data?",
            answer: "We use official National Weather Service data, the same source used by emergency management agencies across the US."
        },
    ]

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
                <h1 className="w-full text-center text-xl font-bold">Help Center</h1>
            </header>

            <main className="w-full max-w-md mx-auto px-6 space-y-6 mt-4">
                {/* Welcome */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <HelpCircle className="w-8 h-8" />
                        <h2 className="text-lg font-bold">How can we help?</h2>
                    </div>
                    <p className="text-sm text-blue-100">
                        Find answers to common questions about ResiliAI below.
                    </p>
                </div>

                {/* FAQs */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <faq.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm mb-1">{faq.question}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 text-center">
                    <h3 className="font-semibold mb-2">Still need help?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        We're here to help you stay safe.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Support
                    </Button>
                </section>
            </main>
        </div>
    )
}
