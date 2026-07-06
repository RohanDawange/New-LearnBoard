import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, BookOpen, Target, Clock, Calendar, Save, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'
import { useNoteStore } from '@/stores/noteStore'
import { useVideoStore } from '@/stores/videoStore'
import { dbFocusSessions } from '@/lib/db'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const { notes } = useNoteStore()
  const { videos } = useVideoStore()
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [goals, setGoals] = useState(user?.goals || '')
  const [focusCount, setFocusCount] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setGoals(user.goals || '')
      loadFocusStats()
    }
  }, [user])

  const loadFocusStats = async () => {
    if (!user) return
    const sessions = await dbFocusSessions.getAll(user.id)
    setFocusCount(sessions.length)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.auth.updateProfile({ name, bio, goals })
      setUser(updated)
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your profile and view your activity</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar || ''} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Bio</label>
                    <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Learning Goals</label>
                    <Input value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="What do you want to learn?" className="h-9" />
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <User className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{notes.length}</p>
                  <p className="text-xs text-muted-foreground">Notes Created</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-cyan-400" />
                  <p className="text-2xl font-bold">{videos.length}</p>
                  <p className="text-xs text-muted-foreground">Videos Watched</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold">{focusCount}</p>
                  <p className="text-xs text-muted-foreground">Focus Sessions</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/30">
                  <Target className="h-5 w-5 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold">{user?.goals ? 'Active' : 'Set Goal'}</p>
                  <p className="text-xs text-muted-foreground">Learning Goal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  )
}
