import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award, CheckCircle, AlertTriangle, XCircle, Zap, Plus, X,
  ExternalLink, Calendar, Building2, Brain, BookOpen, Briefcase,
  Target, TrendingUp, Sparkles, Trash2, ChevronDown, ChevronUp,
  Shield, UploadCloud, FileText, Wifi, WifiOff,
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const LS_KEY = 'ciq_certificates'

const STATUS = {
  verified:   { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', badge: 'Verified'     },
  review:     { icon: AlertTriangle, color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  badge: 'Needs Review' },
  suspicious: { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     badge: 'Suspicious'   },
}

const DIFFICULTY_COLOR = { beginner: 'text-emerald-400', intermediate: 'text-yellow-400', advanced: 'text-orange-400', expert: 'text-red-400' }
const VALUE_COLOR       = { high: 'text-emerald-400', medium: 'text-yellow-400', low: 'text-red-400' }

const UPLOAD_STEPS  = ['Reading file', 'Extracting certificate details with AI', 'Checking issuer database', 'AI skill analysis with Groq']
const MANUAL_STEPS  = ['Parsing details', 'Checking issuer database', 'Validating URL', 'AI skill analysis with Groq']

function LoadingSteps({ steps, step }) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Brain size={15} className="text-brand-400 animate-pulse" /> Analysing…
      </p>
      {steps.map((s, i) => (
        <div key={s} className={`flex items-center gap-3 text-sm transition-all ${i <= step ? 'text-white' : 'text-dark-600'}`}>
          {i < step
            ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] shrink-0">✓</div>
            : i === step
            ? <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0" />
            : <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
          }
          {s}
        </div>
      ))}
    </div>
  )
}

