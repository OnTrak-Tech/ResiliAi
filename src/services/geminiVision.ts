import { GoogleGenerativeAI } from '@google/generative-ai'

// --- Type Definitions ---
export interface Hazard {
    type: 'FALL_HAZARD' | 'FIRE_HAZARD' | 'PROJECTILE_RISK' | 'STRUCTURAL_ISSUE' | 'OTHER'
    item: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    recommendation: string
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

Analyze this image and identify:
1. **Fall Hazards**: Unsecured furniture, heavy objects that could topple (earthquake risk)
2. **Fire Hazards**: Overloaded power strips, flammable materials near heat sources
3. **Projectile Risks**: Glass objects, loose items that could become projectiles
4. **Structural Issues**: Visible cracks, water damage, compromised supports
5. **Safety Assets**: First aid kits, emergency supplies, fire extinguishers, flashlights

For each hazard, provide:
- Type (FALL_HAZARD, FIRE_HAZARD, PROJECTILE_RISK, STRUCTURAL_ISSUE, OTHER)
- Item name
- Severity (LOW, MEDIUM, HIGH, CRITICAL)
- Specific recommendation to mitigate

Return your analysis as a valid JSON object with this exact structure:
{
  "hazards": [
    {
      "type": "FALL_HAZARD",
      "item": "Tall bookshelf",
      "severity": "HIGH",
      "recommendation": "Secure to wall with anti-tip straps"
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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
    } catch (error) {
        console.error('Gemini Vision analysis failed:', error)

        // Return a safe fallback
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse AI response. Please try again.')
        }

        throw new Error('Analysis failed. Please check your connection and try again.')
    }
}
