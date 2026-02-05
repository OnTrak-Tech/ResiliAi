// Web Speech API Type Declarations
// These types are not included in standard TypeScript lib, but are available in modern browsers

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    grammars: SpeechGrammarList

    start(): void
    stop(): void
    abort(): void

    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
    onspeechstart: (() => void) | null
    onspeechend: (() => void) | null
    onaudiostart: (() => void) | null
    onaudioend: (() => void) | null
    onsoundstart: (() => void) | null
    onsoundend: (() => void) | null
    onnomatch: (() => void) | null
}

interface SpeechGrammarList {
    length: number
    item(index: number): SpeechGrammar
    addFromString(string: string, weight?: number): void
    addFromURI(src: string, weight?: number): void
}

interface SpeechGrammar {
    src: string
    weight: number
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor
        webkitSpeechRecognition: SpeechRecognitionConstructor
    }
}

export { }
