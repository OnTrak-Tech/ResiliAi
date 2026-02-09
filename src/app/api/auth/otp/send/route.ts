
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'
import { z } from 'zod'

// Schema for input validation
const sendOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
})

// Rate Limiting Map (Simple In-Memory for specific IPs/Emails)
// Note: In a serverless environment (Vercel), this may reset often.
// For production, use Redis (Upstash). For this MVP, it prevents basic rapid-fire abuse in a single session.
const rateLimitMap = new Map<string, number>()

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // 1. Input Validation
        const result = sendOtpSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
        }

        const { email } = result.data

        // 2. Rate Limiting (Simple) - 1 request per 30 seconds per email
        const lastRequest = rateLimitMap.get(email)
        const now = Date.now()
        if (lastRequest && now - lastRequest < 30000) {
            return NextResponse.json(
                { error: 'Please wait 30 seconds before requesting another code.' },
                { status: 429 }
            )
        }
        rateLimitMap.set(email, now)

        // 3. Generate Secure Random Code (6 digits)
        // Using crypto.randomInt is more secure than Math.random()
        const code = crypto.randomInt(100000, 999999).toString()

        // 4. Calculate Expiry (15 Minutes)
        const expires = now + 15 * 60 * 1000

        // 5. Generate HMAC Signature
        // Sign: email + code + expires
        // This ensures the client cannot tamper with the code or expiry
        const secret = process.env.OTP_SECRET || 'fallback-secret-do-not-use-in-prod'
        const dataToSign = `${email}:${code}:${expires}`
        const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex')

        // 6. Send Email via Resend
        const API_KEY = process.env.RESEND_API_KEY

        if (!API_KEY) {
            // Fallback for development if no key provided yet
            console.log('------------------------------------------------')
            console.log('[DEV MODE] Resend API Key missing.')
            console.log(`[DEV MODE] Validation Code for ${email}: ${code}`)
            console.log('------------------------------------------------')
        } else {
            const resend = new Resend(API_KEY)

            await resend.emails.send({
                from: 'ResiliAi <verify.resiliai.site>',
                to: email,
                subject: 'Your ResiliAi Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-w-md; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1e40af;">Verify Your Identity</h2>
                        <p>Use the following code to verify your email address. This code is valid for 15 minutes.</p>
                        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${code}</span>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                `
            })
        }

        // 7. Return Signed Data to Client
        // IMPORTANT: We do NOT return the code. The client only gets the signature.
        return NextResponse.json({
            success: true,
            hash: `${signature}.${expires}`
        })

    } catch (error) {
        console.error('OTP Send Error:', error)
        return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
    }
}
