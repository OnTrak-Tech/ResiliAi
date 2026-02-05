import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DailyTask, TASK_TEMPLATES } from '@/types/tasks'
import { UserProfile } from './userStore'

interface TaskStore {
    tasks: DailyTask[]
    currentTask: DailyTask | null
    completedTaskIds: string[]
    lastGeneratedDate: string | null

    // Actions
    generateDailyTasks: (profile: UserProfile, weather: any) => void
    completeTask: (taskId: string) => void
    clearExpiredTasks: () => void
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            tasks: [],
            currentTask: null,
            completedTaskIds: [],
            lastGeneratedDate: null,

            generateDailyTasks: (profile, weather) => {
                const { lastGeneratedDate, completedTaskIds } = get()
                const today = new Date().toISOString().split('T')[0]

                // Don't generate if already done today
                if (lastGeneratedDate === today) return

                // Simple algorithm to pick a suitable task
                // 1. Filter templates based on profile (housing, pets, kids, etc.)
                let suitableTemplates = TASK_TEMPLATES.filter(t => {
                    // Housing check
                    if (t.applicableHousing && profile.housingType && !t.applicableHousing.includes(profile.housingType)) return false
                    // Vulnerability checks
                    if (t.requiresPets && !profile.hasPets) return false
                    if (t.requiresKids && !profile.hasKids) return false
                    if (t.requiresElderly && !profile.hasElderly) return false
                    // Don't repeat completed tasks too soon (simple check)
                    if (completedTaskIds.includes(t.id)) return false

                    return true
                })

                // 2. Prioritize weather triggers if bad weather
                // (Simplified mock logic here)

                // 3. Fallback to random if no weather trigger
                if (suitableTemplates.length === 0) {
                    // Reset completed if we ran out? or just pick generic
                    suitableTemplates = TASK_TEMPLATES.filter(t => t.triggers.some(tr => tr.type === 'random'))
                }

                if (suitableTemplates.length > 0) {
                    const randomTemplate = suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)]

                    const newTask: DailyTask = {
                        id: crypto.randomUUID(), // Unique instance ID
                        title: randomTemplate.title,
                        description: randomTemplate.description,
                        category: randomTemplate.category,
                        priority: randomTemplate.priority,
                        estimatedMinutes: randomTemplate.estimatedMinutes,
                        completed: false,
                        createdAt: new Date(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
                        triggers: randomTemplate.triggers
                    }

                    set({
                        tasks: [newTask],
                        currentTask: newTask,
                        lastGeneratedDate: today
                    })
                }
            },

            completeTask: (taskId) => {
                const { tasks, completedTaskIds } = get()
                const taskIndex = tasks.findIndex(t => t.id === taskId)

                if (taskIndex >= 0) {
                    const updatedTasks = [...tasks]
                    updatedTasks[taskIndex] = {
                        ...updatedTasks[taskIndex],
                        completed: true,
                        completedAt: new Date()
                    }

                    // Also find template ID if possible, but here we just track instance or template
                    // ideally we track template ID to avoid repetition. 
                    // For simplicity, assuming mapped IDs for now or ignoring strict repetition logic.

                    set({
                        tasks: updatedTasks,
                        currentTask: updatedTasks[taskIndex], // Update current ref
                        completedTaskIds: [...completedTaskIds, taskId]
                    })
                }
            },

            clearExpiredTasks: () => {
                // Logic to clear old tasks
                const now = new Date()
                set(state => ({
                    tasks: state.tasks.filter(t => new Date(t.expiresAt) > now)
                }))
            }
        }),
        {
            name: 'resiliai-tasks',
        }
    )
)
