import { GoogleGenerativeAI } from '@google/generative-ai'

// --- Type Definitions ---
export type DisasterType = 'EARTHQUAKE' | 'FIRE' | 'FLOOD' | 'STORM' | 'GENERAL'

export interface Hazard {
    type: 'FALL_HAZARD' | 'FIRE_HAZARD' | 'PROJECTILE_RISK' | 'STRUCTURAL_ISSUE' | 'OTHER'
    item: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    recommendation: string
    disasterType: DisasterType
    disasterContext: string
    boundingBox?: {
        x: number
        y: number
        width: number
        height: number
    }
}

export interface AnalysisResult {
    hazards: Hazard[]
    assets: string[]
    overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    summary: string
}

// --- Prompt Engineering ---
const ANALYSIS_PROMPT = `You are a disaster preparedness AI assistant analyzing a home environment for safety risks.

Analyze this image and identify hazards that could cause harm during natural disasters:

1. **Fall Hazards (EARTHQUAKE)**: Unsecured furniture, heavy objects that could topple during seismic activity
2. **Fire Hazards (FIRE)**: Overloaded power strips, flammable materials near heat sources, blocked exits
3. **Projectile Risks (EARTHQUAKE/STORM)**: Glass objects, loose items that could become projectiles during shaking or high winds
4. **Structural Issues (FLOOD/EARTHQUAKE)**: Visible cracks, water damage, compromised supports
5. **Safety Assets**: First aid kits, emergency supplies, fire extinguishers, flashlights

For each hazard, provide:
- Type (FALL_HAZARD, FIRE_HAZARD, PROJECTILE_RISK, STRUCTURAL_ISSUE, OTHER)
- Item name
- Severity (LOW, MEDIUM, HIGH, CRITICAL)
- Specific recommendation to mitigate
- disasterType (EARTHQUAKE, FIRE, FLOOD, STORM, or GENERAL)
- disasterContext (1 sentence explaining why this is dangerous during that disaster type)

Return your analysis as a valid JSON object with this exact structure:
{
  "hazards": [
    {
      "type": "FALL_HAZARD",
      "item": "Tall bookshelf",
      "severity": "HIGH",
      "recommendation": "Secure to wall with anti-tip straps",
      "disasterType": "EARTHQUAKE",
      "disasterContext": "Unsecured furniture can topple during seismic activity, causing injuries"
    }
  ],
  "assets": ["First aid kit on shelf", "Flashlight visible"],
  "overallRiskLevel": "MEDIUM",
  "summary": "Brief 1-2 sentence summary of findings"
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting or additional text.`


// --- Service Implementation ---
export async function analyzeImage(base64Image: string): Promise<AnalysisResult> {
    if (!base64Image) {
        throw new Error('Image data is required')
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
    if (!apiKey) {
        throw new Error('Google AI API key not configured')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    try {
        // Remove data URL prefix if present
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '')

        const result = await model.generateContent([
            ANALYSIS_PROMPT,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageData,
                },
            },
        ])

        const response = result.response
        const text = response.text()

        // Parse JSON response
        const parsed: AnalysisResult = JSON.parse(text)

        // Validate structure
        if (!parsed.hazards || !Array.isArray(parsed.hazards)) {
            parsed.hazards = []
        }
        if (!parsed.assets || !Array.isArray(parsed.assets)) {
            parsed.assets = []
        }
        if (!parsed.overallRiskLevel) {
            parsed.overallRiskLevel = 'LOW'
        }
        if (!parsed.summary) {
            parsed.summary = 'Analysis complete.'
        }

        return parsed
    } catch (error: any) {
        console.error('Gemini Vision analysis failed:', error)

        // Handle specific error types
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse AI response. Please try again.')
        }

        // Check for quota/rate limit errors
        const errorMessage = error?.message || error?.toString() || ''
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            throw new Error('API limit reached. Please wait a moment and try again, or upgrade your plan at ai.google.dev.')
        }

        // Check for API key issues
        if (errorMessage.includes('401') || errorMessage.includes('API key')) {
            throw new Error('Invalid API key. Please check your NEXT_PUBLIC_GOOGLE_AI_API_KEY.')
        }

        // Check for network issues
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
            throw new Error('Network error. Please check your connection and try again.')
        }

        throw new Error('Analysis failed. Please try again.')
    }
}
