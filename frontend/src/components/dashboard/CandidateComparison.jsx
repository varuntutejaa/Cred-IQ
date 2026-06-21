import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitCompare, Search, Plus, X, CheckCircle, Zap, Star,
  GitCommit, Rocket, Award, TrendingUp, Users, Loader2,
  Shield, Brain,
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRecruiter } from '../../context/RecruiterContext'
import TechLogo from '../shared/TechLogo'

const SLOT_COLORS = ['#6366f1', '#10b981']

// Trust score dimension maxes (from backend)
const RADAR_DIMS = [
  { key: 'github_depth',    label: 'GitHub Depth',    max: 30 },
  { key: 'skill_evidence',  label: 'Skill Evidence',  max: 25 },
  { key: 'project_quality', label: 'Project Quality', max: 20 },
  { key: 'consistency',     label: 'Consistency',     max: 15 },
  { key: 'community',       label: 'Community',       max: 10 },
]

const METRICS = [
  { key: 'trustScore',   label: 'Trust Score',      icon: Shield,      invert: false },
  { key: 'builderScore', label: 'Builder Score',    icon: Zap,         invert: false },
  { key: 'repos',        label: 'Repositories',     icon: Award,       invert: false },
  { key: 'stars',        label: 'GitHub Stars',     icon: Star,        invert: false },
  { key: 'commits',      label: 'Commits / yr',     icon: GitCommit,   invert: false },
  { key: 'followers',    label: 'Followers',        icon: Users,       invert: false },
  { key: 'deployments',  label: 'Live Deployments', icon: Rocket,      invert: false },
  { key: 'vibeRisk',     label: 'Vibe Risk',        icon: Brain,       invert: true  },
]

// Fetch real GitHub + trust/builder data for any username
async function fetchCandidate(username) {
  const [profRes, verRes] = await Promise.all([
    axios.get(`/api/github/analyze/${username}`),
    axios.get(`/api/recruiter/quick-verify/${username}`),
  ])
  const p    = profRes.data
  const v    = verRes.data
  const dims = v.trust_score?.dimensions || {}

  const deployments = (p.top_repos || []).filter(r => r.homepage).length

  return {
    username,
    name:         p.name || username,
    avatar:       p.avatar || null,
    trustScore:   v.trust_score?.total   ?? 0,
    builderScore: v.builder_score?.total ?? 0,
    vibeRisk:     v.vibe_analysis?.risk_score ?? 0,
    repos:        p.public_repos  ?? 0,
    stars:        p.total_stars   ?? 0,
    commits:      p.commit_count  ?? 0,
    followers:    p.followers     ?? 0,
    deployments,
    languages:    p.languages || [],
    dims,
    verdict:      null,
  }
}

