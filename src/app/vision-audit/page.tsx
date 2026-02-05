'use client'

import { useRouter } from 'next/navigation'
import { VisionAudit } from '@/components/features/VisionAudit'

export default function VisionAuditPage() {
    const router = useRouter()

    return (
        <VisionAudit
            onClose={() => router.back()}
            onComplete={(result) => {
                console.log('Analysis complete:', result)
                // TODO: Save result to user store or database
            }}
        />
    )
}
