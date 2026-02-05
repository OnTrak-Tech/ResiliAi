import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DailyTask } from '@/types/tasks'

interface TaskStore {
    currentTask: DailyTask | null
    completedTaskIds: string[]
    lastGeneratedDate: string | null

    setCurrentTask: (task: DailyTask) => void
    completeTask: () => void
    clearExpiredTasks: () => void
    shouldGenerateNewTask: () => boolean
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            currentTask: null,
            completedTaskIds: [],
            lastGeneratedDate: null,

            setCurrentTask: (task) => set({
                currentTask: task,
                lastGeneratedDate: new Date().toISOString().split('T')[0],
            }),

            completeTask: () => {
                const { currentTask, completedTaskIds } = get()
                if (currentTask) {
                    set({
                        currentTask: {
                            ...currentTask,
                            completed: true,
                            completedAt: new Date(),
                        },
                        completedTaskIds: [...completedTaskIds, currentTask.id].slice(-30), // Keep last 30
                    })
                }
            },

            clearExpiredTasks: () => {
                const { currentTask } = get()
                if (currentTask && new Date(currentTask.expiresAt) < new Date()) {
                    set({ currentTask: null })
                }
            },

            shouldGenerateNewTask: () => {
                const { currentTask, lastGeneratedDate } = get()
                const today = new Date().toISOString().split('T')[0]

                // Generate new task if:
                // 1. No current task
                // 2. Current task is completed
                // 3. It's a new day
                if (!currentTask) return true
                if (currentTask.completed) return true
                if (lastGeneratedDate !== today) return true

                return false
            },
        }),
        {
            name: 'resiliai-tasks',
        }
    )
)
