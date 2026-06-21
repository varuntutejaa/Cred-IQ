import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, CheckCircle, Filter, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRecruiter } from '../../context/RecruiterContext'

const VERDICT_COLORS = {
  'Top Candidate':      'bg-yellow-500/15  text-yellow-300  border-yellow-500/30',
  'Highly Recommended': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Recommended':        'bg-brand-500/15   text-brand-300   border-brand-500/30',
  'Needs Review':       'bg-orange-500/15  text-orange-300  border-orange-500/30',
}

const AVATAR_COLOR = (username) => {
  const hues = ['#6366f1','#8b5cf6','#f59e0b','#10b981','#06b6d4','#ec4899','#f97316']
  return hues[username.charCodeAt(0) % hues.length]
}

export default function Reports() {
  const navigate = useNavigate()
  const { candidates } = useRecruiter()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? candidates
    : candidates.filter((c) => c.verdict === filter)

  const verdictCounts = candidates.reduce((acc, c) => {
    const v = c.verdict || 'Needs Review'
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={20} className="text-brand-400" /> Reports
          </h1>
          <p className="text-sm text-dark-300 mt-1">Verification records for every candidate you've reviewed</p>
        </div>
        <button onClick={() => toast.success('Batch export coming soon!')}
          className="flex items-center gap-2 glass border border-white/10 hover:border-brand-500/30 hover:text-brand-300 text-dark-300 rounded-xl px-4 py-2 text-sm font-medium transition-all"
        >
          <Download size={14} /> Export All
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Reports',  value: candidates.length,                                                                             color: 'text-brand-400'   },
          { label: 'Top Candidates', value: verdictCounts['Top Candidate'] || 0,                                                           color: 'text-yellow-400'  },
          { label: 'Recommended',    value: (verdictCounts['Highly Recommended'] || 0) + (verdictCounts['Recommended'] || 0),             color: 'text-emerald-400' },
          { label: 'Needs Review',   value: verdictCounts['Needs Review'] || 0,                                                            color: 'text-orange-400'  },
        ].map(({ label, value, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card gradient-border"
          >
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-dark-300 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Top Candidate', 'Highly Recommended', 'Recommended', 'Needs Review'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              filter === f
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-300'
                : 'glass border-white/8 text-dark-400 hover:text-white'
            }`}
          >
            <Filter size={10} /> {f === 'all' ? 'All Reports' : f}
          </button>
        ))}
      </div>

      {candidates.length === 0 ? (
        <div className="glass-card gradient-border text-center py-16">
          <Users size={40} className="mx-auto text-dark-600 mb-3" />
          <p className="text-sm text-dark-400">No candidates verified yet</p>
          <p className="text-xs text-dark-500 mt-1">Use Quick Verify or Candidate Search to add developers</p>
        </div>
      ) : (
        <div className="glass-card gradient-border overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Candidate', 'Trust', 'Builder', 'Verdict', 'Verified', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-dark-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const color = AVATAR_COLOR(c.username)
                  return (
                    <motion.tr key={c.username}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-white/3 hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => navigate(`/recruiter/candidate/${c.username}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {c.avatar
                            ? <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-white/10" />
                            : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                style={{ background: color + '25', color }}
                              >{(c.name || c.username)[0]}</div>
                          }
                          <div>
                            <p className="text-xs font-semibold text-white">{c.name || c.username}</p>
                            <p className="text-[10px] font-mono" style={{ color }}>@{c.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black" style={{ color }}>{c.trust_score ?? '—'}</span>
                        <span className="text-[10px] text-dark-500">/100</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-emerald-400">{c.builder_score ?? '—'}</span>
                        <span className="text-[10px] text-dark-500">/100</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-[10px] font-semibold px-2 py-1 rounded-lg border ${VERDICT_COLORS[c.verdict] || 'bg-dark-700 text-dark-300 border-dark-600'}`}>
                          {c.verdict || 'Unrated'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-dark-400">{formatDate(c.verified_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/recruiter/candidate/${c.username}`)}
                            className="p-1.5 rounded-lg glass border border-white/8 text-dark-400 hover:text-brand-300 hover:border-brand-500/25 transition-all"
                            title="View full profile"
                          >
                            <Eye size={12} />
                          </button>
                          <button onClick={() => toast.success(`Report for @${c.username} ready!`)}
                            className="p-1.5 rounded-lg glass border border-white/8 text-dark-400 hover:text-emerald-300 hover:border-emerald-500/25 transition-all"
                            title="Download PDF"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle size={32} className="mx-auto text-dark-600 mb-2" />
              <p className="text-sm text-dark-400">No reports match this filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
