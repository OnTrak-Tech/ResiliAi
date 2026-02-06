'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useUserStore()
    const theme = profile.theme || 'system' // fallback

    useEffect(() => {
        const root = window.document.documentElement

        // Remove manual classes first
        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    return <>{children}</>
}
