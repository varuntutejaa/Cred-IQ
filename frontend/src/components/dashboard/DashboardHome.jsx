import { motion } from 'framer-motion'
import {
  Shield, TrendingUp, CheckCircle, AlertTriangle, Github,
  Award, Rocket, Code2, ArrowUpRight, Zap, Star, GitCommit
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { useAuth } from '../../context/AuthContext'

const CONTRIBUTION_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const activityData = CONTRIBUTION_MONTHS.map((m, i) => ({
  month: m,
  commits: Math.floor(30 + Math.random() * 80),
  prs: Math.floor(2 + Math.random() * 15),
}))

const radarData = [
  { skill: 'Backend',     score: 88 },
  { skill: 'Frontend',    score: 74 },
  { skill: 'DevOps',      score: 52 },
  { skill: 'Open Source', score: 67 },
  { skill: 'Problem Solving', score: 91 },
  { skill: 'System Design',   score: 60 },
]

const GRID = Array.from({ length: 52 * 7 }, () => {
  const v = Math.random()
  if (v < 0.45) return 0
  if (v < 0.62) return 1
  if (v < 0.78) return 2
  if (v < 0.91) return 3
  return 4
})
const INTENSITY = ['bg-dark-700','bg-brand-900/60','bg-brand-700/70','bg-brand-500/80','bg-brand-400']

const STAT_CARDS = [
  { label: 'Trust Score',       value: '87',  unit: '/100', icon: Shield,    color: 'brand',   trend: '+4 this month' },
  { label: 'GitHub Score',      value: '92',  unit: '/100', icon: Github,    color: 'green',   trend: 'Top 8%'        },
  { label: 'Verified Skills',   value: '14',  unit: '',     icon: CheckCircle,color:'cyan',    trend: '3 pending'     },
  { label: 'Certifications',    value: '6',   unit: '',     icon: Award,     color: 'yellow',  trend: '1 unverified'  },
  { label: 'Live Deployments',  value: '9',   unit: '',     icon: Rocket,    color: 'purple',  trend: 'All healthy'   },
  { label: 'Flagged Claims',    value: '2',   unit: '',     icon: AlertTriangle, color: 'red', trend: 'Needs review'  },
]

const COLOR = {
  brand:  'bg-brand-500/10 border-brand-500/20 text-brand-400',
  green:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  cyan:   'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  red:    'bg-red-500/10 border-red-500/20 text-red-400',
}

const RECENT_ACTIVITY = [
  { icon: CheckCircle, color: 'text-emerald-400', msg: 'Python skill verified via 12 repositories',    time: '2m ago'  },
  { icon: AlertTriangle,color:'text-yellow-400',  msg: 'AWS claim needs supporting evidence',          time: '1h ago'  },
  { icon: Github,      color: 'text-brand-400',   msg: 'GitHub analysis completed — 92/100',          time: '3h ago'  },
  { icon: Rocket,      color: 'text-purple-400',  msg: 'expense-tracker.vercel.app verified live',    time: '5h ago'  },
  { icon: Award,       color: 'text-yellow-400',  msg: 'AWS Solutions Architect cert verified',        time: '1d ago'  },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function DashboardHome() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Developer'}</span> 👋
          </h1>
          <p className="text-sm text-dark-300 mt-1">Here's your verification overview for today</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Zap size={14} /> Run Full Analysis
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
      >
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          const c = COLOR[s.color].split(' ')
          return (
            <motion.div key={s.label} variants={item}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="glass-card glass-hover gradient-border p-4"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${c[0]} ${c[1]}`}>
                <Icon size={16} className={c[2]} />
              </div>
              <p className="text-2xl font-black text-white">{s.value}<span className="text-sm text-dark-400 font-normal">{s.unit}</span></p>
              <p className="text-xs text-dark-300 mt-0.5">{s.label}</p>
              <p className={`text-[10px] mt-1.5 font-medium ${c[2]}`}>{s.trend}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Middle row: chart + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2"><GitCommit size={16} className="text-brand-400" /> Commit Activity</h3>
              <p className="text-xs text-dark-400 mt-0.5">Last 12 months</p>
            </div>
            <span className="badge-verified">↑ 32% vs last year</span>
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
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="commits" stroke="#6366f1" strokeWidth={2} fill="url(#commitsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white flex items-center gap-2 mb-1"><Star size={16} className="text-yellow-400" /> Skill Radar</h3>
          <p className="text-xs text-dark-400 mb-2">Verified competency breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Contribution grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Code2 size={16} className="text-brand-400" /> GitHub Contributions</h3>
          <span className="text-xs text-dark-400">847 contributions in the last year</span>
        </div>
        <div className="grid grid-cols-[repeat(52,_1fr)] gap-[3px] overflow-hidden">
          {GRID.map((v, i) => (
            <div key={i} className={`aspect-square rounded-[2px] ${INTENSITY[v]}`} />
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-dark-400">Less</span>
          {INTENSITY.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
          <span className="text-[10px] text-dark-400">More</span>
        </div>
      </motion.div>

      {/* Bottom row: recent activity + top skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-brand-400" /> Recent Activity</h3>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dark-200 leading-relaxed">{a.msg}</p>
                  </div>
                  <span className="text-[10px] text-dark-400 whitespace-nowrap shrink-0">{a.time}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Verified skills quick view */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Verified Skills</h3>
          <div className="space-y-3">
            {[
              { skill: 'Python',     score: 96, repos: 12, status: 'verified' },
              { skill: 'React',      score: 89, repos: 7,  status: 'verified' },
              { skill: 'Flask',      score: 91, repos: 5,  status: 'verified' },
              { skill: 'MongoDB',    score: 78, repos: 4,  status: 'verified' },
              { skill: 'AWS',        score: 34, repos: 0,  status: 'warning'  },
              { skill: 'Kubernetes', score: 18, repos: 0,  status: 'warning'  },
            ].map((s, i) => (
              <motion.div key={s.skill} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                {s.status === 'verified'
                  ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  : <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
                }
                <span className="text-sm font-medium text-white w-24 shrink-0">{s.skill}</span>
                <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.score}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                    className={`h-full rounded-full ${s.status === 'verified' ? 'bg-gradient-to-r from-brand-500 to-emerald-500' : 'bg-yellow-500'}`}
                  />
                </div>
                <span className={`text-xs font-bold w-10 text-right ${s.status === 'verified' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {s.score}%
                </span>
                <span className="text-[10px] text-dark-400 w-12 text-right">{s.repos} repos</span>
              </motion.div>
            ))}
          </div>
          <button className="mt-4 text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View all 14 skills <ArrowUpRight size={12} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
