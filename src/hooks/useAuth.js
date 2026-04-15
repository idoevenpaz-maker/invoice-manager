import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = signed out

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return unsub
  }, [])

  const login = () => signInWithPopup(auth, provider)
  const logout = () => signOut(auth)

  return { user, login, logout, loading: user === undefined }
}
