import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, Star, Target, RefreshCw, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = ['Reading GitHub profile', 'Analysing commit patterns', 'Mapping skill evidence', 'Generating insights with Groq AI']
const MARKET_COLOR = { high: 'text-emerald-400', medium: 'text-yellow-400', low: 'text-red-400' }

function QuotaError({ onRetry }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card gradient-border border-yellow-500/20 max-w-lg"
    >
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">Gemini API quota exhausted</p>
          <p className="text-sm text-dark-300 mt-1">
            Your free-tier limit is used up. Fix it in 2 minutes:
          </p>
        </div>
      </div>
      <ol className="space-y-2 text-sm text-dark-200 mb-4 ml-2">
        <li className="flex items-start gap-2">
          <span className="text-brand-400 font-bold shrink-0">1.</span>
          Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 underline flex items-center gap-1 inline-flex">
            aistudio.google.com/apikey <ExternalLink size={11} />
          </a>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-400 font-bold shrink-0">2.</span>
          Create a new key (or enable billing on your project)
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-400 font-bold shrink-0">3.</span>
          Replace <code className="text-brand-300 bg-white/5 px-1 rounded">GEMINI_API_KEY</code> in <code className="text-brand-300 bg-white/5 px-1 rounded">backend/.env</code>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-400 font-bold shrink-0">4.</span>
          Restart the backend server, then try again
        </li>
      </ol>
      <p className="text-xs text-dark-400 mb-3">
        Note: results are cached for 6 hours after the first successful call — so once it works you won't burn quota on repeat views.
      </p>
      <button onClick={onRetry} className="btn-secondary text-sm flex items-center gap-2">
        <RefreshCw size={13} /> Try Again
      </button>
    </motion.div>
  )
}

export default function AIInsights() {
  const { user } = useAuth()
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState(0)
  const [insights, setInsights]   = useState(null)
  const [quotaError, setQuotaErr] = useState(false)

  const generate = async () => {
    const username = user?.github_username
    if (!username) { toast.error('No GitHub username — log in via demo first'); return }
    setLoading(true)
    setInsights(null)
    setQuotaErr(false)
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 900))
    }
    try {
      const { data } = await axios.get(`/api/insights/career/${username}`)
      setInsights(data)
      toast.success('AI insights generated!')
    } catch (err) {
      const msg = err?.response?.data?.error || ''
      if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource_exhausted')) {
        setQuotaErr(true)
      } else {
        toast.error(msg || 'Gemini API failed — check GEMINI_API_KEY')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="text-brand-400" size={22} /> AI Insights</h1>
          <p className="text-sm text-dark-300 mt-1">Groq AI-powered career analysis of your GitHub profile</p>
        </div>
        {insights && (
          <button onClick={() => { setInsights(null); setStep(0) }} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Regenerate
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {quotaError && !loading && (
          <motion.div key="quota" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuotaError onRetry={() => { setQuotaErr(false); generate() }} />
          </motion.div>
        )}

        {!insights && !loading && !quotaError && (
          <motion.div key="cta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-purple/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-brand-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">Generate Your Career Analysis</h2>
            <p className="text-sm text-dark-300 mb-5">
              Gemini will analyse <span className="text-brand-400 font-medium">@{user?.github_username || 'your profile'}</span>'s
              repositories, compute skill evidence, and return a personalised career report.
            </p>
            <button onClick={generate} className="btn-primary flex items-center gap-2 mx-auto">
              <Zap size={15} /> Generate Insights
            </button>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Brain size={15} className="text-brand-400" /> Analysing with Gemini…
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

        {insights && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="glass-card gradient-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-2"><Brain size={18} className="text-brand-400" /> AI Summary</h2>
                  <p className="text-dark-200 text-sm leading-relaxed">{insights.insights?.summary}</p>
                </div>
                <div className="text-center shrink-0">
                  <p className={`text-2xl font-black ${MARKET_COLOR[insights.insights?.market_fit] || 'text-white'}`}>
                    {insights.insights?.market_fit?.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-dark-400 mt-0.5">Market Fit</p>
                  <p className="text-3xl font-black gradient-text mt-2">{insights.trust_score ?? '—'}</p>
                  <p className="text-[10px] text-dark-400">Trust Score</p>
                </div>
              </div>
              {insights.insights?.standout_project && (
                <div className="mt-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                  <p className="text-xs text-yellow-400 font-semibold flex items-center gap-1.5"><Star size={11} /> Standout Project</p>
                  <p className="text-sm text-dark-200 mt-1">{insights.insights.standout_project}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-400" /> Strengths</h3>
                <div className="space-y-2.5">
                  {(insights.insights?.strengths || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 text-[10px] font-bold">{i+1}</div>
                      <p className="text-sm text-dark-200">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-400" /> Skill Gaps</h3>
                <div className="space-y-2.5">
                  {(insights.insights?.gaps || []).map((g, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <AlertTriangle size={13} className="text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-dark-200">{g}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Target size={16} className="text-brand-400" /> Recommended Roles</h3>
                <div className="space-y-2">
                  {(insights.insights?.recommended_roles || []).map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight size={13} className="text-brand-400 shrink-0" />
                      <span className="text-dark-200">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Salary Range</h3>
                <p className="text-base font-bold text-emerald-400 leading-relaxed">{insights.insights?.salary_range || '—'}</p>
                <p className="text-xs text-dark-400 mt-2">Based on verified skills and market data</p>
              </div>
              <div className="glass-card gradient-border">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Lightbulb size={16} className="text-cyan-400" /> Next Steps</h3>
                <div className="space-y-2">
                  {(insights.insights?.next_steps || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-cyan-400 font-bold shrink-0">{i+1}.</span>
                      <span className="text-dark-200">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
