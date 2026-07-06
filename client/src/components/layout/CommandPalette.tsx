import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Video, Folder, BookOpen, Settings, User, BarChart3 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useNoteStore } from '@/stores/noteStore'
import { useNotebookStore } from '@/stores/notebookStore'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { id: 'notes', label: 'New Note', icon: FileText, path: '/notes' },
  { id: 'video', label: 'Video Workspace', icon: Video, path: '/video' },
  { id: 'planner', label: 'Study Planner', icon: BookOpen, path: '/planner' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
]

export default function CommandPalette() {
  const navigate = useNavigate()
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { notes } = useNoteStore()
  const { notebooks } = useNotebookStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredNav = navItems.filter(
    (item) => item.label.toLowerCase().includes(query.toLowerCase())
  )
  const filteredNotes = notes.filter(
    (n) => n.title.toLowerCase().includes(query.toLowerCase())
  )
  const filteredNotebooks = notebooks.filter(
    (n) => n.name.toLowerCase().includes(query.toLowerCase())
  )

  const allResults = [
    ...filteredNav.map((item) => ({ ...item, type: 'nav' as const })),
    ...filteredNotebooks.map((n) => ({
      id: n.id,
      label: n.name,
      icon: Folder,
      path: `/notes?notebook=${n.id}`,
      type: 'notebook' as const,
    })),
    ...filteredNotes.map((n) => ({
      id: n.id,
      label: n.title,
      icon: FileText,
      path: `/notes/${n.id}`,
      type: 'note' as const,
    })),
  ]

  const execute = useCallback(
    (index: number) => {
      if (index >= 0 && index < allResults.length) {
        navigate(allResults[index].path)
        setCommandPaletteOpen(false)
        setQuery('')
      }
    },
    [allResults, navigate, setCommandPaletteOpen]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelectedIndex(0)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      execute(selectedIndex)
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false)
      setQuery('')
    }
  }

  if (!commandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => {
        setCommandPaletteOpen(false)
        setQuery('')
      }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg glass-strong rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes, notebooks, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] rounded border bg-muted text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {allResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No results found
            </p>
          )}
          {allResults.map((item, index) => (
            <button
              key={`${item.type}-${item.id}`}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => execute(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
              <span className="ml-auto text-[10px] text-muted-foreground uppercase">
                {item.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
