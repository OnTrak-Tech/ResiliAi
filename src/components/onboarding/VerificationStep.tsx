'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'

interface VerificationStepProps {
    onComplete: () => void
}

export function VerificationStep({ onComplete }: VerificationStepProps) {
    const { profile, setVerificationHash } = useUserStore()
    const [code, setCode] = useState('')
    const [error, setError] = useState(false)
    const [verifying, setVerifying] = useState(false)

    // Resend Logic
    const [countdown, setCountdown] = useState(60)
    const [isResending, setIsResending] = useState(false)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleResend = async () => {
        if (countdown > 0) return

        setIsResending(true)
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to resend code')
            }

            // Update hash and reset timer
            setVerificationHash(data.hash)
            setCountdown(60)
            setError(false)
            // Optional: User feedback could go here (toast)

        } catch (err) {
            console.error('Resend error:', err)
        } finally {
            setIsResending(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setVerifying(true)
        setError(false)

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: profile.email,
                    code: code,
                    hash: profile.verificationHash // From store
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Invalid code')
            }

            // Success!
            onComplete()

        } catch (err) {
            setError(true)
        } finally {
            setVerifying(false)
        }
    }

    return (
        <Card className="w-full max-w-md p-6 border-none shadow-none bg-transparent">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-[#2563eb]" />
                        <span className="text-xs font-bold tracking-widest text-[#2563eb] uppercase">
                            Security Check
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Enter verification code
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        A verification code has been sent to <span className="font-semibold text-gray-900 dark:text-gray-200">{profile.email}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        If you don't see it, please check your <strong>spam folder</strong>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Verification Code
                        </label>
                        <Input
                            required
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value)
                                setError(false)
                            }}
                            className={`h-12 bg-gray-50 dark:bg-slate-800 border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#2563eb] transition-all text-center tracking-[0.5em] text-lg font-bold ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                            maxLength={6}
                        />
                        {error && (
                            <p className="text-xs text-red-500 font-medium ml-1">
                                Invalid code. Please try again or request a new one.
                            </p>
                        )}
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                            Code is valid for 15 minutes.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={verifying || code.length < 6}
                        className="w-full h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & Continue <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Resend Section */}
                <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Didn't receive the email?
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResend}
                        disabled={countdown > 0 || isResending}
                        className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                        {isResending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                            countdown <= 0 && <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
                    </Button>
                </div>
            </motion.div>
        </Card>
    )
}
