import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Shield, Rocket, Star, GitBranch, GitCommit, GitFork,
  Users, ExternalLink, CheckCircle, Code2, TrendingUp, Award,
  MapPin, BookMarked, Loader2, Brain, Zap, AlertTriangle,
  ChevronRight, CheckCircle2, Target, Lightbulb, Wrench,
  RefreshCw, Sparkles, BookOpen, ArrowUpRight, Activity,
  ShieldCheck, ShieldAlert, ShieldQuestion, Gauge,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell,
} from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRecruiter } from '../../context/RecruiterContext'
import TechLogo from '../shared/TechLogo'

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444']
const INTENSITY  = ['bg-dark-700/60','bg-brand-900/70','bg-brand-700/80','bg-brand-500/90','bg-brand-400']

const VERDICT_BADGE = {
  'Top Candidate':      'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  'Highly Recommended': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Recommended':        'bg-brand-500/15 text-brand-300 border-brand-500/25',
  'Needs Review':       'bg-orange-500/15 text-orange-300 border-orange-500/25',
}

const FIT_COLOR = { high: 'text-emerald-400', medium: 'text-yellow-400', low: 'text-red-400' }

const TABS = [
  { id: 'overview',       label: 'Overview',       icon: Activity  },
  { id: 'ai_insights',    label: 'AI Insights',    icon: Brain     },
  { id: 'score_analysis', label: 'Score Analysis', icon: Gauge     },
  { id: 'vibe_code',      label: 'Vibe Code',      icon: ShieldCheck },
]

function toIntensity(count, max) {
  if (!count || !max) return 0
  const r = count / max
  if (r < 0.15) return 1
  if (r < 0.4)  return 2
  if (r < 0.7)  return 3
  return 4
}

function ScoreRing({ value, label, color = '#6366f1' }) {
  const r = 16, circ = 2 * Math.PI * r
  const dash = Math.min(value ?? 0, 100) / 100 * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">{value ?? '—'}</span>
        </div>
      </div>
      <p className="text-[10px] text-dark-400">{label}</p>
    </div>
  )
}

