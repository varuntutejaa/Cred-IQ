import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Shield, Rocket, GitCommit, Users, Award, Lock } from 'lucide-react'

const ACHIEVEMENTS = [
  { icon: GitCommit, color: '#6366f1', title: 'Commit Streak Master',    desc: '30-day commit streak maintained',            earned: true,  date: 'May 2024',  rarity: 'Common'    },
  { icon: Rocket,    color: '#10b981', title: 'Deployer',                desc: 'First live deployment verified',             earned: true,  date: 'Nov 2022',  rarity: 'Common'    },
  { icon: Star,      color: '#f59e0b', title: 'Star Collector',          desc: '100+ GitHub stars earned',                  earned: true,  date: 'Feb 2023',  rarity: 'Uncommon'  },
  { icon: Shield,    color: '#8b5cf6', title: 'Trust Champion',          desc: 'Trust Score above 85',                      earned: true,  date: 'Jun 2024',  rarity: 'Rare'      },
  { icon: Trophy,    color: '#f59e0b', title: 'Hackathon Winner',        desc: 'Won a recognized hackathon',                earned: true,  date: 'Feb 2023',  rarity: 'Rare'      },
  { icon: Users,     color: '#06b6d4', title: 'Open Source Contributor', desc: 'PR merged in external repository',          earned: true,  date: 'Apr 2024',  rarity: 'Uncommon'  },
  { icon: Award,     color: '#ec4899', title: 'Certified Expert',        desc: '5+ verified certifications',                earned: true,  date: 'Oct 2023',  rarity: 'Rare'      },
  { icon: Zap,       color: '#10b981', title: 'Builder Confidence 90+',  desc: 'Builder score exceeded 90%',               earned: true,  date: 'Jun 2024',  rarity: 'Epic'      },
  { icon: GitCommit, color: '#6366f1', title: 'Prolific Developer',      desc: '1000+ total commits across all repos',      earned: false, date: null,        rarity: 'Rare'      },
  { icon: Star,      color: '#f59e0b', title: 'Star Power',              desc: '500+ total GitHub stars',                   earned: false, date: null,        rarity: 'Epic'      },
  { icon: Users,     color: '#06b6d4', title: 'Community Leader',        desc: '10 PRs merged in open source projects',    earned: false, date: null,        rarity: 'Epic'      },
  { icon: Trophy,    color: '#ec4899', title: 'Perfect Trust Score',     desc: 'Trust Score reaches 100',                  earned: false, date: null,        rarity: 'Legendary' },
]

const RARITY = {
  Common:    'text-dark-300 bg-dark-600/60 border-white/8',
  Uncommon:  'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  Rare:      'text-brand-300 bg-brand-500/10 border-brand-500/20',
  Epic:      'text-purple-300 bg-purple-500/10 border-purple-500/20',
  Legendary: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
}

export default function Achievements() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned).length
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-yellow-400" size={22} /> Achievements</h1>
          <p className="text-sm text-dark-300 mt-1">Earn badges by hitting real developer milestones</p>
        </div>
        <div className="glass-card gradient-border text-center px-6">
          <p className="text-2xl font-black gradient-text">{earned}/{ACHIEVEMENTS.length}</p>
          <p className="text-xs text-dark-400">Unlocked</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass-card gradient-border">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-dark-300">Achievement Progress</span>
          <span className="font-semibold text-white">{Math.round(earned / ACHIEVEMENTS.length * 100)}%</span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(earned / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a, i) => {
          const Icon = a.icon
          const rarityClass = RARITY[a.rarity]
          return (
            <motion.div key={a.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`glass-card gradient-border relative overflow-hidden ${!a.earned ? 'opacity-50' : ''}`}
            >
              {!a.earned && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-900/40 backdrop-blur-[1px] z-10 rounded-2xl">
                  <Lock size={20} className="text-dark-400" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.color + '20' }}>
                  <Icon size={20} style={{ color: a.earned ? a.color : '#475569' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-white text-sm">{a.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${rarityClass}`}>{a.rarity}</span>
                  </div>
                  <p className="text-xs text-dark-300">{a.desc}</p>
                  {a.earned && a.date && (
                    <p className="text-[10px] text-dark-500 mt-1.5">Earned {a.date}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
