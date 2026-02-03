# User Flow & Wireframes

## 1. Onboarding Flow (The "Hook")
**Goal:** High-octane intro, get user buy-in immediately.
*   **screen_1_landing:**
    *   **Visual:** Black screen. Pulse red heartbeat animation.
    *   **Text:** "Disasters don't wait. Are you ready?"
    *   **Action:** "Start Scan" button (CTA).
*   **screen_2_permissions:**
    *   **Visual:** Glassmorphism modal requesting Camera (Vision) and Mic (Voice).
    *   **Context:** "Gemini needs to see your home to protect it."
*   **screen_3_home_audit (Vision):**
    *   **Visual:** Full-screen camera viewfinder. AR overlays (bounding boxes) appear on objects.
    *   **Interaction:** User pans room. Dynamic text updates: "Found: Fire Extinguisher (Good)", "Risk: Heavy shelf near door".
    *   **Result:** "Resilience Score: 42/100" (Gamification start).

## 2. Dashboard (The HQ)
**Goal:** Calm, clear status at a glance.
*   **Layout:** Grid system (Bento box style).
*   **Tiles:**
    1.  **Resilience Score:** Large number with progress ring.
    2.  **Weather/Threat Level:** "Low Risk - Clear Skies".
    3.  **Quick Actions:** "Run Simulation", "Open Validt" (Plans).
    4.  **Community Status:** "3 Neighbors Active".

## 3. Crisis Mode (Guardian)
**Goal:** Zero friction. Pure utility.
*   **Trigger:** Big "Emergency" floating action button (FAB) always visible.
*   **screen_emergency:**
    *   **Visual:** High contrast (Black/Red). Large text.
    *   **Components:**
        *   "Voice Active" waveform (Gemini Listening).
        *   Emergency Contacts (One tap call).
        *   "I'm Safe" / "I Need Help" buttons (Mesh broadcast).

## 4. Simulation Mode (The Game)
*   **screen_sim_intro:**
    *   **Visual:** Cyberpunk/Tactical map style.
    *   **Selection:** "Scenario: Urban Flood".
*   **screen_sim_chat:**
    *   **Visual:** Chat interface but highly stylized (like a terminal).
    *   **Interaction:** Gemini provides scenario updates. User replies via voice or quick-reply chips.
