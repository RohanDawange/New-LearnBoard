import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { dbNotebooks } from '@/lib/db'
import type { Notebook } from '@/types'

interface NotebookState {
  notebooks: Notebook[]
  loading: boolean
  loadNotebooks: (userId: string) => Promise<void>
  createNotebook: (userId: string, name: string, parentId?: string) => Promise<Notebook>
  renameNotebook: (id: string, name: string) => Promise<void>
  deleteNotebook: (id: string) => Promise<void>
  moveNotebook: (id: string, parentId: string | null, order: number) => Promise<void>
}

export const useNotebookStore = create<NotebookState>((set, get) => ({
  notebooks: [],
  loading: false,
  loadNotebooks: async (userId) => {
    set({ loading: true })
    const notebooks = await dbNotebooks.getAll(userId)
    set({ notebooks, loading: false })
  },
  createNotebook: async (userId, name, parentId) => {
    const notebook: Notebook = {
      id: uuid(),
      userId,
      name,
      icon: '📁',
      color: '#ff8c00',
      parentId: parentId || null,
      order: get().notebooks.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await dbNotebooks.put(notebook)
    set((s) => ({ notebooks: [...s.notebooks, notebook] }))
    return notebook
  },
  renameNotebook: async (id, name) => {
    const notebooks = get().notebooks.map((n) =>
      n.id === id ? { ...n, name, updatedAt: new Date() } : n
    )
    const updated = notebooks.find((n) => n.id === id)
    if (updated) await dbNotebooks.put(updated)
    set({ notebooks })
  },
  deleteNotebook: async (id) => {
    await dbNotebooks.delete(id)
    set((s) => ({ notebooks: s.notebooks.filter((n) => n.id !== id) }))
  },
  moveNotebook: async (id, parentId, order) => {
    const notebooks = get().notebooks.map((n) =>
      n.id === id ? { ...n, parentId, order, updatedAt: new Date() } : n
    )
    const updated = notebooks.find((n) => n.id === id)
    if (updated) await dbNotebooks.put(updated)
    set({ notebooks })
  },
}))
