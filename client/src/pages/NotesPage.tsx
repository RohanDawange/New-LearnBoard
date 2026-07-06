import { useParams } from 'react-router-dom'
import TipTapEditor from '@/components/editor/TipTapEditor'

export default function NotesPage() {
  const { noteId } = useParams()

  if (!noteId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">No note selected</h2>
          <p className="text-sm">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    )
  }

  return <TipTapEditor noteId={noteId} />
}
