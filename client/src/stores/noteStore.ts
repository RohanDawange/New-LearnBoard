import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { dbNotes } from '@/lib/db'
import type { Note, NoteVersion } from '@/types'

interface NoteState {
  notes: Note[]
  currentNote: Note | null
  loading: boolean
  loadNotes: (userId: string) => Promise<void>
  setCurrentNote: (note: Note | null) => void
  createNote: (userId: string, notebookId: string, title?: string) => Promise<Note>
  updateNote: (id: string, data: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  saveVersion: (noteId: string) => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  loadNotes: async (userId) => {
    set({ loading: true })
    const notes = await dbNotes.getAll(userId)
    set({ notes, loading: false })
  },
  setCurrentNote: (note) => set({ currentNote: note }),
  createNote: async (userId, notebookId, title) => {
    const note: Note = {
      id: uuid(),
      notebookId,
      userId,
      title: title || 'Untitled',
      content: '',
      tags: [],
      pinned: false,
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [],
    }
    await dbNotes.put(note)
    set((s) => ({ notes: [...s.notes, note], currentNote: note }))
    return note
  },
  updateNote: async (id, data) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, ...data, updatedAt: new Date() } : n
    )
    const updated = notes.find((n) => n.id === id)
    if (updated) {
      await dbNotes.put(updated)
      set({ notes, currentNote: get().currentNote?.id === id ? updated : get().currentNote })
    }
  },
  deleteNote: async (id) => {
    await dbNotes.delete(id)
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      currentNote: s.currentNote?.id === id ? null : s.currentNote,
    }))
  },
  saveVersion: async (noteId) => {
    const note = get().notes.find((n) => n.id === noteId)
    if (!note) return
    const version: NoteVersion = {
      id: uuid(),
      noteId: note.id,
      content: note.content,
      title: note.title,
      createdAt: new Date(),
    }
    const versions = [...(note.versions || []), version].slice(-10)
    await get().updateNote(noteId, { versions })
  },
}))
