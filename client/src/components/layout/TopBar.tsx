import { useNavigate } from 'react-router-dom'
import { Menu, Search, User, Settings, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

export default function TopBar() {
  const navigate = useNavigate()
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore()
  const { user } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const isDark = theme !== 'theme-light'

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-xl flex-shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">LB</span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">LearnBoard</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-muted-foreground hidden md:flex"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] rounded border bg-muted text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            setTheme(isDark ? 'theme-light' : 'theme-dark-orange')
          }
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Avatar
          className="h-8 w-8 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <AvatarImage src={user?.avatar || ''} />
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
