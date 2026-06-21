import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Building2, ChevronDown, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function RecruiterLogin() {
  const { idpLogin } = useAuth()
  const navigate = useNavigate()

  const [form,       setForm]       = useState({ email: '', password: '' })
  const [showPwd,    setShowPwd]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [accounts,   setAccounts]   = useState([])
  const [showHints,  setShowHints]  = useState(false)

  useEffect(() => {
    axios.get('/api/idp/accounts')
      .then(({ data }) => setAccounts(data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await idpLogin(form.email.trim().toLowerCase(), form.password)
      toast.success('Welcome back!')
      navigate('/recruiter')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false) }
  }

  const fillAccount = (acc) => {
    setForm({ email: acc.email, password: 'Recruit@123' })
    setShowHints(false)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* bg glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-brand-500/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-glow">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold">Cred<span className="gradient-text">IQ</span></span>
        </div>

        <div className="glass-card gradient-border">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-purple-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Recruiter SSO</h1>
              <p className="text-xs text-dark-400">Sign in with your company credentials</p>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold">
                IDP
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email with account hints */}
            <div>
              <label className="text-xs font-medium text-dark-400 mb-1.5 block">Company Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input type="email" placeholder="you@company.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setShowHints(true)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>

              {/* Account hints dropdown */}
              <AnimatePresence>
                {showHints && accounts.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="mt-1 glass border border-white/10 rounded-xl overflow-hidden shadow-xl"
                  >
                    <p className="text-[10px] text-dark-500 px-3 pt-2 pb-1 font-semibold uppercase tracking-wider">
                      Sample Accounts
                    </p>
                    {accounts.map((acc) => (
                      <button key={acc.email} type="button"
                        onClick={() => fillAccount(acc)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                          <Building2 size={12} className="text-purple-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{acc.name}</p>
                          <p className="text-[10px] text-dark-500 truncate">{acc.email} · {acc.company}</p>
                        </div>
                      </button>
                    ))}
                    <button type="button" onClick={() => setShowHints(false)}
                      className="w-full text-center text-[10px] text-dark-600 hover:text-dark-400 py-2 transition-colors"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-dark-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 hover:from-purple-500 hover:to-brand-400 text-white font-semibold rounded-xl py-3 text-sm shadow-glow disabled:opacity-60 transition-all mt-1"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in with SSO</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Sample credentials info */}
          <div className="mt-5 p-3.5 rounded-xl bg-purple-500/[0.07] border border-purple-500/15">
            <p className="text-[11px] font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
              <CheckCircle size={11} /> Sample IDP Credentials
            </p>
            <div className="space-y-1">
              {accounts.slice(0, 3).map((acc) => (
                <div key={acc.email} className="flex items-center justify-between">
                  <span className="text-[10px] text-dark-400 font-mono">{acc.email}</span>
                  <span className="text-[10px] text-dark-500">Recruit@123</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-dark-500">
              Not a recruiter?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                Developer login
              </Link>
            </p>
            <div className="flex items-center gap-1 text-[10px] text-dark-600">
              <Shield size={9} /> Secured by CredIQ SSO
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
