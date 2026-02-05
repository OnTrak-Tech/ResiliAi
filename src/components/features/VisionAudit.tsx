'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Loader2, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analyzeImage, AnalysisResult, Hazard } from '@/services/geminiVision'

// --- Severity Colors ---
const SEVERITY_COLORS: Record<Hazard['severity'], string> = {
    LOW: 'text-blue-400 border-blue-400/50',
    MEDIUM: 'text-yellow-400 border-yellow-400/50',
    HIGH: 'text-orange-500 border-orange-500/50',
    CRITICAL: 'text-red-500 border-red-500/50',
}

const SEVERITY_BG: Record<Hazard['severity'], string> = {
    LOW: 'bg-blue-500/20',
    MEDIUM: 'bg-yellow-500/20',
    HIGH: 'bg-orange-500/20',
    CRITICAL: 'bg-red-500/20',
}

interface VisionAuditProps {
    onClose: () => void
    onComplete?: (result: AnalysisResult) => void
}

export function VisionAudit({ onClose, onComplete }: VisionAuditProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)

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
                setError('Camera access denied. Please grant permission to use this feature.')
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
        <div className="fixed inset-0 z-50 bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-white font-antonio text-xl tracking-wide uppercase">Vision Audit</span>
                    {!result && !isAnalyzing && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs font-bold uppercase animate-pulse">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            Live
                        </span>
                    )}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Camera Feed / Captured Image */}
            <div className="relative w-full h-full">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {/* HUD Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Corner brackets */}
                            <div className="absolute top-20 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50" />
                            <div className="absolute top-20 right-4 w-16 h-16 border-r-2 border-t-2 border-cyan-400/50" />
                            <div className="absolute bottom-32 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-400/50" />
                            <div className="absolute bottom-32 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50" />
                            {/* Center crosshair */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-8 h-0.5 bg-cyan-400/60" />
                                <div className="w-0.5 h-8 bg-cyan-400/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            {/* Scan lines */}
                            <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse" />
                        </div>
                    </>
                ) : (
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Error State */}
            {error && (
                <div className="absolute inset-x-4 top-24 bg-red-500/10 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Analysis Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-3xl max-h-[60vh] overflow-y-auto"
                    >
                        <div className="p-6 space-y-4">
                            {/* Risk Level Badge */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-antonio text-2xl uppercase">Analysis Report</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${SEVERITY_COLORS[result.overallRiskLevel]} ${SEVERITY_BG[result.overallRiskLevel]}`}>
                                    {result.overallRiskLevel} Risk
                                </span>
                            </div>

                            {/* Summary */}
                            <p className="text-gray-400 text-sm">{result.summary}</p>

                            {/* Hazards */}
                            {result.hazards.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-orange-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Identified Hazards
                                    </h4>
                                    {result.hazards.map((hazard, i) => (
                                        <div
                                            key={i}
                                            className={`p-3 rounded-lg border ${SEVERITY_COLORS[hazard.severity]} ${SEVERITY_BG[hazard.severity]}`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="font-bold text-white">{hazard.item}</span>
                                                <span className="text-xs uppercase">{hazard.severity}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{hazard.recommendation}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Assets */}
                            {result.assets.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-green-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Safety Assets Found
                                    </h4>
                                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                        {result.assets.map((asset, i) => (
                                            <li key={i}>{asset}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleRetry}
                                    variant="outline"
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    Scan Again
                                </Button>
                                <Button
                                    onClick={onClose}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Capture Button */}
            {!result && !isAnalyzing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <button
                        onClick={captureImage}
                        disabled={!stream}
                        className="relative w-20 h-20 rounded-full border-4 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center group disabled:opacity-50 transition-all hover:border-orange-500/60 hover:bg-orange-500/20"
                    >
                        <div className="w-14 h-14 rounded-full bg-white/80 group-hover:bg-orange-500 transition-colors flex items-center justify-center">
                            <Camera className="h-6 w-6 text-black" />
                        </div>
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-orange-500/40 animate-ping" />
                    </button>
                </motion.div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                    <div className="text-center">
                        <p className="text-white font-antonio text-xl uppercase tracking-wide">Analyzing Environment</p>
                        <p className="text-gray-400 text-sm mt-1">Gemini is scanning for hazards...</p>
                    </div>
                </div>
            )}
        </div>
    )
}
