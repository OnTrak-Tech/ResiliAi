'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/store/userStore'

interface VerificationStepProps {
    onComplete: () => void
}

export function VerificationStep({ onComplete }: VerificationStepProps) {
    const { profile } = useUserStore()
    const [code, setCode] = useState('')
    const [error, setError] = useState(false)
    const [verifying, setVerifying] = useState(false)

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
                        A verification code has been sent to your email <span className="font-semibold text-gray-900 dark:text-gray-200">{profile.email}</span>
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
                                Invalid code. Please try again.
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
                            'Verifying...'
                        ) : (
                            <>
                                Verify & Continue <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </Button>
                </form>
            </motion.div>
        </Card>
    )
}
