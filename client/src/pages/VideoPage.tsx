import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Youtube, Upload, Clock, Plus, Trash2, Play, SkipBack, SkipForward, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useVideoStore } from '@/stores/videoStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotebookStore } from '@/stores/notebookStore'
import { getYouTubeId, formatTime, cn } from '@/lib/utils'
import type { Video, VideoNote } from '@/types'

function YouTubePlayer({ videoId, onTimeUpdate, onReady, onSeek }: {
  videoId: string
  onTimeUpdate?: (time: number) => void
  onReady?: () => void
  onSeek?: (time: number) => void
}) {
  const playerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    const interval = setInterval(() => {
      if (playerRef.current && playerReady) {
        try {
          const time = playerRef.current.getCurrentTime()
          if (typeof time === 'number') onTimeUpdate?.(time)
        } catch {}
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [playerReady, onTimeUpdate])

  useEffect(() => {
    setPlayerReady(false)
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 500)
        return
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId,
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setPlayerReady(true)
            onReady?.()
          },
        },
      })
    }
    initPlayer()
  }, [videoId])

  useEffect(() => {
    if (onSeek && playerRef.current && playerReady) {
      onSeek = undefined
    }
  }, [onSeek])

  const seekTo = useCallback((time: number) => {
    if (playerRef.current && playerReady) {
      playerRef.current.seekTo(time, true)
      playerRef.current.playVideo()
    }
  }, [playerReady])

  return (
    <div className="relative" style={{ paddingTop: '56.25%' }}>
      <div id="youtube-player" className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden" />
    </div>
  )
}

export default function VideoPage() {
  const { user } = useAuthStore()
  const { videos, currentVideo, videoNotes, loadVideos, setCurrentVideo, addVideo, updateVideo, deleteVideo, loadVideoNotes, addVideoNote, deleteVideoNote } = useVideoStore()
  const { notebooks, loadNotebooks } = useNotebookStore()
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<'youtube' | 'local'>('youtube')
  const [currentTime, setCurrentTime] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [noteSearch, setNoteSearch] = useState('')
  const [seekTrigger, setSeekTrigger] = useState<number | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [localSrc, setLocalSrc] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadVideos(user.id)
      loadNotebooks(user.id)
    }
  }, [user, loadVideos, loadNotebooks])

  useEffect(() => {
    if (currentVideo) {
      loadVideoNotes(currentVideo.id)
    }
  }, [currentVideo, loadVideoNotes])

  const handleLoadVideo = async () => {
    if (!url.trim() || !user) return
    const videoId = getYouTubeId(url.trim())
    if (!videoId) return

    const existing = videos.find((v) => v.url === url.trim())
    if (existing) {
      setCurrentVideo(existing)
      return
    }
    const video = await addVideo({
      userId: user.id,
      title: url.trim(),
      url: url.trim(),
      platform: 'youtube',
      duration: 0,
      lastPosition: 0,
    })
  }

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const src = URL.createObjectURL(file)
    setLocalSrc(src)
    addVideo({
      userId: user.id,
      title: file.name,
      url: src,
      platform: 'local',
      duration: 0,
      lastPosition: 0,
    }).then((v) => {
      setCurrentVideo(v)
    })
  }

  const handleAddTimestampNote = async () => {
    if (!noteText.trim() || !currentVideo) return
    await addVideoNote({
      videoId: currentVideo.id,
      timestamp: Math.floor(currentTime),
      title: noteText.trim(),
      content: '',
      tags: [],
    })
    setNoteText('')
  }

  const handleSeekTo = (timestamp: number) => {
    setSeekTrigger(timestamp)
    if (localVideoRef.current) {
      localVideoRef.current.currentTime = timestamp
      localVideoRef.current.play()
    }
  }

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const filteredNotes = videoNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="youtube" className="flex-1 flex flex-col" onValueChange={(v) => setMode(v as 'youtube' | 'local')}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-lg font-semibold">Video Learning</h1>
            <TabsList>
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" /> YouTube
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Local Video
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="youtube" className="mt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Paste YouTube URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                className="flex-1"
              />
              <Button onClick={handleLoadVideo}>
                <Youtube className="h-4 w-4 mr-2" /> Load Video
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="local" className="mt-0">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="video/*"
                onChange={handleLocalUpload}
                className="flex-1"
              />
            </div>
          </TabsContent>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {currentVideo && mode === 'youtube' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <YouTubePlayer
                  videoId={getYouTubeId(currentVideo.url) || ''}
                  onTimeUpdate={handleTimeUpdate}
                />
                <div className="mt-4 glass rounded-lg p-4">
                  <h3 className="font-medium mb-2">Playback Controls</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      Current: {formatTime(currentTime)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentVideo && mode === 'local' && localSrc && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <video
                  ref={localVideoRef}
                  src={localSrc}
                  controls
                  className="w-full rounded-lg"
                  onTimeUpdate={() => {
                    if (localVideoRef.current) {
                      setCurrentTime(localVideoRef.current.currentTime)
                    }
                  }}
                />
              </motion.div>
            )}

            {!currentVideo && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                  <Youtube className="h-12 w-12 mx-auto opacity-30" />
                  <p>Load a video to start learning</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-80 border-l border-border flex flex-col overflow-hidden flex-shrink-0">
            <div className="p-3 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Timestamp Notes
                </h3>
                <span className="text-xs text-muted-foreground">{videoNotes.length}</span>
              </div>
              {currentVideo && (
                <div className="flex gap-2">
                  <Input
                    placeholder={`Note at ${formatTime(currentTime)}...`}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTimestampNote()}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 flex-shrink-0"
                    onClick={handleAddTimestampNote}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="h-7 pl-7 text-xs"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group glass rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-all"
                    onClick={() => handleSeekTo(note.timestamp)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-primary font-semibold">
                        ▶ {formatTime(note.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteVideoNote(note.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-xs text-foreground line-clamp-2">{note.title}</p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {note.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                {filteredNotes.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {noteSearch ? 'No matching notes' : 'No timestamp notes yet'}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
