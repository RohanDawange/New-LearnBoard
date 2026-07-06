import { BookOpen, Clock, GitBranch } from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'
import { wordCount, readingTime } from '@/lib/utils'

export default function StatusBar() {
  const { currentNote } = useNoteStore()

  const wc = currentNote ? wordCount(currentNote.content) : 0
  const rt = currentNote ? readingTime(currentNote.content) : 0

  return (
    <footer className="h-7 flex items-center justify-between px-4 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-xl flex-shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        {currentNote && (
          <>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {wc} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {rt} min read
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          Auto-saved
        </span>
      </div>
    </footer>
  )
}
