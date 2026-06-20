import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Search, Plus, X, CheckCircle, Zap, Star, GitCommit, Rocket, Award, TrendingUp } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const CANDIDATE_DB = [
  { id: 1, name: 'Varun T.',  handle: 'varun-dev',  color: '#6366f1', trustScore: 87, githubScore: 92, builderScore: 94, repos: 47, stars: 312, commits: 1200, deployments: 9,  certs: 6, skills: ['Python','React','Flask','MongoDB'], radar: [88,74,52,67,91,86] },
  { id: 2, name: 'Priya S.',  handle: 'priya-dev',  color: '#10b981', trustScore: 79, githubScore: 84, builderScore: 81, repos: 31, stars: 178, commits: 870,  deployments: 6,  certs: 8, skills: ['JavaScript','Vue','Node.js','PostgreSQL'], radar: [72,89,74,55,78,71] },
  { id: 3, name: 'Arjun M.',  handle: 'arjunm',     color: '#f59e0b', trustScore: 91, githubScore: 89, builderScore: 88, repos: 62, stars: 421, commits: 1840, deployments: 14, certs: 4, skills: ['Java','Spring Boot','AWS','Docker'], radar: [93,68,88,71,85,90] },
  { id: 4, name: 'Sneha R.',  handle: 'snehadev',   color: '#ec4899', trustScore: 74, githubScore: 71, builderScore: 72, repos: 24, stars: 89,  commits: 560,  deployments: 3,  certs: 5, skills: ['Python','TensorFlow','FastAPI'], radar: [76,61,45,82,69,74] },
  { id: 5, name: 'Rohan K.',  handle: 'rohanK',     color: '#06b6d4', trustScore: 83, githubScore: 86, builderScore: 85, repos: 38, stars: 234, commits: 1100, deployments: 21, certs: 7, skills: ['Docker','Kubernetes','AWS','Terraform'], radar: [80,62,96,59,83,88] },
]

const RADAR_DIMS = ['Backend','Frontend','DevOps','Open Source','Activity','Projects']

const METRICS = [
  { key: 'trustScore',    label: 'Trust Score',      icon: CheckCircle },
  { key: 'githubScore',   label: 'GitHub Score',     icon: TrendingUp  },
  { key: 'builderScore',  label: 'Builder Score',    icon: Zap         },
  { key: 'repos',         label: 'Repositories',     icon: Star        },
  { key: 'commits',       label: 'Commits',          icon: GitCommit   },
  { key: 'deployments',   label: 'Live Deployments', icon: Rocket      },
  { key: 'certs',         label: 'Certifications',   icon: Award       },
  { key: 'stars',         label: 'GitHub Stars',     icon: Star        },
]

function CandidatePicker({ onSelect, exclude }) {
  const [q, setQ] = useState('')
  const filtered = CANDIDATE_DB.filter((c) => !exclude.includes(c.id) && (c.name.toLowerCase().includes(q.toLowerCase()) || c.handle.includes(q.toLowerCase())))
  return (
    <div className="glass-card gradient-border">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input type="text" placeholder="Search candidate..." value={q} onChange={(e) => setQ(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
        />
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: c.color + '25', color: c.color }}>{c.name[0]}</div>
            <div>
              <p className="text-xs font-semibold text-white">{c.name}</p>
              <p className="text-[10px] font-mono" style={{ color: c.color }}>@{c.handle}</p>
            </div>
            <span className="ml-auto text-xs font-black text-white">{c.trustScore}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-xs text-dark-400 text-center py-3">No candidates found</p>}
      </div>
    </div>
  )
}

