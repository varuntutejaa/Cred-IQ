import { useState } from 'react'
import { motion } from 'framer-motion'
import { Network, CheckCircle, GitCommit, Rocket, Code2, ChevronDown, ChevronRight } from 'lucide-react'
import TechLogo from '../shared/TechLogo'

const SKILL_TREE = [
  {
    skill: 'Python', score: 96, repos: 12, color: 'brand',
    evidence: [
      { type: 'repo',   name: 'expense-tracker',   detail: '847 commits, live',     score: 94 },
      { type: 'repo',   name: 'dsa-solutions',     detail: '412 commits, active',   score: 89 },
      { type: 'repo',   name: 'flask-api-demo',    detail: '156 commits',           score: 82 },
      { type: 'deploy', name: 'expense-tracker.vercel.app', detail: 'Live & healthy', score: 98 },
    ],
  },
  {
    skill: 'React', score: 89, repos: 7, color: 'cyan',
    evidence: [
      { type: 'repo',   name: 'portfolio-v3',      detail: '203 commits, live',     score: 91 },
      { type: 'repo',   name: 'ai-resume-builder', detail: '243 commits, 3 contribs', score: 88 },
      { type: 'deploy', name: 'varun.dev',          detail: 'Live, 99.8% uptime',    score: 98 },
      { type: 'deploy', name: 'ai-resume.netlify.app', detail: 'Live, 98.7% uptime', score: 87 },
    ],
  },
  {
    skill: 'Flask', score: 91, repos: 5, color: 'green',
    evidence: [
      { type: 'repo',   name: 'flask-api-demo',    detail: '156 commits',           score: 82 },
      { type: 'repo',   name: 'expense-tracker',   detail: 'Backend in Flask',      score: 94 },
      { type: 'cert',   name: 'Meta Backend Dev',  detail: 'Verified certification', score: 94 },
    ],
  },
  {
    skill: 'MongoDB', score: 78, repos: 4, color: 'yellow',
    evidence: [
      { type: 'repo', name: 'expense-tracker',   detail: 'Schema files detected', score: 81 },
      { type: 'repo', name: 'ai-resume-builder', detail: 'MongoDB Atlas config',  score: 76 },
    ],
  },
  {
    skill: 'AWS', score: 34, repos: 0, color: 'red',
    evidence: [],
    warning: 'No AWS usage found in any repository. Claimed but unverified.',
  },
  {
    skill: 'TypeScript', score: 82, repos: 3, color: 'purple',
    evidence: [
      { type: 'repo', name: 'ai-resume-builder', detail: 'Primary language, 243 commits', score: 88 },
      { type: 'repo', name: 'portfolio-v3',      detail: 'Used for components',           score: 78 },
    ],
  },
]

