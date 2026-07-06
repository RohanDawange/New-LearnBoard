import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { dbVideos, dbVideoNotes } from '@/lib/db'
import type { Video, VideoNote } from '@/types'

interface VideoState {
  videos: Video[]
  currentVideo: Video | null
  videoNotes: VideoNote[]
  loading: boolean
  loadVideos: (userId: string) => Promise<void>
  setCurrentVideo: (video: Video | null) => void
  addVideo: (data: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Video>
  updateVideo: (id: string, data: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  loadVideoNotes: (videoId: string) => Promise<void>
  addVideoNote: (data: Omit<VideoNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<VideoNote>
  updateVideoNote: (id: string, data: Partial<VideoNote>) => Promise<void>
  deleteVideoNote: (id: string) => Promise<void>
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  currentVideo: null,
  videoNotes: [],
  loading: false,
  loadVideos: async (userId) => {
    set({ loading: true })
    const videos = await dbVideos.getAll(userId)
    set({ videos, loading: false })
  },
  setCurrentVideo: (video) => set({ currentVideo: video }),
  addVideo: async (data) => {
    const video: Video = {
      id: uuid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await dbVideos.put(video)
    set((s) => ({ videos: [...s.videos, video], currentVideo: video }))
    return video
  },
  updateVideo: async (id, data) => {
    const videos = get().videos.map((v) =>
      v.id === id ? { ...v, ...data, updatedAt: new Date() } : v
    )
    const updated = videos.find((v) => v.id === id)
    if (updated) await dbVideos.put(updated)
    set({ videos, currentVideo: get().currentVideo?.id === id ? updated : get().currentVideo })
  },
  deleteVideo: async (id) => {
    await dbVideos.delete(id)
    set((s) => ({
      videos: s.videos.filter((v) => v.id !== id),
      currentVideo: s.currentVideo?.id === id ? null : s.currentVideo,
    }))
  },
  loadVideoNotes: async (videoId) => {
    const videoNotes = await dbVideoNotes.getAll(videoId)
    set({ videoNotes })
  },
  addVideoNote: async (data) => {
    const note: VideoNote = {
      id: uuid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await dbVideoNotes.put(note)
    set((s) => ({ videoNotes: [...s.videoNotes, note].sort((a, b) => a.timestamp - b.timestamp) }))
    return note
  },
  updateVideoNote: async (id, data) => {
    const videoNotes = get().videoNotes.map((n) =>
      n.id === id ? { ...n, ...data, updatedAt: new Date() } : n
    )
    const updated = videoNotes.find((n) => n.id === id)
    if (updated) await dbVideoNotes.put(updated)
    set({ videoNotes })
  },
  deleteVideoNote: async (id) => {
    await dbVideoNotes.delete(id)
    set((s) => ({ videoNotes: s.videoNotes.filter((n) => n.id !== id) }))
  },
}))
