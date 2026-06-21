import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertOctagon, Github, CheckCircle, AlertTriangle, XCircle, Zap, GitCommit, Calendar, FileText, Rocket, Code2, RefreshCw, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const VERDICT_CFG = {
  authentic:  { icon: CheckCircle,  label: 'Authentic',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'badge-verified' },
  warning:    { icon: AlertTriangle,label: 'Review',     color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',   badge: 'badge-warning'  },
  suspicious: { icon: XCircle,      label: 'Suspicious', color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         badge: 'badge-danger'   },
}

const SCAN_STEPS = ['Fetching repositories', 'Analysing commit patterns', 'Checking README & deployments', 'Computing authenticity scores']

function ScoreMeter({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg width="64" height="64" className="rotate-[-90deg]">
        <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 24}
          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - score / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

function LoadingSteps({ step }) {
  return (
    <div className="glass-card gradient-border max-w-lg">
      <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <AlertOctagon size={15} className="text-red-400" /> Scanning repositories…
      </p>
      <div className="space-y-3">
        {SCAN_STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? 'text-white' : 'text-dark-500'}`}>
            {i < step
              ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-[10px]">✓</div>
              : i === step
              ? <div className="w-5 h-5 rounded-full border-2 border-red-400 border-t-transparent animate-spin shrink-0" />
              : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
            }
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

function parseRepoInput(raw) {
  const cleaned = raw.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '')
    .replace(/\/$/, '')
  const parts = cleaned.split('/')
  if (parts.length >= 2) return { owner: parts[0], repo: parts[1] }
  return null
}

export default function ProjectScanner() {
  const { user }  = useAuth()
  const [url, setUrl]         = useState('')
  const [loadingAll, setLoadingAll]   = useState(false)
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [step, setStep]       = useState(0)
  const [repos, setRepos]     = useState([])
  const [expanded, setExpanded] = useState(null)

  const fetchAll = async () => {
    const username = user?.github_username
    if (!username) return
    setLoadingAll(true)
    setRepos([])
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 800))
    }
    try {
      const { data } = await axios.get(`/api/github/scan-repos/${username}`)
      setRepos(data.repos || [])
      toast.success(`Scanned ${(data.repos || []).length} repositories`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to scan repos')
    } finally {
      setLoadingAll(false)
    }
  }

  const scanSingle = async () => {
    const parsed = parseRepoInput(url)
    if (!parsed) { toast.error('Enter a valid GitHub URL or owner/repo'); return }
    setLoadingSingle(true)
    try {
      const { data } = await axios.get(`/api/github/scan-repo/${parsed.owner}/${parsed.repo}`)
      setRepos((prev) => {
        const filtered = prev.filter((r) => r.name !== data.name)
        return [data, ...filtered]
      })
      setExpanded(data.name)
      toast.success(`Scanned ${data.name}`)
      setUrl('')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Repo not found or inaccessible')
    } finally {
      setLoadingSingle(false)
    }
  }

  useEffect(() => { fetchAll() }, [user?.github_username])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertOctagon className="text-red-400" size={22} /> Fake Project Detector
          </h1>
          <p className="text-sm text-dark-300 mt-1">Flags suspicious repos — copied code, single-commit bloat, and ghost projects</p>
        </div>
        {!loadingAll && repos.length > 0 && (
          <button onClick={fetchAll} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Re-scan
          </button>
        )}
      </div>

      {/* Manual scan input */}
      <div className="glass-card gradient-border">
        <p className="text-sm font-semibold text-white mb-3">Scan a Specific Repository</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text" placeholder="github.com/username/repository"
              value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scanSingle()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <button onClick={scanSingle} disabled={loadingSingle || !url.trim()} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
            {loadingSingle ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} /> Scan</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-dark-400">
          {['Commit frequency', 'Repo age', 'Code/commit ratio', 'README presence', 'Deployment status', 'Bulk-upload detection'].map((f) => (
            <span key={f} className="flex items-center gap-1"><span className="text-brand-400">✓</span>{f}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card gradient-border bg-brand-500/3 border-brand-500/15">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Code2 size={15} className="text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">How Fake Detection Works</p>
            <p className="text-xs text-dark-300 leading-relaxed">
              We inspect <span className="text-white font-medium">commit frequency patterns</span>, <span className="text-white font-medium">code size vs commit count ratio</span>,
              repository age, README presence, deployment status, and bulk-upload timing.
              A score below 45 triggers a suspicious flag.
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loadingAll && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSteps step={step} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {!loadingAll && repos.length === 0 && (
        <div className="glass-card gradient-border text-center py-10 text-dark-400 text-sm">
          No repositories scanned yet.
        </div>
      )}

      <div className="space-y-3">
        {repos.map((repo, i) => {
          const cfg  = VERDICT_CFG[repo.verdict] || VERDICT_CFG.warning
          const Icon = cfg.icon
          const isOpen = expanded === repo.name
          const ageDays = repo.age_days ?? 0
          const ageLabel = ageDays >= 365
            ? `${Math.floor(ageDays / 365)}y ${Math.floor((ageDays % 365) / 30)}m`
            : ageDays >= 30
            ? `${Math.floor(ageDays / 30)} month${Math.floor(ageDays / 30) !== 1 ? 's' : ''}`
            : `${ageDays} day${ageDays !== 1 ? 's' : ''}`

          return (
            <motion.div key={repo.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`glass-card gradient-border border cursor-pointer ${cfg.bg}`}
              onClick={() => setExpanded(isOpen ? null : repo.name)}
            >
              <div className="flex items-center gap-4">
                <ScoreMeter score={repo.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-mono text-white">{repo.name}</p>
                    <span className={cfg.badge}><Icon size={10} /> {cfg.label}</span>
                    {repo.flags.length > 0 && (
                      <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                        <XCircle size={9} /> {repo.flags.length} flag{repo.flags.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="text-xs text-dark-400 flex items-center gap-1"><GitCommit size={10} />{repo.commits} commits</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Calendar size={10} />{ageLabel} old</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Code2 size={10} />{(repo.size_kb ?? 0).toLocaleString()} KB</span>
                    {repo.has_deployment && <span className="text-xs text-emerald-400 flex items-center gap-1"><Rocket size={10} /> Live</span>}
                    {repo.has_readme && <span className="text-xs text-dark-400 flex items-center gap-1"><FileText size={10} /> README</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {(repo.languages || []).slice(0, 2).map((l) => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300">{l}</span>
                  ))}
                  <a href={repo.url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-dark-500 hover:text-brand-400 flex items-center gap-0.5 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={9} /> GitHub
                  </a>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-dark-300 mb-1">Analysis</p>
                        <p className="text-xs text-dark-200 leading-relaxed">{repo.analysis}</p>
                      </div>
                      {repo.flags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><AlertTriangle size={11} /> Flags Detected</p>
                          <div className="space-y-1.5">
                            {repo.flags.map((f, fi) => (
                              <div key={fi} className="flex items-center gap-2 text-xs text-dark-300">
                                <XCircle size={11} className="text-red-400 shrink-0" /> {f}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {repo.flags.length === 0 && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                          <CheckCircle size={11} /> No suspicious patterns detected
                        </div>
                      )}
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${repo.score}%` }} transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${repo.score >= 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : repo.score >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <p className={`text-xs font-semibold ${cfg.color}`}>Authenticity Score: {repo.score}%</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
