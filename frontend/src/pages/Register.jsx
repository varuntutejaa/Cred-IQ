import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, Code2, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DEV_PERKS  = ['Resume verification engine', 'GitHub deep analysis', 'Fake project detection', 'AI career insights']
const REC_PERKS  = ['One-click candidate verify', 'Trust score analytics',  'Bulk shortlisting',      'Downloadable reports']

export default function Register() {
  const [role,    setRole]    = useState('developer')
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, demoLogin, demoRecruiterLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register({ ...form, role })
      toast.success('Account created! Welcome to CredIQ.')
      navigate(role === 'recruiter' ? '/recruiter' : '/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = () => {
    if (role === 'recruiter') {
      demoRecruiterLogin()
      toast.success('Recruiter demo loaded!')
      navigate('/recruiter')
    } else {
      demoLogin()
      toast.success('Developer demo loaded!')
      navigate('/dashboard')
    }
  }

  const perks = role === 'recruiter' ? REC_PERKS : DEV_PERKS

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-glow">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold">Cred<span className="gradient-text">IQ</span></span>
        </div>

        <div className="glass-card gradient-border">
          <h1 className="text-2xl font-bold text-center mb-1">Create your account</h1>
          <p className="text-sm text-dark-300 text-center mb-4">Free during beta · No credit card required</p>

          {/* Role toggle */}
          <div className="flex gap-1.5 p-1 glass rounded-xl mb-4">
            {[
              { key: 'developer', icon: Code2,     label: 'I\'m a Developer' },
              { key: 'recruiter', icon: Briefcase, label: 'I\'m a Recruiter'  },
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setRole(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === key ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-dark-300 hover:text-white'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Perks */}
          <AnimatePresence mode="wait">
            <motion.div key={role} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
              className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-5"
            >
              {perks.map((p) => (
                <span key={p} className="flex items-center gap-1 text-[11px] text-accent-green">
                  <CheckCircle size={10} /> {p}
                </span>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* GitHub OAuth */}
          <button onClick={handleDemo}
            className="w-full flex items-center justify-center gap-2 glass glass-hover border border-white/15 rounded-xl py-3 text-sm font-medium mb-4"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign up with GitHub {role === 'recruiter' ? '(Recruiter)' : ''}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-dark-400">or with email</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type="text" placeholder="Full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type={showPwd ? 'text' : 'password'} placeholder="Password (min 8 chars)" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create {role === 'recruiter' ? 'Recruiter' : 'Developer'} Account</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          <button onClick={handleDemo} className="w-full mt-3 text-xs text-dark-400 hover:text-brand-300 transition-colors py-2">
            Try {role === 'recruiter' ? 'Recruiter' : 'Developer'} Demo →
          </button>

          <p className="text-xs text-dark-400 text-center mt-3">
            By signing up you agree to our{' '}
            <a href="#" className="text-brand-400 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>
          </p>

          <p className="text-sm text-dark-300 text-center mt-3">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
