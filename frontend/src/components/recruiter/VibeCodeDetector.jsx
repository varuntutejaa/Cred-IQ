import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Search, AlertTriangle, CheckCircle, XCircle, Bot, GitBranch, Info, Shield } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import TechLogo from '../shared/TechLogo'
import toast from 'react-hot-toast'

const PROFILES = {
  'varun-dev': {
    name: 'Varun Tuteja',
    handle: 'varun-dev',
    color: '#6366f1',
    vibeScore: 12,
    verdict: 'Authentic Developer',
    verdictType: 'clean',
    summary: 'Code patterns are consistent with a self-taught developer who iterates organically. Commit messages show personal style, no AI-generated boilerplate detected. Complexity aligns with experience level.',
    signals: [
      { label: 'Commit Message Style',       score: 96, human: true,  note: 'Personal, typo-prone, informal — classic human pattern'           },
      { label: 'Code Complexity Growth',     score: 91, human: true,  note: 'Complexity increases with experience — authentic learning curve'  },
      { label: 'Variable Naming Patterns',   score: 88, human: true,  note: 'Inconsistent naming in older repos — natural evolution'           },
      { label: 'Comment Patterns',           score: 84, human: true,  note: 'Sparse, context-specific comments — not AI-generated blocks'      },
      { label: 'Function Length Variance',   score: 78, human: true,  note: 'High variance in function size — organic development'             },
      { label: 'Boilerplate Detection',      score: 94, human: true,  note: 'No generated scaffolding detected in 47 repositories'             },
      { label: 'Commit Timing Distribution', score: 87, human: true,  note: 'Commits spread across evenings/weekends — realistic pattern'      },
      { label: 'Error Handling Patterns',    score: 72, human: true,  note: 'Inconsistent error handling typical of self-taught devs'          },
    ],
    byLang: [
      { lang: 'Python',     vibeScore: 8,  repos: 12 },
      { lang: 'TypeScript', vibeScore: 15, repos: 6  },
      { lang: 'React',      vibeScore: 11, repos: 7  },
    ],
    timelineRisk: [
      { m: 'Jan', risk: 5 },{ m: 'Feb', risk: 8 },{ m: 'Mar', risk: 12 },
      { m: 'Apr', risk: 7 },{ m: 'May', risk: 9 },{ m: 'Jun', risk: 11 },
    ],
    flags: [],
  },
  'sus-dev': {
    name: 'Suspicious Dev',
    handle: 'sus-dev',
    color: '#ef4444',
    vibeScore: 78,
    verdict: 'High Vibe Code Risk',
    verdictType: 'danger',
    summary: 'Strong indicators of AI-assisted development across 70%+ of repositories. Commit patterns suggest overnight bulk submission. Boilerplate detected in 14/18 repos. Variable naming is unusually consistent and formal, deviating from natural human patterns.',
    signals: [
      { label: 'Commit Message Style',       score: 14, human: false, note: 'Overly formal, structured messages — matches AI generation patterns'  },
      { label: 'Code Complexity Growth',     score: 21, human: false, note: 'Suspiciously flat complexity — no learning curve detected'            },
      { label: 'Variable Naming Patterns',   score: 18, human: false, note: 'Unusually consistent camelCase + verbose names — AI hallmark'         },
      { label: 'Comment Patterns',           score: 11, human: false, note: 'All comments follow JSDoc/docstring template — AI-generated'          },
      { label: 'Function Length Variance',   score: 25, human: false, note: 'Very low variance, all functions 15–30 lines — unnaturally uniform'   },
      { label: 'Boilerplate Detection',      score: 9,  human: false, note: 'Boilerplate detected in 14/18 repositories'                          },
      { label: 'Commit Timing Distribution', score: 17, human: false, note: '80% of commits in 2-hour windows at 2–4am — suspicious bulk pattern'  },
      { label: 'Error Handling Patterns',    score: 13, human: false, note: 'All try/catch blocks identical across repos — generated pattern'       },
    ],
    byLang: [
      { lang: 'Python',     vibeScore: 82, repos: 8 },
      { lang: 'JavaScript', vibeScore: 75, repos: 6 },
      { lang: 'TypeScript', vibeScore: 71, repos: 4 },
    ],
    timelineRisk: [
      { m: 'Jan', risk: 12 },{ m: 'Feb', risk: 18 },{ m: 'Mar', risk: 74 },
      { m: 'Apr', risk: 80 },{ m: 'May', risk: 77 },{ m: 'Jun', risk: 82 },
    ],
    flags: [
      'Bulk commit pattern detected (2–4am, 500+ commits/day)',
      'All repos created within 2-week window',
      'Identical file structure across unrelated projects',
      'No branch/PR history — straight to main',
    ],
  },
  'partial-dev': {
    name: 'Kiran Bhat',
    handle: 'kiran-b',
    color: '#f59e0b',
    vibeScore: 34,
    verdict: 'Assisted — Some Concerns',
    verdictType: 'warning',
    summary: 'Mixed signals: core business logic appears human-written, but boilerplate and scaffolding shows AI assistance (acceptable). Commit patterns are mostly authentic. Some concerns around 3 repositories with unusually uniform code style.',
    signals: [
      { label: 'Commit Message Style',       score: 81, human: true,  note: 'Mostly authentic, some formal outliers'                  },
      { label: 'Code Complexity Growth',     score: 74, human: true,  note: 'Generally natural progression'                           },
      { label: 'Variable Naming Patterns',   score: 68, human: true,  note: 'Mix of personal style and generated scaffolding'         },
      { label: 'Comment Patterns',           score: 58, human: false, note: '3 repos have AI-style comment blocks'                    },
      { label: 'Function Length Variance',   score: 72, human: true,  note: 'Acceptable variance'                                     },
      { label: 'Boilerplate Detection',      score: 41, human: false, note: 'Scaffolding detected — likely acceptable tool usage'     },
      { label: 'Commit Timing Distribution', score: 79, human: true,  note: 'Normal working hours pattern'                            },
      { label: 'Error Handling Patterns',    score: 65, human: true,  note: 'Mostly consistent with manual coding'                    },
    ],
    byLang: [
      { lang: 'TypeScript', vibeScore: 29, repos: 7 },
      { lang: 'Node.js',    vibeScore: 38, repos: 4 },
      { lang: 'Python',     vibeScore: 42, repos: 3 },
    ],
    timelineRisk: [
      { m: 'Jan', risk: 18 },{ m: 'Feb', risk: 22 },{ m: 'Mar', risk: 35 },
      { m: 'Apr', risk: 41 },{ m: 'May', risk: 38 },{ m: 'Jun', risk: 34 },
    ],
    flags: [
      '3 repos have unusually uniform code style',
    ],
  },
}

