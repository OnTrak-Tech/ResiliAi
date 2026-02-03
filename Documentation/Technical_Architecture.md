# Technical Architecture & Strategy

## 1. Hackathon Compliance

### Gemini API Usage
*   **SDK:** `@google/generative-ai` (Latest)
*   **Models:**
    *   `gemini 3 pro` → Vision (Sentinel), Reasoning (Action Plans)
    *   `gemini 3 pro` → Fast responses, Audio streaming (Guardian Voice)
*   **Key Features Showcased:** Multimodal Vision, Long Context, Agentic Reasoning

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 DEPLOYMENT: Vercel                      │
│                 (Free Tier, Auto SSL, CDN)              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    FRONTEND (PWA)                       │
│   Next.js 14 (App Router) + TypeScript                  │
│   Tailwind CSS + shadcn/ui + Framer Motion              │
│   next-pwa (Service Worker)                             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    AI LAYER                             │
│   @google/generative-ai (Official Gemini SDK)           │
│   - Vision: Home Audit (Sentinel)                       │
│   - Text: Action Plans, Simulations                     │
│   - Audio: Guardian Voice (Web Speech API fallback)     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    EXTERNAL APIs                        │
│   OpenWeatherMap (Alerts) + Browser Geolocation         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    STORAGE (Offline-First)              │
│   Dexie.js (IndexedDB) + Zustand (State)                │
└─────────────────────────────────────────────────────────┘
```

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 | App Router, API routes, PWA |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, dark mode |
| Animation | Framer Motion | Polish, transitions |
| Icons | Lucide React | Clean iconography |
| AI | @google/generative-ai | Gemini Vision + Text |
| State | Zustand | Lightweight global state |
| Offline DB | Dexie.js | IndexedDB wrapper |
| PWA | next-pwa | Service worker, installability |
| Weather | OpenWeatherMap API | Alerts, forecasts |
| Deploy | Vercel | Free hosting, instant deploys |

## 4. Key Data Structures

```typescript
interface UserProfile {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  housingType: 'house' | 'apartment';
  hasPets: boolean;
  hasKids: boolean;
  hasElderly: boolean;
  hasBackupPower: boolean;
  homeInventory: InventoryItem[];
  resilienceScore: number;
}

interface EmergencyPlan {
  id: string;
  threatType: string;
  steps: { action: string; completed: boolean }[];
  generatedAt: Date;
}
```

## 5. API Keys Required

| Service | Purpose | Get From |
|---------|---------|----------|
| Google AI | Gemini API | [aistudio.google.com](https://aistudio.google.com) |
| OpenWeatherMap | Weather Alerts | [openweathermap.org/api](https://openweathermap.org/api) |
