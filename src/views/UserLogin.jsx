import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import "./Auth.css";

function UserLogin() {
  const { connect, isConnected } = useWeb3AuthConnect()
  const { userInfo } = useWeb3AuthUser()
  const { address } = useWeb3AuthAccount()
  const navigate = useNavigate()
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('authRole', 'user')
    }
  }, [])

  useEffect(() => {
    const storeMapping = async () => {
      try {
        const email = userInfo?.email
        if (!email || !address) return

        await fetch(`${BACKEND_URL}/addUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, address }),
        })
      } catch (err) {
        console.warn('Failed to persist user-wallet mapping', err)
      }
    }

    if (isConnected && userInfo) {
      storeMapping().finally(() => navigate('/user'))
    }
  }, [isConnected, userInfo, address, navigate])

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <p className="text-sm mb-4">
          Admin access?{' '}
          <Link to="/admin-login" className="text-blue-600 underline">
            Switch to admin login
          </Link>
        </p>

        {!isConnected ? (
          <button className="login-btn" onClick={() => connect()}>
            Login with Google (Web3Auth)
          </button>
        ) : (
          <div className="logged-in">
            <p>Connected as:</p>
            <p className="wallet-address">{address}</p>
            <p>Welcome, {userInfo?.name}</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default UserLogin
