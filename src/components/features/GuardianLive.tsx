'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic,
    MicOff,
    X,
    Loader2,
    AlertTriangle,
    Shield,
    Home,
    Scan,
    Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getGuardianService, GuardianContext } from '@/services/guardianLive'
import { useUserStore } from '@/store/userStore'
import { useWeatherStore } from '@/store/weatherStore'

interface GuardianLiveProps {
    onClose: () => void
    simulationAlert?: { event: string; description: string } | null
    isSimulation?: boolean
}

const MAX_RECONNECT_ATTEMPTS = 3
const BASE_RECONNECT_DELAY = 2000 // 2 seconds

export function GuardianLive({ onClose, simulationAlert, isSimulation = false }: GuardianLiveProps) {
    const router = useRouter()
    const { profile } = useUserStore()
    const { alerts } = useWeatherStore()

    // --- State ---
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected' | 'reconnecting'>('connecting')
    const [isMicActive, setIsMicActive] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [reconnectAttempt, setReconnectAttempt] = useState(0)

    const guardianRef = useRef(getGuardianService())
    const transcriptEndRef = useRef<HTMLDivElement>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const contextRef = useRef<GuardianContext | null>(null)
    const isMountedRef = useRef(true)

    // --- Scroll to bottom on new transcript ---
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [transcript])

    // --- Build context once (don't change during session) ---
    useEffect(() => {
        // Use simulation alert if in simulation mode, otherwise use real alerts
        const activeAlerts = isSimulation && simulationAlert
            ? [`[SIMULATION] ${simulationAlert.event}: ${simulationAlert.description}`]
            : alerts?.map(a => `${a.event}: ${a.description}`) || []

        contextRef.current = {
            location: profile.location || 'Unknown',
            activeAlerts,
            householdSize: profile.quizAnswers?.householdSize,
            hasElderly: profile.quizAnswers?.hasElderly,
            hasPets: profile.quizAnswers?.hasPets,
            mobilityConsiderations: profile.quizAnswers?.mobilityNotes,
            homeHazards: [], // Could pull from Fortification Plan
        }
    }, []) // Only build once on mount

    // --- Connect Function ---
    const connect = useCallback(async () => {
        if (!contextRef.current) return

        try {
            setStatus('connecting')
            setError(null)

            // ⚠️ SECURITY: Using direct API key for hackathon stability
            // In production, revert to ephemeral tokens once Google fixes the 404 issue
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

            if (!apiKey) {
                throw new Error('API Key not configured')
            }

            if (!isMountedRef.current) return

            // Connect using direct API key
            await guardianRef.current.connect(apiKey, contextRef.current, {
                onConnected: () => {
                    setStatus('connected')
                    setReconnectAttempt(0) // Reset on successful connection
                    setTranscript(['Guardian: I\'m here with you. What\'s happening?'])
                },
                onDisconnected: () => {
                    console.log('Guardian disconnected, attempting reconnect...')
                    handleReconnect()
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
                    // Don't auto-reconnect on errors, user should retry manually
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
    }, [])

    // --- Reconnection Logic (Priority 3) ---
    const handleReconnect = useCallback(() => {
        if (!isMountedRef.current) return

        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }

        // Check if we've exceeded max attempts
        if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
            setStatus('disconnected')
            setError('Connection lost. Please try again manually.')
            return
        }

        // Set reconnecting status
        setStatus('reconnecting')
        const nextAttempt = reconnectAttempt + 1
        setReconnectAttempt(nextAttempt)

        // Exponential backoff: 2s, 4s, 8s
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempt)

        console.log(`Reconnecting in ${delay}ms (attempt ${nextAttempt}/${MAX_RECONNECT_ATTEMPTS})`)

        reconnectTimeoutRef.current = setTimeout(() => {
            connect()
        }, delay)
    }, [reconnectAttempt, connect])

    // --- Initial Connection ---
    useEffect(() => {
        isMountedRef.current = true
        connect()

        return () => {
            isMountedRef.current = false
            // Cleanup on unmount
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            guardianRef.current.disconnect()
        }
    }, [connect])

    // --- Handle AudioContext Resume on Visibility Change (Mobile Fix) ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && status === 'connected') {
                // Resume audio context if it was suspended
                console.log('Page visible, ensuring audio context is active')
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [status])

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
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }
        guardianRef.current.disconnect()
        onClose()
    }, [onClose])

    // --- Manual Retry ---
    const handleManualRetry = useCallback(() => {
        setReconnectAttempt(0)
        connect()
    }, [connect])

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col font-sans text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="pt-8 pb-4 px-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10">
                    <X className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2">
                    <Mic className={`h-5 w-5 ${isSimulation ? 'text-yellow-500' : 'text-blue-600 dark:text-blue-400'}`} />
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">Guardian</span>
                    {isSimulation && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                            Practice
                        </span>
                    )}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Status Indicator */}
            <div className="px-6 py-2">
                <div className="flex items-center justify-center gap-2">
                    {status === 'connecting' && (
                        <>
                            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                            <span className="text-blue-600 dark:text-blue-400 text-sm">Connecting to Guardian...</span>
                        </>
                    )}
                    {status === 'reconnecting' && (
                        <>
                            <Loader2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
                            <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                                Reconnecting... (Attempt {reconnectAttempt}/{MAX_RECONNECT_ATTEMPTS})
                            </span>
                        </>
                    )}
                    {status === 'connected' && (
                        <>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-600 dark:text-green-400 text-sm">Connected • {isSpeaking ? 'Speaking...' : 'Listening'}</span>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400 text-sm">{error || 'Connection failed'}</span>
                        </>
                    )}
                    {status === 'disconnected' && (
                        <>
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400 text-sm">Disconnected</span>
                        </>
                    )}
                </div>
            </div>

            {/* Retry Button for Error/Disconnected States */}
            {(status === 'error' || status === 'disconnected') && (
                <div className="px-6 py-2 text-center">
                    <Button
                        onClick={handleManualRetry}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Retry Connection
                    </Button>
                </div>
            )}

            {/* Active Alerts Banner */}
            {alerts && alerts.length > 0 && (
                <div className="mx-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{alerts[0].event}</span>
                    </div>
                    <p className="text-red-700 dark:text-red-300 text-xs mt-1 line-clamp-2">
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
                                ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 text-blue-900 dark:text-blue-100 mr-auto'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ml-auto'
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
                                    className="w-1 bg-blue-500 dark:bg-blue-400 rounded-full"
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
            <div className="bg-white dark:bg-black/50 border-t border-gray-200 dark:border-gray-800 py-4 px-8 flex justify-between items-center transition-colors">
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
