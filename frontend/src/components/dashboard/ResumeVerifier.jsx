import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, CheckCircle, AlertTriangle, XCircle,
  Zap, RefreshCw, GitCommit, Star, Users, PlusCircle, Trophy
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = [
  'Extracting text from PDF',
  'Identifying skills and claims',
  'Fetching GitHub evidence',
  'Cross-referencing each claim',
  'Computing trust score',
]

function ScoreRing({ score, size = 140, stroke = 12 }) {
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color  = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  )
}

export default function ResumeVerifier() {
  const { user }  = useAuth()
  const [file,      setFile]      = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [step,      setStep]      = useState(0)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)

  const onDrop = useCallback((files) => {
    if (files[0]) { setFile(files[0]); setError(null) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const analyze = async () => {
    if (!file) return
    const username = user?.github_username
    if (!username) { toast.error('No GitHub username — log in via demo first'); return }

    setAnalyzing(true)
    setResult(null)
    setError(null)

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 900))
    }

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('github_username', username)
      const { data } = await axios.post('/api/resume/verify', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      toast.success('Resume verified!')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Verification failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => { setFile(null); setResult(null); setError(null) }

  const scoreColor = result
    ? result.trust_score >= 80 ? 'text-emerald-400'
    : result.trust_score >= 60 ? 'text-yellow-400'
    : 'text-red-400'
    : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-brand-400" size={22} /> Resume Verifier
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Upload your resume — every skill claim is verified against your real GitHub evidence
          </p>
        </div>
        {result && (
          <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> New Resume
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Upload state */}
        {!result && !analyzing && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive        ? 'border-brand-500 bg-brand-500/10'
                : file              ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <motion.div animate={{ y: isDragActive ? -8 : 0 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${file ? 'bg-emerald-500/20' : 'bg-brand-500/10'}`}
                >
                  {file ? <CheckCircle size={32} className="text-emerald-400" /> : <Upload size={32} className="text-brand-400" />}
                </motion.div>
                {file ? (
                  <>
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-dark-300">{(file.size / 1024).toFixed(1)} KB · PDF</p>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-white text-lg">Drop your resume here</p>
                      <p className="text-sm text-dark-300 mt-1">or click to browse · PDF only · max 10 MB</p>
                    </div>
                    <p className="text-xs text-dark-400">
                      Skills will be cross-referenced against <span className="text-brand-400">@{user?.github_username}</span>'s GitHub
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="glass-card border border-red-500/20 bg-red-500/5 text-sm text-red-300 flex items-start gap-2">
                <XCircle size={15} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}

            {file && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={analyze}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
              >
                <Zap size={18} /> Verify Resume Now
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {analyzing && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={15} className="text-brand-400" /> Verifying resume…
            </p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? 'text-white' : 'text-dark-500'}`}>
                  {i < step
                    ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-[10px]">✓</div>
                    : i === step
                    ? <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0" />
                    : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                  }
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score hero */}
            <div className="glass-card gradient-border flex flex-col md:flex-row items-center gap-8">
              <div className="relative flex items-center justify-center shrink-0">
                <ScoreRing score={result.trust_score} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black ${scoreColor}`}>{result.trust_score}</span>
                  <span className="text-xs text-dark-400">/ 100</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-1">Resume Trust Score</h2>
                <p className="text-dark-300 text-sm mb-4">
                  <span className={`font-semibold ${scoreColor}`}>{result.breakdown.skills.pct}% of skills verified</span> against{' '}
                  <span className="text-brand-400">@{result.github_username}</span>'s GitHub —{' '}
                  {result.unverified.length > 0
                    ? `${result.unverified.length} claim${result.unverified.length !== 1 ? 's' : ''} lack GitHub evidence`
                    : 'all skills have evidence'}
                </p>
                {/* Quick stats */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-dark-400">
                    <GitCommit size={12} className="text-brand-400" />
                    {result.total_commits.toLocaleString()} commits
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-dark-400">
                    <Users size={12} className="text-brand-400" />
                    {result.public_repos} public repos
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-dark-400">
                    <Star size={12} className="text-brand-400" />
                    {result.account_age_years}y account age
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.breakdown).map(([k, v]) => (
                    <div key={k} className="glass rounded-xl p-3 text-center">
                      <p className={`text-lg font-black ${v.pct >= 80 ? 'text-emerald-400' : v.pct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{v.pct}%</p>
                      <p className="text-[10px] text-dark-400 capitalize mt-0.5">{k}</p>
                      <p className="text-[10px] text-dark-400">{v.verified}/{v.total} verified</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CP / DSA bonus banner */}
            {result.cp_detected && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-yellow-500/25 bg-yellow-500/5 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <Trophy size={16} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Competitive Programming detected</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    <span className="text-yellow-400 font-medium">{result.cp_signal}</span> found in your resume —
                    C++, C, Java, and Python skills received a confidence bonus
                  </p>
                </div>
              </motion.div>
            )}

            {/* Verified skills */}
            {result.verified.length > 0 && (
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  Verified Skills
                  <span className="text-xs text-dark-400 font-normal ml-1">({result.verified.length})</span>
                </h3>
                <div className="space-y-3">
                  {result.verified.map((v, i) => (
                    <motion.div key={v.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                    >
                      <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white">{v.skill}</span>
                            {v.cp_bonus && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 font-bold flex items-center gap-0.5">
                                <Trophy size={8} /> CP
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 shrink-0 ml-2">{v.confidence}%</span>
                        </div>
                        <p className="text-xs text-dark-400">{v.evidence}</p>
                        <div className="mt-1.5 h-1 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${v.confidence}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Unverified */}
            {result.unverified.length > 0 && (
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  Unverified Claims
                  <span className="text-xs text-dark-400 font-normal ml-1">({result.unverified.length})</span>
                </h3>
                <div className="space-y-2.5">
                  {result.unverified.map((u, i) => (
                    <div key={u.skill} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                      <AlertTriangle size={15} className="text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-white">{u.skill}</p>
                        <p className="text-xs text-dark-400 mt-0.5">{u.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged */}
            {result.flagged.length > 0 && (
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <XCircle size={16} className="text-red-400" />
                  Flagged Claims
                  <span className="text-xs text-dark-400 font-normal ml-1">({result.flagged.length})</span>
                </h3>
                <div className="space-y-2.5">
                  {result.flagged.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                      <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-white">"{f.claim}"</p>
                        <p className="text-xs text-dark-400 mt-0.5">{f.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing from resume */}
            {result.missing_from_resume?.length > 0 && (
              <div className="glass-card gradient-border border-brand-500/20 bg-brand-500/3">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <PlusCircle size={16} className="text-brand-400" />
                  Add to Your Resume
                  <span className="text-xs text-dark-400 font-normal ml-1">({result.missing_from_resume.length} skills found in GitHub)</span>
                </h3>
                <p className="text-xs text-dark-400 mb-4">
                  These technologies appear in your GitHub but aren't mentioned in your resume — consider adding them.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.missing_from_resume.map((item, i) => (
                    <motion.div key={item.skill} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-brand-500/8 border border-brand-500/20"
                    >
                      <PlusCircle size={14} className="text-brand-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-white">{item.skill}</p>
                        <p className="text-xs text-dark-400 mt-0.5 truncate">{item.evidence}</p>
                      </div>
                      {item.pct > 0 && (
                        <span className="text-[10px] font-bold text-brand-400 shrink-0 ml-auto">{item.pct}%</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw size={14} /> Verify Another Resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
