import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GitBranch, Star, GitFork, GitCommit, Users, Code2,
  TrendingUp, Award, ArrowUpRight, Zap, RefreshCw
} from 'lucide-react'
import TechLogo from '../shared/TechLogo'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell
} from 'recharts'

const MOCK_GITHUB = {
  username:     'varun-dev',
  avatar:       null,
  name:         'Varun Tuteja',
  bio:          'Full Stack Developer | Open Source Enthusiast',
  followers:    284,
  following:    91,
  publicRepos:  47,
  totalStars:   312,
  totalForks:   89,
  contributions:847,
  overallScore: 92,
  scores: {
    backend:    88,
    frontend:   74,
    devops:     52,
    openSource: 67,
  },
  topLanguages: [
    { name: 'Python',     pct: 38, color: '#3b82f6' },
    { name: 'JavaScript', pct: 28, color: '#f59e0b' },
    { name: 'TypeScript', pct: 18, color: '#6366f1' },
    { name: 'HTML/CSS',   pct: 10, color: '#ec4899' },
    { name: 'Other',      pct: 6,  color: '#475569'  },
  ],
  topRepos: [
    { name: 'expense-tracker',   stars: 87,  forks: 23, lang: 'Python',     score: 94 },
    { name: 'ai-resume-builder', stars: 142, forks: 41, lang: 'TypeScript',  score: 89 },
    { name: 'dsa-solutions',     stars: 56,  forks: 18, lang: 'Python',     score: 82 },
    { name: 'portfolio-v3',      stars: 27,  forks: 7,  lang: 'React',      score: 91 },
  ],
  monthlyActivity: [
    { m: 'Jan', c: 42 },{ m: 'Feb', c: 67 },{ m: 'Mar', c: 55 },
    { m: 'Apr', c: 88 },{ m: 'May', c: 73 },{ m: 'Jun', c: 91 },
    { m: 'Jul', c: 64 },{ m: 'Aug', c: 78 },{ m: 'Sep', c: 82 },
    { m: 'Oct', c: 95 },{ m: 'Nov', c: 69 },{ m: 'Dec', c: 47 },
  ],
  radarData: [
    { skill: 'Code Quality',  v: 84 },
    { skill: 'Consistency',   v: 91 },
    { skill: 'Diversity',     v: 72 },
    { skill: 'Collaboration', v: 65 },
    { skill: 'Impact',        v: 78 },
    { skill: 'Activity',      v: 88 },
  ],
}

function ScoreBadge({ label, score, color }) {
  const cls = {
    brand:  'bg-brand-500/10 border-brand-500/20 text-brand-400',
    green:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  }[color]
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${cls}`}>
      <span className="text-xl font-black">{score}</span>
      <span className="text-[10px] text-dark-300">{label}</span>
    </div>
  )
}

export default function GitHubAnalyzer() {
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(false)
  const [data, setData]         = useState(null)

  const analyze = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setData(MOCK_GITHUB)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="text-brand-400" size={22} /> GitHub Analyzer
          </h1>
          <p className="text-sm text-dark-300 mt-1">Deep-dive analysis of any GitHub profile</p>
        </div>
        {data && (
          <button onClick={() => setData(null)} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> New Analysis
          </button>
        )}
      </div>

      {!data ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-border max-w-lg">
          <p className="text-sm font-semibold text-white mb-3">Enter GitHub username</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <GitBranch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
            <button onClick={analyze} disabled={loading} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} /> Analyze</>}
            </button>
          </div>
          <p className="text-xs text-dark-400 mt-3">Or click Analyze to load a demo profile</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Profile header */}
          <div className="glass-card gradient-border flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-3xl font-black shrink-0">
              {data.name[0]}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold">{data.name}</h2>
              <p className="text-brand-400 text-sm font-mono">@{data.username}</p>
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
                    <span className="font-semibold text-white">{v.toLocaleString()}</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center shrink-0">
              <p className="text-5xl font-black gradient-text">{data.overallScore}</p>
              <p className="text-xs text-dark-400 mt-1">Overall Score</p>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">Top 8% globally</p>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreBadge label="Backend"     score={data.scores.backend}    color="brand"  />
            <ScoreBadge label="Frontend"    score={data.scores.frontend}   color="green"  />
            <ScoreBadge label="DevOps"      score={data.scores.devops}     color="yellow" />
            <ScoreBadge label="Open Source" score={data.scores.openSource} color="purple" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly commits */}
            <div className="lg:col-span-2 glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-400" /> Monthly Commits
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.monthlyActivity}>
                  <XAxis dataKey="m" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="c" fill="#6366f1" radius={[4,4,0,0]} name="Commits" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Language pie */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Code2 size={16} className="text-brand-400" /> Languages
              </h3>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={data.topLanguages} dataKey="pct" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                    {data.topLanguages.map((l, i) => <Cell key={i} fill={l.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} formatter={(v, n) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {data.topLanguages.map((l) => (
                  <div key={l.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TechLogo name={l.name} size={16} />
                      <span className="text-xs text-dark-300">{l.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{l.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Award size={16} className="text-yellow-400" /> GitHub Quality Radar
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={data.radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Top repos */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" /> Top Repositories
              </h3>
              <div className="space-y-3">
                {data.topRepos.map((r, i) => (
                  <motion.div key={r.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
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
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-emerald-400">{r.score}</p>
                      <p className="text-[10px] text-dark-400">score</p>
                    </div>
                    <ArrowUpRight size={14} className="text-dark-400 group-hover:text-brand-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
