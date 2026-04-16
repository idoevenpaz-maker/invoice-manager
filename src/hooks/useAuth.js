import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'
import { auth, provider } from '../firebase'
import { useAuthStore } from '../store/useAuthStore'

export function useAuth() {
  const [user, setUser] = useState(undefined)
  const setAccessToken  = useAuthStore(s => s.setAccessToken)
  const clearAccessToken = useAuthStore(s => s.clearAccessToken)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return unsub
  }, [])

  const login = async () => {
    const result = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (credential?.accessToken) {
      setAccessToken(credential.accessToken)
    }
    return result
  }

  const logout = () => {
    clearAccessToken()
    signOut(auth)
  }

  return { user, login, logout, loading: user === undefined }
}
