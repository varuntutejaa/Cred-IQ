import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, GitBranch, Zap, GitCommit, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = ['Fetching repository', 'Loading contributor stats', 'Building commit timeline', 'Crunching the numbers']

function parseRepoInput(raw) {
  const cleaned = raw.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '')
    .replace(/\/$/, '')
  const parts = cleaned.split('/')
  if (parts.length >= 2) return { owner: parts[0], repo: parts[1] }
  return null
}

export default function TeamAnalyzer() {
  const [url, setUrl]       = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep]     = useState(0)
  const [data, setData]     = useState(null)
  const [error, setError]   = useState(null)

  const analyze = async () => {
    const parsed = parseRepoInput(url)
    if (!parsed) { toast.error('Enter a valid GitHub URL or owner/repo'); return }

    setLoading(true)
    setData(null)
    setError(null)

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 700))
    }

    try {
      const { data: res } = await axios.get(`/api/github/team/${parsed.owner}/${parsed.repo}`)
      setData(res)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to fetch contributor data'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setData(null); setError(null); setUrl('') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-yellow-400" size={22} /> Team Contribution Analyzer
          </h1>
          <p className="text-sm text-dark-300 mt-1">See who actually built what in any public repository</p>
        </div>
        {data && (
          <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft size={14} /> New Repo
          </button>
        )}
      </div>

      {/* Input */}
      <AnimatePresence mode="wait">
        {!data && !loading && (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-3">Enter a public GitHub repository</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <GitBranch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input type="text" placeholder="github.com/org/repo  or  owner/repo"
                  value={url} onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyze()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>
              <button onClick={analyze} disabled={!url.trim()} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
                <Zap size={14} /> Analyze
              </button>
            </div>
            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={15} className="text-yellow-400" /> Analysing contributors…
            </p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? 'text-white' : 'text-dark-500'}`}>
                  {i < step
                    ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-[10px]">✓</div>
                    : i === step
                    ? <div className="w-5 h-5 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin shrink-0" />
                    : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                  }
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {data && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Repo header */}
            <div className="glass-card gradient-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white font-mono text-lg">{data.full_name}</h3>
                    <a href={`https://github.com/${data.full_name}`} target="_blank" rel="noopener noreferrer"
                      className="text-dark-400 hover:text-brand-400 transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  {data.description && <p className="text-xs text-dark-400 mt-0.5">{data.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black gradient-text">{data.total_commits.toLocaleString()}</p>
                  <p className="text-[10px] text-dark-400">total commits</p>
                  <p className="text-xs text-dark-400 mt-0.5">{data.contributors.length} contributor{data.contributors.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
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
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                        formatter={(v, n) => [`${v}%`, n]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {data.contributors.map((c) => (
                      <div key={c.handle}>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                            <span className="text-xs font-medium text-white truncate max-w-[80px]">{c.name}</span>
                          </div>
                          <span className="text-xs font-bold shrink-0" style={{ color: c.color }}>{c.pct}%</span>
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
                <div className="space-y-2.5">
                  {data.contributors.map((c, i) => (
                    <motion.div key={c.handle} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/5"
                    >
                      {c.avatar
                        ? <img src={c.avatar} alt={c.handle} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: c.color + '25', color: c.color }}>{c.name[0]}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                        <a href={`https://github.com/${c.handle}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-dark-400 font-mono hover:text-brand-400 transition-colors">
                          @{c.handle}
                        </a>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <p className="font-bold" style={{ color: c.color }}>{c.commits.toLocaleString()} commits</p>
                        <p className="text-dark-400">
                          +{c.additions.toLocaleString()} <span className="text-red-400/70">−{c.deletions.toLocaleString()}</span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly timeline */}
            {data.timeline.length > 0 && (
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <GitCommit size={16} className="text-brand-400" /> Weekly Commit Activity
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.timeline} barCategoryGap="20%">
                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                    />
                    {data.contributors.map((c, i) => (
                      <Bar
                        key={c.handle}
                        dataKey={c.handle}
                        stackId="a"
                        fill={c.color}
                        name={c.name}
                        radius={i === data.contributors.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3">
                  {data.contributors.map((c) => (
                    <div key={c.handle} className="flex items-center gap-1.5 text-xs text-dark-400">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw size={14} /> Analyze Another Repo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
