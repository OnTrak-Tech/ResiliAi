// Guardian Alert Monitor - Custom Service Worker Extension
// This file extends the next-pwa generated service worker

// --- Configuration ---
const ALERT_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const OPENWEATHERMAP_API = 'https://api.openweathermap.org/data/3.0/onecall';

// --- Alert Polling ---
let lastAlertCheck = 0;

async function checkForAlerts() {
    try {
        // Get stored user data
        const cache = await caches.open('resiliai-user-data');
        const userDataResponse = await cache.match('user-profile');

        if (!userDataResponse) {
            console.log('[Guardian SW] No user profile cached');
            return;
        }

        const userData = await userDataResponse.json();
        const { location, guardianAutoSpeak } = userData;

        if (!location) {
            console.log('[Guardian SW] No location set');
            return;
        }

        // Fetch weather API key from config
        const configResponse = await cache.match('app-config');
        if (!configResponse) {
            console.log('[Guardian SW] No config cached');
            return;
        }
        const config = await configResponse.json();

        // Geocode location to lat/lon (simplified - using stored coords)
        const { lat, lon } = userData.coordinates || {};
        if (!lat || !lon) {
            console.log('[Guardian SW] No coordinates available');
            return;
        }

        // Fetch alerts
        const response = await fetch(
            `${OPENWEATHERMAP_API}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${config.weatherApiKey}`
        );

        if (!response.ok) {
            console.error('[Guardian SW] Weather API error:', response.status);
            return;
        }

        const data = await response.json();
        const alerts = data.alerts || [];

        if (alerts.length > 0) {
            const topAlert = alerts[0];
            console.log('[Guardian SW] Alert detected:', topAlert.event);

            // Determine severity
            const isCritical = isAlertCritical(topAlert);

            // Show notification
            await self.registration.showNotification('⚠️ Weather Alert', {
                body: `${topAlert.event}: ${topAlert.description.substring(0, 100)}...`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: 'guardian-alert',
                requireInteraction: isCritical,
                data: {
                    url: '/guardian',
                    alert: topAlert,
                    autoSpeak: guardianAutoSpeak && isCritical
                },
                actions: [
                    { action: 'open-guardian', title: 'Talk to Guardian' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            });

            // Cache the alert for the app to use
            await cache.put('latest-alert', new Response(JSON.stringify(topAlert)));
        }

        lastAlertCheck = Date.now();
    } catch (error) {
        console.error('[Guardian SW] Alert check failed:', error);
    }
}

function isAlertCritical(alert) {
    const criticalEvents = [
        'tornado', 'hurricane', 'tsunami', 'earthquake',
        'flash flood', 'severe thunderstorm', 'extreme'
    ];
    const event = (alert.event || '').toLowerCase();
    return criticalEvents.some(ce => event.includes(ce));
}

// --- Notification Click Handler ---
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open Guardian page
    const url = event.notification.data?.url || '/guardian';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Focus existing window or open new one
            for (const client of clientList) {
                if (client.url.includes('/dashboard') || client.url.includes('/guardian')) {
                    return client.focus().then(c => c.navigate(url));
                }
            }
            return clients.openWindow(url);
        })
    );
});

// --- Periodic Sync (if supported) ---
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'guardian-alert-check') {
        event.waitUntil(checkForAlerts());
    }
});

// --- Message Handler for manual trigger ---
self.addEventListener('message', (event) => {
    if (event.data?.type === 'CHECK_ALERTS') {
        checkForAlerts();
    }

    if (event.data?.type === 'CACHE_USER_DATA') {
        caches.open('resiliai-user-data').then(cache => {
            cache.put('user-profile', new Response(JSON.stringify(event.data.profile)));
        });
    }

    if (event.data?.type === 'CACHE_CONFIG') {
        caches.open('resiliai-user-data').then(cache => {
            cache.put('app-config', new Response(JSON.stringify(event.data.config)));
        });
    }
});

// --- Install Event ---
self.addEventListener('install', (event) => {
    console.log('[Guardian SW] Installed');
    self.skipWaiting();
});

// --- Activate Event ---
self.addEventListener('activate', (event) => {
    console.log('[Guardian SW] Activated');
    event.waitUntil(clients.claim());
});

console.log('[Guardian SW] Custom service worker loaded');