const COLOR = {
  brand:  { tag: 'bg-brand-500/15 text-brand-300 border-brand-500/25',   bar: 'from-brand-600 to-brand-400',     dot: 'bg-brand-400'   },
  cyan:   { tag: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',       bar: 'from-cyan-600 to-cyan-400',       dot: 'bg-cyan-400'    },
  green:  { tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', bar: 'from-emerald-600 to-emerald-400', dot: 'bg-emerald-400' },
  yellow: { tag: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25', bar: 'from-yellow-600 to-yellow-400',   dot: 'bg-yellow-400'  },
  red:    { tag: 'bg-red-500/15 text-red-300 border-red-500/25',           bar: 'bg-red-500',                      dot: 'bg-red-400'     },
  purple: { tag: 'bg-purple-500/15 text-purple-300 border-purple-500/25', bar: 'from-purple-600 to-purple-400',   dot: 'bg-purple-400'  },
}

const EVIDENCE_ICON = { repo: GitCommit, deploy: Rocket, cert: CheckCircle }

export default function SkillMap() {
  const [open, setOpen] = useState(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="text-cyan-400" size={22} /> Skill Evidence Map
        </h1>
        <p className="text-sm text-dark-300 mt-1">Every skill linked to concrete, verifiable proof</p>
      </div>

      {/* Legend */}
      <div className="glass-card gradient-border flex flex-wrap gap-4 text-xs text-dark-300">
        {[
          { icon: GitCommit, label: 'Repository', color: 'text-brand-400'   },
          { icon: Rocket,    label: 'Deployment', color: 'text-purple-400'  },
          { icon: CheckCircle,label:'Certificate',color: 'text-emerald-400' },
        ].map(({ icon: Icon, label, color }) => (
          <span key={label} className={`flex items-center gap-1.5 ${color}`}>
            <Icon size={12} /> {label}
          </span>
        ))}
        <span className="ml-auto text-dark-400">Click any skill to expand evidence chain</span>
      </div>

      <div className="space-y-3">
        {SKILL_TREE.map((s, i) => {
          const c = COLOR[s.color]
          const isOpen = open === s.skill
          const hasEvidence = s.evidence.length > 0
          return (
            <motion.div key={s.skill} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card gradient-border overflow-hidden"
            >
              {/* Skill header */}
              <button
                className="w-full flex items-center gap-4 text-left"
                onClick={() => hasEvidence && setOpen(isOpen ? null : s.skill)}
              >
                <TechLogo name={s.skill} size={22} />
                <span className="font-semibold text-white w-24 shrink-0">{s.skill}</span>

                {/* Score bar */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                      className={`h-full rounded-full ${s.color === 'red' ? c.bar : `bg-gradient-to-r ${c.bar}`}`}
                    />
                  </div>
                  <span className={`text-sm font-black w-12 text-right ${s.score >= 70 ? 'text-emerald-400' : s.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {s.score}%
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-dark-400">{s.repos} repos</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${c.tag}`}>
                    {s.score >= 70 ? '✓ Verified' : s.score >= 40 ? '⚠ Partial' : '✗ Unverified'}
                  </span>
                  {hasEvidence && (
                    isOpen ? <ChevronDown size={14} className="text-dark-400" /> : <ChevronRight size={14} className="text-dark-400" />
                  )}
                </div>
              </button>

              {/* Warning */}
              {s.warning && (
                <div className="mt-3 flex items-start gap-2 text-xs text-yellow-300 bg-yellow-500/10 rounded-lg p-2.5 border border-yellow-500/15">
                  <span className="shrink-0">⚠</span>
                  <span>{s.warning}</span>
                </div>
              )}

              {/* Evidence chain */}
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="mt-4 ml-6 pl-4 border-l-2 border-dashed border-white/10 space-y-2"
                >
                  {s.evidence.map((ev, ei) => {
                    const EIcon = EVIDENCE_ICON[ev.type]
                    return (
                      <motion.div key={ei} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ei * 0.07 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5"
                      >
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                          <EIcon size={12} className={c.dot.replace('bg-', 'text-')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white font-mono">{ev.name}</p>
                          <p className="text-[10px] text-dark-400">{ev.detail}</p>
                        </div>
                        <div className="w-8 h-8 relative shrink-0">
                          <svg width="32" height="32" className="rotate-[-90deg]">
                            <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            <motion.circle cx="16" cy="16" r="12" fill="none" stroke="#6366f1" strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 12}
                              initial={{ strokeDashoffset: 2 * Math.PI * 12 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 12 * (1 - ev.score / 100) }}
                              transition={{ duration: 0.6, delay: ei * 0.1 }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-brand-300">{ev.score}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="glass-card gradient-border">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Code2 size={14} className="text-brand-400" /> Skill Coverage Summary</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-400">{SKILL_TREE.filter((s) => s.score >= 70).length}</p>
            <p className="text-xs text-dark-400">Fully Verified</p>
          </div>
          <div>
            <p className="text-2xl font-black text-yellow-400">{SKILL_TREE.filter((s) => s.score >= 40 && s.score < 70).length}</p>
            <p className="text-xs text-dark-400">Partially Verified</p>
          </div>
          <div>
            <p className="text-2xl font-black text-red-400">{SKILL_TREE.filter((s) => s.score < 40).length}</p>
            <p className="text-xs text-dark-400">Unverified</p>
          </div>
        </div>
      </div>
    </div>
  )
}