const VERDICT_STYLES = {
  clean:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-yellow-500/15  text-yellow-300  border-yellow-500/30',
  danger:  'bg-red-500/15     text-red-300     border-red-500/30',
}

export default function VibeCodeDetector() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const detect = () => {
    const key = input.trim().toLowerCase().replace('@', '')
    if (!key) return
    setLoading(true)
    setError('')
    setResult(null)
    setTimeout(() => {
      const profile = PROFILES[key]
      if (profile) {
        setResult(profile)
        toast.success(`Vibe analysis complete for @${key}`)
      } else {
        setError(`No data for "@${key}". Try: varun-dev, sus-dev, or kiran-b`)
        toast.error('Profile not found')
      }
      setLoading(false)
    }, 2100)
  }

  const SCORE_COLOR = (v) => v <= 25 ? '#10b981' : v <= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={20} className="text-purple-400" /> Vibe Code Detector
        </h1>
        <p className="text-sm text-dark-300 mt-1">Detect AI-generated code patterns and distinguish authentic developer work</p>
      </div>

      {/* Info banner */}
      <div className="glass rounded-xl px-4 py-3 border border-purple-500/20 bg-purple-500/5 flex items-start gap-3">
        <Info size={14} className="text-purple-400 shrink-0 mt-0.5" />
        <p className="text-xs text-dark-300 leading-relaxed">
          <span className="text-purple-300 font-semibold">What is Vibe Code?</span> AI-generated or heavily assisted code that doesn't reflect the developer's true skills. A high vibe score indicates risk — code was likely generated rather than authored. Low scores indicate authentic human development.
        </p>
      </div>

      {/* Input */}
      <div className="glass-card gradient-border max-w-xl">
        <label className="text-xs font-semibold text-dark-300 mb-2 block">GitHub Username</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">@</span>
            <input type="text" placeholder="e.g. varun-dev" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && detect()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={detect} disabled={loading || !input.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 text-white font-semibold rounded-xl px-5 py-3 text-sm shadow-glow disabled:opacity-50 transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={14} /> Detect</>}
          </motion.button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><XCircle size={11} /> {error}</p>}
        <p className="text-[10px] text-dark-500 mt-2">Demo: <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setInput('varun-dev')}>varun-dev</button> (clean) · <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setInput('sus-dev')}>sus-dev</button> (high risk) · <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setInput('kiran-b')}>kiran-b</button> (mixed)</p>
      </div>

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card gradient-border max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-white">Running vibe analysis…</p>
          </div>
          {['Fetching commit history','Analysing commit message linguistics','Scanning variable naming entropy','Detecting boilerplate signatures','Checking timing distribution','Computing vibe score'].map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.28 }}
              className="flex items-center gap-2 text-xs text-dark-400 mb-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              {s}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Header */}
            <div className="glass-card gradient-border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0" style={{ background: result.color + '25', color: result.color }}>
                    {result.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{result.name}</h2>
                    <p className="text-sm font-mono" style={{ color: result.color }}>@{result.handle}</p>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border mt-2 ${VERDICT_STYLES[result.verdictType]}`}>
                      {result.verdictType === 'clean' ? <CheckCircle size={11} /> : result.verdictType === 'danger' ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                      {result.verdict}
                    </div>
                  </div>
                </div>

                {/* Big score ring */}
                <div className="shrink-0">
                  {(() => {
                    const r = 38, circ = 2 * Math.PI * r, c = SCORE_COLOR(result.vibeScore)
                    return (
                      <div className="relative w-24 h-24">
                        <svg width={96} height={96} className="-rotate-90">
                          <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
                          <motion.circle cx={48} cy={48} r={r} fill="none" stroke={c} strokeWidth={8}
                            strokeLinecap="round" strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: circ - (result.vibeScore / 100) * circ }}
                            transition={{ duration: 1.2 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-xl font-black text-white">{result.vibeScore}%</p>
                          <p className="text-[9px] text-dark-400">vibe risk</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
              <p className="text-sm text-dark-300 mt-4 leading-relaxed border-t border-white/5 pt-4">{result.summary}</p>

              {/* Red flags */}
              {result.flags.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {result.flags.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-xs text-red-300 bg-red-500/8 rounded-lg px-3 py-2 border border-red-500/15">
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Signals + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Signal breakdown */}
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Shield size={15} className="text-purple-400" /> Signal Analysis</h3>
                <div className="space-y-3">
                  {result.signals.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {s.human
                            ? <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                            : <XCircle    size={11} className="text-red-400 shrink-0"     />
                          }
                          <span className="text-xs text-white">{s.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${s.human ? 'text-emerald-400' : 'text-red-400'}`}>{s.score}%</span>
                      </div>
                      <div className="h-1 bg-dark-700 rounded-full overflow-hidden mb-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 0.7 }}
                          className="h-full rounded-full" style={{ background: s.human ? '#10b981' : '#ef4444' }}
                        />
                      </div>
                      <p className="text-[9px] text-dark-500">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk timeline */}
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Bot size={15} className="text-yellow-400" /> Risk Over Time</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={result.timelineRisk} barSize={22}>
                    <XAxis dataKey="m" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Vibe Risk']} />
                    <Bar dataKey="risk" radius={[4, 4, 0, 0]} name="Vibe Risk"
                      fill="#8b5cf6"
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* By language */}
                <div className="mt-4 space-y-2.5 border-t border-white/5 pt-4">
                  <p className="text-xs font-semibold text-dark-300 mb-2">Risk by Language</p>
                  {result.byLang.map((l) => {
                    const c = SCORE_COLOR(l.vibeScore)
                    return (
                      <div key={l.lang} className="flex items-center gap-3">
                        <TechLogo name={l.lang} size={16} />
                        <span className="text-xs text-dark-300 w-24 shrink-0">{l.lang}</span>
                        <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${l.vibeScore}%` }} transition={{ duration: 0.8 }}
                            className="h-full rounded-full" style={{ background: c }} />
                        </div>
                        <span className="text-xs font-bold w-10 text-right" style={{ color: c }}>{l.vibeScore}%</span>
                        <span className="text-[9px] text-dark-500">{l.repos} repos</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
