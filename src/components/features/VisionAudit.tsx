'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Camera,
    X,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    ArrowLeft,
    Info,
    Home,
    Scan,
    User,
    Settings,
    ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analyzeImage, AnalysisResult, Hazard } from '@/services/geminiVision'
import { FortificationPlan } from '@/components/features/FortificationPlan'

// --- Severity Colors (Clean Enterprise) ---
const SEVERITY_COLORS: Record<Hazard['severity'], string> = {
    LOW: 'text-blue-600 border-blue-200 bg-blue-50',
    MEDIUM: 'text-yellow-600 border-yellow-200 bg-yellow-50',
    HIGH: 'text-orange-600 border-orange-200 bg-orange-50',
    CRITICAL: 'text-red-600 border-red-200 bg-red-50',
}

interface VisionAuditProps {
    onClose: () => void
    onComplete?: (result: AnalysisResult) => void
}

export function VisionAudit({ onClose, onComplete }: VisionAuditProps) {
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [showFortificationPlan, setShowFortificationPlan] = useState(false)

    // --- Camera Setup ---
    useEffect(() => {
        async function setupCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false,
                })
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (err) {
                console.error('Camera access error:', err)
                setError('Camera access denied. Please grant permission.')
            }
        }

        setupCamera()

        return () => {
            stream?.getTracks().forEach((track) => track.stop())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- Capture Image ---
    const captureImage = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(base64)
        analyzeCapture(base64)
    }, [])

    // --- Analyze with Gemini ---
    const analyzeCapture = async (base64: string) => {
        setIsAnalyzing(true)
        setError(null)

        try {
            const analysisResult = await analyzeImage(base64)
            setResult(analysisResult)
            onComplete?.(analysisResult)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed')
        } finally {
            setIsAnalyzing(false)
        }
    }

    // --- Retry ---
    const handleRetry = () => {
        setResult(null)
        setCapturedImage(null)
        setError(null)
    }

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans">

            {/* Header (Transparent over camera) */}
            <div className="absolute top-0 left-0 right-0 z-20 pt-8 pb-4 px-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                {/* No Logo as requested */}
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <span className="text-white font-semibold text-lg tracking-tight">AI Vision Audit Scan</span>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Info className="h-6 w-6" />
                </Button>
            </div>

            {/* Main Content (Camera) */}
            <div className="flex-1 relative bg-black overflow-hidden">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {/* Clean Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* White Rounded Corner Brackets */}
                            <div className="absolute top-24 left-8 w-12 h-12 border-l-[3px] border-t-[3px] border-white rounded-tl-3xl opacity-80" />
                            <div className="absolute top-24 right-8 w-12 h-12 border-r-[3px] border-t-[3px] border-white rounded-tr-3xl opacity-80" />
                            <div className="absolute bottom-40 left-8 w-12 h-12 border-l-[3px] border-b-[3px] border-white rounded-bl-3xl opacity-80" />
                            <div className="absolute bottom-40 right-8 w-12 h-12 border-r-[3px] border-b-[3px] border-white rounded-br-3xl opacity-80" />

                            {/* Simple Crosshair */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-6 h-0.5 bg-white/80" />
                                <div className="w-0.5 h-6 bg-white/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>

                            {/* Label Mockups (Visual only until analyzed) */}
                            {/* <div className="absolute top-1/3 right-12 bg-white px-3 py-1 rounded-lg shadow-lg flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-900">Blocked Exit - Hazard</span>
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-white border-r-[6px] border-r-transparent absolute -bottom-2" />
                            </div> */}
                        </div>
                    </>
                ) : (
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                    />
                )}

                <canvas ref={canvasRef} className="hidden" />

                {/* Loading Overlay (Clean White) */}
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-30">
                        <Loader2 className="h-10 w-10 text-[#2563eb] animate-spin" />
                        <div className="text-center">
                            <h3 className="text-gray-900 font-bold text-xl">Analyzing Environment</h3>
                            <p className="text-gray-500 text-sm mt-1">Gemini is identifying safety hazards...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Area (White) */}
            {/* If no result, show capture button. If result, show sheet. */}

            {/* Capture Button (Floating) */}
            {!result && !isAnalyzing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-28 left-0 right-0 flex justify-center z-20"
                >
                    <button
                        onClick={captureImage}
                        disabled={!stream}
                        className="w-20 h-20 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Camera className="h-8 w-8 text-[#2563eb]" />
                    </button>
                </motion.div>
            )}

            {/* Results Sheet (White Card Style) */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-[72px] left-0 right-0 z-30 max-h-[60vh] flex flex-col justify-end"
                    >
                        <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
                            {/* Drag Handle */}
                            <div className="w-full h-6 flex justify-center items-center bg-gray-50 border-b border-gray-100">
                                <div className="w-10 h-1 rounded-full bg-gray-300" />
                            </div>

                            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[#2563eb] font-bold text-lg">Gemini Vision Insights</h3>
                                    <Button variant="outline" size="sm" className="text-xs h-7">Safety Tips</Button>
                                    {/* <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${SEVERITY_COLORS[result.overallRiskLevel]}`}>
                                        {result.overallRiskLevel} Risk
                                    </span> */}
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {result.summary}
                                </p>

                                {/* List of Hazards */}
                                {result.hazards.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        {result.hazards.map((hazard, i) => (
                                            <div key={i} className="flex gap-3 items-start">
                                                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{hazard.item}</p>
                                                    <p className="text-xs text-gray-500">{hazard.recommendation}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <Button onClick={handleRetry} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200">
                                        Rescan
                                    </Button>
                                    <Button onClick={() => setShowFortificationPlan(true)} className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                                        Action Plan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Nav Bar (Fixed) */}
            <div className="bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-40 relative">
                <NavIcon icon={Home} label="Home" onClick={() => router.push('/dashboard')} />
                <NavIcon icon={Scan} label="Scan" active />
                <NavIcon icon={User} label="Profile" onClick={() => router.push('/onboarding')} />
                <NavIcon icon={Settings} label="Settings" onClick={() => router.push('/settings')} />
            </div>

            {/* Fortification Plan Overlay */}
            {showFortificationPlan && result && (
                <FortificationPlan
                    result={result}
                    onBack={() => setShowFortificationPlan(false)}
                />
            )}
        </div>
    )
}

function NavIcon({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 ${active ? 'text-[#2563eb]' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
        >
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

