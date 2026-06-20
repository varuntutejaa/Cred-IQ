import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_REPORTS = [
  { id: 1,  name: 'Varun Tuteja',   handle: 'varun-dev',  date: '2026-06-18', trust: 87, verdict: 'Highly Recommended', color: '#6366f1', status: 'complete' },
  { id: 2,  name: 'Arjun Mehta',    handle: 'arjunm',     date: '2026-06-17', trust: 91, verdict: 'Top Candidate',       color: '#f59e0b', status: 'complete' },
  { id: 3,  name: 'Rohan Kumar',    handle: 'rohanK',     date: '2026-06-17', trust: 83, verdict: 'Recommended',         color: '#06b6d4', status: 'complete' },
  { id: 4,  name: 'Priya Sharma',   handle: 'priya-dev',  date: '2026-06-15', trust: 79, verdict: 'Recommended',         color: '#10b981', status: 'complete' },
  { id: 5,  name: 'Sneha Rao',      handle: 'snehadev',   date: '2026-06-14', trust: 74, verdict: 'Needs Review',        color: '#ec4899', status: 'complete' },
  { id: 6,  name: 'Kiran Bhat',     handle: 'kiran-b',    date: '2026-06-14', trust: 88, verdict: 'Highly Recommended',  color: '#8b5cf6', status: 'complete' },
  { id: 7,  name: 'Dev Patel',      handle: 'devpatel',   date: '2026-06-13', trust: 92, verdict: 'Top Candidate',       color: '#f97316', status: 'complete' },
  { id: 8,  name: 'Ananya Tiwari',  handle: 'ananya-t',   date: '2026-06-12', trust: 65, verdict: 'Needs Review',        color: '#14b8a6', status: 'pending'  },
]

const VERDICT_COLORS = {
  'Top Candidate':       'bg-yellow-500/15  text-yellow-300  border-yellow-500/30',
  'Highly Recommended':  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Recommended':         'bg-brand-500/15   text-brand-300   border-brand-500/30',
  'Needs Review':        'bg-orange-500/15  text-orange-300  border-orange-500/30',
}

export default function Reports() {
  const [filter, setFilter] = useState('all')

  const filtered = MOCK_REPORTS.filter((r) => filter === 'all' || r.verdict === filter)
  const verdictCounts = MOCK_REPORTS.reduce((acc, r) => { acc[r.verdict] = (acc[r.verdict] || 0) + 1; return acc }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText size={20} className="text-brand-400" /> Reports</h1>
          <p className="text-sm text-dark-300 mt-1">Downloadable verification reports for every candidate</p>
        </div>
        <button onClick={() => toast.success('Batch export started!')}
          className="flex items-center gap-2 glass border border-white/10 hover:border-brand-500/30 hover:text-brand-300 text-dark-300 rounded-xl px-4 py-2 text-sm font-medium transition-all"
        >
          <Download size={14} /> Export All
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Reports',      value: MOCK_REPORTS.length, color: 'text-brand-400' },
          { label: 'Top Candidates',     value: verdictCounts['Top Candidate'] || 0,       color: 'text-yellow-400'  },
          { label: 'Recommended',        value: (verdictCounts['Highly Recommended'] || 0) + (verdictCounts['Recommended'] || 0), color: 'text-emerald-400' },
          { label: 'Needs Review',       value: verdictCounts['Needs Review'] || 0,         color: 'text-orange-400'  },
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
              filter === f ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'glass border-white/8 text-dark-400 hover:text-white'
            }`}
          >
            <Filter size={10} /> {f === 'all' ? 'All Reports' : f}
          </button>
        ))}
      </div>

      {/* Report table */}
      <div className="glass-card gradient-border overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Candidate', 'Trust Score', 'Verdict', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-dark-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-white/3 hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: r.color + '25', color: r.color }}>
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{r.name}</p>
                        <p className="text-[10px] font-mono" style={{ color: r.color }}>@{r.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-black" style={{ color: r.color }}>{r.trust}</span>
                    <span className="text-[10px] text-dark-500">/100</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex text-[10px] font-semibold px-2 py-1 rounded-lg border ${VERDICT_COLORS[r.verdict] || ''}`}>
                      {r.verdict}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-dark-400">{r.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'complete'
                      ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><CheckCircle size={10} /> Complete</span>
                      : <span className="flex items-center gap-1 text-[10px] text-yellow-400"><Clock size={10} /> Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => toast.success(`Viewing ${r.name}'s report`)}
                        className="p-1.5 rounded-lg glass border border-white/8 text-dark-400 hover:text-brand-300 hover:border-brand-500/25 transition-all"
                        title="View report"
                      >
                        <Eye size={12} />
                      </button>
                      <button onClick={() => toast.success(`Downloading ${r.name}'s report`)}
                        className="p-1.5 rounded-lg glass border border-white/8 text-dark-400 hover:text-emerald-300 hover:border-emerald-500/25 transition-all"
                        title="Download PDF"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText size={32} className="mx-auto text-dark-600 mb-2" />
            <p className="text-sm text-dark-400">No reports match this filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
