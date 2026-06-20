import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Upload, CheckCircle, AlertTriangle, XCircle, Zap, Plus, X, ExternalLink, Calendar, Building2 } from 'lucide-react'

const MOCK_CERTS = [
  {
    id: 1,
    name: 'AWS Solutions Architect Associate',
    issuer: 'Amazon Web Services',
    date: 'Oct 2023',
    expiry: 'Oct 2026',
    url: 'https://aws.amazon.com/verify',
    status: 'verified',
    trustScore: 98,
    method: 'URL verified + metadata matched',
  },
  {
    id: 2,
    name: 'Meta Frontend Developer',
    issuer: 'Meta / Coursera',
    date: 'Jul 2023',
    expiry: 'No Expiry',
    url: 'https://coursera.org/verify/ABC123',
    status: 'verified',
    trustScore: 94,
    method: 'Verification URL confirmed + QR matched',
  },
  {
    id: 3,
    name: 'Google Data Analytics',
    issuer: 'Google / Coursera',
    date: 'Mar 2023',
    expiry: 'No Expiry',
    url: '',
    status: 'review',
    trustScore: 61,
    method: 'No verification URL provided',
  },
  {
    id: 4,
    name: 'Docker Certified Associate',
    issuer: 'Docker Inc.',
    date: 'Jan 2024',
    expiry: 'Jan 2026',
    url: 'https://fake-verify.xyz/cert',
    status: 'suspicious',
    trustScore: 12,
    method: 'Verification URL does not match Docker domain',
  },
]

const STATUS_CONFIG = {
  verified:   { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'badge-verified', label: 'Verified'    },
  review:     { icon: AlertTriangle,color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',   badge: 'badge-warning', label: 'Needs Review' },
  suspicious: { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         badge: 'badge-danger',  label: 'Suspicious'  },
}

function AddCertModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', issuer: '', date: '', url: '' })
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="glass-card gradient-border w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Add Certificate</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'name',   placeholder: 'Certificate name',  label: 'Name'              },
            { key: 'issuer', placeholder: 'e.g. AWS, Google',   label: 'Issuer'            },
            { key: 'date',   placeholder: 'e.g. Oct 2023',      label: 'Date Issued'       },
            { key: 'url',    placeholder: 'Verification URL',   label: 'Verification URL'  },
          ].map(({ key, placeholder, label }) => (
            <div key={key}>
              <label className="text-xs text-dark-300 mb-1 block">{label}</label>
              <input
                type="text" placeholder={placeholder} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => { onAdd(form); onClose() }}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4 text-sm"
        >
          <Zap size={14} /> Verify Certificate
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function CertificateVerifier() {
  const [certs, setCerts]       = useState(MOCK_CERTS)
  const [showModal, setModal]   = useState(false)
  const [selected, setSelected] = useState(null)

  const addCert = (form) => {
    const newCert = {
      id: Date.now(),
      name: form.name || 'New Certificate',
      issuer: form.issuer || 'Unknown',
      date: form.date || 'Unknown',
      expiry: 'Unknown',
      url: form.url || '',
      status: form.url ? 'verified' : 'review',
      trustScore: form.url ? 88 : 55,
      method: form.url ? 'URL verification pending' : 'No verification URL',
    }
    setCerts([newCert, ...certs])
  }

  const counts = {
    verified:   certs.filter((c) => c.status === 'verified').length,
    review:     certs.filter((c) => c.status === 'review').length,
    suspicious: certs.filter((c) => c.status === 'suspicious').length,
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{showModal && <AddCertModal onClose={() => setModal(false)} onAdd={addCert} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-yellow-400" size={22} /> Certificate Verifier
          </h1>
          <p className="text-sm text-dark-300 mt-1">Verify every certification against issuer databases</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Certificate
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Verified',    count: counts.verified,   color: 'emerald', icon: CheckCircle   },
          { label: 'Needs Review',count: counts.review,     color: 'yellow',  icon: AlertTriangle },
          { label: 'Suspicious',  count: counts.suspicious, color: 'red',     icon: XCircle       },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`glass-card gradient-border text-center border-${color}-500/20 bg-${color}-500/5`}>
            <Icon size={24} className={`text-${color}-400 mx-auto mb-2`} />
            <p className={`text-3xl font-black text-${color}-400`}>{count}</p>
            <p className="text-xs text-dark-300 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Certificate list */}
      <div className="space-y-3">
        {certs.map((cert, i) => {
          const cfg = STATUS_CONFIG[cert.status]
          const Icon = cfg.icon
          const isOpen = selected === cert.id
          return (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`glass-card gradient-border border ${cfg.bg} cursor-pointer`}
              onClick={() => setSelected(isOpen ? null : cert.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white truncate">{cert.name}</p>
                    <span className={cfg.badge}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Building2 size={10} />{cert.issuer}</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Calendar size={10} />{cert.date}</span>
                    <span className="text-xs text-dark-400">Expires: {cert.expiry}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xl font-black ${cfg.color}`}>{cert.trustScore}</p>
                  <p className="text-[10px] text-dark-400">trust score</p>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-dark-400">Verification method:</span>
                        <span className="text-white">{cert.method}</span>
                      </div>
                      {cert.url && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-dark-400">Verification URL:</span>
                          <a href={cert.url} target="_blank" rel="noreferrer"
                            className="text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cert.url.slice(0, 40)}... <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                      <div className="mt-3 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${cert.trustScore}%` }} transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${
                            cert.status === 'verified'   ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                            cert.status === 'review'     ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
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
