import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Github, Zap, GitCommit, PlusCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const MOCK_TEAM = {
  repo: 'ai-resume-builder',
  totalCommits: 243,
  contributors: [
    { name: 'Varun T.',   handle: 'varun-dev',   pct: 45, commits: 109, color: '#6366f1', additions: 8420, deletions: 2100 },
    { name: 'Arjun M.',  handle: 'arjunm',      pct: 30, commits: 73,  color: '#10b981', additions: 5230, deletions: 1840 },
    { name: 'Sneha R.',  handle: 'snehadev',    pct: 15, commits: 36,  color: '#f59e0b', additions: 2100, deletions: 640  },
    { name: 'Rohan K.',  handle: 'rohanK',      pct: 10, commits: 25,  color: '#8b5cf6', additions: 1250, deletions: 310  },
  ],
  timeline: [
    { week: 'W1', varun: 12, arjun: 8,  sneha: 3, rohan: 2 },
    { week: 'W2', varun: 18, arjun: 11, sneha: 5, rohan: 4 },
    { week: 'W3', varun: 9,  arjun: 14, sneha: 7, rohan: 2 },
    { week: 'W4', varun: 22, arjun: 10, sneha: 4, rohan: 6 },
    { week: 'W5', varun: 15, arjun: 9,  sneha: 6, rohan: 3 },
    { week: 'W6', varun: 33, arjun: 21, sneha: 11,rohan: 8 },
  ],
}

export default function TeamAnalyzer() {
  const [url, setUrl]   = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  const analyze = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setData(MOCK_TEAM)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-yellow-400" size={22} /> Team Contribution Analyzer
        </h1>
        <p className="text-sm text-dark-300 mt-1">See who actually built what in any repository</p>
      </div>

      {!data ? (
        <div className="glass-card gradient-border max-w-lg">
          <p className="text-sm font-semibold text-white mb-3">Enter repository URL</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type="text" placeholder="github.com/org/repo"
                value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
            <button onClick={analyze} disabled={loading} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} /> Analyze</>}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="glass-card gradient-border">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white font-mono">{data.repo}</h3>
              <span className="text-xs text-dark-400">{data.totalCommits} total commits</span>
            </div>
            <p className="text-xs text-dark-400">{data.contributors.length} contributors analyzed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie chart */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4">Contribution Breakdown</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={data.contributors} dataKey="pct" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      {data.contributors.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                      formatter={(v, n) => [`${v}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data.contributors.map((c) => (
                    <div key={c.handle}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                          <span className="text-xs font-medium text-white">{c.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: c.color }}>{c.pct}%</span>
                      </div>
                      <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full" style={{ background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contributor cards */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4">Contributor Details</h3>
              <div className="space-y-3">
                {data.contributors.map((c, i) => (
                  <motion.div key={c.handle} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: c.color + '25', color: c.color }}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-dark-400 font-mono">@{c.handle}</p>
                    </div>
                    <div className="text-right text-xs shrink-0">
                      <p className="font-bold" style={{ color: c.color }}>{c.commits} commits</p>
                      <p className="text-dark-400">+{c.additions.toLocaleString()} -{c.deletions.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card gradient-border">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><GitCommit size={16} className="text-brand-400" /> Commit Timeline by Contributor</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.timeline}>
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                {data.contributors.map((c) => (
                  <Bar key={c.handle} dataKey={c.handle.replace('-dev', '').replace('dev', '')} stackId="a" fill={c.color} radius={[0,0,0,0]} name={c.name} />
                ))}
                <Bar dataKey="varun" stackId="a" fill="#6366f1" name="Varun T." />
                <Bar dataKey="arjun" stackId="a" fill="#10b981" name="Arjun M." />
                <Bar dataKey="sneha" stackId="a" fill="#f59e0b" name="Sneha R." radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
}
