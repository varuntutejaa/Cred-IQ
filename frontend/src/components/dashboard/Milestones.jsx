import { motion } from 'framer-motion'
import { Star, CheckCircle, Circle, Zap, Github, Award, Rocket, Code2, Users, TrendingUp } from 'lucide-react'

const TRACKS = [
  {
    title: 'GitHub Mastery',
    color: '#6366f1',
    icon: Github,
    milestones: [
      { label: 'First Repository',          done: true,  value: '✓' },
      { label: '10 Repositories',           done: true,  value: '✓' },
      { label: '100 Commits',               done: true,  value: '✓' },
      { label: '1,000 Commits',             done: false, value: '1.2K / needed' },
      { label: '300 GitHub Stars',          done: true,  value: '✓' },
      { label: '500 GitHub Stars',          done: false, value: '312 / 500'     },
    ],
  },
  {
    title: 'Deployment Track',
    color: '#8b5cf6',
    icon: Rocket,
    milestones: [
      { label: 'First Deployment',          done: true,  value: '✓' },
      { label: '3 Live Projects',           done: true,  value: '✓' },
      { label: '5 Live Projects',           done: true,  value: '✓' },
      { label: '10 Live Projects',          done: false, value: '9 / 10'        },
      { label: 'All HTTPS Verified',        done: true,  value: '✓' },
      { label: '99%+ Avg Uptime',           done: true,  value: '99.1% ✓'      },
    ],
  },
  {
    title: 'Certification Path',
    color: '#f59e0b',
    icon: Award,
    milestones: [
      { label: 'First Certificate',         done: true,  value: '✓' },
      { label: '3 Certificates',            done: true,  value: '✓' },
      { label: '5 Certificates',            done: true,  value: '✓' },
      { label: '10 Certificates',           done: false, value: '6 / 10'        },
      { label: 'Cloud Certificate (AWS/GCP/Azure)', done: true, value: '✓'    },
      { label: 'Expert-Level Certificate',  done: false, value: 'In progress'   },
    ],
  },
  {
    title: 'Trust Score',
    color: '#10b981',
    icon: TrendingUp,
    milestones: [
      { label: 'Trust Score 50+',           done: true,  value: '✓' },
      { label: 'Trust Score 70+',           done: true,  value: '✓' },
      { label: 'Trust Score 80+',           done: true,  value: '✓' },
      { label: 'Trust Score 90+',           done: false, value: '87 / 90'       },
      { label: 'Trust Score 95+',           done: false, value: 'Locked'        },
      { label: 'Perfect Trust Score (100)', done: false, value: 'Locked'        },
    ],
  },
]

export default function Milestones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="text-brand-400" size={22} /> Milestones</h1>
        <p className="text-sm text-dark-300 mt-1">Track your progress across every dimension of developer growth</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {TRACKS.map((track, ti) => {
          const TrackIcon = track.icon
          const done = track.milestones.filter((m) => m.done).length
          const pct  = Math.round((done / track.milestones.length) * 100)
          return (
            <motion.div key={track.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ti * 0.1 }}
              className="glass-card gradient-border"
            >
              {/* Track header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: track.color + '20' }}>
                    <TrackIcon size={17} style={{ color: track.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{track.title}</h3>
                    <p className="text-[10px] text-dark-400">{done}/{track.milestones.length} completed</p>
                  </div>
                </div>
                <span className="text-base font-black" style={{ color: track.color }}>{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden mb-4">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: ti * 0.1 }}
                  className="h-full rounded-full" style={{ background: track.color }} />
              </div>

              {/* Milestones list */}
              <div className="space-y-2.5">
                {track.milestones.map((m, mi) => (
                  <motion.div key={m.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ti * 0.1 + mi * 0.05 }}
                    className="flex items-center gap-2.5"
                  >
                    {m.done
                      ? <CheckCircle size={15} style={{ color: track.color }} className="shrink-0" />
                      : <Circle size={15} className="text-dark-600 shrink-0" />
                    }
                    <span className={`text-xs flex-1 ${m.done ? 'text-white' : 'text-dark-400'}`}>{m.label}</span>
                    {!m.done && m.value !== 'Locked' && (
                      <span className="text-[10px] font-mono" style={{ color: track.color }}>{m.value}</span>
                    )}
                    {m.value === 'Locked' && (
                      <span className="text-[10px] text-dark-500">Locked</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
