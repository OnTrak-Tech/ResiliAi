'use client'

import { CommunityMesh } from '@/components/features/CommunityMesh'
import { useRouter } from 'next/navigation'

export default function CommunityMeshPage() {
    const router = useRouter()

    return (
        <CommunityMesh onBack={() => router.push('/dashboard')} />
    )
}
