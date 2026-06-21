import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink, Clock, Shield, Wifi, Zap, GitBranch } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import TechLogo from '../shared/TechLogo'

const PLATFORM_COLOR = {
  'Vercel':   'bg-white/10 text-white',
  'Netlify':  'bg-teal-500/15 text-teal-300',
  'Render':   'bg-purple-500/15 text-purple-300',
  'Railway':  'bg-blue-500/15 text-blue-300',
  'GH Pages': 'bg-dark-600 text-dark-300',
  'Fly.io':   'bg-violet-500/15 text-violet-300',
  'Heroku':   'bg-pink-500/15 text-pink-300',
  'CF Pages': 'bg-orange-500/15 text-orange-300',
  'Custom':   'bg-white/5 text-dark-300',
}

const STATUS_CFG = {
  online:  { label: 'Online',  color: 'text-emerald-400', dot: 'bg-emerald-400', badge: 'badge-verified' },
  slow:    { label: 'Slow',    color: 'text-yellow-400',  dot: 'bg-yellow-400',  badge: 'badge-warning'  },
  offline: { label: 'Offline', color: 'text-red-400',     dot: 'bg-red-400',     badge: 'badge-danger'   },
  unknown: { label: 'Unknown', color: 'text-dark-400',    dot: 'bg-dark-400',    badge: ''               },
}

const STEPS = ['Fetching GitHub repos', 'Extracting deployment URLs', 'Pinging live deployments', 'Computing health scores']

