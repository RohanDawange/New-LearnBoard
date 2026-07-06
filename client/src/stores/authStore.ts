import { create } from 'zustand'
import { api } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  goals?: string
  createdAt: Date
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    const { token, user } = await api.auth.login({ email, password })
    localStorage.setItem('lb-token', token)
    set({ user })
  },
  register: async (name, email, password) => {
    const { token, user } = await api.auth.register({ name, email, password })
    localStorage.setItem('lb-token', token)
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('lb-token')
    set({ user: null })
  },
  loadProfile: async () => {
    const token = localStorage.getItem('lb-token')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const user = await api.auth.profile()
      set({ user, isLoading: false })
    } catch {
      localStorage.removeItem('lb-token')
      set({ isLoading: false })
    }
  },
}))
