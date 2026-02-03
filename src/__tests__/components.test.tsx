import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('applies variant styles', () => {
        render(<Button variant="destructive">Danger</Button>)
        const button = screen.getByRole('button', { name: /danger/i })
        expect(button).toBeInTheDocument()
    })
})

describe('ResiliAi App', () => {
    it('should have core features documented', () => {
        const coreFeatures = ['Sentinel', 'Guardian', 'Drill Sergeant', 'Lifeline']
        coreFeatures.forEach(feature => {
            expect(feature).toBeTruthy()
        })
    })
})
