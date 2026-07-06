import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Palette, Type, Layout, Monitor, Sun, Moon,
  Github, LogOut, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const themes = [
  { id: 'theme-dark-orange', label: 'Dark Orange', color: '#ff8c00', icon: Moon },
  { id: 'theme-hacker-green', label: 'Hacker Green', color: '#00ff41', icon: Moon },
  { id: 'theme-cyber-blue', label: 'Cyber Blue', color: '#00b4ff', icon: Moon },
  { id: 'theme-purple-neon', label: 'Purple Neon', color: '#b400ff', icon: Moon },
  { id: 'theme-light', label: 'Light Mode', color: '#f5f5f0', icon: Sun },
] as const

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme, fontSize, setFontSize, sidebarWidth, setSidebarWidth, editorWidth, setEditorWidth } = useThemeStore()
  const { user, logout } = useAuthStore()
  const [localFontSize, setLocalFontSize] = useState(fontSize)
  const [localSidebarWidth, setLocalSidebarWidth] = useState(sidebarWidth)

  const handleSave = () => {
    setFontSize(localFontSize)
    setSidebarWidth(localSidebarWidth)
    toast.success('Settings saved')
  }

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Customize your workspace</p>
        </motion.div>

        <Tabs defaultValue="appearance">
          <TabsList>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Type className="h-4 w-4 mr-2" /> Editor
            </TabsTrigger>
            <TabsTrigger value="account">
              <Monitor className="h-4 w-4 mr-2" /> Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {themes.map((t) => {
                      const Icon = t.icon
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            'glass rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:scale-105',
                            theme === t.id && 'ring-2 ring-primary'
                          )}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: t.color }}
                          >
                            <Icon className="h-5 w-5 text-black" />
                          </div>
                          <span className="text-xs">{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Editor Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                      Font Size: {localFontSize}px
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={localFontSize}
                      onChange={(e) => setLocalFontSize(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                      Sidebar Width: {localSidebarWidth}px
                    </label>
                    <input
                      type="range"
                      min={200}
                      max={400}
                      value={localSidebarWidth}
                      onChange={(e) => setLocalSidebarWidth(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" /> Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4 mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                      Edit Profile
                    </Button>
                  </div>
                  <Separator />
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
