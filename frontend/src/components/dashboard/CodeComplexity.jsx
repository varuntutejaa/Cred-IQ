import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Zap, AlertTriangle, CheckCircle, GitBranch, RefreshCw, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import TechLogo from '../shared/TechLogo'

const MOCK_FILES = [
  { path: 'src/auth/jwt_handler.py',       lang: 'Python',     loc: 312, complexity: 28, maintainability: 62, risk: 'high',   cognitive: 41, duplication: 8  },
  { path: 'src/routes/expense_routes.py',  lang: 'Python',     loc: 198, complexity: 14, maintainability: 81, risk: 'medium', cognitive: 19, duplication: 3  },
  { path: 'src/models/user.py',            lang: 'Python',     loc: 87,  complexity: 6,  maintainability: 92, risk: 'low',    cognitive: 8,  duplication: 0  },
  { path: 'components/Dashboard.tsx',      lang: 'TypeScript', loc: 424, complexity: 31, maintainability: 58, risk: 'high',   cognitive: 47, duplication: 12 },
  { path: 'components/Chart.tsx',          lang: 'TypeScript', loc: 156, complexity: 9,  maintainability: 88, risk: 'low',    cognitive: 11, duplication: 1  },
  { path: 'hooks/useAuth.ts',              lang: 'TypeScript', loc: 63,  complexity: 5,  maintainability: 96, risk: 'low',    cognitive: 6,  duplication: 0  },
  { path: 'api/github_service.py',         lang: 'Python',     loc: 267, complexity: 22, maintainability: 71, risk: 'medium', cognitive: 29, duplication: 5  },
  { path: 'utils/validator.ts',            lang: 'TypeScript', loc: 94,  complexity: 7,  maintainability: 90, risk: 'low',    cognitive: 9,  duplication: 2  },
]

const RADAR_DATA = [
  { dim: 'Readability',    v: 78 },
  { dim: 'Maintainability',v: 71 },
  { dim: 'Test Coverage',  v: 64 },
  { dim: 'Complexity',     v: 59 },
  { dim: 'Duplication',    v: 82 },
  { dim: 'Documentation',  v: 55 },
]

const LANG_COMPLEXITY = [
  { lang: 'Python',     avg: 14.2, files: 5 },
  { lang: 'TypeScript', avg: 11.8, files: 4 },
]

