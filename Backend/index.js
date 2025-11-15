import cors from 'cors'
import express from 'express'
import { addAddress, getJSONData, mapEmail } from './controllers/getJSONData.js'
import { ConnectDB } from './db.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

ConnectDB()
app.post('/upload', (req, res) => {
  res.json({ message: 'Upload endpoint placeholder', file: null })
})

app.post('/getAddress', mapEmail)
app.post('/addUser', addAddress)
app.get('/getjsondata/:jsonCID', getJSONData)

app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok', note: 'Placeholder backend running' })
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
