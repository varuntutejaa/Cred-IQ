import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X, Shield, Github, CheckCircle, Award, Rocket, Star,
  Download, Share2, Edit2, LogOut, Clock, TrendingUp, Code2,
  MapPin, Briefcase, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function TrustRing({ score, size = 72, stroke = 6 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  )
}

export default function ProfileDrawer({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const overlayRef       = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleLogout = () => {
    logout()
    onClose()
    toast.success('Signed out')
    navigate('/')
  }

  if (!user) return null

  const isDev = user.role === 'developer'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] z-50 bg-dark-900 border-l border-white/8 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand-400" />
                <span className="text-sm font-semibold text-white">Profile</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-dark-400 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Identity block */}
              <div className="px-5 py-5 border-b border-white/5">
                <div className="flex items-start gap-4">
                  {/* Avatar + trust ring */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-2xl font-black">
                      {user.name?.[0] || 'U'}
                    </div>
                    {isDev && (
                      <div className="absolute -bottom-1 -right-1">
                        <div className="relative w-6 h-6">
                          <svg width="24" height="24" className="rotate-[-90deg]">
                            <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                            <motion.circle cx="12" cy="12" r="9" fill="none" stroke="#10b981" strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 9}
                              initial={{ strokeDashoffset: 2 * Math.PI * 9 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 9 * (1 - (user.trustScore || 87) / 100) }}
                              transition={{ duration: 1 }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-dark-900 flex items-center justify-center">
                              <CheckCircle size={8} className="text-emerald-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-white">{user.name}</h2>
                      {user.verificationStatus === 'verified' && (
                        <span className="badge-verified text-[10px]"><CheckCircle size={9} /> Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5">{user.email}</p>
                    {isDev && user.githubUsername && (
                      <p className="text-xs text-brand-400 font-mono mt-0.5 flex items-center gap-1">
                        <Github size={10} /> @{user.githubUsername}
                      </p>
                    )}
                    {!isDev && (
                      <p className="text-xs text-dark-400 mt-0.5">{user.title} · {user.company}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {user.location && <span className="text-[10px] text-dark-500 flex items-center gap-0.5"><MapPin size={9} />{user.location}</span>}
                      {user.experience && <span className="text-[10px] text-dark-500 flex items-center gap-0.5"><Briefcase size={9} />{user.experience}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Score — developer only */}
              {isDev && (
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wider">Trust Score</p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <TrustRing score={user.trustScore || 87} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-white">{user.trustScore || 87}</span>
                        <span className="text-[9px] text-dark-400">/100</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[
                        { label: 'GitHub Score',  value: user.githubScore || 92, color: 'bg-brand-500'   },
                        { label: 'Resume Score',  value: user.resumeTrustScore || 87, color: 'bg-emerald-500' },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-dark-400">{s.label}</span>
                            <span className="text-white font-semibold">{s.value}</span>
                          </div>
                          <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.8 }}
                              className={`h-full rounded-full ${s.color}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick stats — developer only */}
              {isDev && (
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wider">Quick Stats</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Code2,   label: 'Skills',       value: user.verifiedSkillsCount  || 14 },
                      { icon: Award,   label: 'Certs',        value: user.certificatesCount     || 6  },
                      { icon: Rocket,  label: 'Deployments',  value: user.deploymentsCount      || 9  },
                      { icon: Star,    label: 'OS Stars',     value: user.openSourceContributions || 312 },
                      { icon: Github,  label: 'GitHub Score', value: user.githubScore           || 92 },
                      { icon: TrendingUp, label: 'Trust',     value: user.trustScore            || 87 },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="glass rounded-xl p-2.5 text-center">
                        <Icon size={13} className="text-brand-400 mx-auto mb-1" />
                        <p className="text-sm font-black text-white">{value}</p>
                        <p className="text-[9px] text-dark-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top skills — developer only */}
              {isDev && user.topSkills?.length > 0 && (
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wider">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.topSkills.map((s) => (
                      <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-brand-500/12 text-brand-300 border border-brand-500/20 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent activity — developer only */}
              {isDev && user.recentActivity?.length > 0 && (
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={11} /> Recent Activity
                  </p>
                  <div className="space-y-2.5">
                    {user.recentActivity.map((a, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-dark-200 leading-relaxed">{a.msg}</p>
                          <p className="text-[10px] text-dark-500 mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-white/5 space-y-2 shrink-0">
              {isDev && (
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1.5 glass glass-hover border border-white/10 rounded-xl py-2.5 text-xs font-medium text-dark-200 hover:text-white transition-all">
                    <Download size={13} /> Download Report
                  </button>
                  <button className="flex items-center justify-center gap-1.5 glass glass-hover border border-white/10 rounded-xl py-2.5 text-xs font-medium text-dark-200 hover:text-white transition-all">
                    <Share2 size={13} /> Share Profile
                  </button>
                </div>
              )}
              <button className="w-full flex items-center justify-center gap-1.5 glass glass-hover border border-white/10 rounded-xl py-2.5 text-xs font-medium text-dark-200 hover:text-white transition-all">
                <Edit2 size={13} /> Edit Profile
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
