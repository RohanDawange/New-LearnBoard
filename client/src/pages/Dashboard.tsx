import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Video, Clock, FolderOpen, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNoteStore } from '@/stores/noteStore'
import { useVideoStore } from '@/stores/videoStore'
import { useAuthStore } from '@/stores/authStore'
import { dbFocusSessions } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#ff8c00', '#00b4ff', '#00ff41', '#b400ff', '#ef4444']

export default function Dashboard() {
  const { user } = useAuthStore()
  const { notes, loadNotes } = useNoteStore()
  const { videos, loadVideos } = useVideoStore()
  const [focusData, setFocusData] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadNotes(user.id)
      loadVideos(user.id)
      loadFocusData(user.id)
    }
  }, [user, loadNotes, loadVideos])

  const loadFocusData = async (userId: string) => {
    const sessions = await dbFocusSessions.getAll(userId)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayTotals = days.map((day) => ({ name: day, hours: 0 }))

    sessions.forEach((s) => {
      const d = new Date(s.date)
      const dayName = days[d.getDay()]
      const found = dayTotals.find((dt) => dt.name === dayName)
      if (found) found.hours += Math.round((s.duration / 3600) * 10) / 10
    })
    setFocusData(dayTotals)
  }

  const totalStudyHours = useMemo(
    () => focusData.reduce((acc, d) => acc + d.hours, 0),
    [focusData]
  )

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m) => ({
      name: m,
      notes: Math.floor(Math.random() * 5) + 1,
      videos: Math.floor(Math.random() * 3),
    }))
  }, [])

  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {}
    notes.forEach((n) => {
      const key = n.tags?.[0] || 'General'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [notes])

  const stats = [
    { label: 'Total Notes', value: notes.length, icon: FileText, color: 'text-primary' },
    { label: 'Videos Watched', value: videos.length, icon: Video, color: 'text-cyan-400' },
    { label: 'Study Hours', value: totalStudyHours.toFixed(1), icon: Clock, color: 'text-green-400' },
    { label: 'Active Notebooks', value: new Set(notes.map((n) => n.notebookId)).size, icon: FolderOpen, color: 'text-purple-400' },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name || 'Learner'}</h1>
          <p className="text-muted-foreground text-sm">{formatDate(new Date())}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weekly Study Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={focusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Subject Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subjectData.length > 0 ? subjectData : [{ name: 'No data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjectData.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Monthly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Line type="monotone" dataKey="notes" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="videos" stroke="#00b4ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  )
}
