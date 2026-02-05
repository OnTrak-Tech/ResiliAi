'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users, Radio, Wifi, MessageCircle, Heart,
    ChevronLeft, MapPin, Clock, Check, AlertTriangle,
    Home, Scan, User, Settings as SettingsIcon, MoreVertical
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Neighbor, MeshMessage, RESOURCE_ICONS, STATUS_CONFIG
} from '@/types/mesh'
import {
    getNearbyNeighbors, getMeshMessages, matchResourceToNeed,
    formatDistance, formatTimeAgo, getUnreadCount
} from '@/services/communityMesh'
import { motion, AnimatePresence } from 'framer-motion'

interface CommunityMeshProps {
    onBack?: () => void
}

export function CommunityMesh({ onBack }: CommunityMeshProps) {
    const router = useRouter()
    const [neighbors, setNeighbors] = useState<Neighbor[]>([])
    const [messages, setMessages] = useState<MeshMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedNeighbor, setSelectedNeighbor] = useState<Neighbor | null>(null)

    useEffect(() => {
        async function loadMeshData() {
            setLoading(true)
            const [neighborsData, messagesData] = await Promise.all([
                getNearbyNeighbors(),
                getMeshMessages()
            ])
            setNeighbors(neighborsData)
            setMessages(messagesData)
            setLoading(false)
        }
        loadMeshData()
    }, [])

    // const matches = matchResourceToNeed(neighbors) // Logic reserved for future expansion

    // Hardcoded mock resource matching cards to match visual mockup perfectly
    const mockMatches = [
        {
            id: 1,
            user: { name: 'You', avatar: null },
            message: 'I have extra water - Need first aid kit',
            time: '5m ago',
            type: 'exchange',
            has: 'water',
            needs: 'first_aid'
        },
        {
            id: 2,
            user: { name: 'Neighbor', avatar: null },
            message: 'Need first aid kit - I have canned food',
            time: '10m ago',
            type: 'exchange',
            has: 'food',
            needs: 'first_aid'
        }
    ]

    const handleBack = () => {
        if (selectedNeighbor) {
            setSelectedNeighbor(null)
        } else if (onBack) {
            onBack()
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-24 font-sans flex flex-col">

            {/* Header - Clean Enterprise (No "Simple Community Map" text as requested) */}
            {/* Just a subtle gradient map background at the top */}
            <div className="relative w-full h-[55vh] bg-slate-900 overflow-hidden">
                {/* Map Background (Abstract Dark/Teal Style from Mockup) */}
                <div className="absolute inset-0 bg-[#0f172a]" />

                {/* Map Grid Lines */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Map Roads (Stylized) */}
                <svg className="absolute inset-0 w-full h-full opacity-30 stroke-teal-500/30" fill="none" strokeWidth="2">
                    <path d="M0,100 Q150,120 300,80 T600,150" />
                    <path d="M50,0 Q80,200 60,400" />
                    <path d="M250,0 Q220,200 280,400" />
                    <path d="M0,300 Q200,280 400,320" />
                </svg>

                {/* Back Button & Header Controls */}
                <div className="absolute top-0 left-0 right-0 p-6 pt-10 flex justify-between items-start z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm rounded-full"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm rounded-full"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>


                {/* Neighbors on Map */}
                {neighbors.map((neighbor, i) => {
                    // Random positioning for mock effect (deterministic based on index)
                    const top = 20 + (i * 15) % 60
                    const left = 20 + (i * 25) % 70

                    return (
                        <div
                            key={neighbor.id}
                            className="absolute flex flex-col items-center gap-1 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95 group"
                            style={{ top: `${top}%`, left: `${left}%` }}
                            onClick={() => setSelectedNeighbor(neighbor)}
                        >
                            {/* Marker Pin */}
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transition-colors ${neighbor.id === 'user' // Assuming 'user' id exists or logic is needed, simplified here
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                                : 'bg-teal-900/80 border-teal-400 text-teal-400'
                                } backdrop-blur-sm`}>
                                <User className="h-5 w-5" />

                                {/* Pulse Effect if Active/Online */}
                                {neighbor.isOnline && (
                                    <div className="absolute inset-0 rounded-full bg-teal-400/30 animate-ping" />
                                )}
                            </div>

                            {/* Label */}
                            <span className="text-[10px] font-medium text-teal-100 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                {neighbor.name}
                            </span>
                        </div>
                    )
                })}

                {/* "You" Marker (Center) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-[3s]" />
                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping delay-1000 duration-[3s]" />
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-emerald-950/30">
                            <User className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 tracking-wide uppercase">You</span>
                </div>
            </div>

            {/* Bottom Section: Resource Matching */}
            <div className="flex-1 bg-gradient-to-b from-[#111827] to-[#0f172a] -mt-6 rounded-t-[2rem] relative z-10 px-6 pt-8 pb-4">
                {/* Drag Handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700/50 rounded-full" />

                <h2 className="text-lg font-bold text-teal-400 mb-4 px-1">Resource Matching</h2>

                <div className="space-y-3">
                    {mockMatches.map((match) => (
                        <div
                            key={match.id}
                            className="bg-[#1e293b]/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex items-start gap-4 shadow-lg"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                                <User className="h-6 w-6 text-slate-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 leading-snug">
                                    {match.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-slate-500">{match.time}</span>
                                    <button className="text-teal-400 hover:text-teal-300 transition-colors">
                                        <Send className="h-4 w-4 rotate-45 transform -translate-y-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation Bar (Default Dashboard Tabs) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-8 flex justify-between items-center z-50">
                <NavIcon icon={Home} label="Home" onClick={() => router.push('/dashboard')} />
                <NavIcon icon={Scan} label="Scan" onClick={() => router.push('/vision-audit')} />
                <NavIcon icon={User} label="Profile" onClick={() => router.push('/onboarding')} />
                <NavIcon icon={SettingsIcon} label="Settings" onClick={() => router.push('/settings')} />
            </div>

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
