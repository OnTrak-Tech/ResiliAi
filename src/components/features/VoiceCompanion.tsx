'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    AlertTriangle,
    X,
    MoreVertical,
    Home,
    Scan,
    User,
    Settings,
    ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getVoiceCompanionService, VoiceCompanionService, ChatMessage, detectEmergencyType, EmergencyType } from '@/services/voiceCompanion'

// --- Clean Enterprise Colors ---
// We keep some semantic color for emergencies but much softer/cleaner
const STATUS_COLORS: Record<EmergencyType, string> = {
    FIRE: 'bg-red-50 text-red-700 border-red-200',
    EARTHQUAKE: 'bg-amber-50 text-amber-700 border-amber-200',
    FLOOD: 'bg-blue-50 text-blue-700 border-blue-200',
    MEDICAL: 'bg-pink-50 text-pink-700 border-pink-200',
    INTRUDER: 'bg-purple-50 text-purple-700 border-purple-200',
    GENERAL: 'bg-gray-50 text-gray-700 border-gray-200',
}

interface VoiceCompanionProps {
    onClose: () => void
}

export function VoiceCompanion({ onClose }: VoiceCompanionProps) {
    const router = useRouter()
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [currentTranscript, setCurrentTranscript] = useState('')
    const [currentAction, setCurrentAction] = useState<string | null>(null)
    const [emergencyType, setEmergencyType] = useState<EmergencyType>('GENERAL')
    const [error, setError] = useState<string | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)

    const serviceRef = useRef<VoiceCompanionService | null>(null)
    const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | InstanceType<typeof window.webkitSpeechRecognition> | null>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // --- Initialize Service ---
    useEffect(() => {
        async function init() {
            try {
                serviceRef.current = await getVoiceCompanionService()
                setIsInitializing(false)

                // Send initial greeting (slightly more professional tone)
                const greeting = await serviceRef.current.sendMessage(
                    "The user has activated ResiliAI Voice Companion. Greet them professionally and ask how you can assist with their safety or resilience tasks."
                )
                setMessages([{ role: 'model', content: greeting, timestamp: new Date() }])
                speak(greeting)
            } catch (err) {
                setError('Failed to initialize voice assistant.')
                setIsInitializing(false)
            }
        }
        init()

        return () => {
            recognitionRef.current?.abort()
            synthRef.current?.cancel()
        }
    }, [])

    // --- Speech Recognition Setup ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            setError('Speech recognition not supported.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results as ArrayLike<any>)
                .map((result: any) => result[0].transcript)
                .join('')
            setCurrentTranscript(transcript)

            if (event.results[event.results.length - 1].isFinal) {
                handleUserMessage(transcript)
                setCurrentTranscript('')
            }
        }

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                setError(`Voice error: ${event.error}`)
            }
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognitionRef.current = recognition
        synthRef.current = window.speechSynthesis
    }, [])

    // --- Auto-scroll ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // --- Handle User Message ---
    const handleUserMessage = useCallback(async (text: string) => {
        if (!serviceRef.current || !text.trim()) return

        const detected = detectEmergencyType(text)
        if (detected !== 'GENERAL') {
            setEmergencyType(detected)
        }

        const userMessage: ChatMessage = { role: 'user', content: text, timestamp: new Date() }
        setMessages((prev) => [...prev, userMessage])

        try {
            const response = await serviceRef.current.sendMessage(text)
            const aiMessage: ChatMessage = { role: 'model', content: response, timestamp: new Date() }
            setMessages((prev) => [...prev, aiMessage])

            const firstSentence = response.split(/[.!?]/)[0]
            if (firstSentence) {
                setCurrentAction(firstSentence)
            }

            if (!isMuted) {
                speak(response)
            }
        } catch (err) {
            setError('Connection issue. Please try again.')
        }
    }, [isMuted])

    // --- TTS ---
    const speak = useCallback((text: string) => {
        if (!synthRef.current || isMuted) return
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        synthRef.current.speak(utterance)
    }, [isMuted])

    // --- Toggles ---
    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            synthRef.current?.cancel()
            setIsSpeaking(false)
            try {
                recognitionRef.current.start()
                setIsListening(true)
                setError(null)
            } catch (err) { }
        }
    }, [isListening])

    const toggleMute = useCallback(() => {
        if (isMuted) {
            setIsMuted(false)
        } else {
            synthRef.current?.cancel()
            setIsSpeaking(false)
            setIsMuted(true)
        }
    }, [isMuted])

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans text-gray-900">

            {/* Header - Clean Enterprise */}
            <div className="pt-8 pb-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
                <Button variant="ghost" size="icon" onClick={onClose} className="-ml-3 text-gray-600 hover:bg-gray-100">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="font-semibold text-lg text-gray-900">Voice Companion</span>
                    {emergencyType !== 'GENERAL' && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 border ${STATUS_COLORS[emergencyType]}`}>
                            {emergencyType} Mode
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="-mr-3 text-gray-600 hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/50">
                {isInitializing && (
                    <div className="flex justify-center p-4">
                        <div className="animate-pulse flex items-center gap-2 text-gray-400 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                            Connecting to ResiliAI...
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#2563eb] text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {currentTranscript && (
                    <div className="flex justify-end">
                        <div className="max-w-[85%] p-4 rounded-2xl rounded-tr-none bg-blue-50 text-blue-800 text-sm italic border border-blue-100">
                            Looking up: "{currentTranscript}..."
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Action Bar / Controls */}
            <div className="bg-white border-t border-gray-100 p-6 pb-24 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">

                {/* Proposed Action */}
                <AnimatePresence>
                    {currentAction && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3"
                        >
                            <div className="bg-blue-600 rounded-full p-1 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Suggested Action</h4>
                                <p className="text-sm font-medium text-gray-900">{currentAction}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mic Controls */}
                <div className="flex items-center justify-center gap-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleMute}
                        className={`h-12 w-12 rounded-full border-gray-200 ${isMuted ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>

                    <div className="relative">
                        {isListening && (
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                        )}
                        <Button
                            onClick={toggleListening}
                            className={`h-20 w-20 rounded-full shadow-lg transition-all transform ${isListening
                                    ? 'bg-[#2563eb] hover:bg-[#1d4ed8] scale-105'
                                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {isListening ? (
                                <Mic className="h-8 w-8 text-white" />
                            ) : (
                                <Mic className="h-8 w-8 text-[#2563eb]" />
                            )}
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMessages([])} // Clear chat
                        className="h-12 w-12 rounded-full text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Bottom Nav Bar (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-50">
                <NavIcon icon={Home} label="Home" onClick={() => router.push('/dashboard')} />
                <NavIcon icon={Scan} label="Scan" onClick={() => router.push('/vision-audit')} />
                <NavIcon icon={User} label="Profile" onClick={() => router.push('/onboarding')} />
                <NavIcon icon={Settings} label="Settings" onClick={() => router.push('/settings')} />
            </div>

            {/* Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-32 left-6 right-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm shadow-md text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

function NavIcon({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 ${active ? 'text-[#2563eb]' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
        >
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}
