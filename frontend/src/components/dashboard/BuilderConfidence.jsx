import { motion } from 'framer-motion'
import {
  Zap, CheckCircle, TrendingUp, Rocket, Code2,
  Network, Users, Star, Share2
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../../context/AuthContext'

const MAXES = { deployment_signal: 35, code_volume: 25, project_diversity: 20, recency: 20 }
const LABELS = {
  deployment_signal: { label: 'Deployment Signal',   icon: Rocket,      color: '#f59e0b', desc: 'Live URLs and deployments found in repo descriptions' },
  code_volume:       { label: 'Code Volume',          icon: Code2,       color: '#6366f1', desc: 'Total lines of code across all public repositories'    },
  project_diversity: { label: 'Project Diversity',    icon: Network,     color: '#06b6d4', desc: 'Variety of domains: web, API, ML, CLI, mobile, DevOps' },
  recency:           { label: 'Recent Activity',      icon: TrendingUp,  color: '#10b981', desc: 'Projects pushed within the last 90 days'               },
}

function ScoreGauge({ score }) {
  const r = 80, stroke = 12, circ = Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
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
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
          className="text-5xl font-black text-white"
        >{score ?? '—'}</motion.p>
        <p className="text-xs text-dark-400 mt-0.5">Builder Score</p>
      </div>
    </div>
  )
}

export default function BuilderConfidence() {
  const { user } = useAuth()

  const builderScore = user?.builder_score ?? 0
  const breakdown    = user?.builder_breakdown ?? {}
  const signals      = user?.signals ?? {}

  const dimensions = Object.entries(LABELS).map(([key, meta]) => {
    const raw  = breakdown[key] ?? 0
    const max  = MAXES[key]
    const pct  = Math.round((raw / max) * 100)
    return { key, ...meta, score: pct, raw, max }
  })

  const radarData = dimensions.map((d) => ({
    dim:   d.label.split(' ')[0],
    score: d.score,
  }))

  const label = builderScore >= 75 ? 'High Confidence Builder' : builderScore >= 50 ? 'Developing Builder' : 'Early Stage Builder'
  const badge = builderScore >= 75 ? 'Production-Ready Developer' : builderScore >= 50 ? 'Building Experience' : 'Growing Developer'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-emerald-400" size={22} /> Builder Confidence Score
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            <span className="text-white font-medium">"Can this candidate actually build?"</span> — answered with evidence.
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="glass-card gradient-border bg-emerald-500/3 border-emerald-500/15">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center">
              <ScoreGauge score={builderScore} />
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">{label}</span>
              </div>
              <span className="badge-verified mt-2 text-xs">{badge}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Public Repos',     value: user?.public_repos  ?? '—', color: 'text-brand-400'   },
                  { label: 'GitHub Stars',      value: user?.total_stars   ?? '—', color: 'text-yellow-400'  },
                  { label: 'Commits (12 mo)',   value: user?.commit_count  ?? '—', color: 'text-cyan-400'    },
                  { label: 'Languages Known',   value: user?.languages?.length ?? '—', color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-xl p-3 border border-white/5">
                    <p className={`text-base font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-dark-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-500/6 border border-emerald-500/15 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <Zap size={11} /> Builder Signal
                </p>
                <p className="text-sm text-dark-200 leading-relaxed">
                  Scores are computed from real GitHub data — deployment links, code volume, project diversity, and recent activity.
                  {builderScore >= 75 ? ' Strong signals across all dimensions.' : builderScore >= 50 ? ' Moderate signals with room to grow.' : ' Early-stage signals; keep building.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass-card gradient-border space-y-3">
            <h3 className="font-semibold text-white mb-4">Dimension Breakdown</h3>
            {dimensions.map((d, i) => {
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
                      <span className="text-xs font-black" style={{ color: d.color }}>{d.raw}/{d.max} pts</span>
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

          <div className="glass-card gradient-border">
            <h3 className="font-semibold text-white mb-4">Confidence Radar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 glass glass-hover border border-white/10 rounded-xl py-2.5 text-xs font-medium text-dark-200 hover:text-white transition-all">
                <Share2 size={12} /> Share Builder Score
              </button>
              <div className="flex-1 text-center py-2.5">
                <span className="text-xs text-dark-400">Trust Score: <span className="text-white font-bold">{user?.trust_score ?? '—'}</span></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
