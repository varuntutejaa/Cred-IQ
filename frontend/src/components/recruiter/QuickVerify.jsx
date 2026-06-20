import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Search, CheckCircle, XCircle, AlertCircle, GitBranch, Rocket, Award, Star, BookMarked, Download, Shield } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

const MOCK_PROFILES = {
  'varun-dev': {
    name: 'Varun Tuteja', handle: 'varun-dev', color: '#6366f1',
    trustScore: 87, builderScore: 94, githubScore: 92, resumeMatch: 91,
    repos: 47, stars: 312, commits: 1200, deployments: 9, certs: 6,
    skills: ['Python', 'React', 'Flask', 'MongoDB', 'TypeScript', 'Docker'],
    verdict: 'Highly Recommended',
    verdictColor: 'emerald',
    summary: 'Strong full-stack developer with 3+ years of verifiable project history. All claimed skills confirmed across 47 repositories. 9 live deployments demonstrate production readiness.',
    checks: [
      { label: 'GitHub Profile',         pass: true,  note: '47 repos, 1,200 commits' },
      { label: 'Resume Accuracy',        pass: true,  note: '91% match with GitHub data' },
      { label: 'Skill Verification',     pass: true,  note: '14 skills confirmed' },
      { label: 'Live Deployments',       pass: true,  note: '9 live projects verified' },
      { label: 'Code Authenticity',      pass: true,  note: 'No plagiarism detected' },
      { label: 'Certificate Validity',   pass: true,  note: '6 certs validated' },
    ],
    radar: [
      { dim: 'GitHub',       v: 92 }, { dim: 'Projects',  v: 88 },
      { dim: 'Deployments',  v: 85 }, { dim: 'Certs',     v: 75 },
      { dim: 'Activity',     v: 91 }, { dim: 'Resume',    v: 87 },
    ],
  },
  'arjunm': {
    name: 'Arjun Mehta', handle: 'arjunm', color: '#f59e0b',
    trustScore: 91, builderScore: 88, githubScore: 89, resumeMatch: 85,
    repos: 62, stars: 421, commits: 1840, deployments: 14, certs: 4,
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
    verdict: 'Top Candidate',
    verdictColor: 'yellow',
    summary: 'Backend specialist with exceptional deployment track record. 14 live systems running across AWS. Resume understates actual experience.',
    checks: [
      { label: 'GitHub Profile',         pass: true,  note: '62 repos, 1,840 commits' },
      { label: 'Resume Accuracy',        pass: true,  note: '85% match — experience understated' },
      { label: 'Skill Verification',     pass: true,  note: '9 skills confirmed' },
      { label: 'Live Deployments',       pass: true,  note: '14 live projects verified' },
      { label: 'Code Authenticity',      pass: true,  note: 'Original code confirmed' },
      { label: 'Certificate Validity',   pass: false, note: '1 cert expired' },
    ],
    radar: [
      { dim: 'GitHub',       v: 89 }, { dim: 'Projects',  v: 92 },
      { dim: 'Deployments',  v: 96 }, { dim: 'Certs',     v: 60 },
      { dim: 'Activity',     v: 88 }, { dim: 'Resume',    v: 82 },
    ],
  },
  'priya-dev': {
    name: 'Priya Sharma', handle: 'priya-dev', color: '#10b981',
    trustScore: 79, builderScore: 81, githubScore: 84, resumeMatch: 72,
    repos: 31, stars: 178, commits: 870, deployments: 6, certs: 8,
    skills: ['Vue', 'Node.js', 'PostgreSQL', 'GraphQL', 'Docker'],
    verdict: 'Recommended',
    verdictColor: 'brand',
    summary: 'Frontend-leaning full-stack developer with strong certification track. Some resume claims need further verification.',
    checks: [
      { label: 'GitHub Profile',         pass: true,  note: '31 repos, 870 commits' },
      { label: 'Resume Accuracy',        pass: false, note: '72% match — some claims unverified' },
      { label: 'Skill Verification',     pass: true,  note: '11 skills confirmed' },
      { label: 'Live Deployments',       pass: true,  note: '6 live projects verified' },
      { label: 'Code Authenticity',      pass: true,  note: 'No issues found' },
      { label: 'Certificate Validity',   pass: true,  note: '8 certs validated' },
    ],
    radar: [
      { dim: 'GitHub',       v: 84 }, { dim: 'Projects',  v: 76 },
      { dim: 'Deployments',  v: 72 }, { dim: 'Certs',     v: 92 },
      { dim: 'Activity',     v: 78 }, { dim: 'Resume',    v: 74 },
    ],
  },
}

const VERDICTS = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  yellow:  'bg-yellow-500/15  text-yellow-300  border-yellow-500/30',
  brand:   'bg-brand-500/15   text-brand-300   border-brand-500/30',
}