function DimBar({ label, value, max, color, reason }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-dark-200">{label}</span>
        <span className="text-xs font-bold text-white">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-full" style={{ background: color }}
        />
      </div>
      {reason && <p className="text-[10px] text-dark-500 leading-relaxed">{reason}</p>}
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ profile: p, verify, activity, username }) {
  const td = verify?.trust_score?.dimensions || {}
  const trust_score   = verify?.trust_score?.total   ?? 0
  const builder_score = verify?.builder_score?.total ?? 0
  const avg     = (trust_score + builder_score) / 2
  const verdict = avg >= 80 ? 'Top Candidate' : avg >= 65 ? 'Highly Recommended' : avg >= 50 ? 'Recommended' : 'Needs Review'

  const languages  = p?.languages || []
  const topRepos   = p?.top_repos  || []
  const pieData    = languages.slice(0, 7).map((l, i) => ({ name: l.name, value: l.pct, color: PIE_COLORS[i % PIE_COLORS.length] }))
  const radarData  = [
    { dim: 'GitHub Depth',  v: td.github_depth    || 0 },
    { dim: 'Skill Evid.',   v: td.skill_evidence  || 0 },
    { dim: 'Consistency',   v: td.consistency     || 0 },
    { dim: 'Impact',        v: td.community       || 0 },
    { dim: 'Quality',       v: td.project_quality || 0 },
  ]
  const allDays    = activity?.weeks?.flatMap(w => w.days) ?? []
  const maxDay     = Math.max(...allDays, 1)
  const GRID       = allDays.map(c => toIntensity(c, maxDay))
  const monthlyData = activity?.monthly ?? []

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="shrink-0">
            {p?.avatar
              ? <img src={p.avatar} alt={p.name} className="w-[72px] h-[72px] rounded-2xl object-cover ring-2 ring-white/10" />
              : <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                  {(p?.name || username)[0]}
                </div>
            }
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
              <h1 className="text-xl font-bold text-white">{p?.name || username}</h1>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${VERDICT_BADGE[verdict] || ''}`}>{verdict}</span>
            </div>
            <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 text-xs font-mono hover:text-brand-300 transition-colors mt-0.5"
            >@{username} <ExternalLink size={10} /></a>
            {p?.bio && <p className="text-xs text-dark-300 mt-1.5 max-w-lg">{p.bio}</p>}
            {p?.location && (
              <div className="flex items-center gap-1 text-dark-400 text-[11px] mt-1 justify-center sm:justify-start">
                <MapPin size={10} /> {p.location}
              </div>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 justify-center sm:justify-start">
              {[
                { icon: Users,     v: p?.followers,    label: 'followers'  },
                { icon: GitBranch, v: p?.public_repos, label: 'repos'      },
                { icon: Star,      v: p?.total_stars,  label: 'stars'      },
                { icon: GitCommit, v: p?.commit_count, label: 'commits/yr' },
              ].filter(x => x.v != null).map(({ icon: Icon, v, label }) => (
                <div key={label} className="flex items-center gap-1 text-dark-300">
                  <Icon size={11} className="text-dark-500" />
                  <span className="text-xs font-semibold text-white">{(v || 0).toLocaleString()}</span>
                  <span className="text-[11px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-5 shrink-0 items-center">
            <ScoreRing value={trust_score}   label="Trust"   color="#6366f1" />
            <ScoreRing value={builder_score} label="Builder" color="#8b5cf6" />
          </div>
        </div>

        {verify?.trust_score?.reasoning && (
          <div className="mt-4 p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
            <p className="text-[11px] text-brand-400 font-semibold flex items-center gap-1.5 mb-1">
              <Brain size={11} /> AI Trust Reasoning
            </p>
            <p className="text-xs text-dark-300 leading-relaxed">{verify.trust_score.reasoning}</p>
          </div>
        )}
      </motion.div>

      {/* Monthly + Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <h3 className="card-title"><GitCommit size={14} className="text-brand-400" /> Monthly Commit Activity</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} barSize={12} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#64748b' }} itemStyle={{ color: '#818cf8' }} />
              <Bar dataKey="commits" fill="#6366f1" radius={[3,3,0,0]} name="Commits" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><Code2 size={14} className="text-brand-400" /> Languages</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={90}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={40} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieData[i].color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }}
                    formatter={(v, n) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((l) => (
                  <div key={l.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: l.color }} />
                    <TechLogo name={l.name} size={11} />
                    <span className="text-[11px] text-dark-300 flex-1 truncate">{l.name}</span>
                    <span className="text-[11px] font-bold text-white">{l.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-xs text-dark-500 mt-4 text-center">No language data</p>}
        </motion.div>
      </div>

      {/* Radar + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <h3 className="card-title"><Award size={14} className="text-yellow-400" /> Trust Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: '#475569', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={1.5} name="Score" dot={{ fill: '#6366f1', r: 2 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="lg:col-span-3 glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="card-title mb-0"><TrendingUp size={14} className="text-brand-400" /> Contribution Heatmap</h3>
            <span className="text-[11px] text-dark-500">{activity?.total?.toLocaleString() ?? '—'} commits</span>
          </div>
          {GRID.length > 0 ? (
            <div className="grid grid-cols-[repeat(52,_1fr)] gap-[2.5px]">
              {GRID.map((v, i) => <div key={i} className={`aspect-square rounded-[2px] ${INTENSITY[v]}`} />)}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(52,_1fr)] gap-[2.5px]">
              {Array.from({ length: 364 }, (_, i) => (
                <div key={i} className="aspect-square rounded-[2px] bg-dark-800/60 animate-pulse" style={{ animationDelay: `${(i % 20) * 18}ms` }} />
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-[9px] text-dark-600">Less</span>
            {INTENSITY.map((c, i) => <div key={i} className={`w-2 h-2 rounded-[2px] ${c}`} />)}
            <span className="text-[9px] text-dark-600">More</span>
          </div>
        </motion.div>
      </div>

      {/* Top Repos */}
      {topRepos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><Star size={14} className="text-yellow-400" /> Top Repositories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {topRepos.slice(0, 6).map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:bg-white/[0.055] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TechLogo name={r.lang} size={12} />
                    <span className="text-[10px] text-dark-500">{r.lang}</span>
                  </div>
                  <ExternalLink size={11} className="text-dark-600 group-hover:text-brand-400 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-white group-hover:text-brand-300 font-mono truncate">{r.name}</p>
                <p className="text-[11px] text-dark-500 line-clamp-2 flex-1">{r.desc || 'No description'}</p>
                <div className="flex items-center gap-3 text-[11px] text-dark-500 pt-1 border-t border-white/[0.04] mt-auto">
                  <span className="flex items-center gap-1"><Star size={9} className="text-yellow-500" /> {r.stars}</span>
                  <span className="flex items-center gap-1"><GitFork size={9} /> {r.forks}</span>
                  {r.homepage && <span className="flex items-center gap-1 text-emerald-500 ml-auto"><Rocket size={9} /> Live</span>}
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Languages bar */}
      {languages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><CheckCircle size={14} className="text-emerald-400" /> Verified Languages</h3>
          <div className="space-y-2.5">
            {languages.slice(0, 8).map((l, i) => (
              <motion.div key={l.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.04 }}
                className="flex items-center gap-3"
              >
                <TechLogo name={l.name} size={14} />
                <span className="text-xs font-medium text-dark-200 w-20 shrink-0 truncate">{l.name}</span>
                <div className="flex-1 h-1.5 bg-dark-700/80 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${l.pct}%` }} transition={{ duration: 0.9, delay: 0.36 + i * 0.04 }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                  />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 w-9 text-right">{l.pct}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── AI Insights tab ────────────────────────────────────────────────────────────
const AI_STEPS = ['Reading GitHub profile', 'Analysing commit patterns', 'Mapping skill evidence', 'Generating insights with Groq AI']

function AIInsightsTab({ username }) {
  const [loading,  setLoading]  = useState(false)
  const [step,     setStep]     = useState(0)
  const [insights, setInsights] = useState(null)
  const [error,    setError]    = useState(null)

  const generate = async () => {
    setLoading(true); setInsights(null); setError(null)
    for (let i = 0; i < AI_STEPS.length; i++) { setStep(i); await new Promise(r => setTimeout(r, 900)) }
    try {
      const { data } = await axios.get(`/api/insights/career/${username}`)
      setInsights(data)
      toast.success('AI insights ready!')
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong')
      toast.error('Failed to generate insights')
    } finally { setLoading(false) }
  }

  const ins = insights?.insights || {}

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Brain className="text-brand-400" size={20} /> AI Insights</h2>
          <p className="text-sm text-dark-300 mt-0.5">Groq AI analysis of <span className="text-brand-400">@{username}</span></p>
        </div>
        {insights && (
          <button onClick={() => { setInsights(null); setStep(0) }} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Regenerate
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error && !loading && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card gradient-border border-red-500/20 max-w-lg">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">AI generation failed</p>
                <p className="text-sm text-dark-400 mt-1 font-mono break-all">{error}</p>
              </div>
            </div>
            <button onClick={() => { setError(null); generate() }} className="btn-secondary text-sm flex items-center gap-2">
              <RefreshCw size={13} /> Try Again
            </button>
          </motion.div>
        )}

        {!insights && !loading && !error && (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card gradient-border max-w-lg text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-purple/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-brand-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Generate AI Insights</h3>
            <p className="text-sm text-dark-300 mb-5">Groq AI will analyse @{username}'s repositories, commit patterns, and skills to generate recruiter-ready insights.</p>
            <button onClick={generate} className="btn-primary flex items-center gap-2 mx-auto">
              <Zap size={15} /> Generate Insights
            </button>
          </motion.div>
        )}

        {loading && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card gradient-border max-w-lg">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Brain size={15} className="text-brand-400 animate-pulse" /> Analysing with Groq AI…
            </p>
            <div className="space-y-3">
              {AI_STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? 'text-white' : 'text-dark-500'}`}>
                  {i < step
                    ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-[10px]">✓</div>
                    : i === step
                    ? <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0" />
                    : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                  }
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {insights && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Summary */}
            <div className="glass-card gradient-border">
              <div className="flex items-start gap-6 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Brain size={16} className="text-brand-400" /> AI Summary</h3>
                  <p className="text-sm text-dark-200 leading-relaxed">{ins.summary || '—'}</p>
                </div>
                <div className="flex gap-5 shrink-0 border-l border-white/5 pl-6">
                  <div className="text-center"><p className="text-3xl font-black gradient-text">{insights.trust_score ?? '—'}</p><p className="text-[10px] text-dark-500 mt-0.5">Trust Score</p></div>
                  <div className="text-center"><p className="text-3xl font-black gradient-text">{insights.builder_score ?? '—'}</p><p className="text-[10px] text-dark-500 mt-0.5">Builder Score</p></div>
                  <div className="border-l border-white/5 pl-5 space-y-3">
                    <div className="text-center"><p className={`text-xl font-black ${FIT_COLOR[ins.market_fit] || 'text-white'}`}>{(ins.market_fit || '—').toUpperCase()}</p><p className="text-[10px] text-dark-500 mt-0.5">Market Fit</p></div>
                    <div className="text-center"><p className={`text-xl font-black ${FIT_COLOR[ins.collaboration_potential] || 'text-white'}`}>{(ins.collaboration_potential || '—').toUpperCase()}</p><p className="text-[10px] text-dark-500 mt-0.5">Collaboration</p></div>
                  </div>
                </div>
              </div>
              {ins.standout_project && (
                <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                  <p className="text-[11px] text-yellow-400 font-semibold flex items-center gap-1.5 mb-1"><Star size={11} /> Standout Project</p>
                  <p className="text-sm text-dark-200">{ins.standout_project}</p>
                </div>
              )}
            </div>

            {/* Strengths + Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { icon: TrendingUp, cls: 'text-emerald-400', title: 'Strengths', items: ins.strengths, bullet: 'check' },
                { icon: AlertTriangle, cls: 'text-yellow-400', title: 'Skill Gaps', items: ins.gaps, bullet: 'arrow' },
              ].map(({ icon: Icon, cls, title, items, bullet }) => (
                <div key={title} className="glass-card gradient-border">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Icon size={15} className={cls} /> {title}</h3>
                  <div className="space-y-2.5">
                    {(items || []).map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        {bullet === 'check'
                          ? <CheckCircle2 size={13} className={`${cls} shrink-0 mt-0.5`} />
                          : <ChevronRight size={13} className={`${cls} shrink-0 mt-0.5`} />
                        }
                        <p className="text-sm text-dark-200 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Roles + Learning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { icon: Target, cls: 'text-brand-400', title: 'Recommended Roles', items: ins.recommended_roles },
                { icon: BookOpen, cls: 'text-purple-400', title: 'Learning Path', items: ins.learning_path },
              ].map(({ icon: Icon, cls, title, items }) => (
                <div key={title} className="glass-card gradient-border">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Icon size={15} className={cls} /> {title}</h3>
                  <div className="space-y-2.5">
                    {(items || []).map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[10px] font-bold text-dark-500 shrink-0 mt-0.5 w-4">{i + 1}.</span>
                        <p className="text-sm text-dark-200 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tech stack + Open source */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { icon: Code2, cls: 'text-cyan-400', title: 'Tech Stack Advice', text: ins.tech_stack_advice },
                { icon: GitBranch, cls: 'text-pink-400', title: 'Open Source Guidance', text: ins.open_source_advice },
              ].map(({ icon: Icon, cls, title, text }) => (
                <div key={title} className="glass-card gradient-border">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Icon size={15} className={cls} /> {title}</h3>
                  <p className="text-sm text-dark-200 leading-relaxed">{text || 'No advice generated.'}</p>
                </div>
              ))}
            </div>

            {/* Profile improvements + Next steps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { icon: Wrench, cls: 'text-orange-400', title: 'Profile Improvements', items: ins.profile_improvements },
                { icon: ArrowUpRight, cls: 'text-emerald-400', title: 'Next Steps', items: ins.next_steps },
              ].map(({ icon: Icon, cls, title, items }) => (
                <div key={title} className="glass-card gradient-border">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Icon size={15} className={cls} /> {title}</h3>
                  <div className="space-y-2.5">
                    {(items || []).map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <ChevronRight size={13} className={`${cls} shrink-0 mt-0.5`} />
                        <p className="text-sm text-dark-200 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Score Analysis tab ─────────────────────────────────────────────────────────
const TRUST_DIMS    = [['github_depth','GitHub Depth',30],['skill_evidence','Skill Evidence',25],['project_quality','Project Quality',20],['consistency','Consistency',15],['community','Community',10]]
const BUILDER_DIMS  = [['deployment_signal','Deployment Signal',35],['code_volume','Code Volume',25],['project_diversity','Project Diversity',20],['recency','Recency',20]]
const DIM_COLOR     = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4','#ef4444','#84cc16','#f97316']

function ScoreAnalysisTab({ username }) {
  const [state,    setState]    = useState('idle')
  const [analysis, setAnalysis] = useState(null)
  const [scores,   setScores]   = useState(null)

  const load = async () => {
    setState('loading')
    try {
      const { data } = await axios.get(`/api/insights/score-analysis/${username}`)
      setAnalysis(data.analysis)
      setScores({ trust: data.trust_score, builder: data.builder_score, trust_dims: data.trust_dims, builder_dims: data.builder_dims })
      setState('done')
      toast.success('Score analysis ready!')
    } catch {
      setState('error')
      toast.error('Failed to load score analysis')
    }
  }

  const [activeTab, setActiveTab] = useState('trust')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><Gauge className="text-brand-400" size={20} /> Score Analysis</h2>
        <p className="text-sm text-dark-300 mt-0.5">AI explains every dimension of @{username}'s trust and builder scores</p>
      </div>

      {state === 'idle' && (
        <div className="glass-card gradient-border max-w-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-600/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Gauge size={28} className="text-brand-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">Analyse Scores</h3>
          <p className="text-sm text-dark-300 mb-5">AI will explain why each dimension scored the way it did, with specific tips to improve.</p>
          <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto">
            <Sparkles size={15} /> Run Analysis
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="glass-card gradient-border max-w-lg flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-brand-400 shrink-0" />
          <p className="text-sm text-white">Running AI score breakdown…</p>
        </div>
      )}

      {state === 'error' && (
        <div className="glass-card gradient-border border-red-500/20 max-w-lg">
          <p className="text-sm text-red-400 mb-3">Failed to load analysis</p>
          <button onClick={load} className="btn-secondary text-sm">Try Again</button>
        </div>
      )}

      {state === 'done' && analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Overall */}
          <div className="glass-card gradient-border">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-dark-400 mb-1.5 flex items-center gap-1.5"><Brain size={12} className="text-brand-400" /> Overall Assessment</p>
                <p className="text-sm text-dark-200 leading-relaxed">{analysis.overall}</p>
              </div>
              <div className="flex gap-4 shrink-0">
                <div className="text-center"><p className="text-2xl font-black gradient-text">{scores?.trust ?? '—'}</p><p className="text-[10px] text-dark-500">Trust</p></div>
                <div className="text-center"><p className="text-2xl font-black text-emerald-400">{scores?.builder ?? '—'}</p><p className="text-[10px] text-dark-500">Builder</p></div>
              </div>
            </div>
          </div>

          {/* Tabs Trust / Builder */}
          <div className="flex gap-2">
            {[['trust','Trust Score','#6366f1'],['builder','Builder Score','#10b981']].map(([id, label, color]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  activeTab === id
                    ? 'border-white/20 text-white'
                    : 'glass border-white/5 text-dark-400 hover:text-white'
                }`}
                style={activeTab === id ? { background: color + '20', borderColor: color + '40' } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'trust' && (
            <motion.div key="trust" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass-card gradient-border">
                <p className="text-xs text-dark-400 mb-3">{analysis.trust_summary}</p>
                <div className="space-y-5">
                  {TRUST_DIMS.map(([key, label, max], ci) => (
                    <DimBar key={key} label={label} value={scores?.trust_dims?.[key] ?? 0} max={max}
                      color={DIM_COLOR[ci]} reason={analysis.trust_dimensions?.[key]} />
                  ))}
                </div>
              </div>
              {analysis.trust_improvements?.length > 0 && (
                <div className="glass-card gradient-border">
                  <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2"><Lightbulb size={14} className="text-yellow-400" /> How to Improve Trust Score</h3>
                  <div className="space-y-2">
                    {analysis.trust_improvements.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-dark-500 shrink-0 mt-0.5 w-4">{i + 1}.</span>
                        <p className="text-xs text-dark-200 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'builder' && (
            <motion.div key="builder" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass-card gradient-border">
                <p className="text-xs text-dark-400 mb-3">{analysis.builder_summary}</p>
                <div className="space-y-5">
                  {BUILDER_DIMS.map(([key, label, max], ci) => (
                    <DimBar key={key} label={label} value={scores?.builder_dims?.[key] ?? 0} max={max}
                      color={DIM_COLOR[ci + 4]} reason={analysis.builder_dimensions?.[key]} />
                  ))}
                </div>
              </div>
              {analysis.builder_improvements?.length > 0 && (
                <div className="glass-card gradient-border">
                  <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2"><Lightbulb size={14} className="text-yellow-400" /> How to Improve Builder Score</h3>
                  <div className="space-y-2">
                    {analysis.builder_improvements.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-dark-500 shrink-0 mt-0.5 w-4">{i + 1}.</span>
                        <p className="text-xs text-dark-200 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ── Vibe Code tab ──────────────────────────────────────────────────────────────
const RISK_LEVEL = (r) => r >= 70 ? ['High Risk', 'text-red-400', 'bg-red-500/10 border-red-500/20'] : r >= 40 ? ['Mixed Signals', 'text-yellow-400', 'bg-yellow-500/10 border-yellow-500/20'] : ['Authentic', 'text-emerald-400', 'bg-emerald-500/10 border-emerald-500/20']

function VibeCodeTab({ verify }) {
  const vibe = verify?.vibe_analysis || {}
  const risk = vibe.risk_score ?? 0
  const [label, textCls, bgCls] = RISK_LEVEL(risk)

  if (!verify) return <div className="glass-card text-center py-10 text-dark-400 text-sm">Vibe data not loaded</div>

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-brand-400" size={20} /> Vibe Code Analysis</h2>
        <p className="text-sm text-dark-300 mt-0.5">Code authenticity signals for @{verify.username || '—'}</p>
      </div>

      {/* Risk gauge */}
      <div className={`glass-card gradient-border border ${bgCls}`}>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle cx="20" cy="20" r="16" fill="none"
                stroke={risk >= 70 ? '#ef4444' : risk >= 40 ? '#f59e0b' : '#10b981'}
                strokeWidth="3"
                strokeDasharray={`${(risk / 100) * 100.5} 100.5`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{risk}</span>
              <span className="text-[8px] text-dark-500">risk</span>
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black ${textCls}`}>{label}</p>
            <p className="text-xs text-dark-400 mt-1">Vibe risk score: {risk}/100 — lower is better</p>
            <p className="text-xs text-dark-300 mt-0.5">Verdict: <span className="font-semibold text-white">{vibe.verdict || '—'}</span></p>
          </div>
        </div>
      </div>

      {/* Flags */}
      {vibe.flags?.length > 0 && (
        <div className="glass-card gradient-border border-red-500/15">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><ShieldAlert size={15} className="text-red-400" /> Flags Detected</h3>
          <div className="space-y-2">
            {vibe.flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-dark-200">{f}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Repos Checked', value: vibe.repos_checked ?? '—', color: 'text-brand-400' },
          { label: 'Risk Score',    value: `${risk}/100`,              color: risk >= 70 ? 'text-red-400' : risk >= 40 ? 'text-yellow-400' : 'text-emerald-400' },
          { label: 'Verdict',       value: vibe.verdict || '—',        color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card gradient-border text-center py-4">
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-dark-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {risk < 40 && (
        <div className="glass-card gradient-border border-emerald-500/20">
          <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2 mb-1"><ShieldCheck size={14} /> Code Appears Authentic</p>
          <p className="text-xs text-dark-300">No significant AI-generated code patterns detected. The commit history and code structure suggest genuine, human-written development work.</p>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CandidateProfileView() {
  const { username } = useParams()
  const navigate     = useNavigate()
  const { shortlists, addToShortlist, createShortlist } = useRecruiter()

  const [profile,  setProfile]  = useState(null)
  const [verify,   setVerify]   = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState('overview')

  useEffect(() => {
    if (!username) return
    setLoading(true); setError('')
    Promise.all([
      axios.get(`/api/github/analyze/${username}`),
      axios.get(`/api/recruiter/quick-verify/${username}`),
      axios.get(`/api/github/activity/${username}`),
    ])
      .then(([p, v, a]) => { setProfile(p.data); setVerify(v.data); setActivity(a.data) })
      .catch(() => setError(`Could not load profile for @${username}`))
      .finally(() => setLoading(false))
  }, [username])

  const handleShortlist = () => {
    const sl = shortlists.length === 0 ? createShortlist('My Candidates') : shortlists[0]
    addToShortlist(sl.id, username)
    toast.success(`Added @${username} to shortlist`)
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 size={28} className="animate-spin text-brand-400" />
      <p className="text-sm text-dark-400">Loading @{username}'s profile…</p>
    </div>
  )

  if (error) return (
    <div className="glass-card text-center py-12">
      <p className="text-red-400 text-sm mb-4">{error}</p>
      <button onClick={() => navigate(-1)} className="text-xs text-brand-400 hover:text-brand-300">← Go back</button>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleShortlist}
            className="flex items-center gap-1.5 glass border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
          >
            <BookMarked size={13} /> Shortlist
          </button>
          <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 glass border border-white/10 hover:border-brand-500/30 text-dark-300 hover:text-brand-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
          >
            <ExternalLink size={13} /> GitHub
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              tab === id
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === 'overview'       && <OverviewTab     profile={profile} verify={verify} activity={activity} username={username} />}
          {tab === 'ai_insights'    && <AIInsightsTab   username={username} />}
          {tab === 'score_analysis' && <ScoreAnalysisTab username={username} />}
          {tab === 'vibe_code'      && <VibeCodeTab     verify={verify} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
