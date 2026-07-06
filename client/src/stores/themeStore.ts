import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'theme-dark-orange' | 'theme-hacker-green' | 'theme-cyber-blue' | 'theme-purple-neon' | 'theme-light'

interface ThemeState {
  theme: Theme
  fontSize: number
  sidebarWidth: number
  editorWidth: number
  setTheme: (theme: Theme) => void
  setFontSize: (size: number) => void
  setSidebarWidth: (width: number) => void
  setEditorWidth: (width: number) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'theme-dark-orange',
      fontSize: 14,
      sidebarWidth: 260,
      editorWidth: 100,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setEditorWidth: (editorWidth) => set({ editorWidth }),
    }),
    { name: 'lb-theme' }
  )
)
