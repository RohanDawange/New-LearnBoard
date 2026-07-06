import mongoose, { Document, Schema } from 'mongoose'

export interface INote extends Document {
  userId: string
  notebookId: string
  title: string
  content: string
  tags: string[]
  pinned: boolean
  favorite: boolean
  createdAt: Date
  updatedAt: Date
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true, index: true },
    notebookId: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled' },
    content: { type: String, default: '' },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
)

noteSchema.index({ userId: 1, updatedAt: -1 })
noteSchema.index({ userId: 1, tags: 1 })

export default mongoose.model<INote>('Note', noteSchema)
