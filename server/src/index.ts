import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongodb: (mongoose.connection.readyState === 1) ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})

// Start HTTP server immediately (MongoDB connection is optional)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Connect to MongoDB in background (non-blocking)
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnboard')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.warn('MongoDB not available, running without database:', err.message))

export default app
