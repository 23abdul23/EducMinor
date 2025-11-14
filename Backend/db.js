import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const { MONGO_URI } = process.env

export const connectDB = async () => {
  if (!MONGO_URI) {
    console.warn('MONGO_URI is not set; skipping Mongo connection')
    return
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
  }
}
