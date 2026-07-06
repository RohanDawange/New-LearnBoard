import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

function requireDB(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'Database not connected. Set MONGODB_URI environment variable and restart.' })
    return false
  }
  return true
}

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' as any })
}

export const register = async (req: Request, res: Response) => {
  if (!requireDB(req, res)) return
  try {
    const { name, email, password } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })

    const token = generateToken(String(user._id))
    res.status(201).json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        goals: user.goals,
        createdAt: user.createdAt,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  if (!requireDB(req, res)) return
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(String(user._id))
    res.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        goals: user.goals,
        createdAt: user.createdAt,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  if (!requireDB(req, res)) return
  try {
    const userId = (req as any).userId
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      goals: user.goals,
      createdAt: user.createdAt,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  if (!requireDB(req, res)) return
  try {
    const userId = (req as any).userId
    const { name, bio, goals, avatar } = req.body
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, bio, goals, avatar } },
      { new: true }
    ).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      goals: user.goals,
      createdAt: user.createdAt,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
