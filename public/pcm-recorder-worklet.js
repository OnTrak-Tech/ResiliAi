// Audio Worklet Processor for raw PCM capture at 16kHz
// This runs in the AudioWorklet global scope (separate thread)

class PCMRecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super()
        this.bufferSize = 4096
        this.buffer = new Float32Array(this.bufferSize)
        this.bufferIndex = 0
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]

        // If no input, return
        if (!input || !input[0]) {
            return true
        }

        const inputChannel = input[0] // Mono channel

        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i]

            // When buffer is full, send to main thread
            if (this.bufferIndex >= this.bufferSize) {
                // Convert Float32 [-1,1] to Int16 [-32768, 32767]
                const int16Buffer = new Int16Array(this.bufferSize)
                for (let j = 0; j < this.bufferSize; j++) {
                    const s = Math.max(-1, Math.min(1, this.buffer[j]))
                    int16Buffer[j] = s < 0 ? s * 0x8000 : s * 0x7FFF
                }

                // Send PCM data to main thread
                this.port.postMessage(int16Buffer.buffer)

                // Reset buffer
                this.bufferIndex = 0
            }
        }

        return true // Keep processor alive
    }
}

registerProcessor('pcm-recorder-processor', PCMRecorderProcessor)
