import { motion } from 'framer-motion'
import { Link2, FileText, Github, Rocket, BookOpen, Award, CheckCircle, AlertTriangle, ArrowDown } from 'lucide-react'

const CHAINS = [
  {
    project: 'Expense Tracker',
    score: 94,
    chain: [
      { step: 'Resume Claim',   icon: FileText,   status: 'done',  detail: 'Listed as "Full-Stack Python Project"'          },
      { step: 'GitHub Repo',    icon: Github,     status: 'done',  detail: '187 commits · 14 months old · Active'           },
      { step: 'Deployment',     icon: Rocket,     status: 'done',  detail: 'expense-tracker.vercel.app · Live · 99.2% uptime'},
      { step: 'Documentation',  icon: BookOpen,   status: 'done',  detail: 'README.md found · 423 words · Detailed'         },
      { step: 'Certificate',    icon: Award,      status: 'skip',  detail: 'No certificate required for this project'        },
      { step: 'Verified',       icon: CheckCircle,status: 'final', detail: 'All critical chain links confirmed'              },
    ],
  },
  {
    project: 'AI Resume Builder',
    score: 88,
    chain: [
      { step: 'Resume Claim',   icon: FileText,   status: 'done',  detail: 'Listed as "Team project with AI integration"'   },
      { step: 'GitHub Repo',    icon: Github,     status: 'done',  detail: '243 commits · 3 contributors · 9 months'        },
      { step: 'Deployment',     icon: Rocket,     status: 'done',  detail: 'ai-resume.netlify.app · Live · 98.7% uptime'    },
      { step: 'Documentation',  icon: BookOpen,   status: 'warn',  detail: 'README exists but lacks setup instructions'      },
      { step: 'Certificate',    icon: Award,      status: 'skip',  detail: 'Not applicable'                                  },
      { step: 'Verified',       icon: CheckCircle,status: 'final', detail: '5/5 critical links verified (docs partial)'      },
    ],
  },
  {
    project: 'ML Classifier Demo',
    score: 19,
    chain: [
      { step: 'Resume Claim',   icon: FileText,   status: 'done',  detail: 'Listed as "ML Project with 95% accuracy"'       },
      { step: 'GitHub Repo',    icon: Github,     status: 'fail',  detail: '3 commits · 2 days old · 18,700 lines — FLAGGED'},
      { step: 'Deployment',     icon: Rocket,     status: 'fail',  detail: 'No live deployment found'                       },
      { step: 'Documentation',  icon: BookOpen,   status: 'fail',  detail: 'No README file'                                  },
      { step: 'Certificate',    icon: Award,      status: 'skip',  detail: 'Not applicable'                                  },
      { step: 'Verified',       icon: CheckCircle,status: 'broken',detail: 'Chain broken — project authenticity unconfirmed' },
    ],
  },
]

const STEP_CFG = {
  done:   { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', line: 'bg-emerald-500/40', badge: 'badge-verified' },
  warn:   { color: 'text-yellow-400',  bg: 'bg-yellow-500/15 border-yellow-500/25',  line: 'bg-yellow-500/40',  badge: 'badge-warning'  },
  fail:   { color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/25',        line: 'bg-red-500/40',     badge: 'badge-danger'   },
  skip:   { color: 'text-dark-400',    bg: 'bg-dark-700/50 border-white/5',          line: 'bg-white/10',       badge: ''               },
  final:  { color: 'text-brand-400',   bg: 'bg-brand-500/15 border-brand-500/25',    line: '',                  badge: ''               },
  broken: { color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/25',        line: '',                  badge: 'badge-danger'   },
}

export default function ProofChain() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="text-brand-400" size={22} /> Proof Chain Verification
        </h1>
        <p className="text-sm text-dark-300 mt-1">End-to-end verification chain for every project — from claim to proof</p>
      </div>

      {/* Legend */}
      <div className="glass-card gradient-border flex flex-wrap gap-4 text-xs">
        {[
          { cls: 'badge-verified', label: 'Verified link' },
          { cls: 'badge-warning',  label: 'Partial'       },
          { cls: 'badge-danger',   label: 'Failed'        },
        ].map(({ cls, label }) => (
          <span key={label} className={`${cls}`}>{label}</span>
        ))}
        <span className="ml-auto text-dark-400">Each link must be confirmed for a complete chain</span>
      </div>

      <div className="space-y-8">
        {CHAINS.map((ch, ci) => {
          const scoreColor = ch.score >= 80 ? 'text-emerald-400' : ch.score >= 50 ? 'text-yellow-400' : 'text-red-400'
          return (
            <motion.div key={ch.project} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.12 }}
              className="glass-card gradient-border"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-white text-lg">{ch.project}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">Proof chain integrity analysis</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black ${scoreColor}`}>{ch.score}%</p>
                  <p className="text-[10px] text-dark-400">chain score</p>
                </div>
              </div>

              {/* Chain steps */}
              <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0">
                {ch.chain.map((step, si) => {
                  const Icon = step.icon
                  const cfg = STEP_CFG[step.status]
                  const isLast = si === ch.chain.length - 1
                  return (
                    <div key={step.step} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
                      {/* Step box */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: ci * 0.12 + si * 0.08 }}
                        className={`w-full md:flex-1 flex flex-col items-center text-center p-3 rounded-xl border ${cfg.bg}`}
                      >
                        <Icon size={18} className={`${cfg.color} mb-1.5`} />
                        <p className="text-[11px] font-semibold text-white leading-tight">{step.step}</p>
                        <p className="text-[9px] text-dark-400 mt-1 leading-tight line-clamp-2">{step.detail}</p>
                      </motion.div>

                      {/* Arrow */}
                      {!isLast && (
                        <div className="flex items-center justify-center my-1 md:my-0 md:mx-1 shrink-0">
                          <ArrowDown size={14} className="md:rotate-[-90deg] text-dark-500" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Score bar */}
              <div className="mt-4 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${ch.score}%` }} transition={{ duration: 0.8, delay: ci * 0.15 }}
                  className={`h-full rounded-full ${ch.score >= 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : ch.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
