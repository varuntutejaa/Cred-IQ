import { motion } from 'framer-motion'
import { Zap, CheckCircle, TrendingUp, Rocket, Code2, Network, Users, Star } from 'lucide-react'

const DIMENSIONS = [
  { icon: CheckCircle, label: 'Evidence Strength',      score: 96, color: '#10b981' },
  { icon: TrendingUp,  label: 'Consistency',            score: 91, color: '#6366f1' },
  { icon: Rocket,      label: 'Project Completion Rate',score: 88, color: '#8b5cf6' },
  { icon: Star,        label: 'Deployment Quality',     score: 97, color: '#f59e0b' },
  { icon: Network,     label: 'Technical Breadth',      score: 82, color: '#06b6d4' },
  { icon: Code2,       label: 'Technical Depth',        score: 89, color: '#ec4899' },
  { icon: Users,       label: 'Open Source Participation', score: 74, color: '#10b981' },
]

export default function BuilderConfidenceSection() {
  return (
    <section id="builder-confidence" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-4">
            <Zap size={11} /> Signature Feature
          </div>
          <h2 className="section-title">
            "Can this candidate{' '}
            <span className="gradient-text">actually build</span>?"
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            The Builder Confidence Score answers the only question that matters in technical hiring — not what someone claims to know, but what they've actually shipped.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Score dimensions */}
          <div className="space-y-3">
            {DIMENSIONS.map((d, i) => {
              const Icon = d.icon
              return (
                <motion.div key={d.label} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: d.color + '20' }}>
                    <Icon size={15} style={{ color: d.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-dark-300 font-medium">{d.label}</span>
                      <span className="font-bold" style={{ color: d.color }}>{d.score}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.score}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 + i * 0.07 }}
                        className="h-full rounded-full" style={{ background: d.color }} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Output card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="glass-card gradient-border"
          >
            {/* Score header */}
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
              <div className="relative w-20 h-20 shrink-0">
                <svg width="80" height="80" className="rotate-[-90deg]">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle cx="40" cy="40" r="32" fill="none"
                    stroke="#10b981" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 32}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - 0.94) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-emerald-400">94%</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Builder Confidence</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400">High Confidence Builder</span>
                </div>
                <span className="badge-verified mt-2 text-[10px]">Production-Ready</span>
              </div>
            </div>

            {/* AI summary */}
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <Zap size={11} /> AI Summary
              </p>
              <p className="text-sm text-dark-200 leading-relaxed italic">
                "This developer consistently ships production-ready projects and has strong evidence supporting every claimed skill. Commit patterns show authentic, organic development. 9 live deployments verified."
              </p>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Projects Shipped',   value: '9 live', color: 'text-brand-400'   },
                { label: 'Fake Repos Detected', value: '0',      color: 'text-emerald-400' },
                { label: 'Skill Backed by Code',value: '86%',    color: 'text-cyan-400'    },
                { label: 'Recruiter Rating',    value: '4.9/5',  color: 'text-yellow-400'  },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass rounded-xl p-3 border border-white/5">
                  <p className={`text-base font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-dark-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
