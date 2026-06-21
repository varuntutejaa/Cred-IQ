import { motion } from 'framer-motion'
import { Link2, Github, Star, GitFork, Code2, CheckCircle, AlertTriangle, ArrowDown, GitCommit } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import TechLogo from '../shared/TechLogo'

const STEP_CFG = {
  done:   { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  warn:   { color: 'text-yellow-400',  bg: 'bg-yellow-500/15 border-yellow-500/25'  },
  fail:   { color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/25'        },
  skip:   { color: 'text-dark-400',    bg: 'bg-dark-700/50 border-white/5'          },
  final:  { color: 'text-brand-400',   bg: 'bg-brand-500/15 border-brand-500/25'    },
  broken: { color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/25'        },
}

function repoChain(repo) {
  const isRecent   = repo.updated && (Date.now() - new Date(repo.updated).getTime()) < 180 * 24 * 60 * 60 * 1000
  const hasStars   = (repo.stars || 0) > 0
  const hasForks   = (repo.forks || 0) > 0
  const hasLang    = !!repo.lang && repo.lang !== 'Unknown'
  const hasDesc    = (repo.desc || '').trim().length > 5

  const steps = [
    {
      step:   'GitHub Repo',
      icon:   Github,
      status: 'done',
      detail: `${repo.stars || 0} stars · ${repo.forks || 0} forks`,
    },
    {
      step:   'Language',
      icon:   Code2,
      status: hasLang ? 'done' : 'warn',
      detail: hasLang ? `Primary language: ${repo.lang}` : 'Language not detected',
    },
    {
      step:   'Stars',
      icon:   Star,
      status: hasStars ? 'done' : repo.stars === 0 ? 'warn' : 'skip',
      detail: hasStars ? `${repo.stars} community stars` : 'No stars yet',
    },
    {
      step:   'Forks',
      icon:   GitFork,
      status: hasForks ? 'done' : 'skip',
      detail: hasForks ? `${repo.forks} forks — others using it` : 'Not yet forked',
    },
    {
      step:   'Active',
      icon:   GitCommit,
      status: isRecent ? 'done' : 'warn',
      detail: isRecent
        ? `Updated ${new Date(repo.updated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
        : 'No activity in 6+ months',
    },
    {
      step:   hasStars || hasForks || (isRecent && hasLang) ? 'Verified' : 'Incomplete',
      icon:   hasStars || hasForks ? CheckCircle : AlertTriangle,
      status: hasStars || (hasForks && isRecent) ? 'final' : isRecent && hasLang ? 'final' : 'broken',
      detail: hasStars || hasForks
        ? 'Community validates this project'
        : isRecent && hasLang
        ? 'Active repo with identified language'
        : 'Needs stars or forks to confirm impact',
    },
  ]

  const passCount = steps.filter((s) => s.status === 'done' || s.status === 'final').length
  const score = Math.round((passCount / (steps.length - 1)) * 100)  // -1 for the final step itself

  return { steps, score }
}

export default function ProofChain() {
  const { user } = useAuth()
  const topRepos = (user?.top_repos || []).slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="text-brand-400" size={22} /> Proof Chain Verification
        </h1>
        <p className="text-sm text-dark-300 mt-1">End-to-end verification chain for every project — from repo to community proof</p>
      </div>

      <div className="glass-card gradient-border flex flex-wrap gap-4 text-xs">
        {[
          { cls: 'badge-verified', label: 'Verified link' },
          { cls: 'badge-warning',  label: 'Partial'       },
          { cls: 'badge-danger',   label: 'Failed'        },
        ].map(({ cls, label }) => (
          <span key={label} className={cls}>{label}</span>
        ))}
        <span className="ml-auto text-dark-400">Each link must pass for a complete chain</span>
      </div>

      {topRepos.length === 0 ? (
        <div className="glass-card gradient-border text-center py-16 text-dark-400">
          <Link2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No repos yet — log in via demo to see real proof chains</p>
        </div>
      ) : (
        <div className="space-y-8">
          {topRepos.map((repo, ci) => {
            const { steps, score } = repoChain(repo)
            const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
            return (
              <motion.div key={repo.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.12 }}
                className="glass-card gradient-border"
              >
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <TechLogo name={repo.lang} size={18} />
                      <a href={repo.url} target="_blank" rel="noopener noreferrer"
                        className="font-bold text-white text-lg hover:text-brand-300 transition-colors font-mono"
                      >{repo.name}</a>
                    </div>
                    {repo.desc && <p className="text-xs text-dark-400 mt-0.5 ml-7">{repo.desc}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${scoreColor}`}>{score}%</p>
                    <p className="text-[10px] text-dark-400">chain score</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0">
                  {steps.map((step, si) => {
                    const Icon = step.icon
                    const cfg  = STEP_CFG[step.status]
                    const isLast = si === steps.length - 1
                    return (
                      <div key={step.step} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
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
                        {!isLast && (
                          <div className="flex items-center justify-center my-1 md:my-0 md:mx-1 shrink-0">
                            <ArrowDown size={14} className="md:rotate-[-90deg] text-dark-500" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: ci * 0.15 }}
                    className={`h-full rounded-full ${score >= 75 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
