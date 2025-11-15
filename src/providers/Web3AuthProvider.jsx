import { useMemo, useState } from 'react'
import { Web3AuthContext } from '../auth/web3authContext'

const Web3AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)

  const contextValue = useMemo(
    () => ({
      session,
      setSession,
    }),
    [session]
  )

  return <Web3AuthContext.Provider value={contextValue}>{children}</Web3AuthContext.Provider>
}

export default Web3AuthProvider
