import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const DEMO_DEVELOPER = {
  id: 'demo-dev-001',
  name: 'Varun Tuteja',
  email: 'demo@crediq.dev',
  role: 'developer',
  avatar: 'V',
  github_username: 'varun-dev',
  bio: 'Full Stack Developer | Open Source Enthusiast',
  location: 'Bangalore, IN',
  trust_score: 87,
  github_score: 92,
  verified_skills: ['Python', 'React', 'Flask', 'MongoDB', 'TypeScript'],
}

const DEMO_RECRUITER = {
  id: 'demo-rec-001',
  name: 'Anjali Mehta',
  email: 'recruiter@techcorp.com',
  role: 'recruiter',
  avatar: 'A',
  company: 'TechCorp India',
  title: 'Senior Technical Recruiter',
  location: 'Mumbai, IN',
}

// Attach stored token to every request on startup
const storedToken = localStorage.getItem('ciq_token')
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ciq_user')
    const token  = localStorage.getItem('ciq_token')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {}
    }
    setLoading(false)
  }, [])

  const _persist = (userData, token) => {
    setUser(userData)
    localStorage.setItem('ciq_user', JSON.stringify(userData))
    if (token) {
      localStorage.setItem('ciq_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    _persist(data.user, data.token)
    if (data.refresh_token) localStorage.setItem('ciq_refresh', data.refresh_token)
    return data
  }

  const register = async (payload) => {
    const { data } = await axios.post('/api/auth/register', payload)
    _persist(data.user, data.token)
    if (data.refresh_token) localStorage.setItem('ciq_refresh', data.refresh_token)
    return data
  }

  const demoLogin = () => _persist(DEMO_DEVELOPER, null)

  const demoRecruiterLogin = () => _persist(DEMO_RECRUITER, null)

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ciq_user')
    localStorage.removeItem('ciq_token')
    localStorage.removeItem('ciq_refresh')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    _persist(updated, localStorage.getItem('ciq_token'))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, demoLogin, demoRecruiterLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
