import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import axios from 'axios'
import { auth, googleProvider, githubProvider, FIREBASE_CONFIGURED } from '../firebase'

const AuthContext = createContext(null)

// Sync Firebase user to our MongoDB and return the enriched profile
async function syncToBackend(firebaseUser, extra = {}) {
  const token = await firebaseUser.getIdToken()
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const { data } = await axios.post('/api/auth/sync', {
    uid:         firebaseUser.uid,
    email:       firebaseUser.email,
    name:        firebaseUser.displayName || extra.name || firebaseUser.email.split('@')[0],
    avatar:      firebaseUser.photoURL || null,
    ...extra,
  })
  return { profile: data.user, token }
}

// Refresh token before it expires (Firebase tokens last 1h)
async function refreshToken(firebaseUser) {
  const token = await firebaseUser.getIdToken(true)
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  return token
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !auth) {
      // Firebase not set up — restore demo session from localStorage
      const stored = localStorage.getItem('ciq_demo_user')
      const token  = localStorage.getItem('ciq_demo_token')
      if (stored && token) {
        try {
          setUser(JSON.parse(stored))
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch {}
      }
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { profile } = await syncToBackend(firebaseUser)
          setUser(profile)
          setInterval(() => refreshToken(firebaseUser), 55 * 60 * 1000)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
        delete axios.defaults.headers.common['Authorization']
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Email + password register
  const register = async ({ name, email, password, role }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const { profile } = await syncToBackend(cred.user, { name, role })
    setUser(profile)
    return profile
  }

  // Email + password login
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const { profile } = await syncToBackend(cred.user)
    setUser(profile)
    return profile
  }

  // Google OAuth
  const loginWithGoogle = async (role = 'developer') => {
    const cred = await signInWithPopup(auth, googleProvider)
    const { profile } = await syncToBackend(cred.user, { role })
    setUser(profile)
    return profile
  }

  // GitHub OAuth
  const loginWithGitHub = async (role = 'developer') => {
    const cred = await signInWithPopup(auth, githubProvider)
    // GitHub access token for our GitHub analysis service
    const githubToken = cred._tokenResponse?.oauthAccessToken
    const { profile } = await syncToBackend(cred.user, {
      role,
      github_username:       cred.user.reloadUserInfo?.screenName || null,
      github_access_token:   githubToken || null,
    })
    setUser(profile)
    return profile
  }

  const logout = async () => {
    if (FIREBASE_CONFIGURED && auth) await signOut(auth)
    setUser(null)
    localStorage.removeItem('ciq_demo_user')
    localStorage.removeItem('ciq_demo_token')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }))

  // Demo — takes a real GitHub username, fetches live data, no Firebase needed
  const demoLogin = async (githubUsername, role = 'developer') => {
    const { data } = await axios.post('/api/auth/demo', { github_username: githubUsername, role })
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    localStorage.setItem('ciq_demo_user',  JSON.stringify(data.user))
    localStorage.setItem('ciq_demo_token', data.token)
    return data.user
  }

  const demoRecruiterLogin = async (githubUsername) => {
    return demoLogin(githubUsername, 'recruiter')
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, loginWithGoogle, loginWithGitHub,
      logout, updateUser,
      demoLogin, demoRecruiterLogin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