const RISK_CONFIG = {
  high:   { label: 'High Risk',   color: '#ef4444', bg: 'bg-red-500/15    border-red-500/25    text-red-300'    },
  medium: { label: 'Med Risk',    color: '#f59e0b', bg: 'bg-yellow-500/15 border-yellow-500/25 text-yellow-300' },
  low:    { label: 'Low Risk',    color: '#10b981', bg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'},
}

const REPO_OPTIONS = [
  'expense-tracker (Python/Flask)',
  'ai-resume-builder (TypeScript/React)',
  'dsa-solutions (Python)',
  'portfolio-v3 (React)',
]

export default function CodeComplexity() {
  const [repo,     setRepo]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [sortBy,   setSortBy]   = useState('complexity')

  const analyze = async () => {
    if (!repo) return
    setLoading(true)
    setAnalyzed(false)
    await new Promise((r) => setTimeout(r, 2200))
    setAnalyzed(true)
    setLoading(false)
  }

  const sorted = [...MOCK_FILES].sort((a, b) => b[sortBy] - a[sortBy])
  const overall = Math.round(MOCK_FILES.reduce((s, f) => s + f.maintainability, 0) / MOCK_FILES.length)
  const highRisk = MOCK_FILES.filter((f) => f.risk === 'high').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="text-cyan-400" size={22} /> Code Complexity Evaluator
          </h1>
          <p className="text-sm text-dark-300 mt-1">Cyclomatic complexity, maintainability index, and risk analysis per file</p>
        </div>
        {analyzed && (
          <button onClick={() => { setAnalyzed(false); setRepo('') }} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> New Analysis
          </button>
        )}
      </div>

      {!analyzed ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-border max-w-xl">
          <p className="text-sm font-semibold text-white mb-1">Select a repository</p>
          <p className="text-xs text-dark-400 mb-4">CredIQ will scan all source files and compute complexity metrics</p>
          <div className="space-y-2 mb-4">
            {REPO_OPTIONS.map((r) => (
              <button key={r} onClick={() => setRepo(r)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all flex items-center gap-3 ${
                  repo === r ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'glass border-white/8 text-dark-300 hover:text-white hover:border-white/15'
                }`}
              >
                <GitBranch size={13} className={repo === r ? 'text-brand-400' : 'text-dark-500'} />
                {r}
                {repo === r && <CheckCircle size={12} className="ml-auto text-brand-400" />}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={analyze} disabled={!repo || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning files…
                </>
              : <><Zap size={14} /> Analyze Complexity</>
            }
          </motion.button>
          {loading && (
            <div className="mt-4 space-y-2">
              {['Cloning repository', 'Parsing AST', 'Computing cyclomatic complexity', 'Calculating maintainability index', 'Detecting duplication', 'Generating report'].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.32 }}
                  className="flex items-center gap-2 text-xs text-dark-400"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                  {step}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Overall Maintainability', value: `${overall}/100`, color: overall >= 80 ? 'text-emerald-400' : overall >= 60 ? 'text-yellow-400' : 'text-red-400', icon: CheckCircle },
                { label: 'Files Analyzed',          value: MOCK_FILES.length, color: 'text-brand-400',   icon: Code2          },
                { label: 'High-Risk Files',         value: highRisk,          color: 'text-red-400',     icon: AlertTriangle  },
                { label: 'Avg Complexity',          value: (MOCK_FILES.reduce((s,f)=>s+f.complexity,0)/MOCK_FILES.length).toFixed(1), color: 'text-yellow-400', icon: Zap },
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

            {/* Chart + radar row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card gradient-border"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Code2 size={15} className="text-cyan-400" /> Complexity by File</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={MOCK_FILES.map((f) => ({ name: f.path.split('/').pop().replace(/\.[^.]+$/, ''), v: f.complexity, fill: f.risk === 'high' ? '#ef4444' : f.risk === 'medium' ? '#f59e0b' : '#10b981' }))} barSize={18}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} formatter={(v) => [v, 'Cyclomatic Complexity']} />
                    <Bar dataKey="v" radius={[4, 4, 0, 0]} name="Complexity">
                      {MOCK_FILES.map((f, i) => (
                        <rect key={i} fill={f.risk === 'high' ? '#ef4444' : f.risk === 'medium' ? '#f59e0b' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center text-xs">
                  {[['#10b981','Low'],['#f59e0b','Medium'],['#ef4444','High']].map(([c,l]) => (
                    <span key={l} className="flex items-center gap-1 text-dark-400"><span className="w-2 h-2 rounded-full inline-block" style={{background:c}}/>{l} Risk</span>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass-card gradient-border"
              >
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Zap size={15} className="text-yellow-400" /> Code Quality Radar</h3>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                    <Radar dataKey="v" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.18} strokeWidth={2} name="Score" />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Lang breakdown */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card gradient-border"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Code2 size={15} className="text-purple-400" /> By Language</h3>
              <div className="flex flex-wrap gap-3">
                {LANG_COMPLEXITY.map((l) => (
                  <div key={l.lang} className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/5">
                    <TechLogo name={l.lang} size={22} />
                    <div>
                      <p className="text-sm font-semibold text-white">{l.lang}</p>
                      <p className="text-[10px] text-dark-400">{l.files} files · avg complexity {l.avg}</p>
                    </div>
                    <div className={`ml-4 text-sm font-black ${l.avg < 15 ? 'text-emerald-400' : 'text-yellow-400'}`}>{l.avg}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* File table */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-card gradient-border"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-white flex items-center gap-2"><AlertTriangle size={15} className="text-yellow-400" /> File-Level Analysis</h3>
                <div className="flex gap-1.5">
                  {['complexity','maintainability','cognitive'].map((s) => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium capitalize transition-all ${sortBy === s ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'glass border-white/8 text-dark-400 hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {sorted.map((f, i) => {
                  const rc = RISK_CONFIG[f.risk]
                  const isOpen = expanded === f.path
                  return (
                    <motion.div key={f.path} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="glass rounded-xl border border-white/5 overflow-hidden"
                    >
                      <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/2 transition-all"
                        onClick={() => setExpanded(isOpen ? null : f.path)}
                      >
                        <TechLogo name={f.lang} size={18} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-white truncate">{f.path}</p>
                          <p className="text-[10px] text-dark-500">{f.loc} LOC</p>
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

                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          className="border-t border-white/5 px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3"
                        >
                          {[
                            { label: 'Lines of Code',     value: f.loc        },
                            { label: 'Cyclomatic Cmplx',  value: f.complexity },
                            { label: 'Maintainability',   value: `${f.maintainability}/100` },
                            { label: 'Cognitive Cmplx',   value: f.cognitive  },
                            { label: 'Code Duplication',  value: `${f.duplication}%` },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center bg-white/3 rounded-lg py-2 px-3">
                              <p className="text-sm font-black text-white">{value}</p>
                              <p className="text-[9px] text-dark-500 mt-0.5">{label}</p>
                            </div>
                          ))}
                          {f.risk === 'high' && (
                            <div className="col-span-2 md:col-span-4 flex items-start gap-2 text-xs text-yellow-300 bg-yellow-500/8 rounded-lg p-2.5 border border-yellow-500/15">
                              <Info size={12} className="shrink-0 mt-0.5" />
                              <span>Refactor recommended: cyclomatic complexity &gt;20 increases bug probability by 3×. Consider splitting into smaller functions.</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
