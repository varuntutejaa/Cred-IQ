import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Zap, TrendingUp, CheckCircle, BarChart2, Star, ArrowRight, FileText } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'

const ACTIVITY = [
  { d: 'Mon', verified: 4, shortlisted: 2 },
  { d: 'Tue', verified: 7, shortlisted: 3 },
  { d: 'Wed', verified: 3, shortlisted: 1 },
  { d: 'Thu', verified: 9, shortlisted: 5 },
  { d: 'Fri', verified: 12, shortlisted: 6 },
  { d: 'Sat', verified: 5, shortlisted: 2 },
  { d: 'Sun', verified: 8, shortlisted: 4 },
]

const TOP_CANDIDATES = [
  { name: 'Arjun M.',  handle: 'arjunm',     trust: 91, builder: 88, color: '#f59e0b', skills: ['Java','AWS','Docker']  },
  { name: 'Varun T.',  handle: 'varun-dev',   trust: 87, builder: 94, color: '#6366f1', skills: ['Python','React','Flask'] },
  { name: 'Rohan K.',  handle: 'rohanK',      trust: 83, builder: 85, color: '#06b6d4', skills: ['K8s','Terraform','AWS'] },
  { name: 'Priya S.',  handle: 'priya-dev',   trust: 79, builder: 81, color: '#10b981', skills: ['Vue','Node.js','PostgreSQL'] },
]

const SKILL_TRENDS = [
  { skill: 'Python',     demand: 94, supply: 78 },
  { skill: 'TypeScript', demand: 89, supply: 61 },
  { skill: 'AWS',        demand: 86, supply: 54 },
  { skill: 'Docker',     demand: 82, supply: 66 },
  { skill: 'React',      demand: 79, supply: 83 },
]

export default function RecruiterHome() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-purple-400">{user?.name?.split(' ')[0] || 'Recruiter'}</span> 👋
          </h1>
          <p className="text-sm text-dark-300 mt-1">{user?.company} · Recruiter Intelligence Dashboard</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/recruiter/verify')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 hover:from-purple-500 hover:to-brand-400 text-white font-semibold rounded-xl px-5 py-2.5 text-sm shadow-glow transition-all"
          >
            <Zap size={15} /> Quick Verify
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/recruiter/search')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Search size={14} /> Search Candidates
          </motion.button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users,       label: 'Candidates Verified',   value: '247',  color: 'bg-brand-500/10 border-brand-500/20 text-brand-400',   trend: '+18 this week' },
          { icon: CheckCircle, label: 'Avg Trust Score',       value: '83',   color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', trend: 'Top pool avg'  },
          { icon: FileText,    label: 'Reports Generated',     value: '62',   color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', trend: '12 this week'  },
          { icon: Star,        label: 'Shortlisted',           value: '34',   color: 'bg-purple-500/10 border-purple-500/20 text-purple-400', trend: '5 new'         },
        ].map(({ icon: Icon, label, value, color, trend }) => {
          const [bg, border, text] = color.split(' ')
          return (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className={`glass-card gradient-border border ${bg} ${border}`}
            >
              <Icon size={16} className={`${text} mb-2`} />
              <p className={`text-2xl font-black ${text}`}>{value}</p>
              <p className="text-xs text-dark-300 mt-0.5">{label}</p>
              <p className={`text-[10px] mt-1 font-medium ${text}`}>{trend}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><TrendingUp size={15} className="text-purple-400" /> Weekly Activity</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-purple-300"><span className="w-2 h-0.5 rounded bg-purple-400 inline-block" /> Verified</span>
              <span className="flex items-center gap-1 text-brand-300"><span className="w-2 h-0.5 rounded bg-brand-400 inline-block" /> Shortlisted</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={ACTIVITY}>
              <defs>
                <linearGradient id="verGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="shortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="verified"    stroke="#8b5cf6" strokeWidth={2} fill="url(#verGrad)"   name="Verified"    />
              <Area type="monotone" dataKey="shortlisted" stroke="#6366f1" strokeWidth={2} fill="url(#shortGrad)" name="Shortlisted" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skill demand */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-brand-400" /> Skill Demand</h3>
          <div className="space-y-3">
            {SKILL_TRENDS.map((s) => (
              <div key={s.skill}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-dark-300">{s.skill}</span>
                  <span className="text-dark-400">{s.demand}% demand</span>
                </div>
                <div className="relative h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.supply}%` }} transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-brand-500" />
                  <div className="absolute top-0 bottom-0 border-r-2 border-purple-400 border-dashed" style={{ left: `${s.demand}%` }} />
                </div>
                <div className="flex justify-between text-[9px] mt-0.5">
                  <span className="text-brand-400">Supply: {s.supply}%</span>
                  <span className="text-purple-400">Gap: {s.demand - s.supply}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top candidates */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-card gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Star size={15} className="text-yellow-400" /> Top Verified Candidates</h3>
          <button onClick={() => navigate('/recruiter/search')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={11} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {TOP_CANDIDATES.map((c, i) => (
            <motion.div key={c.handle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
              className="glass rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              onClick={() => navigate('/recruiter/search')}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0" style={{ background: c.color + '25', color: c.color }}>
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                  <p className="text-[10px] font-mono" style={{ color: c.color }}>@{c.handle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="text-center bg-white/3 rounded-lg py-1">
                  <p className="text-xs font-black" style={{ color: c.color }}>{c.trust}</p>
                  <p className="text-[9px] text-dark-400">Trust</p>
                </div>
                <div className="text-center bg-white/3 rounded-lg py-1">
                  <p className="text-xs font-black text-emerald-400">{c.builder}%</p>
                  <p className="text-[9px] text-dark-400">Builder</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.skills.slice(0, 2).map((s) => (
                  <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-dark-300">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
