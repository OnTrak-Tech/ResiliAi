'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users, Radio, Wifi, WifiOff, MessageCircle, Heart,
    ChevronLeft, Send, AlertTriangle, Check, Clock, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    const [activeTab, setActiveTab] = useState<'radar' | 'messages' | 'needs'>('radar')
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

    const matches = matchResourceToNeed(neighbors)
    const unreadCount = getUnreadCount(messages)

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
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] text-white">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold font-antonio tracking-wider">COMMUNITY MESH</h1>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Radio className="h-3 w-3 text-green-400 animate-pulse" />
                            {neighbors.filter(n => n.isOnline).length} neighbors online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-green-500/20 p-2 rounded-full">
                        <Wifi className="h-4 w-4 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {[
                    { id: 'radar', label: 'Radar', icon: Users },
                    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
                    { id: 'needs', label: 'Matches', icon: Heart, badge: matches.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2
                            ${activeTab === tab.id ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Radio className="h-12 w-12 text-orange-400 animate-pulse mb-4" />
                        <p className="text-gray-400">Scanning for neighbors...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'radar' && !selectedNeighbor && (
                            <motion.div
                                key="radar"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                <RadarView neighbors={neighbors} onSelectNeighbor={setSelectedNeighbor} />
                            </motion.div>
                        )}

                        {activeTab === 'radar' && selectedNeighbor && (
                            <motion.div
                                key="neighbor-detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <NeighborDetail neighbor={selectedNeighbor} onBack={() => setSelectedNeighbor(null)} />
                            </motion.div>
                        )}

                        {activeTab === 'messages' && (
                            <motion.div
                                key="messages"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {messages.map(message => (
                                    <MessageCard key={message.id} message={message} />
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'needs' && (
                            <motion.div
                                key="needs"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <MatchesView matches={matches} neighbors={neighbors} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

// Radar View Component
function RadarView({ neighbors, onSelectNeighbor }: { neighbors: Neighbor[]; onSelectNeighbor: (n: Neighbor) => void }) {
    return (
        <div className="space-y-3">
            {/* Radar visualization */}
            <Card className="bg-white/5 border-white/10 p-6">
                <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                    {/* Radar rings */}
                    <div className="absolute inset-0 rounded-full border border-green-500/20" />
                    <div className="absolute inset-[20%] rounded-full border border-green-500/20" />
                    <div className="absolute inset-[40%] rounded-full border border-green-500/20" />

                    {/* Center (you) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />

                    {/* Neighbor dots */}
                    {neighbors.map((neighbor, i) => {
                        const angle = (i / neighbors.length) * Math.PI * 2
                        const distance = Math.min(neighbor.distance / 500, 1) * 40 // Scale to percentage
                        const x = 50 + Math.cos(angle) * distance
                        const y = 50 + Math.sin(angle) * distance
                        const config = STATUS_CONFIG[neighbor.status]

                        return (
                            <motion.button
                                key={neighbor.id}
                                onClick={() => onSelectNeighbor(neighbor)}
                                className={`absolute w-6 h-6 rounded-full ${config.bgColor} border-2 ${neighbor.isOnline ? 'border-green-400' : 'border-gray-500'} flex items-center justify-center text-[10px] font-bold`}
                                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {neighbor.name.charAt(0)}
                            </motion.button>
                        )
                    })}

                    {/* Scanning line */}
                    <motion.div
                        className="absolute left-1/2 top-1/2 w-[50%] h-0.5 bg-gradient-to-r from-green-500 to-transparent origin-left"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
            </Card>

            {/* Neighbor list */}
            <div className="space-y-2">
                {neighbors.map(neighbor => (
                    <NeighborCard key={neighbor.id} neighbor={neighbor} onClick={() => onSelectNeighbor(neighbor)} />
                ))}
            </div>
        </div>
    )
}

// Neighbor Card Component
function NeighborCard({ neighbor, onClick }: { neighbor: Neighbor; onClick: () => void }) {
    const config = STATUS_CONFIG[neighbor.status]

    return (
        <Card
            className={`${config.bgColor} border-white/10 hover:border-white/20 transition-colors cursor-pointer`}
            onClick={onClick}
        >
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${config.bgColor} border-2 ${neighbor.isOnline ? 'border-green-400' : 'border-gray-500'} flex items-center justify-center font-bold`}>
                    {neighbor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{neighbor.name}</p>
                        {neighbor.status === 'needs_help' && (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {formatDistance(neighbor.distance)}
                        <span className="text-gray-600">•</span>
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(neighbor.lastSeen)}
                    </div>
                </div>
                <Badge className={`${config.bgColor} ${config.color} border-0`}>
                    {config.label}
                </Badge>
            </CardContent>
        </Card>
    )
}

// Neighbor Detail Component
function NeighborDetail({ neighbor, onBack }: { neighbor: Neighbor; onBack: () => void }) {
    const config = STATUS_CONFIG[neighbor.status]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${config.bgColor} border-2 ${neighbor.isOnline ? 'border-green-400' : 'border-gray-500'} flex items-center justify-center text-2xl font-bold`}>
                    {neighbor.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-bold">{neighbor.name}</h2>
                    <p className="text-sm text-gray-400">{formatDistance(neighbor.distance)}</p>
                    <Badge className={`${config.bgColor} ${config.color} border-0 mt-1`}>
                        {config.label}
                    </Badge>
                </div>
            </div>

            {neighbor.skills.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {neighbor.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="border-cyan-500/50 text-cyan-400">
                                {skill}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            )}

            {neighbor.resources.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Available Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {neighbor.resources.map(resource => (
                            <div key={resource.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                <span className="text-lg">{RESOURCE_ICONS[resource.type]}</span>
                                <div className="flex-1">
                                    <p className="text-sm">{resource.description}</p>
                                </div>
                                {resource.available && <Check className="h-4 w-4 text-green-400" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {neighbor.needs.length > 0 && (
                <Card className="bg-red-600/10 border-red-500/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Needs Help With
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {neighbor.needs.map(need => (
                            <div key={need.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                <span className="text-lg">{RESOURCE_ICONS[need.type]}</span>
                                <div className="flex-1">
                                    <p className="text-sm">{need.description}</p>
                                </div>
                                <Badge className={need.urgency === 'critical' ? 'bg-red-500' : need.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}>
                                    {need.urgency}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Button className="w-full bg-orange-500 hover:bg-orange-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
            </Button>
        </div>
    )
}

// Message Card Component
function MessageCard({ message }: { message: MeshMessage }) {
    const typeColors = {
        status_update: 'border-blue-500/40',
        resource_offer: 'border-green-500/40',
        help_request: 'border-red-500/40',
        info_share: 'border-cyan-500/40',
        check_in: 'border-gray-500/40',
    }

    return (
        <Card className={`bg-white/5 ${typeColors[message.type]} ${!message.isRead ? 'border-l-4' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{message.senderName}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(message.timestamp)}</p>
                </div>
                <p className="text-sm text-gray-300">{message.content}</p>
            </CardContent>
        </Card>
    )
}

// Matches View Component
function MatchesView({ matches, neighbors }: { matches: Array<{ provider: Neighbor; receiver: Neighbor; resource: string }>; neighbors: Neighbor[] }) {
    if (matches.length === 0) {
        return (
            <Card className="bg-green-600/10 border-green-500/40 p-6 text-center">
                <Check className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-bold">All Needs Matched</p>
                <p className="text-white/50 text-sm mt-1">No unfulfilled needs in your community right now</p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
                AI has identified {matches.length} resource match{matches.length > 1 ? 'es' : ''}
            </p>
            {matches.map((match, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{RESOURCE_ICONS[match.resource as keyof typeof RESOURCE_ICONS]}</span>
                            <span className="font-medium capitalize">{match.resource}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Has</p>
                                <p className="font-medium text-green-400">{match.provider.name}</p>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 via-orange-500 to-red-500/50 mx-4" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Needs</p>
                                <p className="font-medium text-red-400">{match.receiver.name}</p>
                            </div>
                        </div>
                        <Button className="w-full mt-3 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/40">
                            Facilitate Connection
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
