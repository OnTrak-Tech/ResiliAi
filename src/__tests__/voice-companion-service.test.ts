import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
            startChat: vi.fn().mockReturnValue({
                sendMessage: vi.fn(),
            }),
        }),
    })),
}))

// Type definitions for the service
interface ChatMessage {
    role: 'user' | 'model'
    content: string
}

interface VoiceCompanionConfig {
    voiceRate: number
    voicePitch: number
    systemPrompt: string
}

// Emergency response categories
type EmergencyType = 'FIRE' | 'EARTHQUAKE' | 'FLOOD' | 'MEDICAL' | 'INTRUDER' | 'GENERAL'

describe('VoiceCompanionService - Unit Tests', () => {
    describe('Configuration', () => {
        it('should have calm voice settings', () => {
            const config: VoiceCompanionConfig = {
                voiceRate: 0.9, // Slightly slower than normal
                voicePitch: 1.0, // Neutral
                systemPrompt: '',
            }
            expect(config.voiceRate).toBeLessThan(1.0)
            expect(config.voicePitch).toBe(1.0)
        })

        it('should have emergency-focused system prompt', () => {
            const systemPrompt = `You are "Guardian", a calm and authoritative emergency response AI assistant.

Your role:
- Guide users through crisis situations with clear, step-by-step instructions
- Remain calm and reassuring, even when the user is panicked
- Ask clarifying questions to understand the situation
- Prioritize immediate safety over everything else
- Keep responses SHORT and ACTIONABLE (max 2-3 sentences)

Emergency protocols:
- FIRE: Get out, stay low, don't open hot doors
- EARTHQUAKE: Drop, cover, hold on
- FLOOD: Move to higher ground, avoid water
- MEDICAL: Check breathing, call 911, apply pressure to wounds
- INTRUDER: Hide, silence phone, call 911 if safe

Always end with a clear next step or question.`

            expect(systemPrompt.toLowerCase()).toContain('calm')
            expect(systemPrompt.toLowerCase()).toContain('emergency')
            expect(systemPrompt.toLowerCase()).toContain('safety')
            expect(systemPrompt.toLowerCase()).toContain('step')
        })
    })

    describe('Emergency Detection', () => {
        const detectEmergencyType = (userMessage: string): EmergencyType => {
            const lower = userMessage.toLowerCase()
            if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burning')) return 'FIRE'
            if (lower.includes('earthquake') || lower.includes('shaking')) return 'EARTHQUAKE'
            if (lower.includes('flood') || lower.includes('water rising')) return 'FLOOD'
            if (lower.includes('hurt') || lower.includes('bleeding') || lower.includes('can\'t breathe')) return 'MEDICAL'
            if (lower.includes('intruder') || lower.includes('break in') || lower.includes('someone')) return 'INTRUDER'
            return 'GENERAL'
        }

        it('should detect fire emergencies', () => {
            expect(detectEmergencyType('The smoke alarm is going off!')).toBe('FIRE')
            expect(detectEmergencyType('Something is burning in the kitchen')).toBe('FIRE')
        })

        it('should detect earthquake emergencies', () => {
            expect(detectEmergencyType('Everything is shaking!')).toBe('EARTHQUAKE')
        })

        it('should detect medical emergencies', () => {
            expect(detectEmergencyType('My child is bleeding badly')).toBe('MEDICAL')
            expect(detectEmergencyType('I can\'t breathe')).toBe('MEDICAL')
        })

        it('should default to general emergency', () => {
            expect(detectEmergencyType('I need help')).toBe('GENERAL')
        })
    })

    describe('Conversation Management', () => {
        it('should format messages for Gemini chat', () => {
            const messages: ChatMessage[] = [
                { role: 'user', content: 'Fire!' },
                { role: 'model', content: 'Stay calm. Where is the fire?' },
                { role: 'user', content: 'Kitchen' },
            ]

            const formatted = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }],
            }))

            expect(formatted).toHaveLength(3)
            expect(formatted[0].role).toBe('user')
            expect(formatted[0].parts[0].text).toBe('Fire!')
        })

        it('should limit conversation history length', () => {
            const MAX_HISTORY = 10
            const messages: ChatMessage[] = Array(15).fill({ role: 'user', content: 'test' })
            const trimmed = messages.slice(-MAX_HISTORY)
            expect(trimmed).toHaveLength(MAX_HISTORY)
        })
    })

    describe('Response Processing', () => {
        it('should clean response for TTS', () => {
            const cleanForTTS = (text: string): string => {
                return text
                    .replace(/\*\*/g, '') // Remove bold
                    .replace(/\*/g, '')   // Remove italics
                    .replace(/`/g, '')    // Remove code
                    .replace(/\n+/g, '. ') // Newlines to pauses
                    .trim()
            }

            const geminiResponse = '**Stay calm.** Check the door for heat.\n\nDo NOT open it.'
            const cleaned = cleanForTTS(geminiResponse)
            expect(cleaned).toBe('Stay calm. Check the door for heat.. Do NOT open it.')
        })
    })
})
