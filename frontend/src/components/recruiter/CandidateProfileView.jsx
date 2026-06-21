import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Shield, Rocket, Star, GitBranch, GitCommit, GitFork,
  Users, ExternalLink, CheckCircle, Code2, TrendingUp, Award,
  MapPin, BookMarked, Loader2
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

const VERDICT_STYLE = {
  'Top Candidate':      'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  'Highly Recommended': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Recommended':        'bg-brand-500/15 text-brand-300 border-brand-500/25',
  'Needs Review':       'bg-orange-500/15 text-orange-300 border-orange-500/25',
}

export default function CandidateProfileView() {
  const { username } = useParams()
  const navigate     = useNavigate()
  const { candidates, addCandidate, shortlists, addToShortlist, createShortlist } = useRecruiter()

  const [profile,  setProfile]  = useState(null)
  const [verify,   setVerify]   = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const cached = candidates.find(c => c.username === username)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setError('')

    Promise.all([
      axios.get(`/api/github/analyze/${username}`),
      axios.get(`/api/recruiter/quick-verify/${username}`),
      axios.get(`/api/github/activity/${username}`),
    ])
      .then(([profRes, verRes, actRes]) => {
        setProfile(profRes.data)
        setVerify(verRes.data)
        setActivity(actRes.data)

        // save to recruiter context
        const trust   = verRes.data.trust_score?.total   ?? 0
        const builder = verRes.data.builder_score?.total ?? 0
        const avg = (trust + builder) / 2
        const verdict = avg >= 80 ? 'Top Candidate' : avg >= 65 ? 'Highly Recommended' : avg >= 50 ? 'Recommended' : 'Needs Review'
        addCandidate({
          username,
          name:          profRes.data.name || username,
          avatar:        profRes.data.avatar,
          bio:           profRes.data.bio || '',
          trust_score:   trust,
          builder_score: builder,
          languages:     profRes.data.languages || [],
          top_repos:     profRes.data.top_repos  || [],
          public_repos:  profRes.data.public_repos  || 0,
          total_stars:   profRes.data.total_stars   || 0,
          followers:     profRes.data.followers     || 0,
          commit_count:  profRes.data.commit_count  || 0,
          vibe_risk:     verRes.data.vibe_analysis?.risk_score || 0,
          verdict,
        })
      })
      .catch(() => setError(`Could not load profile for @${username}`))
      .finally(() => setLoading(false))
  }, [username])

  const p = profile
  const td = verify?.trust_score?.dimensions || {}

  const languages    = p?.languages || []
  const topRepos     = p?.top_repos  || []
  const trust_score  = verify?.trust_score?.total   ?? 0
  const builder_score = verify?.builder_score?.total ?? 0
  const avg = (trust_score + builder_score) / 2
  const verdict = avg >= 80 ? 'Top Candidate' : avg >= 65 ? 'Highly Recommended' : avg >= 50 ? 'Recommended' : 'Needs Review'

  const pieData = languages.slice(0, 7).map((l, i) => ({
    name: l.name, value: l.pct, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  const radarData = [
    { dim: 'GitHub Depth',  v: td.github_depth    || 0 },
    { dim: 'Skill Evid.',   v: td.skill_evidence  || 0 },
    { dim: 'Consistency',   v: td.consistency     || 0 },
    { dim: 'Impact',        v: td.community       || 0 },
    { dim: 'Quality',       v: td.project_quality || 0 },
  ]

  const allDays     = activity?.weeks?.flatMap(w => w.days) ?? []
  const maxDay      = Math.max(...allDays, 1)
  const GRID        = allDays.map(c => toIntensity(c, maxDay))
  const monthlyData = activity?.monthly ?? []

  const handleShortlist = () => {
    if (shortlists.length === 0) {
      const sl = createShortlist('My Candidates')
      addToShortlist(sl.id, username)
    } else {
      addToShortlist(shortlists[0].id, username)
    }
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
      {/* back + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleShortlist}
            className="flex items-center gap-1.5 glass border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
          >
            <BookMarked size={13} /> Add to Shortlist
          </button>
          <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 glass border border-white/10 hover:border-brand-500/30 text-dark-300 hover:text-brand-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
          >
            <ExternalLink size={13} /> GitHub
          </a>
        </div>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card gradient-border"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative shrink-0">
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
              {verdict && (
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${VERDICT_STYLE[verdict] || 'bg-dark-700 text-dark-300'}`}>
                  {verdict}
                </span>
              )}
            </div>
            <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 text-xs font-mono hover:text-brand-300 transition-colors mt-0.5"
            >
              @{username} <ExternalLink size={10} />
            </a>
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
              ].map(({ icon: Icon, v, label }) => v != null && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {topRepos.slice(0, 4).map((r) => (
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

      {/* Verified Languages */}
      {languages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card gradient-border"
        >
          <h3 className="card-title"><CheckCircle size={14} className="text-emerald-400" /> Verified Languages</h3>
          <div className="space-y-2.5">
            {languages.slice(0, 6).map((l, i) => (
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
