export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  goals?: string
  createdAt: Date
  updatedAt: Date
}

export interface Notebook {
  id: string
  userId: string
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  notebookId: string
  userId: string
  title: string
  content: string
  tags: string[]
  pinned: boolean
  favorite: boolean
  createdAt: Date
  updatedAt: Date
  versions?: NoteVersion[]
}

export interface NoteVersion {
  id: string
  noteId: string
  content: string
  title: string
  createdAt: Date
}

export interface Video {
  id: string
  userId: string
  notebookId?: string
  title: string
  url: string
  platform: 'youtube' | 'local'
  duration: number
  lastPosition: number
  createdAt: Date
  updatedAt: Date
}

export interface VideoNote {
  id: string
  videoId: string
  notebookId?: string
  timestamp: number
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface StudySession {
  id: string
  userId: string
  title: string
  date: Date
  startTime: string
  endTime: string
  type: 'study' | 'exam' | 'deadline' | 'reminder'
  description?: string
  notebookId?: string
  completed: boolean
  createdAt: Date
}

export interface FocusSession {
  id: string
  userId: string
  date: Date
  duration: number
  completed: boolean
  createdAt: Date
}

export interface Resource {
  id: string
  userId: string
  name: string
  type: string
  data: string
  size: number
  folder?: string
  notebookId?: string
  createdAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  theme: 'dark-orange' | 'hacker-green' | 'cyber-blue' | 'purple-neon' | 'light'
  fontSize: number
  sidebarWidth: number
  editorWidth: number
  accentColor: string
}
