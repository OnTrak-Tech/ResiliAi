
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'

// Schema for input validation
const verifyOtpSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, "Code must be 6 digits"), // Strict length check
    hash: z.string()
})

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // 1. Input Validation
        const result = verifyOtpSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const { email, code, hash } = result.data
        const [signature, expiresStr] = hash.split('.')
        const expires = parseInt(expiresStr)

        // 2. Check Expiration
        if (Date.now() > expires) {
            return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 })
        }

        // 3. Re-calculate Signature
        // We sign the original data (Email + The Code User Entered + Original Expiry)
        const secret = process.env.OTP_SECRET || 'fallback-secret-do-not-use-in-prod'
        const dataToSign = `${email}:${code}:${expires}`
        const expectedSignature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex')

        // 4. Secure Comparison
        // Use timingSafeEqual to prevent timing attacks where attackers guess the signature char-by-char
        // Note: Buffers must be same length for timingSafeEqual, so we check length first
        const sigBuffer = Buffer.from(signature)
        const expectedBuffer = Buffer.from(expectedSignature)

        if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
            return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
        }

        // 5. Success
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('OTP Verify Error:', error)
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}
