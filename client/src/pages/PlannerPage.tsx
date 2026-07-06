import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths
} from 'date-fns'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon,
  BookOpen, GraduationCap, AlertTriangle, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { v4 as uuid } from 'uuid'
import { dbSessions } from '@/lib/db'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import type { StudySession } from '@/types'

const typeIcons: Record<string, any> = {
  study: BookOpen,
  exam: GraduationCap,
  deadline: AlertTriangle,
  reminder: Bell,
}

const typeColors: Record<string, string> = {
  study: 'text-primary',
  exam: 'text-destructive',
  deadline: 'text-amber-400',
  reminder: 'text-cyan-400',
}

export default function PlannerPage() {
  const { user } = useAuthStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<StudySession[]>([])
  const [newEvent, setNewEvent] = useState<{ title: string; type: 'study' | 'exam' | 'deadline' | 'reminder' }>({ title: '', type: 'study' })
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    if (!user) return
    const all = await dbSessions.getAll(user.id)
    setEvents(all)
  }

  const addEvent = async () => {
    if (!newEvent.title.trim() || !user) return
    const session: StudySession = {
      id: uuid(),
      userId: user.id,
      title: newEvent.title,
      date: selectedDate,
      startTime: '09:00',
      endTime: '10:00',
      type: newEvent.type,
      completed: false,
      createdAt: new Date(),
    }
    await dbSessions.put(session)
    setEvents((prev) => [...prev, session])
    setNewEvent({ title: '', type: 'study' })
  }

  const deleteEvent = async (id: string) => {
    await dbSessions.delete(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const dayEvents = events.filter((e) => isSameDay(new Date(e.date), selectedDate))
  const monthEvents = (day: Date) => events.filter((e) => isSameDay(new Date(e.date), day))

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Study Planner</h1>
          <p className="text-muted-foreground text-sm">Plan your study sessions and track deadlines</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const dayEvts = monthEvents(day)
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'h-14 rounded-lg text-sm relative hover:bg-accent/50 transition-colors',
                        !isSameMonth(day, currentMonth) && 'text-muted-foreground/30',
                        isSameDay(day, selectedDate) && 'bg-accent ring-1 ring-primary',
                        isSameDay(day, new Date()) && 'font-bold text-primary'
                      )}
                    >
                      <span className="absolute top-1 left-1.5 text-xs">{format(day, 'd')}</span>
                      {dayEvts.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {dayEvts.slice(0, 3).map((e, i) => (
                            <div
                              key={e.id}
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                typeColors[e.type] || 'bg-primary'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="New study session..."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                    className="flex-1 h-9 text-sm"
                  />
                  <div className="flex gap-1">
                    {(['study', 'exam', 'deadline', 'reminder'] as const).map((type) => {
                      const Icon = typeIcons[type]
                      return (
                        <Button
                          key={type}
                          variant={newEvent.type === type ? 'default' : 'ghost'}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setNewEvent({ ...newEvent, type })}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      )
                    })}
                  </div>
                  <Button size="sm" className="h-9" onClick={addEvent}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  {dayEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No events for this day
                    </p>
                  )}
                  {dayEvents.map((event) => {
                    const Icon = typeIcons[event.type] || CalendarIcon
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30 group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn('h-4 w-4', typeColors[event.type])} />
                          <div>
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events
                    .filter((e) => new Date(e.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((event) => {
                      const Icon = typeIcons[event.type] || CalendarIcon
                      return (
                        <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30">
                          <Icon className={cn('h-4 w-4', typeColors[event.type])} />
                          <div className="flex-1">
                            <p className="text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className={cn('text-xs capitalize', typeColors[event.type])}>
                            {event.type}
                          </span>
                        </div>
                      )
                    })}
                  {events.filter((e) => new Date(e.date) >= new Date()).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ScrollArea>
  )
}
