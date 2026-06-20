import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, CheckCircle, TrendingUp, Rocket, Code2,
  Network, Users, Star, RefreshCw, Download, Share2
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const DIMENSIONS = [
  { key: 'evidence',    icon: CheckCircle, label: 'Evidence Strength',       score: 96, color: '#10b981', desc: '12 repos with commit history backing claimed skills'   },
  { key: 'consistency', icon: TrendingUp,  label: 'Consistency',             score: 91, color: '#6366f1', desc: '847 contributions, no 3-week gaps in 14 months'        },
  { key: 'completion',  icon: Rocket,      label: 'Project Completion Rate', score: 88, color: '#8b5cf6', desc: '9 of 11 projects have live deployments'                },
  { key: 'deployment',  icon: Star,        label: 'Deployment Quality',      score: 97, color: '#f59e0b', desc: 'Avg 99.1% uptime · All HTTPS · <300ms response time'   },
  { key: 'breadth',     icon: Network,     label: 'Technical Breadth',       score: 82, color: '#06b6d4', desc: '5 languages, 3 frameworks, full-stack demonstrated'     },
  { key: 'depth',       icon: Code2,       label: 'Technical Depth',         score: 89, color: '#ec4899', desc: 'Complex systems detected: auth, DB, REST, file storage'  },
  { key: 'oss',         icon: Users,       label: 'Open Source Participation',score: 74, color: '#10b981', desc: '312 stars · 2 external PRs merged · Public packages'    },
]

const RADAR_DATA = DIMENSIONS.map((d) => ({ dim: d.label.split(' ')[0], score: d.score }))

const BUILDER_SCORE = Math.round(DIMENSIONS.reduce((a, d) => a + d.score, 0) / DIMENSIONS.length)

const AI_SUMMARY = `This developer consistently ships production-ready projects and has strong evidence supporting every claimed skill. Commit patterns show authentic, organic development spread across 14 months with no suspicious spikes. 9 live deployments verified with >99% uptime. Technical breadth spans full-stack development with demonstrated depth in backend systems.`

function ScoreGauge({ score }) {
  const r = 80, stroke = 12, circ = Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center">
      <svg width={200} height={120} viewBox="0 0 200 120">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} strokeLinecap="round" />
        <motion.path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div className="absolute bottom-2 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-5xl font-black text-white"
        >{score}%</motion.p>
        <p className="text-xs text-dark-400 mt-0.5">Builder Confidence</p>
      </div>
    </div>
  )
}

export default function BuilderConfidence() {
  const [loading, setLoading]   = useState(false)
  const [analyzed, setAnalyzed] = useState(true)

  const reanalyze = async () => {
    setAnalyzed(false)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    setAnalyzed(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-emerald-400" size={22} /> Builder Confidence Score
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            <span className="text-white font-medium">"Can this candidate actually build?"</span> — answered with evidence.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reanalyze} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-60">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Reanalyze'}
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {loading && (
        <div className="glass-card gradient-border space-y-2">
          <p className="text-sm font-semibold text-dark-300">Calculating builder confidence...</p>
          {['Scanning commit authenticity', 'Checking project completion', 'Verifying deployment health', 'Measuring technical breadth', 'Computing final score'].map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
              className="flex items-center gap-2 text-xs text-dark-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{s}
            </motion.div>
          ))}
        </div>
      )}

      {analyzed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Hero score */}
          <div className="glass-card gradient-border bg-emerald-500/3 border-emerald-500/15">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <ScoreGauge score={BUILDER_SCORE} />
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-400">High Confidence Builder</span>
                </div>
                <span className="badge-verified mt-2 text-xs">Production-Ready Developer</span>
              </div>

              {/* AI summary */}
              <div className="space-y-4">
                <div className="bg-emerald-500/6 border border-emerald-500/15 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Zap size={11} /> AI Summary
                  </p>
                  <p className="text-sm text-dark-200 leading-relaxed">{AI_SUMMARY}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Projects Shipped',    value: '9 live',    color: 'text-brand-400'   },
                    { label: 'Fake Repos Detected', value: 'None',      color: 'text-emerald-400' },
                    { label: 'Skills with Evidence',value: '86%',       color: 'text-cyan-400'    },
                    { label: 'Deployment Uptime',   value: '99.1%',     color: 'text-yellow-400'  },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="glass rounded-xl p-3 border border-white/5">
                      <p className={`text-base font-black ${color}`}>{value}</p>
                      <p className="text-[10px] text-dark-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dimension breakdown */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="glass-card gradient-border space-y-3">
              <h3 className="font-semibold text-white mb-4">Dimension Breakdown</h3>
              {DIMENSIONS.map((d, i) => {
                const Icon = d.icon
                return (
                  <motion.div key={d.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: d.color + '20' }}>
                      <Icon size={14} style={{ color: d.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">{d.label}</span>
                        <span className="text-xs font-black" style={{ color: d.color }}>{d.score}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden mb-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                          className="h-full rounded-full" style={{ background: d.color }} />
                      </div>
                      <p className="text-[10px] text-dark-500 leading-relaxed">{d.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Radar */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4">Confidence Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                  <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>

              {/* Share CTA */}
              <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 glass glass-hover border border-white/10 rounded-xl py-2.5 text-xs font-medium text-dark-200 hover:text-white transition-all">
                  <Share2 size={12} /> Share Builder Score
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 glass glass-hover border border-white/10 rounded-xl py-2.5 text-xs font-medium text-dark-200 hover:text-white transition-all">
                  <Download size={12} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
