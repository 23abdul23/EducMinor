import { createContext, useContext } from 'react'

export const Web3AuthContext = createContext({
  session: null,
  setSession: () => {},
})

export const useWeb3Auth = () => useContext(Web3AuthContext)
