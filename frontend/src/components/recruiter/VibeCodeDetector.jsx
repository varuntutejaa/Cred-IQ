import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Search, AlertTriangle, CheckCircle, XCircle, Info, Shield } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import TechLogo from '../shared/TechLogo'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = ['Fetching commit history', 'Analysing commit message linguistics', 'Scanning variable naming entropy', 'Detecting boilerplate signatures', 'Checking timing distribution', 'Running Gemini verdict']

const VERDICT_STYLES = {
  clean:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  mixed:     'bg-yellow-500/15  text-yellow-300  border-yellow-500/30',
  high_risk: 'bg-red-500/15     text-red-300     border-red-500/30',
}

const CONFIDENCE_COLORS = { high: 'text-emerald-400', medium: 'text-yellow-400', low: 'text-red-400' }
const RECOMMENDATION_COLORS = { hire: 'text-emerald-400', review_further: 'text-yellow-400', caution: 'text-red-400' }

function vibeColor(v) { return v <= 25 ? '#10b981' : v <= 55 ? '#f59e0b' : '#ef4444' }

export default function VibeCodeDetector() {
  const [input,   setInput]   = useState('')
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const detect = async () => {
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
      const { data } = await axios.get(`/api/insights/vibe/${handle}`)
      const raw = data.raw_signals || {}
      const ai  = data.ai_verdict  || {}

      setResult({
        handle,
        vibeScore:    raw.risk_score || 0,
        reposChecked: raw.repos_checked || 0,
        rawFlags:     raw.flags || [],
        verdict:      ai.verdict      || raw.verdict || 'mixed',
        confidence:   ai.confidence   || 'medium',
        explanation:  ai.explanation  || 'No detailed explanation available.',
        redFlags:     ai.red_flags    || [],
        greenFlags:   ai.green_flags  || [],
        recommendation: ai.recommendation || 'review_further',
      })
      toast.success(`Vibe analysis complete for @${handle}`)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Vibe analysis failed'
      setError(msg)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot size={20} className="text-purple-400" /> Vibe Code Detector
        </h1>
        <p className="text-sm text-dark-300 mt-1">Detect AI-generated code patterns — powered by Gemini</p>
      </div>

      <div className="glass rounded-xl px-4 py-3 border border-purple-500/20 bg-purple-500/5 flex items-start gap-3">
        <Info size={14} className="text-purple-400 shrink-0 mt-0.5" />
        <p className="text-xs text-dark-300 leading-relaxed">
          <span className="text-purple-300 font-semibold">What is Vibe Code?</span> AI-generated or heavily assisted code that doesn't reflect the developer's true skills.
          A high vibe risk score indicates the code was likely generated rather than authored. Low scores indicate authentic human development.
        </p>
      </div>

      <div className="glass-card gradient-border max-w-xl">
        <label className="text-xs font-semibold text-dark-300 mb-2 block">GitHub Username or URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">@</span>
            <input type="text" placeholder="e.g. torvalds or github.com/torvalds" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && detect()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={detect} disabled={loading || !input.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 text-white font-semibold rounded-xl px-5 py-3 text-sm shadow-glow disabled:opacity-50 transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={14} /> Detect</>}
          </motion.button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><XCircle size={11} /> {error}</p>}
      </div>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card gradient-border max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-white">Running vibe analysis…</p>
          </div>
          {STEPS.map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.28 }}
              className={`flex items-center gap-2 text-xs mb-1.5 ${i <= step ? 'text-white' : 'text-dark-500'}`}
            >
              {i < step
                ? <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px]">✓</div>
                : i === step
                ? <div className="w-2.5 h-2.5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                : <div className="w-2.5 h-2.5 rounded-full border border-white/10" />
              }
              {s}
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Header */}
            <div className="glass-card gradient-border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <a href={`https://github.com/${result.handle}`} target="_blank" rel="noopener noreferrer"
                      className="text-xl font-bold text-white hover:text-brand-300 transition-colors font-mono"
                    >@{result.handle}</a>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${VERDICT_STYLES[result.verdict]}`}>
                      {result.verdict === 'clean' ? <CheckCircle size={11} /> : result.verdict === 'high_risk' ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                      {result.verdict === 'clean' ? 'Authentic Developer' : result.verdict === 'high_risk' ? 'High Vibe Code Risk' : 'Mixed Signals'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-400">
                    <span>Repos checked: <span className="text-white font-semibold">{result.reposChecked}</span></span>
                    <span className={`font-semibold ${CONFIDENCE_COLORS[result.confidence]}`}>Confidence: {result.confidence}</span>
                    <span className={`font-semibold ${RECOMMENDATION_COLORS[result.recommendation]}`}>
                      {result.recommendation === 'hire' ? '✓ Hire' : result.recommendation === 'review_further' ? '◐ Review Further' : '⚠ Caution'}
                    </span>
                  </div>
                </div>

                {/* Score ring */}
                <div className="shrink-0">
                  {(() => {
                    const r = 38, circ = 2 * Math.PI * r, c = vibeColor(result.vibeScore)
                    return (
                      <div className="relative w-24 h-24">
                        <svg width={96} height={96} className="-rotate-90">
                          <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
                          <motion.circle cx={48} cy={48} r={r} fill="none" stroke={c} strokeWidth={8}
                            strokeLinecap="round" strokeDasharray={circ}
                            initial={{ strokeDashoffset: circ }}
                            animate={{ strokeDashoffset: circ - (result.vibeScore / 100) * circ }}
                            transition={{ duration: 1.2 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-xl font-black text-white">{result.vibeScore}%</p>
                          <p className="text-[9px] text-dark-400">vibe risk</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <p className="text-sm text-dark-300 mt-4 leading-relaxed border-t border-white/5 pt-4">{result.explanation}</p>

              {result.rawFlags.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-semibold text-red-400 mb-2">Raw Pattern Flags</p>
                  {result.rawFlags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-300 bg-red-500/8 rounded-lg px-3 py-2 border border-red-500/15">
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Green flags */}
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={15} className="text-emerald-400" /> Green Flags (Authentic)</h3>
                {result.greenFlags.length > 0 ? (
                  <div className="space-y-2.5">
                    {result.greenFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-dark-500 italic">No green flags identified</p>
                )}
              </div>

              {/* Red flags */}
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Shield size={15} className="text-red-400" /> Red Flags (Concerns)</h3>
                {result.redFlags.length > 0 ? (
                  <div className="space-y-2.5">
                    {result.redFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-dark-200">
                        <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-400 italic">No red flags detected — authentic developer</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
