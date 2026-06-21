import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Trophy, Lock, Search, Loader2, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const TIER_STYLE = {
  Bronze:   'text-orange-300 bg-orange-500/10 border-orange-500/25',
  Silver:   'text-slate-200 bg-slate-400/10 border-slate-400/25',
  Gold:     'text-yellow-300 bg-yellow-500/10 border-yellow-500/25',
  Platinum: 'text-cyan-200 bg-cyan-400/10 border-cyan-400/25',
  Earned:   'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
}

const TIER_GLOW = {
  Bronze:   'shadow-[0_0_18px_rgba(249,115,22,0.18)]',
  Silver:   'shadow-[0_0_18px_rgba(148,163,184,0.18)]',
  Gold:     'shadow-[0_0_18px_rgba(234,179,8,0.22)]',
  Platinum: 'shadow-[0_0_18px_rgba(34,211,238,0.22)]',
  Earned:   'shadow-[0_0_14px_rgba(16,185,129,0.18)]',
}

const CATEGORY_COLOR = {
  'GitHub Badge':  'text-brand-400',
  'Activity':      'text-emerald-400',
  'Popularity':    'text-yellow-400',
  'Skills':        'text-cyan-400',
  'Seniority':     'text-purple-400',
  'Contribution':  'text-pink-400',
}

function ProgressBar({ value, next }) {
  if (!next || !value) return null
  const pct = Math.min((value / next) * 100, 100)
  return (
    <div className="mt-2.5">
      <div className="flex justify-between text-[10px] text-dark-500 mb-1">
        <span>{value.toLocaleString()}</span>
        <span>{next.toLocaleString()}</span>
      </div>
      <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
        />
      </div>
    </div>
  )
}

export default function Achievements() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [input, setInput]     = useState('')
  const [handle, setHandle]   = useState('')

  useEffect(() => {
    if (user?.github_username && !data) fetch(user.github_username)
  }, [user?.github_username])

  function fetch(username) {
    setLoading(true)
    setError('')
    axios.get(`/api/github/achievements/${username}`)
      .then(({ data: d }) => { setData(d); setHandle(username) })
      .catch(() => setError(`Could not load achievements for @${username}`))
      .finally(() => setLoading(false))
  }

  function submit(e) {
    e.preventDefault()
    const val = input.trim().replace(/^@/, '')
    if (val) fetch(val)
  }

  const achievements = data?.achievements || []
  const earned       = achievements.filter(a => a.earned)
  const locked       = achievements.filter(a => !a.earned)
  const pct          = data ? Math.round((data.earned / data.total) * 100) : 0

  // Group earned by category
  const githubBadges  = earned.filter(a => a.category === 'GitHub Badge')
  const otherEarned   = earned.filter(a => a.category !== 'GitHub Badge')

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-400" size={22} /> GitHub Achievements
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            Real badges earned from actual GitHub activity
            {handle && <span className="text-dark-400"> · @{handle}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <div className="glass-card gradient-border text-center px-5 py-2.5">
              <p className="text-2xl font-black gradient-text">{data.earned}/{data.total}</p>
              <p className="text-xs text-dark-400">Unlocked</p>
            </div>
          )}
          <form onSubmit={submit} className="flex gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={handle || 'GitHub username…'}
                className="w-44 bg-dark-800 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60"
              />
            </div>
            <button type="submit" disabled={loading || !input.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white flex items-center gap-1.5 transition-colors"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Go
            </button>
          </form>
        </div>
      </div>

      {/* error */}
      {error && <div className="glass-card border border-red-500/30 text-red-400 text-sm p-4">{error}</div>}

      {/* loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse h-28" />
          ))}
        </div>
      )}

      {data && !loading && (
        <>
          {/* progress */}
          <div className="glass-card gradient-border">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-dark-300">Achievement Progress</span>
              <span className="font-semibold text-white">{pct}% · {data.earned} of {data.total} unlocked</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
              />
            </div>
          </div>

          {/* Official GitHub Badges section */}
          {githubBadges.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
                🏅 Official GitHub Badges
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {githubBadges.map((a, i) => (
                  <AchievementCard key={a.id} a={a} i={i} />
                ))}
              </div>
            </div>
          )}

          {/* Other earned */}
          {otherEarned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                ✅ Earned
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {otherEarned.map((a, i) => (
                  <AchievementCard key={a.id} a={a} i={i} />
                ))}
              </div>
            </div>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
                🔒 Locked
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {locked.map((a, i) => (
                  <AchievementCard key={a.id} a={a} i={i} locked />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* empty */}
      {!loading && !data && !error && (
        <div className="glass-card text-center py-16 text-dark-400">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a GitHub username to load their achievements</p>
        </div>
      )}
    </div>
  )
}

function AchievementCard({ a, i, locked }) {
  const ts = TIER_STYLE[a.tier] || ''
  const tg = TIER_GLOW[a.tier]  || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className={`glass-card gradient-border relative overflow-hidden ${locked ? 'opacity-45' : tg}`}
    >
      {locked && (
        <div className="absolute top-3 right-3">
          <Lock size={13} className="text-dark-500" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* emoji badge */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl
          ${locked ? 'bg-dark-700/60' : 'bg-white/5 border border-white/8'}`}
        >
          {locked ? '🔒' : a.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-semibold text-white text-sm">{a.title}</p>
            {a.tier && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${ts}`}>
                {a.tier}
              </span>
            )}
          </div>
          <p className={`text-[10px] font-medium mb-0.5 ${CATEGORY_COLOR[a.category] || 'text-dark-400'}`}>
            {a.category}
          </p>
          <p className="text-xs text-dark-300">{a.desc}</p>
        </div>
      </div>

      {/* progress toward next tier */}
      {!locked && a.next && (
        <ProgressBar value={a.value} next={a.next} />
      )}
      {locked && (
        <p className="text-[10px] text-dark-500 mt-2 leading-relaxed">{a.progress}</p>
      )}
    </motion.div>
  )
}
