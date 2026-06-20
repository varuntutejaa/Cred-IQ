import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const DEMO_DEVELOPER = {
  id: 'demo-dev-001',
  name: 'Varun Tuteja',
  email: 'demo@crediq.dev',
  role: 'developer',
  avatar: 'V',
  githubUsername: 'varun-dev',
  bio: 'Full Stack Developer | Open Source Enthusiast',
  location: 'Bangalore, IN',
  experience: '3 years',
  verificationStatus: 'verified',
  trustScore: 87,
  githubScore: 92,
  verifiedSkillsCount: 14,
  certificatesCount: 6,
  deploymentsCount: 9,
  openSourceContributions: 312,
  resumeTrustScore: 87,
  topSkills: ['Python', 'React', 'Flask', 'MongoDB', 'TypeScript'],
  recentActivity: [
    { msg: 'Python skill verified via 12 repositories', time: '2m ago' },
    { msg: 'AWS claim needs supporting evidence', time: '1h ago' },
    { msg: 'GitHub analysis completed — 92/100', time: '3h ago' },
  ],
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
  verificationStatus: 'verified',
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('pf_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const _persist = (userData) => {
    setUser(userData)
    localStorage.setItem('pf_user', JSON.stringify(userData))
  }

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    _persist(data.user)
    localStorage.setItem('pf_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const register = async (payload) => {
    const { data } = await axios.post('/api/auth/register', payload)
    _persist(data.user)
    localStorage.setItem('pf_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const demoLogin = () => _persist(DEMO_DEVELOPER)

  const demoRecruiterLogin = () => _persist(DEMO_RECRUITER)

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pf_user')
    localStorage.removeItem('pf_token')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    _persist(updated)
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
