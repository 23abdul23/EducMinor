import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { addAddress, getJSONData, mapEmail } from './controllers/getJSONData.js'
import { connectDB } from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

connectDB()

app.post('/upload', (_req, res) => {
  res.json({ message: 'File upload stubbed in rebuild', file: null })
})

app.post('/getAddress', mapEmail)
app.post('/addUser', addAddress)
app.get('/getjsondata/:jsonCID', getJSONData)

app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok', note: 'Minor 2 backend placeholder running' })
})

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`))
