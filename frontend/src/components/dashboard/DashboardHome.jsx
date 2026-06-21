import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  Shield, TrendingUp, CheckCircle, AlertTriangle,
  Rocket, Code2, ArrowUpRight, Zap, Star, GitCommit,
  GitBranch, Users, GitFork, Award, ExternalLink, Search, Loader2,
  MapPin, Calendar, Brain, ChevronRight, RefreshCw, Sparkles,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import TechLogo from '../shared/TechLogo'

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444','#14b8a6']
const INTENSITY  = ['bg-dark-700/60','bg-brand-900/70','bg-brand-700/80','bg-brand-500/90','bg-brand-400']

function toIntensity(count, max) {
  if (!count || !max) return 0
  const r = count / max
  if (r < 0.15) return 1
  if (r < 0.4)  return 2
  if (r < 0.7)  return 3
  return 4
}

/* SVG score ring */
function ScoreRing({ value, label, color = '#6366f1' }) {
  const r   = 16
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value ?? 0, 100)
  const dash = (pct / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[68px] h-[68px]">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black text-white leading-none">{value ?? '—'}</span>
        </div>
      </div>
      <p className="text-[10px] text-dark-400 font-medium">{label}</p>
    </div>
  )
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

const TRUST_DIMS   = ['github_depth', 'skill_evidence', 'project_quality', 'consistency', 'community']
const BUILDER_DIMS = ['deployment_signal', 'code_volume', 'project_diversity', 'recency']
const TRUST_MAX    = { github_depth: 30, skill_evidence: 25, project_quality: 20, consistency: 15, community: 10 }
const BUILDER_MAX  = { deployment_signal: 35, code_volume: 25, project_diversity: 20, recency: 20 }
const DIM_LABEL    = {
  github_depth: 'GitHub Depth', skill_evidence: 'Skill Evidence', project_quality: 'Project Quality',
  consistency: 'Consistency', community: 'Community',
  deployment_signal: 'Deployment Signal', code_volume: 'Code Volume',
  project_diversity: 'Project Diversity', recency: 'Recency',
}
const DIM_COLOR = {
  github_depth: '#6366f1', skill_evidence: '#10b981', project_quality: '#f59e0b',
  consistency: '#06b6d4', community: '#8b5cf6',
  deployment_signal: '#f59e0b', code_volume: '#10b981',
  project_diversity: '#6366f1', recency: '#06b6d4',
}

function DimBar({ dim, score, max, reason }) {
  const pct = max ? Math.round((score / max) * 100) : 0
  const col = DIM_COLOR[dim] || '#6366f1'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-dark-200">{DIM_LABEL[dim]}</span>
        <span className="font-bold text-white">{score}<span className="text-dark-600">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: col }}
        />
      </div>
      {reason && <p className="text-[10px] text-dark-500 leading-relaxed">{reason}</p>}
    </div>
  )
}

