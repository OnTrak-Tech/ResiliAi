import { NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'

/**
 * POST /api/live/token
 * 
 * Generates a short-lived ephemeral token for Gemini Live API.
 * This keeps the API key secure on the server while allowing
 * the client to connect directly to Gemini Live via WebSocket.
 */
export async function POST() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Server configuration error: API key not set' },
            { status: 500 }
        )
    }

    try {
        const client = new GoogleGenAI({ apiKey })

        // Token expires in 30 minutes
        const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()

        const token = await client.authTokens.create({
            config: {
                uses: 1, // Single use token
                expireTime: expireTime,
                liveConnectConstraints: {
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                    config: {
                        responseModalities: [Modality.AUDIO, Modality.TEXT],
                    },
                },
            },
        })

        return NextResponse.json({
            token: token.name,
            expiresAt: expireTime,
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        })
    } catch (error: any) {
        console.error('Failed to generate ephemeral token:', error)

        // Check for specific error types
        if (error?.message?.includes('401') || error?.message?.includes('API key')) {
            return NextResponse.json(
                { error: 'Invalid API key configuration' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to generate session token. Please try again.' },
            { status: 500 }
        )
    }
}
