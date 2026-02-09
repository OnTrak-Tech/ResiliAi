'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'

/**
 * Minimal Guardian Live Test Page
 * Purpose: Isolate connection issues without React complexity
 * 
 * This test:
 * 1. Connects directly to Gemini Live API (no service layer)
 * 2. Uses a ref to prevent Strict Mode double-connection
 * 3. No microphone - just receives and plays audio
 * 4. Verbose logging for debugging
 */

const MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'

export default function GuardianTestPage() {
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
    const [isPlaying, setIsPlaying] = useState(false)

    const sessionRef = useRef<any>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const hasConnectedRef = useRef(false)

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        console.log(`[${timestamp}] ${message}`)
        setLogs(prev => [...prev.slice(-50), `[${timestamp}] ${message}`])
    }

    const connect = async () => {
        // Prevent double connection (React Strict Mode)
        if (hasConnectedRef.current) {
            log('⚠️ Already connected or connecting, ignoring')
            return
        }
        hasConnectedRef.current = true

        try {
            setStatus('connecting')
            log('🔄 Connecting to Gemini Live API...')

            // ⚠️ SECURITY WARNING: For hackathon/demo only
            // In production, use ephemeral tokens generated server-side
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

            if (!apiKey) {
                throw new Error('NEXT_PUBLIC_GOOGLE_AI_API_KEY not found in environment')
            }

            log('✅ Using API key from environment')

            // Create audio context
            audioContextRef.current = new AudioContext({ sampleRate: 24000 })
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume()
            }
            log(`✅ AudioContext created (state: ${audioContextRef.current.state})`)

            // Initialize Gemini client with API key directly
            log('🔄 Creating GoogleGenAI client...')
            const ai = new GoogleGenAI({
                apiKey: apiKey,
            })

            // Connect to Live API
            log(`🔄 Connecting to model: ${MODEL}`)
            sessionRef.current = await ai.live.connect({
                model: MODEL,
                config: {
                    responseModalities: [Modality.AUDIO], // Native audio model might only support AUDIO
                    systemInstruction: { parts: [{ text: 'You are a helpful assistant. Keep responses brief.' }] },
                },
                callbacks: {
                    onopen: () => {
                        log('✅ WebSocket OPEN')

                        // Check if we were disconnected before this fired
                        if (!sessionRef.current) {
                            log('⚠️ Session was nulled before onopen fired (Strict Mode cleanup)')
                            return
                        }

                        setStatus('connected')

                        // Send keepalive
                        try {
                            const silence = new Int16Array(8000)
                            const buffer = new Uint8Array(silence.buffer)
                            let binary = ''
                            for (let i = 0; i < buffer.byteLength; i++) {
                                binary += String.fromCharCode(buffer[i])
                            }
                            const base64 = btoa(binary)

                            sessionRef.current?.sendRealtimeInput({
                                audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                            })
                            log('✅ Sent silence keepalive')
                        } catch (e: any) {
                            log(`❌ Keepalive error: ${e.message}`)
                        }

                        // Send greeting
                        setTimeout(() => {
                            if (sessionRef.current) {
                                sessionRef.current.sendClientContent({
                                    turns: [{ role: 'user', parts: [{ text: 'Hello! Say one short sentence.' }] }],
                                    turnComplete: true,
                                })
                                log('📤 Sent greeting message')
                            }
                        }, 1000)
                    },
                    onmessage: (message: any) => {
                        if (message.serverContent?.modelTurn?.parts) {
                            for (const part of message.serverContent.modelTurn.parts) {
                                if (part.text) {
                                    log(`📥 TEXT: "${part.text}"`)
                                }
                                if (part.inlineData?.data) {
                                    log('📥 AUDIO received (playing...)')
                                    setIsPlaying(true)
                                    playAudio(part.inlineData.data)
                                }
                            }
                        }
                        if (message.serverContent?.interrupted) {
                            log('⚡ Interrupted')
                        }
                    },
                    onerror: (error: any) => {
                        log(`❌ ERROR: ${error?.message || JSON.stringify(error)}`)
                        setStatus('error')
                    },
                    onclose: (event: any) => {
                        log(`🔌 CLOSED: code=${event?.code}, reason=${event?.reason || 'none'}`)
                        setStatus('idle')
                        hasConnectedRef.current = false
                    },
                },
            })

            log('✅ ai.live.connect() returned successfully')

        } catch (error: any) {
            log(`❌ FATAL: ${error.message}`)
            setStatus('error')
            hasConnectedRef.current = false
        }
    }

    const playAudio = async (base64: string) => {
        if (!audioContextRef.current) return

        try {
            const binary = atob(base64)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }

            const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer.slice(0))
            const source = audioContextRef.current.createBufferSource()
            source.buffer = audioBuffer
            source.connect(audioContextRef.current.destination)
            source.onended = () => setIsPlaying(false)
            source.start()
        } catch (e: any) {
            log(`❌ Audio playback error: ${e.message}`)
            setIsPlaying(false)
        }
    }

    const disconnect = () => {
        log('🔌 Manual disconnect')
        if (sessionRef.current) {
            const session = sessionRef.current
            sessionRef.current = null
            try {
                session.close()
            } catch (e) {
                log('Session already closed')
            }
        }
        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        hasConnectedRef.current = false
        setStatus('idle')
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                sessionRef.current.close()
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4">🧪 Guardian Live Test</h1>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={connect}
                    disabled={status === 'connecting' || status === 'connected'}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
                >
                    {status === 'connecting' ? '🔄 Connecting...' : 'Connect'}
                </button>
                <button
                    onClick={disconnect}
                    disabled={status === 'idle'}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-bold"
                >
                    Disconnect
                </button>
            </div>

            <div className="mb-4 flex items-center gap-4">
                <span className={`inline-block w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' :
                    status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                        status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                <span className="text-lg">Status: {status.toUpperCase()}</span>
                {isPlaying && <span className="text-blue-400">🔊 Playing audio...</span>}
            </div>

            <div className="bg-black/50 rounded-lg p-4 h-[60vh] overflow-y-auto text-sm">
                {logs.length === 0 ? (
                    <p className="text-gray-500">Click "Connect" to start test...</p>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="mb-1 whitespace-pre-wrap">{log}</div>
                    ))
                )}
            </div>

            <p className="mt-4 text-gray-500 text-sm">
                This test page connects without React Strict Mode interference.
                Watch the logs to see exactly where the connection fails.
            </p>
        </div>
    )
}
