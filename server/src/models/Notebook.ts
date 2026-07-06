import mongoose, { Document, Schema } from 'mongoose'

export interface INotebook extends Document {
  userId: string
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

const notebookSchema = new Schema<INotebook>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: '📁' },
    color: { type: String, default: '#ff8c00' },
    parentId: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

notebookSchema.index({ userId: 1, order: 1 })

export default mongoose.model<INotebook>('Notebook', notebookSchema)