// ── Candidate Picker ──────────────────────────────────────────────────────────
function CandidatePicker({ slot, onSelect, exclude }) {
  const { candidates } = useRecruiter()
  const [q,       setQ]       = useState('')
  const [loading, setLoading] = useState(false)

  const contextList = candidates.filter(c =>
    !exclude.includes(c.username) &&
    (c.username.toLowerCase().includes(q.toLowerCase()) ||
     (c.name || '').toLowerCase().includes(q.toLowerCase()))
  )

  const handleFetch = async () => {
    const handle = q.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '').replace('@', '')
    if (!handle) return
    setLoading(true)
    try {
      const cand = await fetchCandidate(handle)
      onSelect(cand)
    } catch {
      toast.error(`Could not find @${handle}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="glass-card gradient-border mt-2">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          type="text"
          placeholder="Search saved or enter GitHub username…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
        />
      </div>

      {/* Saved candidates */}
      {contextList.length > 0 && (
        <div className="space-y-1 max-h-44 overflow-y-auto mb-2">
          {contextList.map(c => (
            <button key={c.username} onClick={() => {
              // Use cached data from context directly
              onSelect({
                username:     c.username,
                name:         c.name || c.username,
                avatar:       c.avatar || null,
                trustScore:   c.trust_score   ?? 0,
                builderScore: c.builder_score ?? 0,
                vibeRisk:     c.vibe_risk     ?? 0,
                repos:        c.public_repos  ?? 0,
                stars:        c.total_stars   ?? 0,
                commits:      c.commit_count  ?? 0,
                followers:    c.followers     ?? 0,
                deployments:  (c.top_repos || []).filter(r => r.homepage).length,
                languages:    c.languages     || [],
                dims:         {},
              })
            }}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left group"
            >
              {c.avatar
                ? <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 bg-brand-500/20 text-brand-300">{(c.name || c.username)[0]}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{c.name || c.username}</p>
                <p className="text-[10px] font-mono text-dark-500">@{c.username}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-brand-400">{c.trust_score ?? '—'}</p>
                <p className="text-[9px] text-dark-600">trust</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {contextList.length === 0 && q && (
        <p className="text-xs text-dark-500 text-center py-1 mb-2">No saved candidates match — fetch from GitHub below</p>
      )}

      {contextList.length === 0 && !q && (
        <p className="text-xs text-dark-500 text-center py-1 mb-2">No candidates saved yet — type a GitHub username to search</p>
      )}

      {/* Live fetch button */}
      <button
        onClick={handleFetch}
        disabled={!q.trim() || loading}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-500/15 border border-brand-500/25 text-brand-300 text-xs font-semibold hover:bg-brand-500/25 disabled:opacity-40 transition-all"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        {loading ? 'Fetching…' : 'Fetch from GitHub'}
      </button>
    </div>
  )
}

// ── Slot card ─────────────────────────────────────────────────────────────────
function SlotCard({ slot, candidate, color, onClear, onChangePick, picking, onSelect, exclude }) {
  return (
    <div>
      {candidate ? (
        <div className="glass-card gradient-border text-center relative">
          <button onClick={onClear}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/8 text-dark-400 hover:text-white transition-all"
          ><X size={13} /></button>

          {candidate.avatar
            ? <img src={candidate.avatar} alt={candidate.name}
                className="w-12 h-12 rounded-xl object-cover mx-auto mb-2 ring-2 ring-white/10"
              />
            : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-2"
                style={{ background: color + '25', color }}
              >{candidate.name[0]}</div>
          }
          <p className="font-bold text-white text-sm">{candidate.name}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color }}>@{candidate.username}</p>

          <div className="flex items-center justify-center gap-4 mt-3">
            <div>
              <p className="text-xl font-black" style={{ color }}>{candidate.trustScore}</p>
              <p className="text-[9px] text-dark-500">Trust</p>
            </div>
            <div>
              <p className="text-xl font-black text-emerald-400">{candidate.builderScore}</p>
              <p className="text-[9px] text-dark-500">Builder</p>
            </div>
          </div>

          {candidate.languages?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {candidate.languages.slice(0, 3).map(l => (
                <span key={l.name || l} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-dark-400">
                  <TechLogo name={l.name || l} size={10} />{l.name || l}
                </span>
              ))}
            </div>
          )}

          <button onClick={onChangePick} className="mt-3 text-[11px] text-brand-400 hover:text-brand-300 transition-colors">Change →</button>
        </div>
      ) : (
        <button onClick={onChangePick}
          className="w-full glass-card gradient-border text-center border-dashed hover:border-brand-500/40 transition-all py-8 group"
        >
          <Plus size={20} className="mx-auto mb-2 text-dark-500 group-hover:text-brand-400 transition-colors" />
          <p className="text-xs text-dark-400 group-hover:text-brand-300 transition-colors">Select Candidate</p>
        </button>
      )}

      {picking && (
        <CandidatePicker slot={slot} onSelect={c => { onSelect(c); }} exclude={exclude} />
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CandidateComparison() {
  const [selected, setSelected] = useState([null, null])
  const [picking,  setPicking]  = useState(null)   // 0 | 1 | null

  const clear = (slot) => {
    const next = [...selected]; next[slot] = null; setSelected(next); setPicking(null)
  }

  const pick = (slot, candidate) => {
    const next = [...selected]; next[slot] = candidate; setSelected(next); setPicking(null)
  }

  const [a, b] = selected

  const radarData = RADAR_DIMS.map(({ key, label, max }) => ({
    dim: label,
    ...(a ? { A: Math.round(((a.dims?.[key] ?? 0) / max) * 100) } : {}),
    ...(b ? { B: Math.round(((b.dims?.[key] ?? 0) / max) * 100) } : {}),
  }))

  // Check if radar has any real dimension data
  const hasRadar = (a && Object.keys(a.dims || {}).length > 0) || (b && Object.keys(b.dims || {}).length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompare className="text-cyan-400" size={22} /> Candidate Comparison
        </h1>
        <p className="text-sm text-dark-300 mt-1">Side-by-side deep comparison of any two GitHub developer profiles</p>
      </div>

      {/* Slot headers */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <SlotCard
          slot={0} candidate={a} color={SLOT_COLORS[0]}
          onClear={() => clear(0)}
          onChangePick={() => setPicking(picking === 0 ? null : 0)}
          picking={picking === 0}
          onSelect={c => pick(0, c)}
          exclude={[b?.username].filter(Boolean)}
        />

        <div className="flex flex-col items-center gap-2 pt-4">
          <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/8 flex items-center justify-center">
            <GitCompare size={18} className="text-dark-400" />
          </div>
          <span className="text-xs font-bold text-dark-400">VS</span>
        </div>

        <SlotCard
          slot={1} candidate={b} color={SLOT_COLORS[1]}
          onClear={() => clear(1)}
          onChangePick={() => setPicking(picking === 1 ? null : 1)}
          picking={picking === 1}
          onSelect={c => pick(1, c)}
          exclude={[a?.username].filter(Boolean)}
        />
      </div>

      {/* Comparison */}
      <AnimatePresence>
        {a && b && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

            {/* Head-to-head metrics */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-5">Head-to-Head Metrics</h3>
              <div className="space-y-4">
                {METRICS.map(({ key, label, icon: Icon, invert }) => {
                  const vA = a[key] ?? 0
                  const vB = b[key] ?? 0
                  const max = Math.max(vA, vB, 1)
                  // For inverted metrics (vibe risk), lower is better
                  const aWins = invert ? vA <= vB : vA >= vB
                  return (
                    <div key={key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {/* Left (slot A) */}
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-sm font-black ${aWins ? 'text-white' : 'text-dark-500'}`}>{vA}</span>
                        {aWins && <Star size={9} className="text-yellow-400 shrink-0" />}
                        <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(vA / max) * 100}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full rounded-full"
                            style={{ background: SLOT_COLORS[0] }}
                          />
                        </div>
                      </div>

                      {/* Centre label */}
                      <div className="flex items-center justify-center gap-1 text-[10px] text-dark-400 w-28 text-center shrink-0">
                        <Icon size={10} className="shrink-0" />
                        <span className="leading-tight">{label}</span>
                        {invert && <span className="text-dark-600 text-[8px]">(lower=better)</span>}
                      </div>

                      {/* Right (slot B) */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(vB / max) * 100}%` }}
                            transition={{ duration: 0.7 }}
                            className="h-full rounded-full"
                            style={{ background: SLOT_COLORS[1] }}
                          />
                        </div>
                        {!aWins && <Star size={9} className="text-yellow-400 shrink-0" />}
                        <span className={`text-sm font-black ${!aWins ? 'text-white' : 'text-dark-500'}`}>{vB}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Languages comparison */}
            <div className="grid grid-cols-2 gap-4">
              {[a, b].map((cand, i) => (
                <div key={cand.username} className="glass-card gradient-border">
                  <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: SLOT_COLORS[i] }}>
                    @{cand.username} — Languages
                  </h3>
                  {cand.languages?.length > 0 ? (
                    <div className="space-y-2">
                      {cand.languages.slice(0, 5).map(l => (
                        <div key={l.name} className="flex items-center gap-2">
                          <TechLogo name={l.name} size={12} />
                          <span className="text-xs text-dark-300 w-20 truncate">{l.name}</span>
                          <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${l.pct}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ background: SLOT_COLORS[i] }}
                            />
                          </div>
                          <span className="text-[10px] font-bold w-7 text-right" style={{ color: SLOT_COLORS[i] }}>{l.pct}%</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-dark-500 text-center py-2">No language data</p>}
                </div>
              ))}
            </div>

            {/* Radar — only if dimension data was fetched */}
            {hasRadar ? (
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-2">Trust Dimension Radar</h3>
                <p className="text-[11px] text-dark-500 mb-3">Each dimension normalized to 0–100. Only available when profiles are freshly fetched (not loaded from saved cache).</p>
                <div className="flex justify-center gap-6 mb-3">
                  {[a, b].map((c, i) => (
                    <span key={c.username} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: SLOT_COLORS[i] }}>
                      <span className="w-3 h-0.5 rounded inline-block" style={{ background: SLOT_COLORS[i] }} />
                      @{c.username}
                    </span>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                    <Radar dataKey="A" name={`@${a.username}`} stroke={SLOT_COLORS[0]} fill={SLOT_COLORS[0]} fillOpacity={0.15} strokeWidth={2} />
                    <Radar dataKey="B" name={`@${b.username}`} stroke={SLOT_COLORS[1]} fill={SLOT_COLORS[1]} fillOpacity={0.12} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="glass-card gradient-border border-brand-500/15 text-center py-5">
                <Brain size={20} className="mx-auto text-brand-400 mb-2" />
                <p className="text-xs text-dark-300">Radar chart requires trust dimension data.</p>
                <p className="text-xs text-dark-500 mt-0.5">Use the "Fetch from GitHub" option in the picker to load full dimension data.</p>
              </div>
            )}

            {/* Winner summary */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                {[a, b].map((cand, i) => {
                  const wins = METRICS.filter(({ key, invert }) => {
                    const vA = a[key] ?? 0, vB = b[key] ?? 0
                    return invert
                      ? (i === 0 ? vA <= vB : vB <= vA)
                      : (i === 0 ? vA >= vB : vB >= vA)
                  }).length
                  return (
                    <div key={cand.username} className="text-center p-4 rounded-xl border"
                      style={{ background: SLOT_COLORS[i] + '10', borderColor: SLOT_COLORS[i] + '30' }}
                    >
                      {cand.avatar
                        ? <img src={cand.avatar} alt={cand.name} className="w-10 h-10 rounded-xl object-cover mx-auto mb-2" />
                        : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black mx-auto mb-2 text-lg"
                            style={{ background: SLOT_COLORS[i] + '25', color: SLOT_COLORS[i] }}
                          >{cand.name[0]}</div>
                      }
                      <p className="text-sm font-bold text-white">{cand.name}</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: SLOT_COLORS[i] }}>@{cand.username}</p>
                      <p className="text-2xl font-black mt-2" style={{ color: SLOT_COLORS[i] }}>{wins}/{METRICS.length}</p>
                      <p className="text-[10px] text-dark-400">metrics won</p>
                      {wins > METRICS.length / 2 && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: SLOT_COLORS[i] + '20', color: SLOT_COLORS[i] }}
                        >
                          <CheckCircle size={9} /> Stronger Profile
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(!a || !b) && (
        <div className="text-center py-10 text-dark-500 text-sm">
          Select two candidates above to start comparing
        </div>
      )}
    </div>
  )
}
