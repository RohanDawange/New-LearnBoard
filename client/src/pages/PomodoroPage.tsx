import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Settings, Clock, BarChart3, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { v4 as uuid } from 'uuid'
import { dbFocusSessions } from '@/lib/db'
import { useAuthStore } from '@/stores/authStore'
import { formatTime } from '@/lib/utils'

export default function PomodoroPage() {
  const { user } = useAuthStore()
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [isBreak, setIsBreak] = useState(false)
  const [focusHistory, setFocusHistory] = useState<any[]>([])
  const [customMinutes, setCustomMinutes] = useState(25)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f4B/f39/gH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f4B/f39/gH9/f3+AgH9/f3+AgH9//w==')
  }, [])

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    if (!user) return
    const sessions = await dbFocusSessions.getAll(user.id)
    setFocusHistory(sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const playSound = () => {
    audioRef.current?.play().catch(() => {})
  }

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 0) return prev - 1
        return 59
      })
      setMinutes((prev) => {
        if (seconds === 0) {
          if (prev === 0) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            playSound()
            if (!isBreak) {
              setIsBreak(true)
              setMinutes(breakMinutes)
              setSeconds(0)
              saveSession()
            } else {
              setIsBreak(false)
              setMinutes(customMinutes)
              setSeconds(0)
            }
            return 0
          }
          return prev - 1
        }
        return prev
      })
    }, 1000)
  }, [seconds, minutes, isBreak, breakMinutes, customMinutes])

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
  }

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
    setIsBreak(false)
    setMinutes(customMinutes)
    setSeconds(0)
  }

  const saveSession = async () => {
    if (!user) return
    const session = {
      id: uuid(),
      userId: user.id,
      date: new Date(),
      duration: customMinutes * 60,
      completed: true,
      createdAt: new Date(),
    }
    await dbFocusSessions.put(session)
    loadHistory()
  }

  const totalMinutes = focusHistory.reduce((acc, s) => acc + s.duration / 60, 0)
  const todayMinutes = focusHistory
    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.duration / 60, 0)

  const circumference = 2 * Math.PI * 120
  const progress = isBreak
    ? ((breakMinutes * 60 - (minutes * 60 + seconds)) / (breakMinutes * 60)) * circumference
    : ((customMinutes * 60 - (minutes * 60 + seconds)) / (customMinutes * 60)) * circumference
  const elapsed = isBreak
    ? breakMinutes * 60 - (minutes * 60 + seconds)
    : customMinutes * 60 - (minutes * 60 + seconds)

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Focus Mode</h1>
        <p className="text-muted-foreground text-sm">Stay focused with the Pomodoro technique</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass">
            <CardContent className="flex flex-col items-center py-12">
              <div className="relative mb-8">
                <svg width="280" height="280" className="transform -rotate-90">
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-mono font-bold">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">
                    {isBreak ? 'Break Time' : 'Focus Time'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                {!isRunning ? (
                  <Button size="lg" className="h-12 px-8" onClick={startTimer}>
                    <Play className="h-5 w-5 mr-2" /> Start
                  </Button>
                ) : (
                  <Button size="lg" className="h-12 px-8" variant="secondary" onClick={pauseTimer}>
                    <Pause className="h-5 w-5 mr-2" /> Pause
                  </Button>
                )}
                <Button variant="outline" size="lg" className="h-12 px-4" onClick={resetTimer}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-4" onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="h-5 w-5" />
                </Button>
              </div>

              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="w-full max-w-sm space-y-3 glass rounded-lg p-4"
                >
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Focus Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={customMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 25
                        setCustomMinutes(val)
                        if (!isRunning) setMinutes(val)
                      }}
                      className="h-8"
                      min={1}
                      max={120}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Break Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 5)}
                      className="h-8"
                      min={1}
                      max={30}
                    />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Focus Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{Math.floor(totalMinutes)}</p>
                <p className="text-xs text-muted-foreground">Total Focus Minutes</p>
              </div>
              <Separator />
              <div>
                <p className="text-2xl font-bold">{focusHistory.length}</p>
                <p className="text-xs text-muted-foreground">Sessions Completed</p>
              </div>
              <Separator />
              <div>
                <p className="text-2xl font-bold">{Math.floor(todayMinutes)}</p>
                <p className="text-xs text-muted-foreground">Today's Minutes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {focusHistory.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                    <span className="font-mono">
                      {Math.floor(session.duration / 60)} min
                    </span>
                  </div>
                ))}
                {focusHistory.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No sessions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
