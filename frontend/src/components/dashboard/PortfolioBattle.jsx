import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Github, CheckCircle, Star, GitCommit, Rocket, Award, Trophy, Zap } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const DEV_A = {
  name: 'Varun T.',
  handle: 'varun-dev',
  avatar: 'V',
  color: '#6366f1',
  trustScore: 87,
  githubScore: 92,
  repos: 47,
  stars: 312,
  commits: 1200,
  deployments: 9,
  certifications: 6,
  verifiedSkills: 14,
  skills: ['Python', 'React', 'Flask', 'MongoDB', 'TypeScript'],
  radar: [
    { dim: 'Backend',     v: 88 },
    { dim: 'Frontend',    v: 74 },
    { dim: 'DevOps',      v: 52 },
    { dim: 'Open Source', v: 67 },
    { dim: 'Activity',    v: 91 },
    { dim: 'Projects',    v: 86 },
  ],
}

const DEV_B = {
  name: 'Priya S.',
  handle: 'priya-dev',
  avatar: 'P',
  color: '#10b981',
  trustScore: 79,
  githubScore: 84,
  repos: 31,
  stars: 178,
  commits: 870,
  deployments: 6,
  certifications: 8,
  verifiedSkills: 11,
  skills: ['JavaScript', 'Vue', 'Node.js', 'PostgreSQL', 'Docker'],
  radar: [
    { dim: 'Backend',     v: 72 },
    { dim: 'Frontend',    v: 89 },
    { dim: 'DevOps',      v: 74 },
    { dim: 'Open Source', v: 55 },
    { dim: 'Activity',    v: 78 },
    { dim: 'Projects',    v: 71 },
  ],
}

const METRICS = [
  { key: 'trustScore',      label: 'Trust Score',       icon: CheckCircle, higher: true  },
  { key: 'githubScore',     label: 'GitHub Score',      icon: Github,      higher: true  },
  { key: 'repos',           label: 'Repositories',      icon: Github,      higher: true  },
  { key: 'stars',           label: 'Total Stars',       icon: Star,        higher: true  },
  { key: 'commits',         label: 'Total Commits',     icon: GitCommit,   higher: true  },
  { key: 'deployments',     label: 'Live Deployments',  icon: Rocket,      higher: true  },
  { key: 'certifications',  label: 'Certifications',    icon: Award,       higher: true  },
  { key: 'verifiedSkills',  label: 'Verified Skills',   icon: CheckCircle, higher: true  },
]

const radarMerge = DEV_A.radar.map((d, i) => ({
  dim: d.dim,
  A: d.v,
  B: DEV_B.radar[i].v,
}))

function DevHeader({ dev }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center p-4 glass rounded-2xl border border-white/8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: dev.color + '25', color: dev.color }}>
        {dev.avatar}
      </div>
      <div>
        <p className="font-bold text-white">{dev.name}</p>
        <p className="text-xs font-mono" style={{ color: dev.color }}>@{dev.handle}</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-black" style={{ color: dev.color }}>{dev.trustScore}</p>
        <p className="text-[10px] text-dark-400">Trust Score</p>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {dev.skills.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-dark-300">{s}</span>
        ))}
        {dev.skills.length > 3 && <span className="text-[10px] text-dark-400">+{dev.skills.length - 3}</span>}
      </div>
    </div>
  )
}

export default function PortfolioBattle() {
  const [started, setStarted] = useState(false)
  const [step, setStep]       = useState(0)

  const winner = DEV_A.trustScore > DEV_B.trustScore ? DEV_A : DEV_B

  const startBattle = async () => {
    setStarted(true)
    for (let i = 0; i <= METRICS.length; i++) {
      await new Promise((r) => setTimeout(r, 300))
      setStep(i)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="text-red-400" size={22} /> Portfolio Battle Mode
        </h1>
        <p className="text-sm text-dark-300 mt-1">Compare two developer portfolios head-to-head across every metric</p>
      </div>

      {/* Developer headers */}
      <div className="grid grid-cols-3 gap-4 items-center">
        <DevHeader dev={DEV_A} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <Swords size={20} className="text-red-400" />
          </div>
          <span className="text-sm font-bold text-dark-300">VS</span>
          {!started && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={startBattle}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5"
            >
              <Zap size={14} /> Battle!
            </motion.button>
          )}
          {started && step >= METRICS.length && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex flex-col items-center gap-1"
            >
              <Trophy size={24} className="text-yellow-400" />
              <p className="text-xs font-bold text-yellow-400">{winner.name} wins!</p>
            </motion.div>
          )}
        </div>
        <DevHeader dev={DEV_B} />
      </div>

      {/* Metrics comparison */}
      {started && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {METRICS.map(({ key, label, icon: Icon }, i) => {
            if (i >= step) return null
            const vA = DEV_A[key], vB = DEV_B[key]
            const aWins = vA >= vB
            const maxV  = Math.max(vA, vB, 1)
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card gradient-border"
              >
                <div className="grid grid-cols-3 items-center gap-4">
                  {/* A value */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(vA / maxV) * 100}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: DEV_A.color }} />
                    </div>
                    <span className={`text-sm font-black w-10 text-right ${aWins ? 'text-white' : 'text-dark-400'}`}>{vA}</span>
                    {aWins && <Trophy size={12} className="text-yellow-400 shrink-0" />}
                  </div>

                  {/* Label */}
                  <div className="flex items-center gap-1.5 justify-center">
                    <Icon size={12} className="text-dark-400" />
                    <span className="text-xs text-dark-300 text-center">{label}</span>
                  </div>

                  {/* B value */}
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(vB / maxV) * 100}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: DEV_B.color }} />
                    </div>
                    <span className={`text-sm font-black w-10 text-left ${!aWins ? 'text-white' : 'text-dark-400'}`}>{vB}</span>
                    {!aWins && <Trophy size={12} className="text-yellow-400 shrink-0" />}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Radar comparison */}
      {started && step >= METRICS.length && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-border">
          <h3 className="font-semibold text-white mb-2">Skill Radar Comparison</h3>
          <div className="flex justify-center gap-6 mb-3">
            {[DEV_A, DEV_B].map((d) => (
              <span key={d.handle} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: d.color }}>
                <span className="w-3 h-0.5 rounded" style={{ background: d.color }} />{d.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarMerge}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Radar dataKey="A" name={DEV_A.name} stroke={DEV_A.color} fill={DEV_A.color} fillOpacity={0.15} strokeWidth={2} />
              <Radar dataKey="B" name={DEV_B.name} stroke={DEV_B.color} fill={DEV_B.color} fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