export default function QuickVerify() {
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')

  const handleVerify = () => {
    const key = input.trim().toLowerCase().replace('@','')
    if (!key) return
    setLoading(true)
    setError('')
    setResult(null)
    setTimeout(() => {
      const profile = MOCK_PROFILES[key]
      if (profile) {
        setResult(profile)
        toast.success(`Verified @${key} successfully!`)
      } else {
        setError(`No verified profile found for "@${key}". Try: varun-dev, arjunm, or priya-dev`)
        toast.error('Profile not found')
      }
      setLoading(false)
    }, 1800)
  }

  const SCORE_COLOR = (v) => v >= 85 ? '#10b981' : v >= 70 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Quick Verify</h1>
        <p className="text-sm text-dark-300 mt-1">Enter a GitHub username for an instant verification report</p>
      </div>

      {/* Input */}
      <div className="glass-card gradient-border max-w-xl">
        <label className="text-xs font-semibold text-dark-300 mb-2 block">GitHub Username</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">@</span>
            <input type="text" placeholder="e.g. varun-dev" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={loading || !input.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 text-white font-semibold rounded-xl px-5 py-3 text-sm shadow-glow disabled:opacity-50 transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={14} /> Verify</>}
          </motion.button>
        </div>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
        <p className="text-[10px] text-dark-500 mt-2">Demo: try <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setInput('varun-dev')}>varun-dev</button>, <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setInput('arjunm')}>arjunm</button>, or <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setInput('priya-dev')}>priya-dev</button></p>
      </div>

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card gradient-border max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-white">Running verification checks…</p>
          </div>
          {['Fetching GitHub profile', 'Analysing repositories', 'Checking deployments', 'Validating certificates', 'Computing trust score'].map((step, i) => (
            <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.22 }}
              className="flex items-center gap-2 text-xs text-dark-400 mb-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              {step}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
            {/* Header card */}
            <div className="glass-card gradient-border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0" style={{ background: result.color + '25', color: result.color }}>
                    {result.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{result.name}</h2>
                    <p className="text-sm font-mono" style={{ color: result.color }}>@{result.handle}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border mt-2 ${VERDICTS[result.verdictColor]}`}>
                      <Shield size={11} /> {result.verdict}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => toast.success('Added to shortlist!')}
                    className="flex items-center gap-1.5 glass border border-white/10 hover:border-yellow-500/30 hover:text-yellow-300 text-dark-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
                  >
                    <BookMarked size={13} /> Shortlist
                  </button>
                  <button onClick={() => toast.success('Report downloaded!')}
                    className="flex items-center gap-1.5 glass border border-white/10 hover:border-brand-500/30 hover:text-brand-300 text-dark-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
                  >
                    <Download size={13} /> Download Report
                  </button>
                </div>
              </div>

              <p className="text-sm text-dark-300 mt-4 leading-relaxed border-t border-white/5 pt-4">{result.summary}</p>
            </div>

            {/* Score ring row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Trust Score',    value: result.trustScore,   max: 100, suffix: '' },
                { label: 'Builder Score',  value: result.builderScore, max: 100, suffix: '%' },
                { label: 'GitHub Score',   value: result.githubScore,  max: 100, suffix: '' },
                { label: 'Resume Match',   value: result.resumeMatch,  max: 100, suffix: '%' },
              ].map(({ label, value, max, suffix }) => {
                const c = SCORE_COLOR(value)
                const pct = (value / max) * 100
                const r = 32, circ = 2 * Math.PI * r
                return (
                  <div key={label} className="glass-card gradient-border text-center">
                    <svg width={90} height={90} className="mx-auto mb-1">
                      <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
                      <motion.circle cx={45} cy={45} r={r} fill="none" stroke={c} strokeWidth={6}
                        strokeLinecap="round" strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                        transition={{ duration: 1, delay: 0.2 }} style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
                      />
                      <text x={45} y={45} dominantBaseline="middle" textAnchor="middle" fill={c} fontSize={14} fontWeight={900}>{value}{suffix}</text>
                    </svg>
                    <p className="text-[10px] text-dark-400">{label}</p>
                  </div>
                )
              })}
            </div>

            {/* Checks + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Checks */}
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={15} className="text-emerald-400" /> Verification Checks</h3>
                <div className="space-y-2.5">
                  {result.checks.map((ck) => (
                    <div key={ck.label} className="flex items-center gap-3">
                      {ck.pass
                        ? <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                        : <XCircle    size={15} className="text-red-400 shrink-0"     />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{ck.label}</p>
                        <p className="text-[10px] text-dark-400 truncate">{ck.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar */}
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Star size={15} className="text-yellow-400" /> Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={result.radar}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                    <Radar dataKey="v" name="Score" stroke={result.color} fill={result.color} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick stats */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><GitBranch size={15} className="text-brand-400" /> Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { icon: GitBranch, label: 'Repositories', value: result.repos },
                  { icon: Star,      label: 'GitHub Stars', value: result.stars },
                  { icon: GitBranch, label: 'Total Commits', value: result.commits },
                  { icon: Rocket,    label: 'Deployments',  value: result.deployments },
                  { icon: Award,     label: 'Certificates', value: result.certs },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center glass rounded-xl py-3 border border-white/5">
                    <Icon size={14} className="mx-auto mb-1 text-dark-400" />
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="text-[9px] text-dark-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-3">Verified Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <CheckCircle size={10} /> {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