export default function CandidateComparison() {
  const [selected, setSelected] = useState([CANDIDATE_DB[0], CANDIDATE_DB[2]])
  const [picking, setPicking]   = useState(null)

  const swap = (slot, candidate) => {
    const next = [...selected]
    next[slot] = candidate
    setSelected(next)
    setPicking(null)
  }

  const radarData = RADAR_DIMS.map((dim, i) => ({
    dim,
    ...(selected[0] ? { A: selected[0].radar[i] } : {}),
    ...(selected[1] ? { B: selected[1].radar[i] } : {}),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompare className="text-cyan-400" size={22} /> Candidate Comparison
        </h1>
        <p className="text-sm text-dark-300 mt-1">Side-by-side deep comparison of any two developer profiles</p>
      </div>

      {/* Slot headers */}
      <div className="grid grid-cols-3 gap-4 items-start">
        {[0, null, 1].map((slot, i) => {
          if (slot === null) return (
            <div key="vs" className="flex flex-col items-center gap-2 pt-4">
              <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/8 flex items-center justify-center">
                <GitCompare size={18} className="text-dark-400" />
              </div>
              <span className="text-xs font-bold text-dark-400">VS</span>
            </div>
          )
          const c = selected[slot]
          return (
            <div key={slot}>
              {c ? (
                <div className="glass-card gradient-border text-center relative">
                  <button onClick={() => { const next = [...selected]; next[slot] = null; setSelected(next) }}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/8 text-dark-400 hover:text-white transition-all">
                    <X size={13} />
                  </button>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-2" style={{ background: c.color + '25', color: c.color }}>{c.name[0]}</div>
                  <p className="font-bold text-white text-sm">{c.name}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: c.color }}>@{c.handle}</p>
                  <p className="text-2xl font-black mt-2" style={{ color: c.color }}>{c.trustScore}</p>
                  <p className="text-[10px] text-dark-400">Trust Score</p>
                  <button onClick={() => setPicking(slot)} className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors">Change →</button>
                </div>
              ) : (
                <button onClick={() => setPicking(slot)}
                  className="w-full glass-card gradient-border text-center border-dashed hover:border-brand-500/40 transition-all py-8 group"
                >
                  <Plus size={20} className="mx-auto mb-2 text-dark-500 group-hover:text-brand-400 transition-colors" />
                  <p className="text-xs text-dark-400 group-hover:text-brand-300 transition-colors">Select Candidate</p>
                </button>
              )}
              {picking === slot && <div className="mt-2"><CandidatePicker onSelect={(c) => swap(slot, c)} exclude={selected.filter(Boolean).map((s) => s.id)} /></div>}
            </div>
          )
        })}
      </div>

      {selected[0] && selected[1] && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Metric bars */}
          <div className="glass-card gradient-border space-y-3">
            <h3 className="font-semibold text-white mb-4">Head-to-Head Metrics</h3>
            {METRICS.map(({ key, label, icon: Icon }) => {
              const vA = selected[0][key], vB = selected[1][key]
              const max = Math.max(vA, vB, 1)
              const aWins = vA >= vB
              return (
                <div key={key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex items-center gap-2 justify-end">
                    <span className={`text-sm font-black ${aWins ? 'text-white' : 'text-dark-400'}`}>{vA}</span>
                    {aWins && <Star size={10} className="text-yellow-400" />}
                    <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(vA / max) * 100}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: selected[0].color }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-dark-400 w-24 text-center">
                    <Icon size={10} />{label}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(vB / max) * 100}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: selected[1].color }} />
                    </div>
                    {!aWins && <Star size={10} className="text-yellow-400" />}
                    <span className={`text-sm font-black ${!aWins ? 'text-white' : 'text-dark-400'}`}>{vB}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Radar */}
          <div className="glass-card gradient-border">
            <h3 className="font-semibold text-white mb-2">Skill Radar</h3>
            <div className="flex justify-center gap-6 mb-3">
              {selected.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: c.color }}>
                  <span className="w-3 h-0.5 rounded" style={{ background: c.color }} />{c.name}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                <Radar dataKey="A" name={selected[0].name} stroke={selected[0].color} fill={selected[0].color} fillOpacity={0.15} strokeWidth={2} />
                <Radar dataKey="B" name={selected[1].name} stroke={selected[1].color} fill={selected[1].color} fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
}
