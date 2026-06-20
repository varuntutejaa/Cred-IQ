import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Users, Award } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts'

const TRUST_DIST = [
  { range: '0–50',  count: 3  },
  { range: '51–60', count: 8  },
  { range: '61–70', count: 14 },
  { range: '71–80', count: 31 },
  { range: '81–90', count: 48 },
  { range: '91–100',count: 19 },
]

const SKILL_FREQ = [
  { skill: 'Python',     count: 89 },
  { skill: 'React',      count: 76 },
  { skill: 'Docker',     count: 68 },
  { skill: 'AWS',        count: 62 },
  { skill: 'TypeScript', count: 57 },
  { skill: 'K8s',        count: 41 },
  { skill: 'Golang',     count: 34 },
  { skill: 'Rust',       count: 18 },
]

const MONTHLY = [
  { m: 'Jan', verified: 18, shortlisted: 7  },
  { m: 'Feb', verified: 24, shortlisted: 11 },
  { m: 'Mar', verified: 19, shortlisted: 8  },
  { m: 'Apr', verified: 32, shortlisted: 14 },
  { m: 'May', verified: 41, shortlisted: 17 },
  { m: 'Jun', verified: 56, shortlisted: 22 },
]

const VERDICT_PIE = [
  { name: 'Highly Recommended', value: 42, color: '#10b981' },
  { name: 'Recommended',        value: 91, color: '#6366f1' },
  { name: 'Needs Review',       value: 78, color: '#f59e0b' },
  { name: 'Not Recommended',    value: 36, color: '#ef4444' },
]

export default function RecruiterAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 size={20} className="text-brand-400" /> Analytics</h1>
        <p className="text-sm text-dark-300 mt-1">Pipeline and talent pool intelligence for your recruiter account</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users,     label: 'Total Pipeline',    value: '247', sub: 'candidates',  color: 'text-brand-400' },
          { icon: TrendingUp,label: 'Avg Trust Score',   value: '83',  sub: 'this month',  color: 'text-emerald-400' },
          { icon: Award,     label: 'Top Builder Score', value: '94%', sub: 'Varun T.',     color: 'text-yellow-400' },
          { icon: BarChart2, label: 'Verified Rate',     value: '68%', sub: 'of pipeline',  color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card gradient-border"
          >
            <Icon size={15} className={`${color} mb-2`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-dark-300 mt-0.5">{label}</p>
            <p className={`text-[10px] mt-1 ${color} opacity-70`}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Trust score distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-purple-400" /> Trust Score Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TRUST_DIST} barSize={24}>
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-brand-400" /> Verification Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="aVer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aShort" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="verified"    stroke="#6366f1" strokeWidth={2} fill="url(#aVer)"   name="Verified"    />
              <Area type="monotone" dataKey="shortlisted" stroke="#10b981" strokeWidth={2} fill="url(#aShort)" name="Shortlisted" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Skill frequency */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-yellow-400" /> Skill Frequency in Pool</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SKILL_FREQ} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Verdict breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Award size={15} className="text-emerald-400" /> Verdict Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={VERDICT_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {VERDICT_PIE.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
