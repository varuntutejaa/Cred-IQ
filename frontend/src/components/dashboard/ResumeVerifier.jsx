import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, CheckCircle, AlertTriangle, XCircle,
  Shield, Zap, Download, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react'

const MOCK_RESULT = {
  trustScore: 87,
  verified: [
    { skill: 'Python',       evidence: '12 repositories, 847 commits',       confidence: 96 },
    { skill: 'React',        evidence: '7 repos, 3 live deployments',         confidence: 89 },
    { skill: 'Flask',        evidence: '5 repos, portfolio project verified', confidence: 91 },
    { skill: 'MongoDB',      evidence: '4 repos, DB schema files found',      confidence: 78 },
    { skill: 'REST APIs',    evidence: '8 repos with API endpoint patterns',  confidence: 84 },
    { skill: 'Git / GitHub', evidence: 'Active since 2020, 847 contributions',confidence: 99 },
  ],
  unverified: [
    { skill: 'AWS',        reason: 'No AWS service usage found in any repo'              },
    { skill: 'Kubernetes', reason: 'No k8s config files or Dockerfile references found' },
    { skill: 'CI/CD',      reason: 'No GitHub Actions or pipeline configs detected'     },
  ],
  flagged: [
    { claim: '5 years experience', reason: 'GitHub account created 3 years ago' },
  ],
  breakdown: {
    skills:          { verified: 6, total: 9,  pct: 67 },
    projects:        { verified: 8, total: 10, pct: 80 },
    certifications:  { verified: 5, total: 6,  pct: 83 },
    experience:      { verified: 2, total: 3,  pct: 67 },
  },
}

function ScoreRing({ score, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
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
  const [file, setFile]       = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]   = useState(null)
  const [expanded, setExpanded] = useState(null)

  const onDrop = useCallback((files) => {
    if (files[0]) setFile(files[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const analyze = async () => {
    setAnalyzing(true)
    await new Promise((r) => setTimeout(r, 3000))
    setResult(MOCK_RESULT)
    setAnalyzing(false)
  }

  const reset = () => { setFile(null); setResult(null) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-brand-400" size={22} /> Resume Verifier
          </h1>
          <p className="text-sm text-dark-300 mt-1">Upload your resume and verify every claim against real evidence</p>
        </div>
        {result && (
          <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Analyze New Resume
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-brand-500 bg-brand-500/10'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ y: isDragActive ? -8 : 0 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    file ? 'bg-emerald-500/20' : 'bg-brand-500/10'
                  }`}
                >
                  {file
                    ? <CheckCircle size={32} className="text-emerald-400" />
                    : <Upload size={32} className="text-brand-400" />
                  }
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
                      <p className="text-sm text-dark-300 mt-1">or click to browse · PDF only</p>
                    </div>
                    <p className="text-xs text-dark-400">Max 10MB · Your data stays private</p>
                  </>
                )}
              </div>
            </div>

            {file && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={analyze}
                disabled={analyzing}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-4 text-base disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing resume...
                  </>
                ) : (
                  <><Zap size={18} /> Verify Resume Now</>
                )}
              </motion.button>
            )}

            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 glass-card">
                <p className="text-sm font-semibold mb-3 text-dark-300">Analysis in progress...</p>
                <div className="space-y-2">
                  {['Extracting skills and claims', 'Cross-referencing GitHub repos', 'Checking deployments', 'Validating certifications', 'Computing trust score'].map((step, i) => (
                    <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}
                      className="flex items-center gap-2 text-xs text-dark-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                      {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score hero */}
            <div className="glass-card gradient-border flex flex-col md:flex-row items-center gap-8">
              <div className="relative flex items-center justify-center shrink-0">
                <ScoreRing score={result.trustScore} size={140} stroke={12} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{result.trustScore}</span>
                  <span className="text-xs text-dark-400">/ 100</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-1">Resume Trust Score</h2>
                <p className="text-dark-300 text-sm mb-4">
                  Your resume is <span className="text-emerald-400 font-semibold">87% verifiable</span> — strong, but 3 claims need evidence.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(result.breakdown).map(([k, v]) => (
                    <div key={k} className="glass rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-white">{v.pct}%</p>
                      <p className="text-[10px] text-dark-400 capitalize mt-0.5">{k}</p>
                      <p className="text-[10px] text-dark-400">{v.verified}/{v.total} verified</p>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn-secondary flex items-center gap-2 text-sm shrink-0">
                <Download size={14} /> Export Report
              </button>
            </div>

            {/* Verified skills */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Verified Claims <span className="text-xs text-dark-400 font-normal ml-1">({result.verified.length} skills)</span>
              </h3>
              <div className="space-y-3">
                {result.verified.map((v, i) => (
                  <motion.div key={v.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                  >
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-white">{v.skill}</span>
                        <span className="text-xs font-bold text-emerald-400">{v.confidence}%</span>
                      </div>
                      <p className="text-xs text-dark-400">{v.evidence}</p>
                      <div className="mt-1.5 h-1 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${v.confidence}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Unverified */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                Unverified Claims <span className="text-xs text-dark-400 font-normal ml-1">({result.unverified.length})</span>
              </h3>
              <div className="space-y-3">
                {result.unverified.map((u, i) => (
                  <div key={u.skill} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                    <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-white">{u.skill}</p>
                      <p className="text-xs text-dark-400 mt-0.5">{u.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle size={16} className="text-red-400" />
                Flagged Claims <span className="text-xs text-dark-400 font-normal ml-1">({result.flagged.length})</span>
              </h3>
              <div className="space-y-3">
                {result.flagged.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-white">"{f.claim}"</p>
                      <p className="text-xs text-dark-400 mt-0.5">{f.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
