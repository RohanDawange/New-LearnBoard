import { openDB, type IDBPDatabase } from 'idb'
import type {
  Notebook,
  Note,
  Video,
  VideoNote,
  StudySession,
  FocusSession,
  Resource,
  UserSettings,
} from '@/types'

const DB_NAME = 'learnboard'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notebooks')) {
          const notebooks = db.createObjectStore('notebooks', { keyPath: 'id' })
          notebooks.createIndex('userId', 'userId')
          notebooks.createIndex('order', 'order')
        }
        if (!db.objectStoreNames.contains('notes')) {
          const notes = db.createObjectStore('notes', { keyPath: 'id' })
          notes.createIndex('notebookId', 'notebookId')
          notes.createIndex('userId', 'userId')
          notes.createIndex('tags', 'tags', { multiEntry: true })
          notes.createIndex('updatedAt', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('videos')) {
          const videos = db.createObjectStore('videos', { keyPath: 'id' })
          videos.createIndex('userId', 'userId')
          videos.createIndex('title', 'title')
        }
        if (!db.objectStoreNames.contains('videoNotes')) {
          const videoNotes = db.createObjectStore('videoNotes', { keyPath: 'id' })
          videoNotes.createIndex('videoId', 'videoId')
          videoNotes.createIndex('notebookId', 'notebookId')
          videoNotes.createIndex('timestamp', 'timestamp')
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
          sessions.createIndex('userId', 'userId')
          sessions.createIndex('date', 'date')
        }
        if (!db.objectStoreNames.contains('focusSessions')) {
          const focusSessions = db.createObjectStore('focusSessions', { keyPath: 'id' })
          focusSessions.createIndex('userId', 'userId')
          focusSessions.createIndex('date', 'date')
        }
        if (!db.objectStoreNames.contains('resources')) {
          const resources = db.createObjectStore('resources', { keyPath: 'id' })
          resources.createIndex('userId', 'userId')
          resources.createIndex('type', 'type')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

// Generic CRUD helpers
async function getAll<T>(store: string): Promise<T[]> {
  const db = await getDB()
  return db.getAll(store)
}

async function getAllByIndex<T>(store: string, index: string, value: any): Promise<T[]> {
  const db = await getDB()
  return db.getAllFromIndex(store, index, value)
}

async function get<T>(store: string, id: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(store, id)
}

async function put<T>(store: string, value: T): Promise<void> {
  const db = await getDB()
  await db.put(store, value as any)
}

async function del(store: string, id: string): Promise<void> {
  const db = await getDB()
  await db.delete(store, id)
}

async function clear(store: string): Promise<void> {
  const db = await getDB()
  await db.clear(store)
}

// Notebook operations
export const dbNotebooks = {
  getAll: (userId: string) => getAllByIndex<Notebook>('notebooks', 'userId', userId),
  get: (id: string) => get<Notebook>('notebooks', id),
  put: (notebook: Notebook) => put('notebooks', notebook),
  delete: (id: string) => del('notebooks', id),
  clear: () => clear('notebooks'),
}

// Note operations
export const dbNotes = {
  getAll: (userId: string) => getAllByIndex<Note>('notes', 'userId', userId),
  getByNotebook: (notebookId: string) => getAllByIndex<Note>('notes', 'notebookId', notebookId),
  get: (id: string) => get<Note>('notes', id),
  put: (note: Note) => put('notes', note),
  delete: (id: string) => del('notes', id),
  clear: () => clear('notes'),
}

// Video operations
export const dbVideos = {
  getAll: (userId: string) => getAllByIndex<Video>('videos', 'userId', userId),
  get: (id: string) => get<Video>('videos', id),
  put: (video: Video) => put('videos', video),
  delete: (id: string) => del('videos', id),
  clear: () => clear('videos'),
}

// VideoNote operations
export const dbVideoNotes = {
  getAll: (videoId: string) => getAllByIndex<VideoNote>('videoNotes', 'videoId', videoId),
  get: (id: string) => get<VideoNote>('videoNotes', id),
  put: (note: VideoNote) => put('videoNotes', note),
  delete: (id: string) => del('videoNotes', id),
  clear: () => clear('videoNotes'),
}

// Session operations
export const dbSessions = {
  getAll: (userId: string) => getAllByIndex<StudySession>('sessions', 'userId', userId),
  getByDate: (date: string) => getAllByIndex<StudySession>('sessions', 'date', date),
  put: (session: StudySession) => put('sessions', session),
  delete: (id: string) => del('sessions', id),
  clear: () => clear('sessions'),
}

// FocusSession operations
export const dbFocusSessions = {
  getAll: (userId: string) => getAllByIndex<FocusSession>('focusSessions', 'userId', userId),
  put: (session: FocusSession) => put('focusSessions', session),
  delete: (id: string) => del('focusSessions', id),
  clear: () => clear('focusSessions'),
}

// Resource operations
export const dbResources = {
  getAll: (userId: string) => getAllByIndex<Resource>('resources', 'userId', userId),
  get: (id: string) => get<Resource>('resources', id),
  put: (resource: Resource) => put('resources', resource),
  delete: (id: string) => del('resources', id),
  clear: () => clear('resources'),
}

// Settings operations
export const dbSettings = {
  get: (id: string) => get<UserSettings>('settings', id),
  put: (settings: UserSettings) => put('settings', settings),
}

export { getAll, getAllByIndex, get, put, del, clear }
export default getDB
