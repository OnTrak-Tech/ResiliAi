'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getVoiceCompanionService, VoiceCompanionService, ChatMessage, detectEmergencyType, EmergencyType } from '@/services/voiceCompanion'

// --- Emergency Colors ---
const EMERGENCY_COLORS: Record<EmergencyType, string> = {
    FIRE: 'from-red-600 to-orange-600',
    EARTHQUAKE: 'from-amber-600 to-yellow-600',
    FLOOD: 'from-blue-600 to-cyan-600',
    MEDICAL: 'from-red-600 to-pink-600',
    INTRUDER: 'from-purple-600 to-red-600',
    GENERAL: 'from-red-600 to-red-800',
}

interface VoiceCompanionProps {
    onClose: () => void
}

export function VoiceCompanion({ onClose }: VoiceCompanionProps) {
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

                // Send initial greeting
                const greeting = await serviceRef.current.sendMessage(
                    "The user has activated Guardian emergency mode. Greet them and ask how you can help."
                )
                setMessages([{ role: 'model', content: greeting, timestamp: new Date() }])
                speak(greeting)
            } catch (err) {
                setError('Failed to initialize voice assistant. Please check your connection.')
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
            setError('Speech recognition not supported in this browser.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join('')
            setCurrentTranscript(transcript)

            // If final result, send to AI
            if (event.results[event.results.length - 1].isFinal) {
                handleUserMessage(transcript)
                setCurrentTranscript('')
            }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error)
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

    // --- Auto-scroll to bottom ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // --- Handle User Message ---
    const handleUserMessage = useCallback(async (text: string) => {
        if (!serviceRef.current || !text.trim()) return

        // Detect emergency type
        const detected = detectEmergencyType(text)
        if (detected !== 'GENERAL') {
            setEmergencyType(detected)
        }

        // Add user message
        const userMessage: ChatMessage = { role: 'user', content: text, timestamp: new Date() }
        setMessages((prev) => [...prev, userMessage])

        try {
            const response = await serviceRef.current.sendMessage(text)
            const aiMessage: ChatMessage = { role: 'model', content: response, timestamp: new Date() }
            setMessages((prev) => [...prev, aiMessage])

            // Extract action (first sentence)
            const firstSentence = response.split(/[.!?]/)[0]
            if (firstSentence) {
                setCurrentAction(firstSentence.toUpperCase())
            }

            // Speak response
            if (!isMuted) {
                speak(response)
            }
        } catch (err) {
            setError('Failed to get response. Stay calm.')
        }
    }, [isMuted])

    // --- Text-to-Speech ---
    const speak = useCallback((text: string) => {
        if (!synthRef.current || isMuted) return

        // Cancel any ongoing speech
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9  // Slightly slower for clarity
        utterance.pitch = 1.0
        utterance.volume = 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        synthRef.current.speak(utterance)
    }, [isMuted])

    // --- Toggle Listening ---
    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            // Stop TTS if speaking
            synthRef.current?.cancel()
            setIsSpeaking(false)

            try {
                recognitionRef.current.start()
                setIsListening(true)
                setError(null)
            } catch (err) {
                console.error('Failed to start recognition:', err)
            }
        }
    }, [isListening])

    // --- Toggle Mute ---
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
        <div className={`fixed inset-0 z-50 bg-gradient-to-b ${EMERGENCY_COLORS[emergencyType]} flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/30">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                    <span className="text-white font-bold text-xl uppercase tracking-wider">Guardian Mode</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse uppercase">
                        Active
                    </span>
                </div>
            </div>

            {/* Microphone Indicator */}
            <div className="flex-shrink-0 flex items-center justify-center py-8">
                <motion.div
                    animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500/30' : 'bg-white/10'
                        }`}
                >
                    {/* Pulse rings */}
                    {isListening && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 rounded-full border-2 border-white/50"
                            />
                            <motion.div
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                className="absolute inset-0 rounded-full border-2 border-white/50"
                            />
                        </>
                    )}
                    <Mic className={`h-16 w-16 ${isListening ? 'text-white' : 'text-white/60'}`} />
                </motion.div>
            </div>

            {/* Current Transcript */}
            {currentTranscript && (
                <div className="px-4 py-2 bg-black/20 text-center">
                    <p className="text-white/80 italic">"{currentTranscript}"</p>
                </div>
            )}

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {isInitializing && (
                    <div className="text-center text-white/60">Initializing Guardian...</div>
                )}
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                            ? 'ml-auto bg-white/20 text-white'
                            : 'mr-auto bg-black/40 text-white border border-red-500/30'
                            }`}
                    >
                        <p className="text-lg leading-relaxed">{msg.content}</p>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Current Action Callout */}
            <AnimatePresence>
                {currentAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mx-4 mb-4 p-4 bg-yellow-500/90 text-black rounded-xl text-center"
                    >
                        <p className="text-xs font-bold uppercase tracking-widest mb-1">Next Action</p>
                        <p className="text-xl font-bold">{currentAction}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
                <div className="mx-4 mb-4 p-3 bg-red-900/80 text-white rounded-lg text-center text-sm">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 p-6 bg-black/40">
                {/* Mute Toggle */}
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-gray-600' : 'bg-white/20'
                        }`}
                >
                    {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
                </button>

                {/* Main Mic Button */}
                <button
                    onClick={toggleListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                        ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                        : 'bg-white/30 hover:bg-white/40'
                        }`}
                >
                    {isListening ? (
                        <MicOff className="h-8 w-8 text-white" />
                    ) : (
                        <Mic className="h-8 w-8 text-white" />
                    )}
                </button>

                {/* End Call */}
                <button
                    onClick={onClose}
                    className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                    <PhoneOff className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    )
}
