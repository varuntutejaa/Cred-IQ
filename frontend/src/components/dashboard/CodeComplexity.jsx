import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Zap, AlertTriangle, CheckCircle, GitBranch, RefreshCw, ChevronDown, ChevronRight, Info, ArrowLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import TechLogo from '../shared/TechLogo'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = ['Reading file tree', 'Fetching source files', 'Computing cyclomatic complexity', 'Calculating maintainability index', 'Detecting duplication', 'Building report']

const RISK_CONFIG = {
  high:   { label: 'High Risk',  color: '#ef4444', bg: 'bg-red-500/15    border-red-500/25    text-red-300'    },
  medium: { label: 'Med Risk',   color: '#f59e0b', bg: 'bg-yellow-500/15 border-yellow-500/25 text-yellow-300' },
  low:    { label: 'Low Risk',   color: '#10b981', bg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'},
}

function parseRepoInput(raw) {
  const cleaned = raw.trim().replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\/$/, '')
  const parts = cleaned.split('/')
  if (parts.length >= 2) return { owner: parts[0], repo: parts[1] }
  return null
}

export default function CodeComplexity() {
  const { user } = useAuth()
  const [url,      setUrl]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [step,     setStep]     = useState(0)
  const [data,     setData]     = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [sortBy,   setSortBy]   = useState('complexity')

  const analyze = async (repoUrl) => {
    const target = repoUrl || url
    const parsed = parseRepoInput(target)
    if (!parsed) { toast.error('Enter a valid GitHub URL or owner/repo'); return }

    setLoading(true)
    setData(null)

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 600))
    }

    try {
      const { data: res } = await axios.get(`/api/complexity/${parsed.owner}/${parsed.repo}`)
      setData(res)
      toast.success(`Analyzed ${res.summary.files_analyzed} files in ${res.repo}`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to analyze repository')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setData(null); setUrl('') }

  const files  = data?.files  || []
  const sorted = [...files].sort((a, b) => b[sortBy] - a[sortBy])
  const s      = data?.summary || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="text-cyan-400" size={22} /> Code Complexity Evaluator
          </h1>
          <p className="text-sm text-dark-300 mt-1">Cyclomatic complexity, maintainability index, and risk analysis per file</p>
        </div>
        {data && (
          <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft size={14} /> New Analysis
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Input state */}
        {!data && !loading && (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-xl"
          >
            <p className="text-sm font-semibold text-white mb-1">Enter a GitHub repository</p>
            <p className="text-xs text-dark-400 mb-4">CredIQ will fetch source files and compute complexity metrics</p>

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <GitBranch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text" placeholder="github.com/owner/repo  or  owner/repo"
                  value={url} onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyze()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
                />
              </div>
              <button onClick={() => analyze()} disabled={!url.trim()} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
                <Zap size={14} /> Analyze
              </button>
            </div>

            {/* Quick-select: user's own repos */}
            {user?.top_repos?.length > 0 && (
              <>
                <p className="text-xs text-dark-400 mb-2">Or pick one of your repos:</p>
                <div className="space-y-1.5">
                  {user.top_repos.slice(0, 4).map((r) => (
                    <button key={r.name}
                      onClick={() => { setUrl(r.url); analyze(r.url) }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm border glass border-white/8 text-dark-300 hover:text-white hover:border-white/15 flex items-center gap-3 transition-all"
                    >
                      <GitBranch size={12} className="text-dark-500 shrink-0" />
                      <span className="font-mono truncate">{r.name}</span>
                      <span className="text-[10px] text-dark-500 ml-auto shrink-0">{r.lang}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Code2 size={15} className="text-cyan-400" /> Scanning files…
            </p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? 'text-white' : 'text-dark-500'}`}>
                  {i < step
                    ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-[10px]">✓</div>
                    : i === step
                    ? <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                    : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                  }
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {data && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Overall Maintainability', value: `${s.overall_maintainability}/100`, color: s.overall_maintainability >= 80 ? 'text-emerald-400' : s.overall_maintainability >= 60 ? 'text-yellow-400' : 'text-red-400', icon: CheckCircle },
                { label: 'Files Analyzed',          value: s.files_analyzed,                  color: 'text-brand-400',  icon: Code2         },
                { label: 'High-Risk Files',         value: s.high_risk_files,                  color: 'text-red-400',    icon: AlertTriangle },
                { label: 'Avg Complexity',          value: s.avg_complexity,                   color: 'text-yellow-400', icon: Zap           },
              ].map(({ label, value, color, icon: Icon }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card gradient-border"
                >
                  <Icon size={15} className={`${color} mb-2`} />
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-dark-300 mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bar chart */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card gradient-border"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Code2 size={15} className="text-cyan-400" /> Complexity by File</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart barSize={14}
                    data={[...files].sort((a,b) => b.complexity - a.complexity).slice(0,12).map((f) => ({
                      name: f.path.split('/').pop().replace(/\.[^.]+$/, ''),
                      v:    f.complexity,
                      fill: f.risk === 'high' ? '#ef4444' : f.risk === 'medium' ? '#f59e0b' : '#10b981',
                    }))}
                  >
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                      formatter={(v) => [v, 'Cyclomatic Complexity']} />
                    <Bar dataKey="v" radius={[4,4,0,0]} name="Complexity">
                      {[...files].sort((a,b) => b.complexity - a.complexity).slice(0,12).map((f, i) => (
                        <Cell key={i} fill={f.risk === 'high' ? '#ef4444' : f.risk === 'medium' ? '#f59e0b' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center text-xs">
                  {[['#10b981','Low'],['#f59e0b','Medium'],['#ef4444','High']].map(([c,l]) => (
                    <span key={l} className="flex items-center gap-1 text-dark-400">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{l} Risk
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Radar */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass-card gradient-border"
              >
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Zap size={15} className="text-yellow-400" /> Code Quality Radar</h3>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={data.radar}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                    <Radar dataKey="v" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.18} strokeWidth={2} name="Score" />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* By language */}
            {data.by_lang?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card gradient-border"
              >
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Code2 size={15} className="text-purple-400" /> By Language</h3>
                <div className="flex flex-wrap gap-3">
                  {data.by_lang.map((l) => (
                    <div key={l.lang} className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/5">
                      <TechLogo name={l.lang} size={22} />
                      <div>
                        <p className="text-sm font-semibold text-white">{l.lang}</p>
                        <p className="text-[10px] text-dark-400">{l.files} file{l.files !== 1 ? 's' : ''} · avg complexity {l.avg}</p>
                      </div>
                      <div className={`ml-4 text-sm font-black ${l.avg < 15 ? 'text-emerald-400' : l.avg < 25 ? 'text-yellow-400' : 'text-red-400'}`}>{l.avg}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* File table */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-card gradient-border"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <AlertTriangle size={15} className="text-yellow-400" /> File-Level Analysis
                  <span className="text-xs text-dark-500 font-normal">({files.length} files)</span>
                </h3>
                <div className="flex gap-1.5">
                  {['complexity','maintainability','cognitive'].map((k) => (
                    <button key={k} onClick={() => setSortBy(k)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium capitalize transition-all ${sortBy === k ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'glass border-white/8 text-dark-400 hover:text-white'}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {sorted.map((f, i) => {
                  const rc    = RISK_CONFIG[f.risk]
                  const isOpen = expanded === f.path
                  return (
                    <motion.div key={f.path} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="glass rounded-xl border border-white/5 overflow-hidden"
                    >
                      <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/2 transition-all"
                        onClick={() => setExpanded(isOpen ? null : f.path)}
                      >
                        <TechLogo name={f.lang} size={18} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-white truncate">{f.path}</p>
                          <p className="text-[10px] text-dark-500">{f.loc.toLocaleString()} LOC</p>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                          <div className="text-center">
                            <p className={`text-sm font-black ${f.complexity > 20 ? 'text-red-400' : f.complexity > 10 ? 'text-yellow-400' : 'text-emerald-400'}`}>{f.complexity}</p>
                            <p className="text-[9px] text-dark-500">Cyclomatic</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-black ${f.maintainability >= 80 ? 'text-emerald-400' : f.maintainability >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{f.maintainability}</p>
                            <p className="text-[9px] text-dark-500">Maint.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-purple-400">{f.cognitive}</p>
                            <p className="text-[9px] text-dark-500">Cognitive</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium shrink-0 ${rc.bg}`}>{rc.label}</span>
                        {isOpen ? <ChevronDown size={12} className="text-dark-400 shrink-0" /> : <ChevronRight size={12} className="text-dark-400 shrink-0" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }} className="overflow-hidden"
                          >
                            <div className="border-t border-white/5 px-4 py-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                              {[
                                { label: 'Lines of Code',    value: f.loc.toLocaleString() },
                                { label: 'Cyclomatic Cmplx', value: f.complexity },
                                { label: 'Maintainability',  value: `${f.maintainability}/100` },
                                { label: 'Cognitive Cmplx',  value: f.cognitive },
                                { label: 'Duplication',      value: `${f.duplication}%` },
                              ].map(({ label, value }) => (
                                <div key={label} className="text-center bg-white/3 rounded-lg py-2 px-3">
                                  <p className="text-sm font-black text-white">{value}</p>
                                  <p className="text-[9px] text-dark-500 mt-0.5">{label}</p>
                                </div>
                              ))}
                              {f.risk === 'high' && (
                                <div className="col-span-2 md:col-span-5 flex items-start gap-2 text-xs text-yellow-300 bg-yellow-500/8 rounded-lg p-2.5 border border-yellow-500/15">
                                  <Info size={12} className="shrink-0 mt-0.5" />
                                  Refactor recommended: cyclomatic complexity &gt;20 increases bug probability by 3×. Consider splitting into smaller functions.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
