import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Search, Zap, TrendingUp, CheckCircle, BarChart2,
  Star, ArrowRight, FileText, BookMarked, Plus
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { useRecruiter } from '../../context/RecruiterContext'

const VERDICT_COLORS = {
  'Top Candidate':      '#f59e0b',
  'Highly Recommended': '#10b981',
  'Recommended':        '#6366f1',
  'Needs Review':       '#f97316',
}

export default function RecruiterHome({ onAddCandidate }) {
  const { user }       = useAuth()
  const navigate       = useNavigate()
  const { candidates, shortlists } = useRecruiter()

  const avgTrust   = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + (c.trust_score || 0), 0) / candidates.length)
    : 0
  const shortlisted = shortlists.reduce((s, sl) => s + sl.candidateHandles.length, 0)

  // Build last-7-days activity from verified_at timestamps
  const today   = new Date()
  const days    = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const dayLabel = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const activityData = days.map((iso) => {
    const d   = new Date(iso)
    const cnt = candidates.filter((c) => c.verified_at?.slice(0, 10) === iso).length
    return { d: dayLabel[d.getDay()], verified: cnt, shortlisted: 0 }
  })

  const topCandidates = [...candidates]
    .sort((a, b) => ((b.trust_score || 0) + (b.builder_score || 0)) - ((a.trust_score || 0) + (a.builder_score || 0)))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-purple-400">{user?.name?.split(' ')[0] || 'Recruiter'}</span>
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            {user?.company ? `${user.company} · ` : ''}Recruiter Intelligence Dashboard
          </p>
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
          { icon: Users,       label: 'Candidates Verified', value: candidates.length, color: 'bg-brand-500/10 border-brand-500/20 text-brand-400',     sub: candidates.length === 0 ? 'None yet' : 'Total verified' },
          { icon: CheckCircle, label: 'Avg Trust Score',     value: avgTrust || '—',  color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', sub: 'Across all candidates' },
          { icon: FileText,    label: 'Shortlists Created',  value: shortlists.length, color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',   sub: `${shortlisted} total candidates` },
          { icon: Star,        label: 'Shortlisted',         value: shortlisted,       color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',   sub: 'Across all lists' },
        ].map(({ icon: Icon, label, value, color, sub }) => {
          const [bg, border, text] = color.split(' ')
          return (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className={`glass-card gradient-border border ${bg} ${border}`}
            >
              <Icon size={16} className={`${text} mb-2`} />
              <p className={`text-2xl font-black ${text}`}>{value}</p>
              <p className="text-xs text-dark-300 mt-0.5">{label}</p>
              <p className={`text-[10px] mt-1 font-medium ${text}`}>{sub}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp size={15} className="text-purple-400" /> Weekly Verifications
            </h3>
            <span className="text-xs text-dark-500">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="verGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="verified" stroke="#8b5cf6" strokeWidth={2} fill="url(#verGrad)" name="Verified" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Verdict breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card gradient-border"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 size={15} className="text-brand-400" /> Verdict Breakdown
          </h3>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <p className="text-xs text-dark-500">No candidates verified yet</p>
              <button onClick={onAddCandidate}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> Add first candidate
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(
                candidates.reduce((acc, c) => {
                  const v = c.verdict || 'Needs Review'
                  acc[v] = (acc[v] || 0) + 1
                  return acc
                }, {})
              ).map(([verdict, count]) => (
                <div key={verdict}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-300">{verdict}</span>
                    <span className="font-bold" style={{ color: VERDICT_COLORS[verdict] || '#64748b' }}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / candidates.length) * 100}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full"
                      style={{ background: VERDICT_COLORS[verdict] || '#6366f1' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Top candidates */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-card gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Star size={15} className="text-yellow-400" /> Top Verified Candidates
          </h3>
          <button onClick={() => navigate('/recruiter/search')}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={11} />
          </button>
        </div>

        {topCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users size={36} className="mx-auto text-dark-600 mb-3" />
            <p className="text-sm text-dark-400">No candidates yet</p>
            <p className="text-xs text-dark-500 mt-1">Verify a GitHub profile to get started</p>
            <button onClick={onAddCandidate}
              className="mt-4 flex items-center gap-1.5 mx-auto bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold rounded-xl px-5 py-2.5 text-sm shadow-glow transition-all"
            >
              <Plus size={14} /> Add Candidate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {topCandidates.map((c, i) => {
              const color = VERDICT_COLORS[c.verdict] || '#6366f1'
              return (
                <motion.div key={c.username}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                  className="glass rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                  onClick={() => navigate(`/recruiter/candidate/${c.username}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {c.avatar
                      ? <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-white/10" />
                      : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                          style={{ background: color + '25', color }}
                        >{(c.name || c.username)[0]}</div>
                    }
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{c.name || c.username}</p>
                      <p className="text-[10px] font-mono text-brand-400">@{c.username}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <div className="text-center bg-white/3 rounded-lg py-1">
                      <p className="text-xs font-black" style={{ color }}>{c.trust_score ?? '—'}</p>
                      <p className="text-[9px] text-dark-400">Trust</p>
                    </div>
                    <div className="text-center bg-white/3 rounded-lg py-1">
                      <p className="text-xs font-black text-emerald-400">{c.builder_score ?? '—'}</p>
                      <p className="text-[9px] text-dark-400">Builder</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(c.languages || []).slice(0, 2).map((l) => (
                      <span key={l.name || l} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-dark-300">
                        {l.name || l}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Shortlists quick view */}
      {shortlists.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="glass-card gradient-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BookMarked size={15} className="text-yellow-400" /> Shortlists
            </h3>
            <button onClick={() => navigate('/recruiter/shortlists')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight size={11} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {shortlists.map((sl) => (
              <button key={sl.id} onClick={() => navigate('/recruiter/shortlists')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/8 hover:border-white/15 transition-all"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: sl.color }} />
                <span className="text-xs text-white font-medium">{sl.name}</span>
                <span className="text-[10px] text-dark-500">{sl.candidateHandles.length}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
