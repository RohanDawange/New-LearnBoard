import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus, Folder, FileText, Star, Clock, Search, ChevronDown, ChevronRight,
  MoreHorizontal, Trash2, Edit3, Pin, BookMarked
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotebookStore } from '@/stores/notebookStore'
import { useNoteStore } from '@/stores/noteStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export default function LeftSidebar() {
  const navigate = useNavigate()
  const { noteId } = useParams()
  const { user } = useAuthStore()
  const { notebooks, loadNotebooks, createNotebook, renameNotebook, deleteNotebook } = useNotebookStore()
  const { notes, currentNote, setCurrentNote, createNote, loadNotes } = useNoteStore()
  const { searchQuery, setSearchQuery } = useUIStore()
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (user) {
      loadNotebooks(user.id)
      loadNotes(user.id)
    }
  }, [user, loadNotebooks, loadNotes])

  const rootNotebooks = notebooks.filter((n) => !n.parentId)
  const childNotebooks = (parentId: string) => notebooks.filter((n) => n.parentId === parentId)
  const notesInNotebook = (notebookId: string) => notes.filter((n) => n.notebookId === notebookId)

  const favoriteNotes = notes.filter((n) => n.favorite)
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
  const pinnedNotes = notes.filter((n) => n.pinned)

  const toggleExpand = (id: string) => {
    setExpandedNotebooks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreateNotebook = async () => {
    if (!user) return
    const nb = await createNotebook(user.id, 'New Notebook')
    setExpandedNotebooks((prev) => new Set(prev).add(nb.id))
    setEditingId(nb.id)
    setEditName(nb.name)
  }

  const handleCreateNote = async (notebookId: string) => {
    if (!user) return
    const note = await createNote(user.id, notebookId)
    navigate(`/notes/${note.id}`)
  }

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      await renameNotebook(id, editName.trim())
    }
    setEditingId(null)
  }

  const handleSelectNote = (note: any) => {
    setCurrentNote(note)
    navigate(`/notes/${note.id}`)
  }

  const toggleFavorite = async (note: any) => {
    useNoteStore.getState().updateNote(note.id, { favorite: !note.favorite })
  }

  const togglePin = async (note: any) => {
    useNoteStore.getState().updateNote(note.id, { pinned: !note.pinned })
  }

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const renderNotebookTree = (notebooksList: typeof notebooks, depth = 0) => {
    return notebooksList.map((notebook) => {
      const children = childNotebooks(notebook.id)
      const nNotes = notesInNotebook(notebook.id)
      const isExpanded = expandedNotebooks.has(notebook.id)
      const isEditing = editingId === notebook.id

      return (
        <div key={notebook.id}>
          <div
            className={cn(
              'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent/50 transition-colors',
              depth > 0 && 'ml-4'
            )}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
          >
            <button
              onClick={() => toggleExpand(notebook.id)}
              className="h-4 w-4 flex items-center justify-center text-muted-foreground"
            >
              {children.length > 0 || nNotes.length > 0 ? (
                isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
              ) : (
                <span className="w-3" />
              )}
            </button>

            <Folder
              className="h-4 w-4 text-primary flex-shrink-0"
              style={{ color: notebook.color || undefined }}
            />

            {isEditing ? (
              <input
                className="flex-1 bg-background border border-primary rounded px-1 py-0.5 text-xs outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(notebook.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(notebook.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                autoFocus
              />
            ) : (
              <span
                className="flex-1 truncate text-sidebar-foreground"
                onDoubleClick={() => {
                  setEditingId(notebook.id)
                  setEditName(notebook.name)
                }}
              >
                {notebook.name}
              </span>
            )}

            <div className="hidden group-hover:flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCreateNote(notebook.id)
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingId(notebook.id)
                      setEditName(notebook.name)
                    }}
                  >
                    <Edit3 className="h-3 w-3 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteNotebook(notebook.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isExpanded && (
            <>
              {children.length > 0 && renderNotebookTree(children, depth + 1)}
              {nNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent/50 transition-colors',
                    note.id === noteId && 'bg-accent text-accent-foreground',
                  )}
                  style={{ paddingLeft: `${24 + (depth + 1) * 16}px` }}
                  onClick={() => handleSelectNote(note)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate text-sidebar-foreground">
                    {note.title || 'Untitled'}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(note)
                      }}
                    >
                      <Star
                        className={cn('h-3 w-3', note.favorite && 'text-yellow-400 fill-yellow-400')}
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )
    })
  }

  if (collapsed) {
    return (
      <div className="h-full sidebar-panel flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCreateNotebook}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full sidebar-panel flex flex-col">
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-background/50 border-sidebar-border"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {searchQuery ? (
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase text-muted-foreground font-semibold px-2 py-1">
                Search Results ({filteredNotes.length})
              </p>
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectNote(note)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No notes found
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  Quick Access
                </span>
              </div>

              {pinnedNotes.length > 0 && (
                <div className="space-y-0.5 mb-2">
                  {pinnedNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent/50 transition-colors"
                      onClick={() => handleSelectNote(note)}
                    >
                      <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="flex-1 truncate text-sidebar-foreground text-xs">
                        {note.title || 'Untitled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {favoriteNotes.length > 0 && (
                <div className="space-y-0.5 mb-2">
                  <p className="text-[10px] uppercase text-muted-foreground font-semibold px-2 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3" /> Favorites
                  </p>
                  {favoriteNotes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent/50 transition-colors"
                      onClick={() => handleSelectNote(note)}
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate text-sidebar-foreground text-xs">
                        {note.title || 'Untitled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-0.5 mb-2">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold px-2 py-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Recent
                </p>
                {recentNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm hover:bg-accent/50 transition-colors"
                    onClick={() => handleSelectNote(note)}
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 truncate text-sidebar-foreground text-xs">
                      {note.title || 'Untitled'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-2 py-1 mt-4">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  Notebooks
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCreateNotebook}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {renderNotebookTree(rootNotebooks)}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