export default function DeploymentChecker() {
  const { user } = useAuth()
  const [deployments, setDeployments] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [step, setStep]               = useState(0)
  const [rechecking, setRechecking]   = useState(null)

  const load = async () => {
    const username = user?.github_username
    if (!username) { toast.error('No GitHub username — log in via demo first'); return }
    setLoading(true)
    setDeployments(null)
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 800))
    }
    try {
      const { data } = await axios.get(`/api/github/deployments/${username}`)
      setDeployments(data.deployments)
      if (data.count === 0) toast('No deployment URLs found in your repos — add a homepage URL to your repo settings', { icon: '💡' })
      else toast.success(`Found ${data.count} deployment${data.count > 1 ? 's' : ''}`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to load deployments')
    } finally { setLoading(false) }
  }

  const recheck = async (deploy) => {
    setRechecking(deploy.name)
    try {
      const { data } = await axios.get(`/api/github/deployments/${user.github_username}`)
      const updated = data.deployments.find((d) => d.name === deploy.name)
      if (updated) {
        setDeployments((prev) => prev.map((d) => d.name === deploy.name ? { ...d, ...updated } : d))
      }
      toast.success('Status refreshed')
    } catch { toast.error('Recheck failed') }
    finally { setRechecking(null) }
  }

  const healthy  = (deployments || []).filter((d) => d.status === 'online').length
  const total    = (deployments || []).length
  const avgHealth = total > 0 ? Math.round(deployments.reduce((a, b) => a + (b.health || 0), 0) / total) : 0
  const httpsCount = (deployments || []).filter((d) => d.https).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="text-purple-400" size={22} /> Deployment Checker
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Live status of all deployments detected from <span className="text-brand-400 font-medium">@{user?.github_username || 'your profile'}</span>
          </p>
        </div>
        {!deployments && !loading && (
          <button onClick={load} className="btn-primary flex items-center gap-2 text-sm">
            <Zap size={14} /> Check Deployments
          </button>
        )}
        {deployments && (
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh All
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!deployments && !loading && (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg text-center"
          >
            <Rocket size={32} className="text-purple-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-2">Check Your Deployments</h2>
            <p className="text-sm text-dark-300 mb-4">
              CredIQ will scan your GitHub repos, extract homepage/deployment URLs, ping each one for live status, response time, and HTTPS.
            </p>
            <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto">
              <Zap size={14} /> Run Check
            </button>
            <p className="text-xs text-dark-500 mt-3">Tip: add a <span className="text-brand-400">homepage URL</span> to your repo settings so CredIQ can find it</p>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Rocket size={15} className="text-purple-400" /> Scanning deployments…
            </p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm ${i <= step ? 'text-white' : 'text-dark-500'}`}>
                  {i < step
                    ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-[10px]">✓</div>
                    : i === step
                    ? <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shrink-0" />
                    : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                  }
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {deployments && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Found',   value: total,           icon: Rocket,       color: 'text-brand-400',   bg: 'bg-brand-500/10 border-brand-500/20'   },
                { label: 'Online Now',    value: healthy,         icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'},
                { label: 'Avg Health',    value: `${avgHealth}%`, icon: Shield,       color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'      },
                { label: 'HTTPS Secured', value: `${httpsCount}/${total}`, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`glass-card gradient-border border ${bg}`}>
                  <Icon size={18} className={`${color} mb-2`} />
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-dark-300 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {deployments.length === 0 ? (
              <div className="glass-card gradient-border text-center py-14">
                <Rocket size={36} className="mx-auto mb-3 text-dark-500" />
                <p className="font-semibold text-white mb-2">No deployment URLs found</p>
                <p className="text-sm text-dark-400 max-w-sm mx-auto">
                  Add a <span className="text-brand-400">homepage URL</span> to your GitHub repo settings (e.g. your Vercel/Netlify URL) and run again.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((d, i) => {
                  const scfg = STATUS_CFG[d.status] || STATUS_CFG.unknown
                  const isChecking = rechecking === d.name
                  return (
                    <motion.div key={d.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="glass-card gradient-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className={`w-3 h-3 rounded-full ${scfg.dot}`} />
                          {d.status === 'online' && <div className={`absolute inset-0 rounded-full ${scfg.dot} animate-ping opacity-40`} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <TechLogo name={d.lang} size={14} />
                            <p className="font-semibold text-white font-mono">{d.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLOR[d.platform] || PLATFORM_COLOR['Custom']}`}>{d.platform}</span>
                            {d.https && <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><Shield size={9} /> HTTPS</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <a href={d.deploy_url} target="_blank" rel="noreferrer"
                              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-mono transition-colors truncate max-w-xs"
                            >
                              {d.deploy_url.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
                            </a>
                            <a href={d.repo_url} target="_blank" rel="noreferrer"
                              className="text-xs text-dark-400 hover:text-dark-300 flex items-center gap-1 transition-colors"
                            >
                              <GitBranch size={10} /> repo
                            </a>
                          </div>
                          {d.desc && <p className="text-[10px] text-dark-500 mt-0.5 truncate">{d.desc}</p>}
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-bold text-white flex items-center gap-1">
                              <Wifi size={12} className="text-dark-400" />
                              {d.response_ms ? `${d.response_ms}ms` : '—'}
                            </p>
                            <p className="text-[10px] text-dark-400">response</p>
                          </div>
                          {d.http_code && (
                            <div className="text-center">
                              <p className="text-sm font-bold text-white flex items-center gap-1">
                                <Clock size={12} className="text-dark-400" />
                                {d.http_code}
                              </p>
                              <p className="text-[10px] text-dark-400">HTTP code</p>
                            </div>
                          )}
                        </div>

                        <div className="text-center shrink-0">
                          <div className="relative w-12 h-12">
                            <svg width="48" height="48" className="rotate-[-90deg]">
                              <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                              <motion.circle cx="24" cy="24" r="18" fill="none"
                                stroke={d.health >= 70 ? '#10b981' : d.health >= 40 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 18}
                                initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - (d.health || 0) / 100) }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{d.health || 0}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {scfg.badge && <span className={scfg.badge}>{scfg.label}</span>}
                          {!scfg.badge && <span className="text-xs text-dark-400">{scfg.label}</span>}
                          <button onClick={() => recheck(d)} disabled={isChecking}
                            className="flex items-center gap-1 text-[11px] text-dark-400 hover:text-brand-300 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw size={10} className={isChecking ? 'animate-spin' : ''} />
                            {isChecking ? 'Checking…' : 'Recheck'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 h-1 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${d.health || 0}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                          className={`h-full rounded-full ${(d.health || 0) >= 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : (d.health || 0) >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
