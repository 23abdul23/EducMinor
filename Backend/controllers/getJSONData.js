import axios from 'axios'
import User from '../models/User.js'

export const getJSONData = async (req, res) => {
  const { jsonCID } = req.params

  if (!jsonCID) {
    res.status(400).json({ message: 'IPFS hash is required' })
    return
  }

  try {
    const endpointUrl = `https://gateway.pinata.cloud/ipfs/${jsonCID}`
    const response = await axios.get(endpointUrl)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch certificate JSON', error: error.message })
  }
}

export const mapEmail = async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(422).json({ message: 'Email is required', wallet_address: null })
    return
  }

  try {
    const user = await User.findOne({ email_id: email }).lean()
    if (!user) {
      res.status(404).json({ message: 'No record found', wallet_address: null })
      return
    }

    res.json({ wallet_address: user.wallet_address ?? null })
  } catch (error) {
    res.status(500).json({ message: 'Unable to map email to wallet', error: error.message })
  }
}

export const addAddress = async (req, res) => {
  const { email, address } = req.body

  if (!email || !address) {
    res.status(422).json({ message: 'Email and wallet address are required' })
    return
  }

  try {
    const user = await User.findOneAndUpdate(
      { email_id: email },
      { $setOnInsert: { email_id: email }, wallet_address: address },
      { upsert: true, new: true }
    )

    res.json({ message: 'Wallet address saved', user })
  } catch (error) {
    res.status(500).json({ message: 'Unable to store wallet address', error: error.message })
  }
}
