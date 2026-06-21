import { useState } from 'react'
import { motion } from 'framer-motion'
import { Network, CheckCircle, GitCommit, Star, Code2, ChevronDown, ChevronRight } from 'lucide-react'
import TechLogo from '../shared/TechLogo'
import { useAuth } from '../../context/AuthContext'

const PALETTE = ['brand', 'cyan', 'green', 'yellow', 'purple', 'red']

const COLOR = {
  brand:  { tag: 'bg-brand-500/15 text-brand-300 border-brand-500/25',   bar: 'from-brand-600 to-brand-400',     dot: 'bg-brand-400'   },
  cyan:   { tag: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',       bar: 'from-cyan-600 to-cyan-400',       dot: 'bg-cyan-400'    },
  green:  { tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', bar: 'from-emerald-600 to-emerald-400', dot: 'bg-emerald-400' },
  yellow: { tag: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25', bar: 'from-yellow-600 to-yellow-400',   dot: 'bg-yellow-400'  },
  purple: { tag: 'bg-purple-500/15 text-purple-300 border-purple-500/25', bar: 'from-purple-600 to-purple-400',   dot: 'bg-purple-400'  },
  red:    { tag: 'bg-red-500/15 text-red-300 border-red-500/25',           bar: 'bg-red-500',                      dot: 'bg-red-400'     },
}

export default function SkillMap() {
  const { user } = useAuth()
  const [open, setOpen] = useState(null)

  const languages = user?.languages || []
  const topRepos  = user?.top_repos || []

  // Build a skill tree from real language data
  const skillTree = languages.map((lang, i) => {
    const color   = PALETTE[i % PALETTE.length]
    const reposForLang = topRepos.filter((r) => r.lang?.toLowerCase() === lang.name?.toLowerCase())
    const evidence = reposForLang.map((r) => ({
      type: 'repo',
      name: r.name,
      detail: `${r.stars} stars · ${r.forks} forks`,
      url:  r.url,
      score: Math.min(50 + Math.round(r.stars / 2), 99),
    }))

    return {
      skill:    lang.name,
      score:    lang.pct,
      repos:    lang.repos ?? reposForLang.length,
      color,
      evidence,
    }
  })

  const verified   = skillTree.filter((s) => s.score >= 20)
  const partial    = skillTree.filter((s) => s.score >= 8 && s.score < 20)
  const unverified = skillTree.filter((s) => s.score < 8)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="text-cyan-400" size={22} /> Skill Evidence Map
        </h1>
        <p className="text-sm text-dark-300 mt-1">Languages linked to concrete, verifiable GitHub evidence</p>
      </div>

      <div className="glass-card gradient-border flex flex-wrap gap-4 text-xs text-dark-300">
        {[
          { icon: GitCommit,  label: 'Repository',  color: 'text-brand-400'   },
          { icon: Star,       label: 'Stars',        color: 'text-yellow-400'  },
          { icon: CheckCircle,label: 'Verified',     color: 'text-emerald-400' },
        ].map(({ icon: Icon, label, color }) => (
          <span key={label} className={`flex items-center gap-1.5 ${color}`}>
            <Icon size={12} /> {label}
          </span>
        ))}
        <span className="ml-auto text-dark-400">Click any skill to expand evidence</span>
      </div>

      {skillTree.length === 0 ? (
        <div className="glass-card gradient-border text-center py-12 text-dark-400">
          <Network size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No language data yet — log in via demo to see real skills</p>
        </div>
      ) : (
        <div className="space-y-3">
          {skillTree.map((s, i) => {
            const c      = COLOR[s.color]
            const isOpen = open === s.skill
            const hasEvidence = s.evidence.length > 0
            return (
              <motion.div key={s.skill} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-card gradient-border overflow-hidden"
              >
                <button className="w-full flex items-center gap-4 text-left"
                  onClick={() => hasEvidence && setOpen(isOpen ? null : s.skill)}
                >
                  <TechLogo name={s.skill} size={22} />
                  <span className="font-semibold text-white w-28 shrink-0">{s.skill}</span>

                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                        className={`h-full rounded-full ${s.color === 'red' ? c.bar : `bg-gradient-to-r ${c.bar}`}`}
                      />
                    </div>
                    <span className={`text-sm font-black w-12 text-right ${s.score >= 20 ? 'text-emerald-400' : s.score >= 8 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {s.score}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-dark-400">{s.repos} repos</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${c.tag}`}>
                      {s.score >= 20 ? '✓ Primary' : s.score >= 8 ? '◐ Secondary' : '· Minor'}
                    </span>
                    {hasEvidence && (
                      isOpen ? <ChevronDown size={14} className="text-dark-400" /> : <ChevronRight size={14} className="text-dark-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 ml-6 pl-4 border-l-2 border-dashed border-white/10 space-y-2"
                  >
                    {s.evidence.map((ev, ei) => (
                      <motion.div key={ei} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ei * 0.07 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5"
                      >
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                          <GitCommit size={12} className={c.dot.replace('bg-', 'text-')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a href={ev.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold text-white font-mono hover:text-brand-300 transition-colors"
                          >{ev.name}</a>
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
                    ))}
                    {s.evidence.length === 0 && (
                      <p className="text-xs text-dark-500 italic py-2">No top-repo evidence for this language — but it appears in {s.repos} repo(s)</p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {skillTree.length > 0 && (
        <div className="glass-card gradient-border">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Code2 size={14} className="text-brand-400" /> Skill Coverage Summary</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-emerald-400">{verified.length}</p>
              <p className="text-xs text-dark-400">Primary Languages</p>
            </div>
            <div>
              <p className="text-2xl font-black text-yellow-400">{partial.length}</p>
              <p className="text-xs text-dark-400">Secondary</p>
            </div>
            <div>
              <p className="text-2xl font-black text-dark-400">{unverified.length}</p>
              <p className="text-xs text-dark-400">Minor Usage</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
