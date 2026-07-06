import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, FileText, Image, FileArchive, Download, Trash2, Search, Grid3X3, List, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { v4 as uuid } from 'uuid'
import { dbResources } from '@/lib/db'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import type { Resource } from '@/types'

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf')) return FileText
  if (type.includes('zip') || type.includes('rar')) return FileArchive
  return FileText
}

export default function ResourcesPage() {
  const { user } = useAuthStore()
  const [resources, setResources] = useState<Resource[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [preview, setPreview] = useState<Resource | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) loadResources()
  }, [user])

  const loadResources = async () => {
    if (!user) return
    const all = await dbResources.getAll(user.id)
    setResources(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user) return

    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = async () => {
        const resource: Resource = {
          id: uuid(),
          userId: user!.id,
          name: file.name,
          type: file.type,
          data: reader.result as string,
          size: file.size,
          createdAt: new Date(),
        }
        await dbResources.put(resource)
        loadResources()
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteResource = async (id: string) => {
    await dbResources.delete(id)
    setResources((prev) => prev.filter((r) => r.id !== id))
    if (preview?.id === id) setPreview(null)
  }

  const downloadResource = (resource: Resource) => {
    const a = document.createElement('a')
    a.href = resource.data
    a.download = resource.name
    a.click()
  }

  const filtered = resources.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Resource Manager</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
              {view === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg,.zip,.rar"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Upload className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-sm mb-2">No resources yet</p>
                <p className="text-xs">Upload PDFs, documents, images, or ZIP files</p>
              </div>
            )}

            {view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((resource, i) => {
                  const Icon = getFileIcon(resource.type)
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        'glass rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-all group',
                        preview?.id === resource.id && 'ring-1 ring-primary'
                      )}
                      onClick={() => setPreview(resource)}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        {resource.type.startsWith('image/') ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                            <img src={resource.data} alt={resource.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center">
                            <Icon className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <p className="text-xs truncate w-full">{resource.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatSize(resource.size)}</p>
                      </div>
                      <div className="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); downloadResource(resource) }}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteResource(resource.id) }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((resource) => {
                  const Icon = getFileIcon(resource.type)
                  return (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/30 cursor-pointer group"
                      onClick={() => setPreview(resource)}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm truncate">{resource.name}</span>
                      <span className="text-xs text-muted-foreground">{formatSize(resource.size)}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); downloadResource(resource) }}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteResource(resource.id) }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {preview && (
          <div className="w-96 border-l border-border flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium truncate flex-1">{preview.name}</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreview(null)}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {preview.type.startsWith('image/') ? (
                <img src={preview.data} alt={preview.name} className="w-full rounded-lg" />
              ) : preview.type.includes('pdf') ? (
                <iframe src={preview.data} className="w-full h-full min-h-[500px] rounded-lg" title={preview.name} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm">Preview not available</p>
                  <Button variant="link" size="sm" onClick={() => downloadResource(preview)}>
                    Download to view
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
