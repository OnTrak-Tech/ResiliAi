# ResiliAi 
> **Disasters Don't Wait. Neither Should You.**

**ResiliAi** is an active survival intelligence that lives on your device. Unlike static checklists, it uses **Gemini 3's multimodal capabilities** to *see* risks in your home, *speak* to you during crises, and *train* you for the unexpected—even when the power goes out.

---

##  Core Functionalities

###  "Sentinel" Home Audit (Gemini Vision)
Turn your phone into a risk detector. Point your camera at a room, and ResiliAi identifies:
*   **Hazards:** "That heavy bookshelf isn't anchored (Earthquake Risk)."
*   **Assets:** "Found: First Aid Kit, Canned Goods."
*   **Result:** A prioritized, AI-generated fortification plan for your specific home.

###  "Guardian" Live Voice (Gemini Audio)
Panic freezes the brain. ResiliAi unfreezes it.
*   **Hands-Free:** Activate "Event Mode" with a single tap.
*   **Calm Guidance:** A reasoning voice assistant (Gemini Live) talks you through smoke, floods, or blackouts in real-time.
*   **Emotional Regulation:** The AI adapts its tone to de-escalate panic while keeping you moving.

### 🎮 "Drill Sergeant" Simulations (Practice Mode)
Don't just read about disasters—live them (virtually).
*   **Interactive Scenarios:** "It's 2 AM. Flood sirens are blaring. Battery is 12%. What do you do?"
*   **Personalized:** Utilizing your *actual* home inventory scanned by Sentinel.
*   **Gamified:** Earn Resilience Points for making the right active decisions.

#### 🔥 How Practice Mode Works
From the dashboard, tap **"Practice Mode"** to launch a simulated emergency:

| Scenario | What Guardian Receives |
|----------|----------------------|
| 🌪️ Tornado Warning | `[SIMULATION] Tornado approaching your area...` |
| ⚠️ Earthquake | `[SIMULATION] Strong earthquake activity detected...` |
| 🌊 Flash Flood | `[SIMULATION] Flash flood warning in effect...` |

*   **Same AI, Safe Context:** Guardian provides real guidance based on the simulated scenario—no actual alerts triggered.
*   **Visual Indicator:** A yellow "Practice" badge appears so users know they're training.
*   **Seamless Transition:** In a real emergency, Guardian automatically uses **live weather data** from OpenWeatherMap.

> **For Judges:** Practice Mode demonstrates the app's training capability. In real use, Guardian receives actual weather alerts from the user's location, enabling context-aware emergency guidance.

### 🔗 "Lifeline" Community Mesh
When cell towers fail, your community shouldn't.
*   **Offline-First:** Critical data is stored locally on your device.
*   **Supply Matching:** "Neighbor Sarah has extra water." (Mesh Protocol Mockup).

---

##  Powered by Gemini 3 API

ResiliAi leverages the absolute bleeding edge of Google's AI:
*   **Gemini Vision:** For real-time object detection and hazard analysis.
*   **Gemini 2.0 Flash/Live:** For low-latency conversational audio streaming.
*   **Long-Context Window:** To hold your entire "Home Profile" in memory for hyper-personalized advice.

---

##  Technical Stack 

Built for speed, reliability, and the modern web.
*   **Frontend:** Next.js 14 (App Router) + TypeScript
*   **Deployment:** Vercel (Edge Network)
*   **PWA:** Installable, mobile-native feel, offline service workers.
*   **Visuals:** Tailwind CSS + Framer Motion (Cyberpunk/Safety Aesthetic).
*   **Storage:** Dexie.js (IndexedDB) for robust offline data persistence.

---

##  Project Documentation

Deep dive into our architecture and design:

*    **[Product Concept](./Documentation/Product_Concept.md)** - The full vision, "Blue Sky / Grey Sky" lifecycle, and demo flow.
*    **[Technical Architecture](./Documentation/Technical_Architecture.md)** - AI integration matrix, database schema, and security.
*    **[User Flow & Wireframes](./Documentation/User_Flow.md)** - Step-by-step user journey from onboarding to crisis response.

---

##  Best Experience: Install as PWA

ResiliAi is designed as a **Progressive Web App (PWA)** for instant access during emergencies.

**To install:**
1. Open the app in Chrome (desktop/mobile) or Safari (iOS)
2. Tap the browser menu (⋮ or share icon)
3. Select **"Add to Home Screen"** or **"Install App"**

**PWA benefits:**
-  Works offline (cached resources)
-  Push notifications for real-time alerts  
-  One-tap access from home screen
-  Full-screen, app-like experience

> **Note for Judges:** The app works in-browser for testing, but installing as a PWA unlocks the full emergency-ready experience including background alert monitoring.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
