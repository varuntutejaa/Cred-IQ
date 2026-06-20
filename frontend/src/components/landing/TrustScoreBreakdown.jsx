import { motion } from 'framer-motion'
import { Shield, Github, AlertOctagon, Award, Rocket, GitPullRequest, Link2 } from 'lucide-react'

const DIMENSIONS = [
  { icon: Github,         label: 'GitHub Activity',         score: 95, weight: '20%', color: '#6366f1', desc: 'Commits, PRs, stars, forks, consistency'         },
  { icon: AlertOctagon,   label: 'Project Authenticity',    score: 90, weight: '20%', color: '#10b981', desc: 'Commit patterns, age, code/commit ratio'          },
  { icon: Award,          label: 'Certificate Verification',score: 88, weight: '15%', color: '#f59e0b', desc: 'Issuer lookup, URL check, QR validation'          },
  { icon: Rocket,         label: 'Deployment Health',       score: 97, weight: '20%', color: '#8b5cf6', desc: 'Live status, HTTPS, response time, uptime'        },
  { icon: GitPullRequest, label: 'Resume Accuracy',         score: 91, weight: '15%', color: '#06b6d4', desc: 'Claims vs. evidence, inflated experience flags'   },
  { icon: Link2,          label: 'Proof Chain Completion',  score: 93, weight: '10%', color: '#ec4899', desc: 'Resume → Repo → Deploy → Docs → Certificate'      },
]

const WEIGHTED_SCORE = Math.round(
  DIMENSIONS.reduce((acc, d) => acc + d.score * parseFloat(d.weight) / 100, 0) / (DIMENSIONS.reduce((a, d) => a + parseFloat(d.weight) / 100, 0))
)

export default function TrustScoreBreakdown() {
  return (
    <section id="trust-score" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Dimensions */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-xs font-semibold text-brand-300 mb-4">
                <Shield size={11} /> Unified Trust Engine
              </div>
              <h2 className="section-title mb-4">
                One score.{' '}
                <span className="gradient-text">Six dimensions.</span>
              </h2>
              <p className="text-dark-300 leading-relaxed mb-8">
                The CredIQ Trust Score isn't just a number — it's a weighted composite of six independent verification engines working in parallel to give you a complete picture.
              </p>
            </motion.div>

            <div className="space-y-3">
              {DIMENSIONS.map((d, i) => {
                const Icon = d.icon
                return (
                  <motion.div key={d.label} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: d.color + '20' }}>
                      <Icon size={16} style={{ color: d.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">{d.label}</span>
                        <span className="text-xs font-black" style={{ color: d.color }}>{d.score}</span>
                      </div>
                      <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.score}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 + i * 0.07 }}
                          className="h-full rounded-full" style={{ background: d.color }} />
                      </div>
                      <p className="text-[10px] text-dark-500 mt-0.5">{d.desc}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-dark-500 shrink-0">{d.weight}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Master score display */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            {/* Big ring */}
            <div className="relative">
              <svg width={240} height={240} className="rotate-[-90deg]">
                <circle cx={120} cy={120} r={100} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={14} />
                <motion.circle cx={120} cy={120} r={100} fill="none"
                  stroke="url(#trustGrad)" strokeWidth={14} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 100}
                  initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
                  whileInView={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - 87 / 100) }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.6))' }}
                />
                <defs>
                  <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black gradient-text">87</span>
                <span className="text-sm text-dark-400">/ 100</span>
                <span className="text-xs font-semibold text-brand-300 mt-1">CredIQ Trust Score</span>
              </div>
            </div>

            {/* Mini breakdown */}
            <div className="w-full grid grid-cols-3 gap-2">
              {DIMENSIONS.map((d) => (
                <div key={d.label} className="glass rounded-xl p-2.5 text-center border border-white/5">
                  <p className="text-base font-black" style={{ color: d.color }}>{d.score}</p>
                  <p className="text-[9px] text-dark-400 mt-0.5 leading-tight">{d.label.split(' ')[0]}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-dark-400 text-center max-w-xs leading-relaxed">
              Recalculated in real-time as you add repositories, certificates, and deployments. The more evidence you add, the higher your score.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