function AddCertModal({ onClose, onResult }) {
  const [tab, setTab]       = useState('upload')   // 'upload' | 'manual'
  const [file, setFile]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm]     = useState({ name: '', issuer: '', date: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [step, setStep]     = useState(0)

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
  })

  const tickSteps = async (steps) => {
    for (let i = 0; i < steps.length; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, 800))
    }
  }

  const handleUpload = async () => {
    if (!file) { toast.error('Select a file first'); return }
    setLoading(true)
    tickSteps(UPLOAD_STEPS)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await axios.post('/api/certificate/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onResult({ ...data, id: Date.now() })
      toast.success('Certificate analysed!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed — try entering details manually')
      setLoading(false)
    }
  }

  const handleManual = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Enter a certificate name'); return }
    setLoading(true)
    tickSteps(MANUAL_STEPS)
    try {
      const { data } = await axios.post('/api/certificate/analyze', {
        name: form.name.trim(), issuer: form.issuer.trim(),
        date: form.date.trim(), url: form.url.trim(),
      })
      onResult({ ...data, id: Date.now() })
      toast.success('Certificate analysed!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Analysis failed — try again')
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="glass-card gradient-border w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Add Certificate</h3>
            <p className="text-xs text-dark-400 mt-0.5">AI extracts details + analyses skills learned</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        {loading ? (
          <LoadingSteps steps={tab === 'upload' ? UPLOAD_STEPS : MANUAL_STEPS} step={step} />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 glass rounded-xl mb-4">
              {[
                { key: 'upload', icon: UploadCloud, label: 'Upload File' },
                { key: 'manual', icon: FileText,    label: 'Enter Manually' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    tab === key ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Upload tab */}
            {tab === 'upload' && (
              <div className="space-y-3">
                <div {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-brand-500 bg-brand-500/10'
                      : file
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/10 hover:border-brand-500/40 hover:bg-white/[0.02]'
                  }`}
                >
                  <input {...getInputProps()} />

                  {file ? (
                    <div className="space-y-2">
                      {preview ? (
                        <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-xl object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                          <FileText size={22} className="text-red-400" />
                        </div>
                      )}
                      <p className="text-xs font-medium text-emerald-400">{file.name}</p>
                      <p className="text-[10px] text-dark-500">{(file.size / 1024).toFixed(0)} KB · click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <UploadCloud size={22} className="text-dark-400" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {isDragActive ? 'Drop it here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-dark-500">PNG, JPG, JPEG, WEBP or PDF · max 15 MB</p>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15 text-xs text-dark-400">
                    <Brain size={10} className="inline text-brand-400 mr-1" />
                    AI will read the certificate, extract the name, issuer, and date, then analyse skills and career impact.
                  </div>
                )}

                <button onClick={handleUpload} disabled={!file}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Zap size={14} /> Analyse Certificate
                </button>
              </div>
            )}

            {/* Manual tab */}
            {tab === 'manual' && (
              <form onSubmit={handleManual} className="space-y-3">
                {[
                  { key: 'name',   label: 'Certificate Name *', placeholder: 'e.g. AWS Solutions Architect Associate' },
                  { key: 'issuer', label: 'Issuer',             placeholder: 'e.g. Amazon Web Services, Coursera, Google' },
                  { key: 'date',   label: 'Date Issued',        placeholder: 'e.g. Oct 2023' },
                  { key: 'url',    label: 'Verification URL',   placeholder: 'https://aws.amazon.com/verify/...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-dark-400 mb-1.5 block">{label}</label>
                    <input
                      type={key === 'url' ? 'url' : 'text'}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60 transition-all"
                    />
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Zap size={14} /> Analyse Certificate
                </button>
              </form>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function CertCard({ cert, onDelete }) {
  const [open, setOpen] = useState(false)
  const cfg  = STATUS[cert.status] || STATUS.review
  const Icon = cfg.icon
  const ai   = cert.ai || {}

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`glass-card gradient-border border ${cfg.border}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon size={20} className={cfg.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">{cert.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
              {cfg.badge}
            </span>
            {cert.verification?.issuer_known && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-semibold">
                Known Issuer
              </span>
            )}
            {cert.verification?.url_live === true && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <Wifi size={9} /> URL Live
              </span>
            )}
            {cert.verification?.url_live === false && cert.url && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold flex items-center gap-1">
                <WifiOff size={9} /> URL Dead
              </span>
            )}
            {cert.extracted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold">
                AI Extracted
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {cert.issuer && <span className="text-xs text-dark-400 flex items-center gap-1"><Building2 size={10} />{cert.issuer}</span>}
            {cert.date   && <span className="text-xs text-dark-400 flex items-center gap-1"><Calendar size={10} />{cert.date}</span>}
            {cert.extracted?.recipient && <span className="text-xs text-dark-500">Issued to: {cert.extracted.recipient}</span>}
            {cert.extracted?.credential_id && <span className="text-xs text-dark-500 font-mono">ID: {cert.extracted.credential_id}</span>}
            {cert.verification?.issuer_category && (
              <span className="text-xs text-dark-500">{cert.verification.issuer_category}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className={`text-2xl font-black ${cfg.color}`}>{cert.trust_score}</p>
            <p className="text-[10px] text-dark-500">trust</p>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={e => { e.stopPropagation(); onDelete(cert.id) }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
            {open ? <ChevronUp size={14} className="text-dark-500 mx-auto" /> : <ChevronDown size={14} className="text-dark-500 mx-auto" />}
          </div>
        </div>
      </div>

      {/* Trust score bar */}
      <div className="mt-3 h-1 bg-dark-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${cert.trust_score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            cert.status === 'verified'   ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
            cert.status === 'suspicious' ? 'bg-red-500' : 'bg-yellow-500'
          }`}
        />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden"
          >
            <div className="mt-5 space-y-4 border-t border-white/5 pt-4">

              {/* Verification info */}
              <div className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <p className="text-[11px] font-semibold text-dark-400 mb-1 flex items-center gap-1.5">
                  <Shield size={11} /> Verification Result
                </p>
                <p className="text-xs text-dark-200">{cert.verification?.reason}</p>
                {cert.verification?.url_live === true && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Wifi size={11} /> URL is live — page loaded successfully
                  </div>
                )}
                {cert.verification?.url_live === false && cert.url && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <WifiOff size={11} /> URL not reachable — link may be expired
                  </div>
                )}
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-1.5 transition-colors"
                  >
                    <ExternalLink size={10} /> View certificate
                  </a>
                )}
              </div>

              {/* Skills learned */}
              {ai.skills_learned?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-dark-300 mb-2 flex items-center gap-1.5">
                    <BookOpen size={12} className="text-brand-400" /> Skills Learned
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ai.skills_learned.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill analysis */}
              {ai.skill_analysis && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[11px] font-semibold text-dark-400 mb-1.5 flex items-center gap-1.5">
                    <Brain size={11} className="text-purple-400" /> Skill Analysis
                  </p>
                  <p className="text-xs text-dark-200 leading-relaxed">{ai.skill_analysis}</p>
                </div>
              )}

              {/* Career insights */}
              {ai.career_insights && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[11px] font-semibold text-dark-400 mb-1.5 flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-emerald-400" /> Career Impact
                  </p>
                  <p className="text-xs text-dark-200 leading-relaxed">{ai.career_insights}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Relevant job roles */}
                {ai.job_roles?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-dark-400 mb-2 flex items-center gap-1.5">
                      <Briefcase size={11} className="text-yellow-400" /> Relevant Roles
                    </p>
                    <div className="space-y-1">
                      {ai.job_roles.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-dark-300">
                          <span className="w-1 h-1 rounded-full bg-yellow-400 shrink-0" />{r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complementary skills */}
                {ai.complementary_skills?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-dark-400 mb-2 flex items-center gap-1.5">
                      <Target size={11} className="text-cyan-400" /> Learn Next
                    </p>
                    <div className="space-y-1">
                      {ai.complementary_skills.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-dark-300">
                          <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />{s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Real-world applications */}
              {ai.real_world_applications?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-dark-400 mb-2 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-brand-400" /> Real-World Applications
                  </p>
                  <div className="space-y-1.5">
                    {ai.real_world_applications.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-dark-300">
                        <span className="text-brand-500 font-bold shrink-0 mt-0.5">{i + 1}.</span>{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty + Industry value pills */}
              <div className="flex gap-3 pt-1">
                {ai.difficulty_level && ai.difficulty_level !== 'unknown' && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-dark-500">Difficulty:</span>
                    <span className={`font-semibold capitalize ${DIFFICULTY_COLOR[ai.difficulty_level] || 'text-white'}`}>
                      {ai.difficulty_level}
                    </span>
                  </div>
                )}
                {ai.industry_value && ai.industry_value !== 'unknown' && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-dark-500">Industry Value:</span>
                    <span className={`font-semibold capitalize ${VALUE_COLOR[ai.industry_value] || 'text-white'}`}>
                      {ai.industry_value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CertificateVerifier() {
  const [certs, setCerts]     = useState([])
  const [showModal, setModal] = useState(false)

  useEffect(() => {
    try { setCerts(JSON.parse(localStorage.getItem(LS_KEY) || '[]')) } catch {}
  }, [])

  const save = (updated) => {
    setCerts(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  const addCert   = (cert) => save([cert, ...certs])
  const deleteCert = (id) => save(certs.filter(c => c.id !== id))

  const counts = {
    verified:   certs.filter(c => c.status === 'verified').length,
    review:     certs.filter(c => c.status === 'review').length,
    suspicious: certs.filter(c => c.status === 'suspicious').length,
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showModal && <AddCertModal onClose={() => setModal(false)} onResult={addCert} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-yellow-400" size={22} /> Certificate Verifier
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Verify certificates against issuer databases + AI skill analysis
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Certificate
        </button>
      </div>

      {/* Stats */}
      {certs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Verified',      count: counts.verified,   Icon: CheckCircle,   color: 'emerald' },
            { label: 'Needs Review',  count: counts.review,     Icon: AlertTriangle, color: 'yellow'  },
            { label: 'Suspicious',    count: counts.suspicious, Icon: XCircle,       color: 'red'     },
          ].map(({ label, count, Icon, color }) => (
            <div key={label} className={`glass-card gradient-border text-center border-${color}-500/20 bg-${color}-500/5`}>
              <Icon size={22} className={`text-${color}-400 mx-auto mb-2`} />
              <p className={`text-3xl font-black text-${color}-400`}>{count}</p>
              <p className="text-xs text-dark-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {certs.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card gradient-border max-w-lg text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Award size={26} className="text-yellow-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">No Certificates Yet</h2>
          <p className="text-sm text-dark-400 mb-5">
            Add any certificate — AWS, Google, Coursera, Udemy, or anything else.
            AI will identify what skills you learned, the career impact, and relevant job roles.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-5 text-left">
            {['Skills learned from cert', 'Career impact analysis', 'Relevant job roles', 'Complementary skills to learn', 'Real-world applications', 'Issuer verification'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-dark-400">
                <Sparkles size={10} className="text-yellow-400 shrink-0" />{f}
              </div>
            ))}
          </div>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus size={14} /> Add Your First Certificate
          </button>
        </motion.div>
      )}

      {/* Certificate list */}
      {certs.length > 0 && (
        <div className="space-y-3">
          {certs.map(cert => (
            <CertCard key={cert.id} cert={cert} onDelete={deleteCert} />
          ))}
        </div>
      )}
    </div>
  )
}
