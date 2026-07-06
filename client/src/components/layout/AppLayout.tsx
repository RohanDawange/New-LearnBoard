import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useUIStore } from '@/stores/uiStore'
import TopBar from './TopBar'
import LeftSidebar from './LeftSidebar'
import StatusBar from './StatusBar'
import CommandPalette from './CommandPalette'

export default function AppLayout() {
  const { loadProfile } = useAuthStore()
  const { fontSize, sidebarWidth } = useThemeStore()
  const { sidebarOpen } = useUIStore()

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ fontSize: `${fontSize}px` }}
    >
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            width: sidebarOpen ? `${sidebarWidth}px` : '0px',
            minWidth: sidebarOpen ? `${sidebarWidth}px` : '0px',
          }}
        >
          <LeftSidebar />
        </div>
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
      <StatusBar />
      <CommandPalette />
    </div>
  )
}
