'use client'

import { GoogleGenAI, Modality } from '@google/genai'

// --- Types ---
export interface GuardianContext {
    location: string
    activeAlerts: string[]
    householdSize?: number
    hasElderly?: boolean
    hasPets?: boolean
    mobilityConsiderations?: string
    homeHazards?: string[]
}

export interface GuardianCallbacks {
    onConnected: () => void
    onDisconnected: () => void
    onAudioReceived: (audioData: ArrayBuffer) => void
    onTextReceived: (text: string) => void
    onError: (error: string) => void
    onInterrupted: () => void
}

// --- System Prompt Generator ---
function createSystemPrompt(context: GuardianContext): string {
    const alertsText = context.activeAlerts.length > 0
        ? context.activeAlerts.join(', ')
        : 'No active alerts'

    const hazardsText = context.homeHazards?.length
        ? context.homeHazards.join(', ')
        : 'None identified'

    return `You are Guardian, ResiliAi's emergency voice companion.

CURRENT SITUATION:
- Active Alerts: ${alertsText}
- User Location: ${context.location}

USER CONTEXT:
- Household Size: ${context.householdSize || 'Unknown'}
- Has Elderly Family: ${context.hasElderly ? 'Yes' : 'No'}
- Has Pets: ${context.hasPets ? 'Yes' : 'No'}
- Mobility Considerations: ${context.mobilityConsiderations || 'None'}
- Known Home Hazards: ${hazardsText}

YOUR ROLE:
1. Stay calm. Speak slowly and clearly in a reassuring tone.
2. Give ONE instruction at a time. Wait for the user to confirm before proceeding.
3. If the user sounds panicked (fast speech, fragmented sentences), say: "I'm here with you. Take one slow breath. We'll do this together."
4. Adapt your advice to their specific situation and household needs.
5. If they mention elderly family or pets, prioritize their safety in your guidance.
6. Never give medical advice. If someone is injured, guide them to call 911.

CONVERSATION STYLE:
- Be warm but focused
- Use their name if they provide it
- Acknowledge their emotions
- Keep responses concise (2-3 sentences max)
- End each response with a clear next step or question

BEGIN by introducing yourself briefly and asking what's happening.`
}

// --- Guardian Live Service Class ---
export class GuardianLiveService {
    private ai: GoogleGenAI | null = null
    private session: any = null
    private audioContext: AudioContext | null = null
    private mediaRecorder: MediaRecorder | null = null
    private audioQueue: ArrayBuffer[] = []
    private isPlaying = false
    private callbacks: GuardianCallbacks | null = null
    private isConnecting = false

    async connect(token: string, context: GuardianContext, callbacks: GuardianCallbacks): Promise<void> {
        if (this.isConnecting) {
            console.log('Guardian: Connection already in progress, ignoring')
            return
        }
        this.isConnecting = true
        this.callbacks = callbacks

        try {
            // Initialize with ephemeral token - MUST use v1alpha for ephemeral tokens
            this.ai = new GoogleGenAI({
                apiKey: token,
                httpOptions: { apiVersion: 'v1alpha' }
            })

            // Create audio context for playback
            this.audioContext = new AudioContext({ sampleRate: 24000 })

            // Connect to Gemini Live
            // Using gemini-3-pro-preview for hackathon (more stable than flash)
            this.session = await this.ai.live.connect({
                model: 'gemini-3-pro-preview',
                config: {
                    responseModalities: [Modality.AUDIO, Modality.TEXT],
                    systemInstruction: createSystemPrompt(context),
                },
                callbacks: {
                    onopen: () => {
                        console.log('Guardian connected to Gemini Live')
                        this.isConnecting = false

                        // IMMEDIATELY send silent audio packet to satisfy audio modality requirement
                        // MUST be 16-bit Linear PCM (Int16Array) at 16kHz
                        try {
                            // 0.5 second of silence at 16kHz
                            // 16kHz * 0.5s = 8000 samples
                            // Int16Array takes 2 bytes per element, so header is handled by mimetype
                            const pcm16 = new Int16Array(8000) // Default initialized to 0s (silence)

                            // Convert to bytes for Base64 (little-endian)
                            const buffer = new Uint8Array(pcm16.buffer)

                            // Efficient binary string construction
                            let binary = ''
                            const len = buffer.byteLength
                            for (let i = 0; i < len; i++) {
                                binary += String.fromCharCode(buffer[i])
                            }
                            const base64Silent = btoa(binary)

                            this.session?.sendRealtimeInput({
                                audio: {
                                    data: base64Silent,
                                    mimeType: 'audio/pcm;rate=16000',
                                },
                            })
                            console.log('Guardian: sent valid 16-bit PCM keepalive')
                        } catch (e) {
                            console.error('Guardian: failed to send keepalive', e)
                        }

                        callbacks.onConnected()

                        // Send initial greeting to trigger Guardian's introduction
                        // This keeps the session alive and starts the conversation
                        setTimeout(() => {
                            if (this.session) {
                                this.session.sendClientContent({
                                    turns: [{
                                        role: 'user',
                                        parts: [{ text: 'Hello Guardian, I need your help.' }]
                                    }],
                                    turnComplete: true,
                                })
                            }
                        }, 500)
                    },
                    onmessage: (message: any) => {
                        this.handleMessage(message)
                    },
                    onerror: (error: any) => {
                        console.error('Guardian error:', error)
                        this.isConnecting = false
                        callbacks.onError(error?.message || 'Connection error')
                    },
                    onclose: () => {
                        console.log('Guardian disconnected')
                        this.isConnecting = false
                        callbacks.onDisconnected()
                    },
                },
            })
        } catch (error: any) {
            console.error('Failed to connect Guardian:', error)
            this.isConnecting = false
            callbacks.onError(error?.message || 'Failed to connect')
            throw error
        }
    }

