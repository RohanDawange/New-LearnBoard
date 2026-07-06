import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useNoteStore } from '@/stores/noteStore'
import { Separator } from '@/components/ui/separator'
import Toolbar from './Toolbar'

const lowlight = createLowlight(common)

interface TipTapEditorProps {
  noteId: string
}

export default function TipTapEditor({ noteId }: TipTapEditorProps) {
  const { notes, updateNote, saveVersion } = useNoteStore()
  const note = notes.find((n) => n.id === noteId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({ openOnClick: true }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-8 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (note) {
        updateNote(note.id, { content: html })
      }
    },
  })

  useEffect(() => {
    if (editor && note) {
      const currentContent = editor.getHTML()
      if (currentContent !== note.content) {
        editor.commands.setContent(note.content || '')
      }
    }
  }, [note?.id])

  const handleTitleChange = useCallback(
    (title: string) => {
      if (note) {
        updateNote(note.id, { title })
      }
    },
    [note, updateNote]
  )

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">Select a note to start editing</p>
          <p className="text-sm">Or create a new note from the sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar editor={editor} />
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <div className="editor-container">
          <input
            type="text"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-4 placeholder:text-muted-foreground/30"
          />
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
