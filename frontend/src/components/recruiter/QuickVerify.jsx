import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Search, CheckCircle, XCircle, AlertCircle, GitBranch, Star, BookMarked, Download, Shield, Users, GitCommit, Eye } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRecruiter } from '../../context/RecruiterContext'

const STEPS = ['Fetching GitHub profile', 'Computing trust score', 'Analysing builder signals', 'Checking vibe code', 'Finalising report']

function scoreColor(v) { return v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444' }

function verdictFromScore(trust, builder) {
  const avg = (trust + builder) / 2
  if (avg >= 75) return { label: 'Highly Recommended', type: 'emerald' }
  if (avg >= 55) return { label: 'Recommended',        type: 'brand'   }
  return                { label: 'Needs Further Review', type: 'yellow' }
}

const VERDICT_STYLES = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  brand:   'bg-brand-500/15   text-brand-300   border-brand-500/30',
  yellow:  'bg-yellow-500/15  text-yellow-300  border-yellow-500/30',
}

export default function QuickVerify() {
  const navigate = useNavigate()
  const { addCandidate, shortlists, addToShortlist, createShortlist } = useRecruiter()
  const [input,   setInput]   = useState('')
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const handleVerify = async () => {
    const handle = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '').replace('@', '')
    if (!handle) return
    setLoading(true)
    setError('')
    setResult(null)

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 700))
    }

    try {
      const [profileRes, verifyRes] = await Promise.all([
        axios.get(`/api/github/analyze/${handle}`),
        axios.get(`/api/recruiter/quick-verify/${handle}`),
      ])
      const profile = profileRes.data
      const verify  = verifyRes.data
      const trust   = verify.trust_score?.total   ?? 0
      const builder = verify.builder_score?.total ?? 0
      const vibe    = verify.vibe_analysis ?? {}
      const verdict = verdictFromScore(trust, builder)

      const trustDims   = verify.trust_score?.dimensions   || {}
      const builderDims = verify.builder_score?.dimensions || {}

      const radarData = [
        { dim: 'GitHub Depth',  v: trustDims.github_depth    || 0 },
        { dim: 'Skill Evid.',   v: trustDims.skill_evidence  || 0 },
        { dim: 'Quality',       v: trustDims.project_quality || 0 },
        { dim: 'Consistency',   v: trustDims.consistency     || 0 },
        { dim: 'Community',     v: trustDims.community       || 0 },
      ]

      const checks = [
        { label: 'GitHub Profile',    pass: true,               note: `${profile.public_repos} repos · ${(profile.commit_count || 0).toLocaleString()} commits` },
        { label: 'Trust Score',       pass: trust >= 50,        note: `${trust}/100` },
        { label: 'Builder Score',     pass: builder >= 50,      note: `${builder}/100` },
        { label: 'Active Recently',   pass: (profile.commit_count || 0) > 10, note: `${profile.commit_count || 0} commits in last 12 months` },
        { label: 'Vibe Code Check',   pass: (vibe.risk_score || 0) < 50, note: vibe.verdict === 'clean' ? 'Authentic code detected' : vibe.verdict === 'mixed' ? 'Some concerns found' : 'High AI-generation risk' },
        { label: 'Community Signal',  pass: (profile.followers || 0) >= 5, note: `${profile.followers || 0} followers · ${profile.total_stars || 0} stars` },
      ]

      const resolvedResult = {
        name:         profile.name || handle,
        handle,
        avatar:       profile.avatar,
        bio:          profile.bio,
        verdict:      verdict.label,
        verdictType:  verdict.type,
        trustScore:   trust,
        builderScore: builder,
        vibeRisk:     vibe.risk_score || 0,
        repos:        profile.public_repos || 0,
        stars:        profile.total_stars  || 0,
        commits:      profile.commit_count || 0,
        followers:    profile.followers    || 0,
        skills:       (profile.languages || []).slice(0, 6).map((l) => l.name),
        checks,
        radarData,
        summary: `${profile.name || handle} has a trust score of ${trust}/100 and builder score of ${builder}/100. ${profile.public_repos} public repos with ${(profile.commit_count || 0).toLocaleString()} commits in the past year.${profile.bio ? ' ' + profile.bio : ''}`,
      }
      setResult(resolvedResult)

      // persist to RecruiterContext
      addCandidate({
        username:      handle,
        name:          profile.name || handle,
        avatar:        profile.avatar,
        bio:           profile.bio || '',
        trust_score:   trust,
        builder_score: builder,
        languages:     profile.languages || [],
        top_repos:     profile.top_repos  || [],
        public_repos:  profile.public_repos  || 0,
        total_stars:   profile.total_stars   || 0,
        followers:     profile.followers     || 0,
        commit_count:  profile.commit_count  || 0,
        vibe_risk:     vibe.risk_score || 0,
        verdict:       verdict.label,
      })
      toast.success(`Verified @${handle}`)
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Verification failed — check the username')
      toast.error('Verification failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Quick Verify</h1>
        <p className="text-sm text-dark-300 mt-1">Enter any GitHub username for a real-time verification report</p>
      </div>

      <div className="glass-card gradient-border max-w-xl">
        <label className="text-xs font-semibold text-dark-300 mb-2 block">GitHub Username or URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">@</span>
            <input type="text" placeholder="e.g. torvalds" value={input} onChange={(e) => setInput(e.target.value)}
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
      </div>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card gradient-border max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-white">Running verification checks…</p>
          </div>
          {STEPS.map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.22 }}
              className={`flex items-center gap-2 text-xs mb-2 ${i <= step ? 'text-white' : 'text-dark-500'}`}
            >
              {i < step
                ? <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px]">✓</div>
                : i === step
                ? <div className="w-3 h-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                : <div className="w-3 h-3 rounded-full border border-white/10" />
              }
              {s}
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass-card gradient-border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {result.avatar
                    ? <img src={result.avatar} className="w-14 h-14 rounded-2xl object-cover shrink-0" alt={result.name} />
                    : <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center text-2xl font-black text-brand-300 shrink-0">{result.name[0]}</div>
                  }
                  <div>
                    <h2 className="text-xl font-bold text-white">{result.name}</h2>
                    <a href={`https://github.com/${result.handle}`} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-mono text-brand-400 hover:text-brand-300 transition-colors"
                    >@{result.handle}</a>
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg border mt-2 ml-3 ${VERDICT_STYLES[result.verdictType]}`}>
                      <Shield size={11} /> {result.verdict}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => navigate(`/recruiter/candidate/${result.handle}`)}
                    className="flex items-center gap-1.5 glass border border-brand-500/25 hover:border-brand-500/50 text-brand-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
                  >
                    <Eye size={13} /> View Full Profile
                  </button>
                  <button onClick={() => {
                    if (shortlists.length === 0) {
                      const sl = createShortlist('My Candidates')
                      addToShortlist(sl.id, result.handle)
                    } else {
                      addToShortlist(shortlists[0].id, result.handle)
                    }
                    toast.success('Added to shortlist!')
                  }}
                    className="flex items-center gap-1.5 glass border border-white/10 hover:border-yellow-500/30 hover:text-yellow-300 text-dark-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
                  >
                    <BookMarked size={13} /> Shortlist
                  </button>
                  <button onClick={() => toast.success('Report downloaded!')}
                    className="flex items-center gap-1.5 glass border border-white/10 hover:border-brand-500/30 hover:text-brand-300 text-dark-300 rounded-xl px-4 py-2 text-xs font-medium transition-all"
                  >
                    <Download size={13} /> Export
                  </button>
                </div>
              </div>
              <p className="text-sm text-dark-300 mt-4 leading-relaxed border-t border-white/5 pt-4">{result.summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Trust Score',   value: result.trustScore,   suffix: ''  },
                { label: 'Builder Score', value: result.builderScore, suffix: ''  },
                { label: 'Vibe Risk',     value: result.vibeRisk,     suffix: '%', invert: true },
                { label: 'Stars',         value: result.stars,        suffix: ''  },
              ].map(({ label, value, suffix, invert }) => {
                const c    = invert ? scoreColor(100 - value) : scoreColor(value)
                const r    = 32, circ = 2 * Math.PI * r
                const pct  = invert ? (100 - value) : Math.min(value, 100)
                return (
                  <div key={label} className="glass-card gradient-border text-center">
                    <svg width={90} height={90} className="mx-auto mb-1">
                      <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
                      <motion.circle cx={45} cy={45} r={r} fill="none" stroke={c} strokeWidth={6}
                        strokeLinecap="round" strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
                      />
                      <text x={45} y={45} dominantBaseline="middle" textAnchor="middle" fill={c} fontSize={13} fontWeight={900}>{value}{suffix}</text>
                    </svg>
                    <p className="text-[10px] text-dark-400">{label}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={15} className="text-emerald-400" /> Verification Checks</h3>
                <div className="space-y-2.5">
                  {result.checks.map((ck) => (
                    <div key={ck.label} className="flex items-center gap-3">
                      {ck.pass ? <CheckCircle size={15} className="text-emerald-400 shrink-0" /> : <XCircle size={15} className="text-red-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{ck.label}</p>
                        <p className="text-[10px] text-dark-400 truncate">{ck.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Star size={15} className="text-yellow-400" /> Trust Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={result.radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                    <Radar dataKey="v" name="Score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><GitBranch size={15} className="text-brand-400" /> Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { icon: GitBranch,  label: 'Repositories', value: result.repos    },
                  { icon: Star,       label: 'GitHub Stars',  value: result.stars    },
                  { icon: GitCommit,  label: 'Total Commits', value: result.commits  },
                  { icon: Users,      label: 'Followers',     value: result.followers},
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center glass rounded-xl py-3 border border-white/5">
                    <Icon size={14} className="mx-auto mb-1 text-dark-400" />
                    <p className="text-lg font-black text-white">{(value || 0).toLocaleString()}</p>
                    <p className="text-[9px] text-dark-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {result.skills.length > 0 && (
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-3">Primary Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <CheckCircle size={10} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