    private handleMessage(message: any) {
        if (!this.callbacks) return

        // Handle interruption
        if (message.serverContent?.interrupted) {
            this.audioQueue = []
            this.callbacks.onInterrupted()
            return
        }

        // Handle model response
        if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
                // Audio response
                if (part.inlineData?.data) {
                    const audioData = this.base64ToArrayBuffer(part.inlineData.data)
                    this.audioQueue.push(audioData)
                    this.playNextAudio()
                }

                // Text response
                if (part.text) {
                    this.callbacks.onTextReceived(part.text)
                }
            }
        }
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes.buffer
    }

    private async playNextAudio() {
        if (this.isPlaying || this.audioQueue.length === 0 || !this.audioContext) return

        this.isPlaying = true
        const audioData = this.audioQueue.shift()!

        try {
            // Decode and play audio
            const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0))
            const source = this.audioContext.createBufferSource()
            source.buffer = audioBuffer
            source.connect(this.audioContext.destination)
            source.onended = () => {
                this.isPlaying = false
                this.playNextAudio()
            }
            source.start()

            this.callbacks?.onAudioReceived(audioData)
        } catch (error) {
            console.error('Failed to play audio:', error)
            this.isPlaying = false
            this.playNextAudio()
        }
    }

    async startMicrophone(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            })

            this.mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && this.session) {
                    const arrayBuffer = await event.data.arrayBuffer()
                    const base64 = btoa(
                        String.fromCharCode(...new Uint8Array(arrayBuffer))
                    )

                    this.session.sendRealtimeInput({
                        audio: {
                            data: base64,
                            mimeType: 'audio/pcm;rate=16000',
                        },
                    })
                }
            }

            this.mediaRecorder.start(100) // Send chunks every 100ms
        } catch (error: any) {
            console.error('Failed to start microphone:', error)
            this.callbacks?.onError('Microphone access denied')
            throw error
        }
    }

    stopMicrophone(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop()
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
        }
    }

    sendText(text: string): void {
        if (this.session) {
            this.session.sendClientContent({
                turns: [{ role: 'user', parts: [{ text }] }],
                turnComplete: true,
            })
        }
    }

    disconnect(): void {
        this.stopMicrophone()

        if (this.session) {
            this.session.close()
            this.session = null
        }

        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        this.audioQueue = []
        this.ai = null
    }
}

// --- Singleton instance ---
let guardianInstance: GuardianLiveService | null = null

export function getGuardianService(): GuardianLiveService {
    if (!guardianInstance) {
        guardianInstance = new GuardianLiveService()
    }
    return guardianInstance
}