function ScoreAnalysisCard({ username }) {
  const [state,    setState]    = useState('idle')   // idle | loading | done | error
  const [data,     setData]     = useState(null)
  const [errMsg,   setErrMsg]   = useState('')
  const [tab,      setTab]      = useState('trust')

  const load = async () => {
    if (!username) return
    setState('loading')
    setData(null)
    try {
      const { data: res } = await axios.get(`/api/insights/score-analysis/${username}`)
      setData(res)
      setState('done')
    } catch (e) {
      setErrMsg(e?.response?.data?.error || 'AI analysis failed')
      setState('error')
    }
  }

  const analysis  = data?.analysis || {}
  const tDims     = data?.trust_dims   || {}
  const bDims     = data?.builder_dims || {}

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="glass-card gradient-border"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="card-title mb-0.5">
            <Brain size={15} className="text-brand-400" /> AI Score Analysis
          </h3>
          <p className="text-[11px] text-dark-500">
            {state === 'done'
              ? `Trust ${data.trust_score}/100 · Builder ${data.builder_score}/100 — AI dimension breakdown`
              : 'Get AI reasoning behind every dimension of your Trust & Builder scores'}
          </p>
        </div>
        {state === 'idle' && (
          <button onClick={load} disabled={!username}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-brand-500/15 border border-brand-500/25 text-brand-300 hover:bg-brand-500/25 transition-all disabled:opacity-40 shrink-0"
          >
            <Sparkles size={12} /> Analyse Scores
          </button>
        )}
        {state === 'done' && (
          <button onClick={load}
            className="p-1.5 rounded-lg hover:bg-white/5 text-dark-500 hover:text-white transition-all shrink-0"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      {/* Idle placeholder */}
      {state === 'idle' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Why is my Trust Score X?', "What's limiting my Builder Score?", 'Which dimension to improve first?', 'Specific tips for each score'].map(q => (
            <div key={q} className="p-3 rounded-xl bg-white/[0.025] border border-white/[0.05] flex items-start gap-2">
              <ChevronRight size={11} className="text-brand-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-dark-400 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <Brain size={14} className="text-brand-400 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Groq AI is analysing your scores…</p>
            <p className="text-xs text-dark-500 mt-0.5">Reading dimensions, reasoning through your data, writing explanations</p>
          </div>
          <div className="ml-auto w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin shrink-0" />
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="flex items-center gap-3 py-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-dark-300">{errMsg}</p>
          <button onClick={load} className="ml-auto text-xs text-brand-400 hover:text-brand-300 transition-colors shrink-0">Retry</button>
        </div>
      )}

      {/* Results */}
      {state === 'done' && analysis && (
        <div className="space-y-4">
          {/* Overall */}
          <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/15">
            <p className="text-xs text-dark-200 leading-relaxed">{analysis.overall}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 glass rounded-xl">
            {[
              { key: 'trust',   label: `Trust Score — ${data.trust_score}/100`   },
              { key: 'builder', label: `Builder Score — ${data.builder_score}/100` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === key ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-dark-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'trust' && (
              <motion.div key="trust" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                className="space-y-4"
              >
                {analysis.trust_summary && (
                  <p className="text-xs text-dark-300 leading-relaxed italic">{analysis.trust_summary}</p>
                )}
                <div className="space-y-4">
                  {TRUST_DIMS.map(dim => (
                    <DimBar key={dim} dim={dim} score={tDims[dim] ?? 0} max={TRUST_MAX[dim]}
                      reason={analysis.trust_dimensions?.[dim]}
                    />
                  ))}
                </div>
                {analysis.trust_improvements?.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[11px] font-semibold text-dark-400 mb-2 flex items-center gap-1.5">
                      <Zap size={11} className="text-yellow-400" /> How to improve your Trust Score
                    </p>
                    <div className="space-y-1.5">
                      {analysis.trust_improvements.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-dark-300">
                          <span className="text-yellow-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'builder' && (
              <motion.div key="builder" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                className="space-y-4"
              >
                {analysis.builder_summary && (
                  <p className="text-xs text-dark-300 leading-relaxed italic">{analysis.builder_summary}</p>
                )}
                <div className="space-y-4">
                  {BUILDER_DIMS.map(dim => (
                    <DimBar key={dim} dim={dim} score={bDims[dim] ?? 0} max={BUILDER_MAX[dim]}
                      reason={analysis.builder_dimensions?.[dim]}
                    />
                  ))}
                </div>
                {analysis.builder_improvements?.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[11px] font-semibold text-dark-400 mb-2 flex items-center gap-1.5">
                      <Zap size={11} className="text-yellow-400" /> How to improve your Builder Score
                    </p>
                    <div className="space-y-1.5">
                      {analysis.builder_improvements.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-dark-300">
                          <span className="text-yellow-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [activity, setActivity]          = useState(null)
  const [activityLoading, setActLoading] = useState(false)
  const [activityHandle, setActHandle]   = useState('')
  const [inputVal, setInputVal]          = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const handle = activityHandle || user?.github_username
    if (!handle) return
    setActLoading(true)
    setActivity(null)
    axios.get(`/api/github/activity/${handle}`)
      .then(({ data }) => setActivity(data))
      .catch(() => setActivity(null))
      .finally(() => setActLoading(false))
  }, [activityHandle, user?.github_username])

  function submitHandle(e) {
    e.preventDefault()
    const val = inputVal.trim().replace(/^@/, '')
    if (val) { setActHandle(val); setInputVal('') }
  }

  const displayHandle = activityHandle || user?.github_username || ''
  const languages     = user?.languages || []
  const topRepos      = user?.top_repos  || []
  const td            = user?.trust_breakdown || {}

  const allDays    = activity?.weeks?.flatMap(w => w.days) ?? []
  const maxDay     = Math.max(...allDays, 1)
  const GRID       = allDays.map(c => toIntensity(c, maxDay))
  const monthlyData = activity?.monthly ?? []

  const pieData = languages.slice(0, 7).map((l, i) => ({
    name: l.name, value: l.pct, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  const radarData = [
    { dim: 'Consistency', v: td.consistency     ?? Math.min(Math.round((user?.commit_count || 0) / 8), 100) },
    { dim: 'Diversity',   v: td.skill_evidence  ?? Math.min((languages.length) * 14, 100) },
    { dim: 'Activity',    v: td.github_depth    ?? Math.min((user?.public_repos || 0) * 3, 100) },
    { dim: 'Impact',      v: td.community       ?? Math.min(Math.round((user?.total_stars || 0) / 2), 100) },
    { dim: 'Quality',     v: td.project_quality ?? Math.min(Math.round((user?.public_repos || 0) * 2), 100) },
  ]

  const STATS = [
    { label: 'Repositories', value: user?.public_repos  ?? '—', icon: GitBranch, color: 'text-brand-400',   ring: 'bg-brand-500/10 border-brand-500/15'   },
    { label: 'Commits / yr', value: user?.commit_count  ?? '—', icon: GitCommit, color: 'text-emerald-400', ring: 'bg-emerald-500/10 border-emerald-500/15' },
    { label: 'Total Stars',  value: user?.total_stars   ?? '—', icon: Star,      color: 'text-yellow-400',  ring: 'bg-yellow-500/10 border-yellow-500/15'   },
    { label: 'Followers',    value: user?.followers     ?? '—', icon: Users,     color: 'text-cyan-400',    ring: 'bg-cyan-500/10 border-cyan-500/15'       },
    { label: 'Total Forks',  value: user?.total_forks   ?? '—', icon: GitFork,   color: 'text-purple-400',  ring: 'bg-purple-500/10 border-purple-500/15'   },
    { label: 'Account Age',  value: user?.account_age_days != null ? `${Math.round(user.account_age_days / 30)}mo` : '—', icon: Calendar, color: 'text-rose-400', ring: 'bg-rose-500/10 border-rose-500/15' },
  ]

  return (
    <div className="space-y-4">

      {/* ── Profile Hero ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass-card gradient-border"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-[72px] h-[72px] rounded-2xl object-cover ring-2 ring-white/10" />
              : <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                  {(user?.name || 'D')[0]}
                </div>
            }
            {user?.trust_score >= 80 && (
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-dark-900 flex items-center justify-center">
                <CheckCircle size={10} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
              <h1 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Developer'}</h1>
              {user?.trust_score >= 80 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold">
                  ✓ Verified
                </span>
              )}
            </div>

            {user?.github_username && (
              <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-400 text-xs font-mono hover:text-brand-300 transition-colors mt-0.5"
              >
                @{user.github_username} <ExternalLink size={10} />
              </a>
            )}

            {user?.bio && (
              <p className="text-xs text-dark-300 mt-1.5 line-clamp-2 max-w-lg">{user.bio}</p>
            )}

            {/* inline stats */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 justify-center sm:justify-start">
              {[
                { icon: Users,     v: user?.followers,    label: 'followers'  },
                { icon: Users,     v: user?.following,    label: 'following'  },
                { icon: GitBranch, v: user?.public_repos, label: 'repos'      },
                { icon: Star,      v: user?.total_stars,  label: 'stars'      },
                { icon: GitCommit, v: user?.commit_count, label: 'commits/yr' },
              ].map(({ icon: Icon, v, label }) => v != null && (
                <div key={label} className="flex items-center gap-1 text-dark-300">
                  <Icon size={11} className="text-dark-500" />
                  <span className="text-xs font-semibold text-white">{(v || 0).toLocaleString()}</span>
                  <span className="text-[11px]">{label}</span>
                </div>
              ))}
              {user?.location && (
                <div className="flex items-center gap-1 text-dark-400">
                  <MapPin size={10} /> <span className="text-[11px]">{user.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score rings */}
          <div className="flex gap-5 shrink-0 items-center">
            <ScoreRing value={user?.trust_score}   label="Trust"   color="#6366f1" />
            <ScoreRing value={user?.builder_score} label="Builder" color="#8b5cf6" />
          </div>
        </div>
      </motion.div>

      {/* ── Stat chips ── */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-3 md:grid-cols-6 gap-3"
      >
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={fadeUp}
              whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.12 } }}
              className={`glass rounded-xl border p-3.5 cursor-default ${s.ring}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} className={s.color} />
                <span className="text-[10px] text-dark-400 font-medium truncate">{s.label}</span>
              </div>
              <p className="text-[22px] font-black text-white leading-none tracking-tight">
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── AI Score Analysis ── */}
      {user?.github_username && (
        <ScoreAnalysisCard username={user.github_username} />
      )}

      {/* ── Monthly Commits + Languages ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="card-title mb-0.5">
                <GitCommit size={14} className="text-brand-400" /> Monthly Commit Activity
              </h3>
              <p className="text-[11px] text-dark-500">
                {activityLoading
                  ? `Scanning @${displayHandle}…`
                  : activity
                  ? `${activity.total.toLocaleString()} commits · ${activity.repos_scanned} repos · @${displayHandle}`
                  : user?.commit_count
                  ? `${user.commit_count} commits this year`
                  : 'Last 12 months'}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={12} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, padding: '6px 12px' }}
                labelStyle={{ color: '#64748b' }} itemStyle={{ color: '#818cf8' }}
              />
              <Bar dataKey="commits" fill="url(#barGrad)" radius={[3,3,0,0]} name="Commits" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
          className="glass-card gradient-border flex flex-col"
        >
          <h3 className="card-title"><Code2 size={14} className="text-brand-400" /> Languages</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={24} outerRadius={46} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieData[i].color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
                    formatter={(v, n) => [`${v}%`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3 flex-1">
                {pieData.map((l) => (
                  <div key={l.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: l.color }} />
                    <TechLogo name={l.name} size={12} />
                    <span className="text-[11px] text-dark-300 flex-1 truncate">{l.name}</span>
                    <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden mx-1">
                      <div className="h-full rounded-full" style={{ width: `${l.value}%`, background: l.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-white w-8 text-right">{l.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-dark-500">No language data</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Radar + Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <h3 className="card-title mb-0.5"><Award size={14} className="text-yellow-400" /> Profile Radar</h3>
          <p className="text-[11px] text-dark-500 mb-2">Skill dimensions</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: '#475569', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={1.5} name="Score" dot={{ fill: '#6366f1', r: 2 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="lg:col-span-3 glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="card-title mb-0">
                <TrendingUp size={14} className="text-brand-400" /> Contribution Heatmap
              </h3>
              <p className="text-[11px] text-dark-500 mt-0.5">
                {activityLoading ? `Scanning @${displayHandle}…`
                  : activity ? `${activity.total.toLocaleString()} total commits · @${displayHandle}`
                  : 'Real commit data from GitHub repos'}
              </p>
            </div>
            {/* search */}
            <form onSubmit={submitHandle} className="flex gap-1.5 shrink-0">
              <div className="relative">
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-dark-500" />
                <input ref={inputRef} value={inputVal} onChange={e => setInputVal(e.target.value)}
                  placeholder={displayHandle || 'username…'}
                  className="w-32 bg-dark-800/80 border border-white/[0.07] rounded-lg pl-6 pr-2 py-1.5 text-[11px] text-white placeholder-dark-600 focus:outline-none focus:border-brand-500/50"
                />
              </div>
              <button type="submit" disabled={activityLoading || !inputVal.trim()}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white flex items-center gap-1 transition-colors"
              >
                {activityLoading ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
              </button>
            </form>
          </div>

          {GRID.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: '2.5px' }}>
              {GRID.map((v, i) => <div key={i} className={`aspect-square rounded-[2px] ${INTENSITY[v]}`} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: '2.5px' }}>
              {Array.from({ length: 364 }, (_, i) => (
                <div key={i} className="aspect-square rounded-[2px] bg-dark-800/60 animate-pulse"
                  style={{ animationDelay: `${(i % 20) * 18}ms` }} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2.5 justify-end">
            <span className="text-[9px] text-dark-600">Less</span>
            {INTENSITY.map((c, i) => <div key={i} className={`w-2 h-2 rounded-[2px] ${c}`} />)}
            <span className="text-[9px] text-dark-600">More</span>
          </div>
        </motion.div>
      </div>

      {/* ── Top Repositories ── */}
      {topRepos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><Star size={14} className="text-yellow-400" /> Top Repositories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {topRepos.slice(0, 4).map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col gap-2.5 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:bg-white/[0.055] hover:border-white/[0.12] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TechLogo name={r.lang} size={13} />
                    <span className="text-[10px] text-dark-500">{r.lang}</span>
                  </div>
                  <ArrowUpRight size={12} className="text-dark-600 group-hover:text-brand-400 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors font-mono truncate">{r.name}</p>
                  <p className="text-[11px] text-dark-500 mt-0.5 leading-relaxed line-clamp-2">{r.desc || 'No description'}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-dark-500 mt-auto pt-1 border-t border-white/[0.04]">
                  <span className="flex items-center gap-1"><Star size={9} className="text-yellow-500" /> {r.stars}</span>
                  <span className="flex items-center gap-1"><GitFork size={9} /> {r.forks}</span>
                  {r.homepage && (
                    <span className="flex items-center gap-1 text-emerald-500 ml-auto">
                      <Rocket size={9} /> Live
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Verified Languages + Quick Profile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><CheckCircle size={14} className="text-emerald-400" /> Verified Languages</h3>
          {languages.length > 0 ? (
            <div className="space-y-2.5">
              {languages.slice(0, 6).map((l, i) => (
                <motion.div key={l.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <TechLogo name={l.name} size={14} />
                  <span className="text-xs font-medium text-dark-200 w-20 shrink-0 truncate">{l.name}</span>
                  <div className="flex-1 h-1.5 bg-dark-700/80 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${l.pct}%` }}
                      transition={{ duration: 0.9, delay: 0.36 + i * 0.04 }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 w-9 text-right">{l.pct}%</span>
                  {l.repos != null && (
                    <span className="text-[10px] text-dark-600 w-10 text-right hidden sm:block">{l.repos}r</span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-xs text-dark-500">Connect GitHub to see language data</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><Zap size={14} className="text-brand-400" /> Profile Summary</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Trust Score',   value: `${user?.trust_score ?? '—'}/100`,   color: 'text-brand-400',   icon: Shield    },
              { label: 'Builder Score', value: `${user?.builder_score ?? '—'}/100`, color: 'text-purple-400',  icon: Rocket    },
              { label: 'Languages',     value: languages.length || '—',             color: 'text-cyan-400',    icon: Code2     },
              { label: 'GitHub Stars',  value: user?.total_stars ?? '—',            color: 'text-yellow-400',  icon: Star      },
              { label: 'Public Repos',  value: user?.public_repos ?? '—',           color: 'text-emerald-400', icon: GitBranch },
              { label: 'Account Age',   value: user?.account_age_days != null ? `${Math.round(user.account_age_days / 30)}mo` : '—', color: 'text-rose-400', icon: Calendar },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
                <Icon size={13} className={`${color} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-[10px] text-dark-500 truncate">{label}</p>
                  <p className="text-sm font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  )
}
