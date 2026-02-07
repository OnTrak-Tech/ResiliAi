'use client'

import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'

/**
 * Hook to register the Guardian Service Worker and sync user data.
 * Call this in a top-level component (e.g., layout or dashboard).
 */
export function useGuardianWorker() {
    const { profile } = useUserStore()

    // Register and update service worker
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return
        }

        async function registerWorker() {
            try {
                // The main SW is auto-registered by next-pwa
                // We just need to register our custom guardian worker as well
                const registration = await navigator.serviceWorker.register('/worker-guardian.js', {
                    scope: '/'
                })

                console.log('[Guardian] Service worker registered:', registration.scope)

                // Request permission for notifications
                if ('Notification' in window && Notification.permission === 'default') {
                    await Notification.requestPermission()
                }

                // Request periodic sync permission (if supported)
                if ('periodicSync' in registration) {
                    try {
                        const status = await navigator.permissions.query({
                            name: 'periodic-background-sync' as PermissionName,
                        })
                        if (status.state === 'granted') {
                            await (registration as any).periodicSync.register('guardian-alert-check', {
                                minInterval: 5 * 60 * 1000, // 5 minutes
                            })
                            console.log('[Guardian] Periodic sync registered')
                        }
                    } catch (e) {
                        console.log('[Guardian] Periodic sync not supported')
                    }
                }
            } catch (error) {
                console.error('[Guardian] Service worker registration failed:', error)
            }
        }

        registerWorker()
    }, [])

    // Sync user data to service worker cache
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return
        }

        navigator.serviceWorker.ready.then((registration) => {
            if (registration.active) {
                registration.active.postMessage({
                    type: 'CACHE_USER_DATA',
                    profile: {
                        location: profile.location,
                        guardianAutoSpeak: profile.guardianAutoSpeak,
                        // Coordinates would need to be added to profile or fetched separately
                    }
                })
            }
        })
    }, [profile.location, profile.guardianAutoSpeak])

    // Cache API config
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return
        }

        const weatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY

        navigator.serviceWorker.ready.then((registration) => {
            if (registration.active && weatherApiKey) {
                registration.active.postMessage({
                    type: 'CACHE_CONFIG',
                    config: {
                        weatherApiKey
                    }
                })
            }
        })
    }, [])

    // Manual trigger for alert check
    const triggerAlertCheck = useCallback(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                if (registration.active) {
                    registration.active.postMessage({ type: 'CHECK_ALERTS' })
                }
            })
        }
    }, [])

    return { triggerAlertCheck }
}
