'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic,
    MicOff,
    X,
    Loader2,
    Volume2,
    AlertTriangle,
    Shield,
    Home,
    Scan,
    User,
    Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getGuardianService, GuardianContext } from '@/services/guardianLive'
import { useUserStore } from '@/store/userStore'
import { useWeatherStore } from '@/store/weatherStore'

interface GuardianLiveProps {
    onClose: () => void
}

export function GuardianLive({ onClose }: GuardianLiveProps) {
    const router = useRouter()
    const { profile } = useUserStore()
    const { alerts } = useWeatherStore()

    // --- State ---
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting')
    const [isMicActive, setIsMicActive] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const guardianRef = useRef(getGuardianService())
    const transcriptEndRef = useRef<HTMLDivElement>(null)

    // --- Scroll to bottom on new transcript ---
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [transcript])

    // --- Connect to Guardian ---
    useEffect(() => {
        async function connect() {
            try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
                if (!apiKey) {
                    throw new Error('API key not configured')
                }

                // Build context from user profile and alerts
                const context: GuardianContext = {
                    location: profile.location || 'Unknown',
                    activeAlerts: alerts?.map(a => `${a.event}: ${a.description}`) || [],
                    householdSize: profile.quizAnswers?.householdSize,
                    hasElderly: profile.quizAnswers?.hasElderly,
                    hasPets: profile.quizAnswers?.hasPets,
                    mobilityConsiderations: profile.quizAnswers?.mobilityNotes,
                    homeHazards: [], // Could pull from Fortification Plan
                }

                // Connect to Gemini Live
                await guardianRef.current.connect(apiKey, context, {
                    onConnected: () => {
                        setStatus('connected')
                        setTranscript(['Guardian: I\'m here with you. What\'s happening?'])
                    },
                    onDisconnected: () => {
                        setStatus('disconnected')
                    },
                    onAudioReceived: () => {
                        setIsSpeaking(true)
                        setTimeout(() => setIsSpeaking(false), 500)
                    },
                    onTextReceived: (text) => {
                        setTranscript(prev => [...prev, `Guardian: ${text}`])
                    },
                    onError: (err) => {
                        setError(err)
                        setStatus('error')
                    },
                    onInterrupted: () => {
                        setIsSpeaking(false)
                    },
                })
            } catch (err: any) {
                console.error('Guardian connection error:', err)
                setError(err?.message || 'Failed to connect')
                setStatus('error')
            }
        }

        connect()

        return () => {
            guardianRef.current.disconnect()
        }
    }, [profile, alerts])

    // --- Toggle Microphone ---
    const toggleMicrophone = useCallback(async () => {
        if (isMicActive) {
            guardianRef.current.stopMicrophone()
            setIsMicActive(false)
        } else {
            try {
                await guardianRef.current.startMicrophone()
                setIsMicActive(true)
            } catch {
                setError('Microphone access denied')
            }
        }
    }, [isMicActive])

    // --- Disconnect and Close ---
    const handleClose = useCallback(() => {
        guardianRef.current.disconnect()
        onClose()
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black flex flex-col font-sans">
            {/* Header */}
            <div className="pt-8 pb-4 px-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/10">
                    <X className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold text-lg">Guardian</span>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Status Indicator */}
            <div className="px-6 py-2">
                <div className="flex items-center justify-center gap-2">
                    {status === 'connecting' && (
                        <>
                            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                            <span className="text-blue-400 text-sm">Connecting to Guardian...</span>
                        </>
                    )}
                    {status === 'connected' && (
                        <>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400 text-sm">Connected • {isSpeaking ? 'Speaking...' : 'Listening'}</span>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 text-sm">{error || 'Connection failed'}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Active Alerts Banner */}
            {alerts && alerts.length > 0 && (
                <div className="mx-4 p-3 bg-red-900/50 border border-red-700 rounded-xl">
                    <div className="flex items-center gap-2 text-red-300 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{alerts[0].event}</span>
                    </div>
                    <p className="text-red-200/70 text-xs mt-1 line-clamp-2">
                        {alerts[0].description}
                    </p>
                </div>
            )}

            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {transcript.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-2xl max-w-[85%] ${message.startsWith('Guardian:')
                                ? 'bg-blue-900/50 border border-blue-700/50 text-blue-100 mr-auto'
                                : 'bg-gray-800 border border-gray-700 text-gray-100 ml-auto'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">
                                {message.replace(/^(Guardian:|You:)\s*/, '')}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={transcriptEndRef} />
            </div>

            {/* Voice Visualization */}
            <div className="flex justify-center py-6">
                <AnimatePresence>
                    {isSpeaking && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex items-center gap-1"
                        >
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-blue-400 rounded-full"
                                    animate={{
                                        height: [8, 24, 8],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Microphone Button */}
            <div className="pb-8 flex justify-center">
                <button
                    onClick={toggleMicrophone}
                    disabled={status !== 'connected'}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isMicActive
                        ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                        } ${status !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isMicActive ? (
                        <MicOff className="h-8 w-8 text-white" />
                    ) : (
                        <Mic className="h-8 w-8 text-white" />
                    )}
                </button>
            </div>

            {/* Bottom Nav */}
            <div className="bg-black/50 border-t border-gray-800 py-4 px-8 flex justify-between items-center">
                <NavIcon icon={Home} label="Home" onClick={() => { handleClose(); router.push('/dashboard') }} />
                <NavIcon icon={Scan} label="Scan" onClick={() => { handleClose(); router.push('/vision-audit') }} />
                <NavIcon icon={Shield} label="Guardian" active />
                <NavIcon icon={Settings} label="Settings" onClick={() => { handleClose(); router.push('/settings') }} />
            </div>
        </div>
    )
}

function NavIcon({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 ${active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
        >
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}
