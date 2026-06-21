import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Zap, TrendingUp, AlertTriangle, Lightbulb, ChevronRight,
  Star, Target, RefreshCw, BookOpen, Code2, GitBranch, Users,
  ArrowUpRight, Sparkles, CheckCircle2, Wrench,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const STEPS = [
  'Reading GitHub profile',
  'Analysing commit patterns',
  'Mapping skill evidence',
  'Generating insights with Groq AI',
]
const FIT_COLOR = { high: 'text-emerald-400', medium: 'text-yellow-400', low: 'text-red-400' }
const FIT_BG   = { high: 'bg-emerald-500/10 border-emerald-500/20', medium: 'bg-yellow-500/10 border-yellow-500/20', low: 'bg-red-500/10 border-red-500/20' }

function Badge({ value, label }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-black ${FIT_COLOR[value] || 'text-white'}`}>{(value || '—').toUpperCase()}</p>
      <p className="text-[10px] text-dark-500 mt-0.5">{label}</p>
    </div>
  )
}

function ScoreBadge({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-black gradient-text">{value ?? '—'}</p>
      <p className="text-[10px] text-dark-500 mt-0.5">{label}</p>
    </div>
  )
}

function ListCard({ icon: Icon, iconClass, title, items = [], bullet = 'number' }) {
  return (
    <div className="glass-card gradient-border h-full">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Icon size={15} className={iconClass} /> {title}
      </h3>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            {bullet === 'number'
              ? <span className="text-[10px] font-bold text-dark-500 shrink-0 mt-0.5 w-4">{i + 1}.</span>
              : bullet === 'check'
              ? <CheckCircle2 size={13} className={`${iconClass} shrink-0 mt-0.5`} />
              : <ChevronRight size={13} className={`${iconClass} shrink-0 mt-0.5`} />
            }
            <p className="text-sm text-dark-200 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProseCard({ icon: Icon, iconClass, title, text, accent }) {
  return (
    <div className={`glass-card gradient-border border ${accent}`}>
      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
        <Icon size={15} className={iconClass} /> {title}
      </h3>
      <p className="text-sm text-dark-200 leading-relaxed">{text}</p>
    </div>
  )
}

export default function AIInsights() {
  const { user } = useAuth()
  const [loading,  setLoading]  = useState(false)
  const [step,     setStep]     = useState(0)
  const [insights, setInsights] = useState(null)
  const [error,    setError]    = useState(null)

  const generate = async () => {
    const username = user?.github_username
    if (!username) { toast.error('No GitHub username — connect your profile first'); return }
    setLoading(true)
    setInsights(null)
    setError(null)
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise((r) => setTimeout(r, 900))
    }
    try {
      const { data } = await axios.get(`/api/insights/career/${username}`)
      setInsights(data)
      toast.success('AI insights ready!')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Something went wrong — check GROQ_API_KEY'
      setError(msg)
      toast.error('Failed to generate insights')
    } finally { setLoading(false) }
  }

  const ins = insights?.insights || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-brand-400" size={22} /> AI Insights
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Groq AI analysis of <span className="text-brand-400">@{user?.github_username || 'your profile'}</span> — personalised recommendations
          </p>
        </div>
        {insights && (
          <button onClick={() => { setInsights(null); setStep(0) }} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Regenerate
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* Error state */}
        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border border-red-500/20 max-w-lg"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">AI generation failed</p>
                <p className="text-sm text-dark-400 mt-1 font-mono break-all">{error}</p>
              </div>
            </div>
            <button onClick={() => { setError(null); generate() }} className="btn-secondary text-sm flex items-center gap-2">
              <RefreshCw size={13} /> Try Again
            </button>
          </motion.div>
        )}

        {/* CTA */}
        {!insights && !loading && !error && (
          <motion.div key="cta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-purple/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-brand-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">Generate AI Insights</h2>
            <p className="text-sm text-dark-300 mb-2">
              Groq AI will analyse your repositories, commit patterns, and skill evidence
              to generate personalised recommendations.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5 text-left">
              {[
                'Skill gaps & strengths',
                'Learning path',
                'Tech stack advice',
                'Profile improvements',
                'Role recommendations',
                'Open source guidance',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-dark-400">
                  <Sparkles size={10} className="text-brand-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <button onClick={generate} className="btn-primary flex items-center gap-2 mx-auto">
              <Zap size={15} /> Generate Insights
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card gradient-border max-w-lg"
          >
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Brain size={15} className="text-brand-400 animate-pulse" /> Analysing with Groq AI…
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
        {insights && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Summary + scores row */}
            <div className="glass-card gradient-border">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Brain size={16} className="text-brand-400" /> AI Summary
                  </h2>
                  <p className="text-sm text-dark-200 leading-relaxed">{ins.summary}</p>
                </div>
                <div className="flex gap-5 shrink-0 border-l border-white/5 pl-6">
                  <ScoreBadge value={insights.trust_score}   label="Trust Score"   />
                  <ScoreBadge value={insights.builder_score} label="Builder Score" />
                  <div className="border-l border-white/5 pl-5">
                    <Badge value={ins.market_fit}             label="Market Fit"   />
                    <div className="mt-3">
                      <Badge value={ins.collaboration_potential} label="Collaboration" />
                    </div>
                  </div>
                </div>
              </div>

              {ins.standout_project && (
                <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                  <p className="text-[11px] text-yellow-400 font-semibold flex items-center gap-1.5 mb-1">
                    <Star size={11} /> Standout Project
                  </p>
                  <p className="text-sm text-dark-200">{ins.standout_project}</p>
                </div>
              )}
            </div>

            {/* Strengths + Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ListCard
                icon={TrendingUp} iconClass="text-emerald-400"
                title="Strengths" items={ins.strengths || []} bullet="check"
              />
              <ListCard
                icon={AlertTriangle} iconClass="text-yellow-400"
                title="Skill Gaps" items={ins.gaps || []} bullet="arrow"
              />
            </div>

            {/* Roles + Learning Path + Profile Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <ListCard
                icon={Target} iconClass="text-brand-400"
                title="Recommended Roles" items={ins.recommended_roles || []} bullet="arrow"
              />
              <ListCard
                icon={BookOpen} iconClass="text-purple-400"
                title="Learning Path" items={ins.learning_path || []} bullet="number"
              />
              <ListCard
                icon={Wrench} iconClass="text-cyan-400"
                title="Profile Improvements" items={ins.profile_improvements || []} bullet="check"
              />
            </div>

            {/* Tech Stack Advice + Open Source Advice */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ProseCard
                icon={Code2} iconClass="text-brand-400"
                title="Tech Stack Advice"
                text={ins.tech_stack_advice}
                accent="border-brand-500/15"
              />
              <ProseCard
                icon={GitBranch} iconClass="text-purple-400"
                title="Open Source Guidance"
                text={ins.open_source_advice}
                accent="border-purple-500/15"
              />
            </div>

            {/* Next Steps */}
            <div className="glass-card gradient-border">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowUpRight size={16} className="text-emerald-400" /> Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(ins.next_steps || []).map((step, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-dark-200 leading-relaxed">{step}</p>
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
