import { motion } from 'framer-motion'
import {
  Shield, TrendingUp, CheckCircle, AlertTriangle,
  Award, Rocket, Code2, ArrowUpRight, Zap, Star, GitCommit, GitBranch, Users
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import TechLogo from '../shared/TechLogo'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const INTENSITY = ['bg-dark-700','bg-brand-900/60','bg-brand-700/70','bg-brand-500/80','bg-brand-400']
const GRID = Array.from({ length: 52 * 7 }, () => {
  const v = Math.random()
  if (v < 0.45) return 0; if (v < 0.62) return 1; if (v < 0.78) return 2; if (v < 0.91) return 3; return 4
})

const COLOR = {
  brand:  'bg-brand-500/10 border-brand-500/20 text-brand-400',
  green:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  cyan:   'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  red:    'bg-red-500/10 border-red-500/20 text-red-400',
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function DashboardHome() {
  const { user } = useAuth()

  const isReal    = !!user?.is_demo || !!user?.github_username
  const languages = user?.languages || []
  const topRepos  = user?.top_repos  || []

  // Stat cards — use real values when available
  const statCards = [
    { label: 'Trust Score',      value: user?.trust_score   ?? '—',  unit: user?.trust_score   ? '/100' : '', icon: Shield,       color: 'brand',  trend: 'Verified by CredIQ'  },
    { label: 'Builder Score',    value: user?.builder_score ?? '—',  unit: user?.builder_score ? '/100' : '', icon: Rocket,       color: 'purple', trend: 'Production readiness' },
    { label: 'Public Repos',     value: user?.public_repos  ?? '—',  unit: '',                                icon: GitBranch,    color: 'green',  trend: 'GitHub verified'      },
    { label: 'Total Stars',      value: user?.total_stars   ?? '—',  unit: '',                                icon: Star,         color: 'yellow', trend: 'Across all repos'     },
    { label: 'Followers',        value: user?.followers     ?? '—',  unit: '',                                icon: Users,        color: 'cyan',   trend: 'GitHub followers'     },
    { label: 'Commits / yr',     value: user?.commit_count  ?? '—',  unit: '',                                icon: GitCommit,    color: 'brand',  trend: 'Last 12 months'       },
  ]

  // Activity chart — derived from commit count
  const commitCount = user?.commit_count || 0
  const activityData = MONTHS.map((m, i) => ({
    month:   m,
    commits: Math.max(0, Math.floor((commitCount / 12) * (0.6 + Math.random() * 0.8))),
  }))

  // Radar — derived from trust breakdown
  const td = user?.trust_breakdown || {}
  const radarData = [
    { skill: 'GitHub Depth',    score: td.github_depth    ?? 60 },
    { skill: 'Skill Evidence',  score: td.skill_evidence  ?? 55 },
    { skill: 'Project Quality', score: td.project_quality ?? 50 },
    { skill: 'Consistency',     score: td.consistency     ?? 45 },
    { skill: 'Community',       score: td.community       ?? 40 },
  ]

  // Verified skills from real languages
  const skills = languages.slice(0, 6).map((l) => ({
    skill:  l.name,
    score:  l.pct,
    repos:  l.repos,
    status: l.pct >= 30 ? 'verified' : 'low',
  }))

  const recentActivity = user?.github_username ? [
    { icon: GitBranch,    color: 'text-brand-400',   msg: `GitHub profile loaded — ${user.public_repos ?? 0} public repos found`, time: 'just now' },
    { icon: Shield,       color: 'text-emerald-400', msg: `Trust Score computed: ${user.trust_score ?? '—'}/100`,                  time: 'just now' },
    { icon: Rocket,       color: 'text-purple-400',  msg: `Builder Score: ${user.builder_score ?? '—'}/100`,                       time: 'just now' },
    { icon: Star,         color: 'text-yellow-400',  msg: `${user.total_stars ?? 0} total stars earned across all repos`,          time: 'just now' },
    { icon: Code2,        color: 'text-cyan-400',    msg: `Top languages: ${languages.slice(0,3).map(l=>l.name).join(', ')}`,      time: 'just now' },
  ] : [
    { icon: CheckCircle,    color: 'text-emerald-400', msg: 'Python skill verified via 12 repositories',  time: '2m ago'  },
    { icon: AlertTriangle,  color: 'text-yellow-400',  msg: 'AWS claim needs supporting evidence',        time: '1h ago'  },
    { icon: GitBranch,      color: 'text-brand-400',   msg: 'GitHub analysis completed — 92/100',         time: '3h ago'  },
    { icon: Rocket,         color: 'text-purple-400',  msg: 'expense-tracker.vercel.app verified live',   time: '5h ago'  },
    { icon: Award,          color: 'text-yellow-400',  msg: 'AWS Solutions Architect cert verified',      time: '1d ago'  },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Developer'}</span> 👋
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            {user?.github_username
              ? <>Showing live data for <span className="text-brand-400 font-medium">@{user.github_username}</span></>
              : 'Here\'s your verification overview for today'}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Zap size={14} /> Run Full Analysis
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
      >
        {statCards.map((s) => {
          const Icon = s.icon
          const c    = COLOR[s.color].split(' ')
          return (
            <motion.div key={s.label} variants={item}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="glass-card glass-hover gradient-border p-4"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${c[0]} ${c[1]}`}>
                <Icon size={16} className={c[2]} />
              </div>
              <p className="text-2xl font-black text-white">
                {s.value}<span className="text-sm text-dark-400 font-normal">{s.unit}</span>
              </p>
              <p className="text-xs text-dark-300 mt-0.5">{s.label}</p>
              <p className={`text-[10px] mt-1.5 font-medium ${c[2]}`}>{s.trend}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Middle row: chart + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2"><GitCommit size={16} className="text-brand-400" /> Commit Activity</h3>
              <p className="text-xs text-dark-400 mt-0.5">Last 12 months · {user?.commit_count ?? 0} total commits</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#818cf8' }} />
              <Area type="monotone" dataKey="commits" stroke="#6366f1" strokeWidth={2} fill="url(#commitsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white flex items-center gap-2 mb-1"><Star size={16} className="text-yellow-400" /> Score Radar</h3>
          <p className="text-xs text-dark-400 mb-2">Trust score dimensions</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top repos (real) — only shown when we have them */}
      {topRepos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4"><Star size={16} className="text-yellow-400" /> Top Repositories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {topRepos.slice(0, 4).map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                className="glass glass-hover rounded-xl p-3 border border-white/5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TechLogo name={r.lang} size={14} />
                    <span className="text-[10px] text-dark-400">{r.lang}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                    <Star size={10} /> {r.stars}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors truncate">{r.name}</p>
                <p className="text-[11px] text-dark-400 mt-1 line-clamp-2 leading-relaxed">{r.desc || 'No description'}</p>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contribution grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Code2 size={16} className="text-brand-400" /> GitHub Contributions</h3>
          <span className="text-xs text-dark-400">{user?.commit_count ?? '—'} contributions in the last year</span>
        </div>
        <div className="grid grid-cols-[repeat(52,_1fr)] gap-[3px] overflow-hidden">
          {GRID.map((v, i) => <div key={i} className={`aspect-square rounded-[2px] ${INTENSITY[v]}`} />)}
        </div>
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-dark-400">Less</span>
          {INTENSITY.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
          <span className="text-[10px] text-dark-400">More</span>
        </div>
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-brand-400" /> Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className={a.color} />
                  </div>
                  <p className="flex-1 text-xs text-dark-200 leading-relaxed">{a.msg}</p>
                  <span className="text-[10px] text-dark-400 whitespace-nowrap shrink-0">{a.time}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Language Skills</h3>
          {skills.length > 0 ? (
            <div className="space-y-3">
              {skills.map((s, i) => (
                <motion.div key={s.skill} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <TechLogo name={s.skill} size={15} />
                  <span className="text-sm font-medium text-white w-24 shrink-0">{s.skill}</span>
                  <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                    />
                  </div>
                  <span className="text-xs font-bold w-10 text-right text-emerald-400">{s.score}%</span>
                  <span className="text-[10px] text-dark-400 w-14 text-right">{s.repos} repos</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { skill: 'Python',  score: 96, repos: 12 },
                { skill: 'React',   score: 89, repos: 7  },
                { skill: 'Flask',   score: 91, repos: 5  },
                { skill: 'MongoDB', score: 78, repos: 4  },
              ].map((s, i) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <TechLogo name={s.skill} size={15} />
                  <span className="text-sm font-medium text-white w-24 shrink-0">{s.skill}</span>
                  <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                    />
                  </div>
                  <span className="text-xs font-bold w-10 text-right text-emerald-400">{s.score}%</span>
                  <span className="text-[10px] text-dark-400 w-14 text-right">{s.repos} repos</span>
                </div>
              ))}
            </div>
          )}
          <button className="mt-4 text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View full skill map <ArrowUpRight size={12} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
