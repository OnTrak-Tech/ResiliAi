// @ts-check
import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Empty turbopack config to silence Next.js 16 warning
    turbopack: {},
}

export default withPWA(nextConfig)
