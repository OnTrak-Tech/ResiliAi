import { GoogleGenerativeAI, ChatSession, Content } from '@google/generative-ai'

// --- Type Definitions ---
export interface ChatMessage {
    role: 'user' | 'model'
    content: string
    timestamp: Date
}

export type EmergencyType = 'FIRE' | 'EARTHQUAKE' | 'FLOOD' | 'MEDICAL' | 'INTRUDER' | 'GENERAL'

export interface VoiceCompanionConfig {
    voiceRate: number
    voicePitch: number
    maxHistoryLength: number
}

// --- Constants ---
const DEFAULT_CONFIG: VoiceCompanionConfig = {
    voiceRate: 0.9,    // Slightly slower for clarity
    voicePitch: 1.0,   // Neutral
    maxHistoryLength: 20,
}

const SYSTEM_PROMPT = `You are "Guardian", a calm and authoritative emergency response AI assistant for the ResiliAi disaster preparedness app.

Your role:
- Guide users through crisis situations with clear, step-by-step instructions
- Remain calm and reassuring, even when the user is panicked
- Ask clarifying questions to understand the situation
- Prioritize immediate safety over everything else
- Keep responses SHORT and ACTIONABLE (max 2-3 sentences)

Emergency protocols:
- FIRE: Get out, stay low, don't open hot doors, meet at safe point
- EARTHQUAKE: Drop, cover, hold on until shaking stops
- FLOOD: Move to higher ground, avoid walking in water
- MEDICAL: Check breathing, call 911, apply pressure to wounds
- INTRUDER: Hide, silence phone, call 911 if safe

Always end with a clear next step or question. Do not use markdown formatting - speak naturally.`

// --- Emergency Detection ---
export function detectEmergencyType(userMessage: string): EmergencyType {
    const lower = userMessage.toLowerCase()
    if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burning') || lower.includes('flames')) return 'FIRE'
    if (lower.includes('earthquake') || lower.includes('shaking') || lower.includes('tremor')) return 'EARTHQUAKE'
    if (lower.includes('flood') || lower.includes('water rising') || lower.includes('flooding')) return 'FLOOD'
    if (lower.includes('hurt') || lower.includes('bleeding') || lower.includes('can\'t breathe') || lower.includes('heart') || lower.includes('injured')) return 'MEDICAL'
    if (lower.includes('intruder') || lower.includes('break in') || lower.includes('someone in')) return 'INTRUDER'
    return 'GENERAL'
}

// --- Text Cleaning for TTS ---
export function cleanForTTS(text: string): string {
    return text
        .replace(/\*\*/g, '')     // Remove bold markdown
        .replace(/\*/g, '')       // Remove italics
        .replace(/`/g, '')        // Remove code
        .replace(/#+ /g, '')      // Remove headers
        .replace(/\n+/g, '. ')    // Newlines to pauses
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim()
}

// --- Voice Companion Service Class ---
export class VoiceCompanionService {
    private genAI: GoogleGenerativeAI | null = null
    private chat: ChatSession | null = null
    private history: ChatMessage[] = []
    private config: VoiceCompanionConfig

    constructor(config: Partial<VoiceCompanionConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    async initialize(): Promise<void> {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
        if (!apiKey) {
            throw new Error('Google AI API key not configured. Set NEXT_PUBLIC_GOOGLE_AI_API_KEY.')
        }

        this.genAI = new GoogleGenerativeAI(apiKey)
        const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

        this.chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 200,  // Keep responses short
                temperature: 0.7,      // Some creativity but mostly focused
            },
        })

        // Send system prompt as first message
        await this.chat.sendMessage(SYSTEM_PROMPT)
        this.history = []
    }

    async sendMessage(userMessage: string): Promise<string> {
        if (!this.chat) {
            throw new Error('VoiceCompanionService not initialized. Call initialize() first.')
        }

        // Add user message to history
        this.history.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        })

        try {
            const result = await this.chat.sendMessage(userMessage)
            const response = result.response.text()
            const cleanedResponse = cleanForTTS(response)

            // Add AI response to history
            this.history.push({
                role: 'model',
                content: cleanedResponse,
                timestamp: new Date(),
            })

            // Trim history if too long
            if (this.history.length > this.config.maxHistoryLength) {
                this.history = this.history.slice(-this.config.maxHistoryLength)
            }

            return cleanedResponse
        } catch (error) {
            console.error('VoiceCompanion chat error:', error)
            // Return offline fallback
            return "I'm having trouble connecting. Stay calm. If this is an emergency, call 911 immediately. Follow your emergency plan."
        }
    }

    getHistory(): ChatMessage[] {
        return [...this.history]
    }

    clearHistory(): void {
        this.history = []
    }

    getConfig(): VoiceCompanionConfig {
        return { ...this.config }
    }
}

// --- Singleton Instance ---
let serviceInstance: VoiceCompanionService | null = null

export async function getVoiceCompanionService(): Promise<VoiceCompanionService> {
    if (!serviceInstance) {
        serviceInstance = new VoiceCompanionService()
        await serviceInstance.initialize()
    }
    return serviceInstance
}
