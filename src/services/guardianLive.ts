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
    private audioWorkletNode: AudioWorkletNode | null = null
    private mediaStream: MediaStream | null = null
    private audioQueue: ArrayBuffer[] = []
    private isPlaying = false
    private callbacks: GuardianCallbacks | null = null
    private isConnecting = false
    private nextPlayTime = 0 // For seamless audio scheduling

    async connect(token: string, context: GuardianContext, callbacks: GuardianCallbacks): Promise<void> {
        if (this.isConnecting) {
            console.log('Guardian: Connection already in progress, ignoring')
            return
        }
        this.isConnecting = true
        this.callbacks = callbacks

        try {
            // Initialize with API Key directly (for now)
            this.ai = new GoogleGenAI({
                apiKey: token,
            })

            // Create audio context for playback at 24kHz (Gemini's output rate)
            this.audioContext = new AudioContext({ sampleRate: 24000 })

            // Resume if suspended (mobile Safari issue)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume()
            }

            // Connect to Gemini Live
            this.session = await this.ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO], // Native audio model only supports AUDIO request config
                    systemInstruction: createSystemPrompt(context),
                },
                callbacks: {
                    onopen: () => {
                        // Wait a tick for session to be assigned to this.session
                        setTimeout(() => {
                            // Check if session is still valid (prevent React Strict Mode race condition)
                            if (!this.session) {
                                console.log('Guardian: onopen fired but session was already closed (Strict Mode cleanup)')
                                return
                            }

                            console.log('Guardian connected to Gemini Live')
                            this.isConnecting = false

                            // IMMEDIATELY send silent audio packet to satisfy audio modality requirement
                            // MUST be 16-bit Linear PCM (Int16Array) at 16kHz
                            try {
                                // 0.5 second of silence at 16kHz = 8000 samples
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

                                // Check again before sending (session might have closed)
                                if (this.session) {
                                    this.session.sendRealtimeInput({
                                        audio: {
                                            data: base64Silent,
                                            mimeType: 'audio/pcm;rate=16000',
                                        },
                                    })
                                    console.log('Guardian: sent valid 16-bit PCM keepalive')
                                }
                            } catch (e) {
                                console.error('Guardian: failed to send keepalive', e)
                            }

                            callbacks.onConnected()

                            // Send initial greeting to trigger Guardian's introduction
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
                        }, 100)
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

                        // Only trigger reconnect if we still have callbacks (not during cleanup)
                        if (this.callbacks) {
                            callbacks.onDisconnected()
                        }
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
        if (this.audioQueue.length === 0 || !this.audioContext) return

        // Resume AudioContext if suspended (mobile)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }

        // Process all queued audio chunks with precise scheduling
        while (this.audioQueue.length > 0) {
            const audioData = this.audioQueue.shift()!

            try {
                // Gemini sends raw 16-bit PCM at 24kHz - convert to Float32 AudioBuffer
                const int16Array = new Int16Array(audioData)
                const float32Array = new Float32Array(int16Array.length)

                // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
                for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 32768.0
                }

                // Create AudioBuffer at 24kHz (Gemini's output sample rate)
                const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000)
                audioBuffer.copyToChannel(float32Array, 0)

                const source = this.audioContext.createBufferSource()
                source.buffer = audioBuffer
                source.connect(this.audioContext.destination)

                // Schedule precisely - no gaps between chunks
                const currentTime = this.audioContext.currentTime
                const startTime = Math.max(currentTime, this.nextPlayTime)

                source.start(startTime)
                this.nextPlayTime = startTime + audioBuffer.duration

                // Mark as playing and notify
                if (!this.isPlaying) {
                    this.isPlaying = true
                    this.callbacks?.onAudioReceived(audioData)
                }

                // Set up end detection for the last scheduled chunk
                source.onended = () => {
                    // Check if queue is empty and we're past scheduled time
                    if (this.audioQueue.length === 0 && this.audioContext) {
                        if (this.audioContext.currentTime >= this.nextPlayTime - 0.01) {
                            this.isPlaying = false
                        }
                    }
                }


            } catch (error) {
                console.error('Failed to play audio chunk:', error)
            }
        }
    }

    async startMicrophone(): Promise<void> {
        try {
            if (!this.audioContext) {
                throw new Error('AudioContext not initialized')
            }

            // Request microphone with 16kHz sample rate (Gemini's input requirement)
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            })

            // Create MediaStreamSource
            const source = this.audioContext.createMediaStreamSource(this.mediaStream)

            // Load and create AudioWorklet for PCM processing
            await this.audioContext.audioWorklet.addModule('/pcm-recorder-worklet.js')

            this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'pcm-recorder-processor')

            // Handle PCM data from worklet
            this.audioWorkletNode.port.onmessage = (event) => {
                if (this.session && event.data) {
                    // event.data is Int16Array buffer (raw PCM)
                    const int16Array = new Int16Array(event.data)

                    // Convert to Uint8Array for base64 encoding
                    const uint8Array = new Uint8Array(int16Array.buffer)

                    // Encode to base64
                    let binary = ''
                    const len = uint8Array.byteLength
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(uint8Array[i])
                    }
                    const base64 = btoa(binary)

                    // Send to Gemini as proper PCM
                    this.session.sendRealtimeInput({
                        audio: {
                            data: base64,
                            mimeType: 'audio/pcm;rate=16000',
                        },
                    })
                }
            }

            // Connect audio pipeline
            source.connect(this.audioWorkletNode)
            this.audioWorkletNode.connect(this.audioContext.destination)

            console.log('Guardian: Microphone started with raw PCM capture')

        } catch (error: any) {
            console.error('Failed to start microphone:', error)
            this.callbacks?.onError('Microphone access denied')
            throw error
        }
    }

    stopMicrophone(): void {
        if (this.audioWorkletNode) {
            this.audioWorkletNode.disconnect()
            this.audioWorkletNode = null
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop())
            this.mediaStream = null
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

        // Null session BEFORE closing to prevent callbacks from using it
        if (this.session) {
            const sessionToClose = this.session
            this.session = null

            try {
                sessionToClose.close()
            } catch (e) {
                console.log('Guardian: Error closing session (already closed)', e)
            }
        }

        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        this.audioQueue = []
        this.callbacks = null // Also clear callbacks to prevent stale reconnect attempts
        this.ai = null
        this.isConnecting = false
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
