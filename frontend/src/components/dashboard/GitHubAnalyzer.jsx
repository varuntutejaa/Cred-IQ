import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Star, GitFork, GitCommit, Users, Code2, TrendingUp, Award, ArrowUpRight, Zap, RefreshCw } from 'lucide-react'
import TechLogo from '../shared/TechLogo'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444','#14b8a6']

function ScoreBadge({ label, score, color }) {
  const cls = { brand:'bg-brand-500/10 border-brand-500/20 text-brand-400', green:'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', yellow:'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', purple:'bg-purple-500/10 border-purple-500/20 text-purple-400' }[color]
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${cls}`}>
      <span className="text-xl font-black">{score ?? '—'}</span>
      <span className="text-[10px] text-dark-300">{label}</span>
    </div>
  )
}

export default function GitHubAnalyzer() {
  const { user } = useAuth()
  const [username, setUsername] = useState(user?.github_username || '')
  const [loading, setLoading]   = useState(false)
  const [data, setData]         = useState(() => user?.github_username ? buildFromUser(user) : null)

  function buildFromUser(u) {
    return {
      username:      u.github_username,
      name:          u.name,
      avatar:        u.avatar,
      bio:           u.bio || '',
      followers:     u.followers || 0,
      following:     u.following || 0,
      publicRepos:   u.public_repos || 0,
      totalStars:    u.total_stars || 0,
      totalForks:    u.total_forks || 0,
      contributions: u.commit_count || 0,
      overallScore:  u.trust_score || 0,
      languages:     (u.languages || []).map((l, i) => ({ name: l.name, pct: l.pct, color: PIE_COLORS[i % PIE_COLORS.length] })),
      topRepos:      (u.top_repos || []).slice(0, 4),
      trust_breakdown: u.trust_breakdown || {},
    }
  }

  const analyze = async () => {
    const handle = username.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '')
    if (!handle) { toast.error('Enter a GitHub username'); return }
    setLoading(true)
    try {
      const { data: res } = await axios.get(`/api/github/analyze/${handle}`)
      setData({
        username:      res.username,
        name:          res.name,
        avatar:        res.avatar,
        bio:           res.bio,
        followers:     res.followers,
        following:     res.following,
        publicRepos:   res.public_repos,
        totalStars:    res.total_stars,
        totalForks:    res.total_forks,
        contributions: res.commit_count,
        overallScore:  null,
        languages:     (res.languages || []).map((l, i) => ({ name: l.name, pct: l.pct, color: PIE_COLORS[i % PIE_COLORS.length] })),
        topRepos:      res.top_repos || [],
        trust_breakdown: {},
      })
      toast.success(`Loaded @${res.username}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'GitHub fetch failed')
    } finally { setLoading(false) }
  }

  // Simulated monthly spread from total commits
  const commitCount = data?.contributions || 0
  const monthlyActivity = MONTHS.map((m) => ({ m, c: Math.max(1, Math.floor((commitCount / 12) * (0.5 + Math.random() * 1.0))) }))

  const radarData = [
    { skill: 'Consistency',  v: data?.trust_breakdown?.consistency     || Math.min(Math.round(commitCount / 8), 100) },
    { skill: 'Diversity',    v: data?.trust_breakdown?.skill_evidence  || Math.min((data?.languages?.length || 0) * 15, 100) },
    { skill: 'Activity',     v: data?.trust_breakdown?.github_depth    || Math.min(Math.round((data?.publicRepos || 0) * 2), 100) },
    { skill: 'Impact',       v: data?.trust_breakdown?.community       || Math.min(Math.round((data?.totalStars || 0) / 3), 100) },
    { skill: 'Projects',     v: data?.trust_breakdown?.project_quality || Math.min(Math.round((data?.publicRepos || 0) * 1.5), 100) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="text-brand-400" size={22} /> GitHub Analyzer</h1>
          <p className="text-sm text-dark-300 mt-1">Deep-dive analysis of any GitHub profile</p>
        </div>
        {data && (
          <button onClick={() => { setData(null); setUsername('') }} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> New Analysis
          </button>
        )}
      </div>

      {!data ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-border max-w-lg">
          <p className="text-sm font-semibold text-white mb-3">Enter GitHub username or URL</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <GitBranch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type="text" placeholder="e.g. torvalds or github.com/torvalds"
                value={username} onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
            <button onClick={analyze} disabled={loading} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} /> Analyze</>}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Profile header */}
          <div className="glass-card gradient-border flex flex-col md:flex-row items-center md:items-start gap-6">
            {data.avatar
              ? <img src={data.avatar} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt={data.name} />
              : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-3xl font-black shrink-0">{data.name?.[0]}</div>
            }
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold">{data.name}</h2>
              <a href={`https://github.com/${data.username}`} target="_blank" rel="noopener noreferrer"
                className="text-brand-400 text-sm font-mono hover:text-brand-300 transition-colors">@{data.username}</a>
              <p className="text-dark-300 text-sm mt-1">{data.bio}</p>
              <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                {[
                  { icon: Users,     v: data.followers,    l: 'followers'    },
                  { icon: Code2,     v: data.publicRepos,  l: 'repos'        },
                  { icon: Star,      v: data.totalStars,   l: 'stars'        },
                  { icon: GitFork,   v: data.totalForks,   l: 'forks'        },
                  { icon: GitCommit, v: data.contributions,l: 'contributions'},
                ].map(({ icon: Icon, v, l }) => (
                  <div key={l} className="flex items-center gap-1.5 text-sm text-dark-300">
                    <Icon size={14} className="text-dark-400" />
                    <span className="font-semibold text-white">{(v || 0).toLocaleString()}</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            {data.overallScore !== null && (
              <div className="text-center shrink-0">
                <p className="text-5xl font-black gradient-text">{data.overallScore}</p>
                <p className="text-xs text-dark-400 mt-1">Trust Score</p>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-brand-400" /> Monthly Commits (est.)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyActivity}>
                  <XAxis dataKey="m" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="c" fill="#6366f1" radius={[4,4,0,0]} name="Commits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Code2 size={16} className="text-brand-400" /> Languages</h3>
              {data.languages.length > 0 && (
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={data.languages} dataKey="pct" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}>
                      {data.languages.map((l, i) => <Cell key={i} fill={l.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="space-y-2 mt-2">
                {data.languages.slice(0, 5).map((l) => (
                  <div key={l.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><TechLogo name={l.name} size={14} /><span className="text-xs text-dark-300">{l.name}</span></div>
                    <span className="text-xs font-semibold text-white">{l.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Award size={16} className="text-yellow-400" /> Profile Radar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Top Repositories</h3>
              <div className="space-y-3">
                {data.topRepos.map((r, i) => (
                  <a key={r.name} href={r.url || `https://github.com/${data.username}/${r.name}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white font-mono truncate">{r.name}</p>
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-300">
                          <TechLogo name={r.lang} size={11} />{r.lang}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-dark-400 flex items-center gap-1"><Star size={10} />{r.stars}</span>
                        <span className="text-xs text-dark-400 flex items-center gap-1"><GitFork size={10} />{r.forks}</span>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-dark-400 group-hover:text-brand-400 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
