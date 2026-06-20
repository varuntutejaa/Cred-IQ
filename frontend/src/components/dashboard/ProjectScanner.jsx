import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertOctagon, Github, CheckCircle, AlertTriangle, XCircle, Zap, GitCommit, Calendar, Users, FileText, Rocket, Code2 } from 'lucide-react'

const MOCK_PROJECTS = [
  {
    name: 'expense-tracker',
    url: 'github.com/varun/expense-tracker',
    commits: 187,
    age: '14 months',
    contributors: 1,
    hasDeployment: true,
    hasReadme: true,
    linesOfCode: 4820,
    lastActivity: '3 days ago',
    languages: ['Python', 'HTML', 'CSS'],
    score: 91,
    verdict: 'authentic',
    flags: [],
    analysis: 'Consistent commit history over 14 months with meaningful commit messages. Single contributor with organic growth pattern. Live deployment confirmed.',
  },
  {
    name: 'ai-resume-builder',
    url: 'github.com/varun/ai-resume-builder',
    commits: 243,
    age: '9 months',
    contributors: 3,
    hasDeployment: true,
    hasReadme: true,
    linesOfCode: 12400,
    lastActivity: '1 week ago',
    languages: ['TypeScript', 'React', 'Python'],
    score: 88,
    verdict: 'authentic',
    flags: [],
    analysis: 'Multi-contributor project with clear PR history. Code complexity aligns with team size and timeline. Deployment active.',
  },
  {
    name: 'ml-classifier-demo',
    url: 'github.com/varun/ml-classifier-demo',
    commits: 3,
    age: '2 days',
    contributors: 1,
    hasDeployment: false,
    hasReadme: false,
    linesOfCode: 18700,
    lastActivity: '2 days ago',
    languages: ['Python'],
    score: 19,
    verdict: 'suspicious',
    flags: [
      'Only 3 commits for 18,700 lines of code',
      'Repository created 2 days ago',
      'No README file found',
      'No deployment detected',
      'Commit messages are generic ("init", "update", "fix")',
    ],
    analysis: 'High probability of copied or AI-generated code. The ratio of code volume to commits is extreme. Recommend manual review before listing on resume.',
  },
  {
    name: 'dsa-solutions',
    url: 'github.com/varun/dsa-solutions',
    commits: 412,
    age: '26 months',
    contributors: 1,
    hasDeployment: false,
    hasReadme: true,
    linesOfCode: 7300,
    lastActivity: '2 weeks ago',
    languages: ['Python', 'Java'],
    score: 76,
    verdict: 'warning',
    flags: ['No deployment (expected for DSA)', 'Inactive for 2 weeks'],
    analysis: 'Legitimate practice repository with consistent growth. No deployment expected for DSA repos. Minor inactivity flag.',
  },
]

const VERDICT_CFG = {
  authentic:  { icon: CheckCircle,  label: 'Authentic',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'badge-verified' },
  warning:    { icon: AlertTriangle,label: 'Review',     color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',   badge: 'badge-warning'  },
  suspicious: { icon: XCircle,      label: 'Suspicious', color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         badge: 'badge-danger'   },
}

function ScoreMeter({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" className="rotate-[-90deg]">
        <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 24}
          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - score / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

export default function ProjectScanner() {
  const [url, setUrl]       = useState('')
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(MOCK_PROJECTS)
  const [expanded, setExpanded] = useState(null)

  const scanRepo = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2500))
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertOctagon className="text-red-400" size={22} /> Fake Project Detector
        </h1>
        <p className="text-sm text-dark-300 mt-1">Our ML engine flags suspicious repos — copied code, single-commit bloat, and ghost projects</p>
      </div>

      {/* Scan input */}
      <div className="glass-card gradient-border">
        <p className="text-sm font-semibold text-white mb-3">Scan a GitHub Repository</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text" placeholder="github.com/username/repository"
              value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scanRepo()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <button onClick={scanRepo} disabled={loading} className="btn-primary px-5 flex items-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={14} /> Scan</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-dark-400">
          {['Commit frequency', 'Repo age', 'Code/commit ratio', 'README quality', 'Deployment status', 'Contributor patterns'].map((f) => (
            <span key={f} className="flex items-center gap-1"><span className="text-brand-400">✓</span>{f}</span>
          ))}
        </div>
      </div>

      {/* Algorithm explainer */}
      <div className="glass-card gradient-border bg-brand-500/3 border-brand-500/15">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Code2 size={15} className="text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">How Fake Detection Works</p>
            <p className="text-xs text-dark-300 leading-relaxed">
              We analyze <span className="text-white font-medium">commit frequency patterns</span>, <span className="text-white font-medium">lines-of-code vs commit ratio</span>,
              repository age, contributor history, README quality score, deployment verification, and code originality signals.
              A score below 40% triggers a suspicious flag.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {scanned.map((proj, i) => {
          const cfg = VERDICT_CFG[proj.verdict]
          const Icon = cfg.icon
          const isOpen = expanded === proj.name
          return (
            <motion.div key={proj.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-card gradient-border border cursor-pointer ${cfg.bg}`}
              onClick={() => setExpanded(isOpen ? null : proj.name)}
            >
              <div className="flex items-center gap-4">
                <ScoreMeter score={proj.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-mono text-white">{proj.name}</p>
                    <span className={cfg.badge}><Icon size={10} /> {cfg.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="text-xs text-dark-400 flex items-center gap-1"><GitCommit size={10} />{proj.commits} commits</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Calendar size={10} />{proj.age}</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Code2 size={10} />{proj.linesOfCode.toLocaleString()} lines</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Users size={10} />{proj.contributors} contributor{proj.contributors > 1 ? 's' : ''}</span>
                    {proj.hasDeployment && <span className="text-xs text-emerald-400 flex items-center gap-1"><Rocket size={10} /> Live</span>}
                    {proj.hasReadme && <span className="text-xs text-dark-400 flex items-center gap-1"><FileText size={10} /> README</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {proj.languages.slice(0, 2).map((l) => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300">{l}</span>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-dark-300 mb-1">Analysis</p>
                        <p className="text-xs text-dark-200 leading-relaxed">{proj.analysis}</p>
                      </div>
                      {proj.flags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><AlertTriangle size={11} /> Flags Detected</p>
                          <div className="space-y-1.5">
                            {proj.flags.map((f, fi) => (
                              <div key={fi} className="flex items-center gap-2 text-xs text-dark-300">
                                <XCircle size={11} className="text-red-400 shrink-0" /> {f}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${proj.score}%` }} transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${proj.score >= 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : proj.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <p className={`text-xs font-semibold ${cfg.color}`}>Authenticity Score: {proj.score}%</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
