import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Clock, Github, Code2, Star, Zap, GitFork,
  GitBranch, Search, Loader2, CalendarDays
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import TechLogo from '../shared/TechLogo'

const COLORS = ['brand', 'cyan', 'green', 'yellow', 'purple']
const COLOR = {
  brand:  'bg-brand-500/15 border-brand-500/30 text-brand-400',
  cyan:   'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
  green:  'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  yellow: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
}
const DOT = {
  brand:  'bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]',
  cyan:   'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]',
  green:  'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  yellow: 'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  purple: 'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]',
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthYear(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function daysSince(iso) {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso)) / 86400000)
}

function buildTimeline(profile) {
  const events = []

  // 1. Account creation — always first
  if (profile.account_created_at) {
    events.push({
      date:      profile.account_created_at,
      icon:      Github,
      color:     'brand',
      title:     `@${profile.username} joined GitHub`,
      desc:      `Started the developer journey on ${fmtDate(profile.account_created_at)}`,
      tags:      [],
      milestone: true,
    })
  }

  // 2. Each repo sorted by created_at oldest → newest
  const repos = [...(profile.top_repos || [])]
    .filter(r => r.created_at)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  repos.forEach((r, i) => {
    const age = daysSince(r.created_at)
    const tags = [r.lang].filter(t => t && t !== 'Unknown')
    if (r.stars > 0) tags.push(`★ ${r.stars}`)
    if (r.forks > 0) tags.push(`⑂ ${r.forks}`)

    events.push({
      date:      r.created_at,
      icon:      Code2,
      color:     COLORS[i % COLORS.length],
      title:     r.name,
      desc:      r.desc || `${r.lang} project`,
      tags,
      url:       r.url,
      lang:      r.lang,
      age_label: age < 30   ? `${age}d old`
                : age < 365 ? `${Math.round(age / 30)}mo old`
                :             `${(age / 365).toFixed(1)}y old`,
    })
  })

  // 3. CredIQ milestone at the end (today)
  events.push({
    date:      new Date().toISOString(),
    icon:      Zap,
    color:     'brand',
    title:     'Verified on CredIQ',
    desc:      `Trust Score: ${profile.trust_score ?? '—'}/100 · Builder Score: ${profile.builder_score ?? '—'}/100`,
    tags:      ['CredIQ', 'Verified'],
    milestone: true,
  })

  return events
}

export default function DevTimeline() {
  const { user } = useAuth()
  const [handle, setHandle]   = useState('')
  const [input, setInput]     = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // auto-load own profile on mount
  useEffect(() => {
    if (user?.github_username && !profile) {
      fetchProfile(user.github_username)
    }
  }, [user?.github_username])

  function fetchProfile(username) {
    setLoading(true)
    setError('')
    axios.get(`/api/github/analyze/${username}`)
      .then(({ data }) => {
        setProfile(data)
        setHandle(username)
      })
      .catch(() => setError(`Could not load @${username}`))
      .finally(() => setLoading(false))
  }

  function submit(e) {
    e.preventDefault()
    const val = input.trim().replace(/^@/, '')
    if (val) fetchProfile(val)
  }

  const timeline = profile ? buildTimeline(profile) : []
  const totalRepos = (profile?.top_repos || []).filter(r => r.created_at).length
  const span = profile?.account_created_at
    ? Math.floor(daysSince(profile.account_created_at) / 30)
    : 0

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="text-cyan-400" size={22} /> Developer Journey
          </h1>
          <p className="text-sm text-dark-300 mt-1">
            GitHub account creation → every repository, in chronological order
          </p>
        </div>

        {/* username search */}
        <form onSubmit={submit} className="flex gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={handle || 'GitHub username…'}
              className="w-48 bg-dark-800 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60"
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

      {/* stats row */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Repos on timeline', value: totalRepos,              color: 'text-brand-400'   },
            { label: 'GitHub age',         value: `${span} months`,       color: 'text-cyan-400'    },
            { label: 'Total stars',        value: profile.total_stars,    color: 'text-yellow-400'  },
            { label: 'Commits (12 mo)',    value: profile.commit_count,   color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card gradient-border text-center">
              <p className={`text-2xl font-black ${color}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="glass-card border border-red-500/30 text-red-400 text-sm p-4">{error}</div>
      )}

      {/* loading skeleton */}
      {loading && (
        <div className="space-y-4 pl-12 relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse h-20" />
          ))}
        </div>
      )}

      {/* timeline */}
      {!loading && timeline.length > 0 && (
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/60 via-white/5 to-transparent" />

          <div className="space-y-4 pl-12">
            {timeline.map((ev, i) => {
              const Icon = ev.icon
              const cc   = COLOR[ev.color]
              const dc   = DOT[ev.color]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative"
                >
                  {/* dot on line */}
                  <div className={`absolute -left-[35px] top-4 w-3 h-3 rounded-full ${dc} ${ev.milestone ? 'scale-125' : ''}`} />

                  <div className={`glass-card glass-hover gradient-border ${ev.milestone ? 'border-l-2 border-l-brand-500/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cc}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {ev.url ? (
                            <a href={ev.url} target="_blank" rel="noopener noreferrer"
                              className="font-semibold text-white hover:text-brand-300 transition-colors font-mono"
                            >{ev.title}</a>
                          ) : (
                            <h3 className="font-semibold text-white">{ev.title}</h3>
                          )}
                          {ev.milestone && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/25 font-semibold">
                              Milestone
                            </span>
                          )}
                          {ev.age_label && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-dark-400">
                              {ev.age_label}
                            </span>
                          )}
                        </div>

                        {ev.date && (
                          <p className="text-xs text-dark-400 mt-0.5 flex items-center gap-1">
                            <CalendarDays size={10} /> {fmtDate(ev.date)}
                          </p>
                        )}

                        <p className="text-sm text-dark-300 mt-1.5 leading-relaxed">{ev.desc}</p>

                        {ev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {ev.tags.map((t) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-dark-300 flex items-center gap-1">
                                {ev.lang && t === ev.lang
                                  ? <><TechLogo name={t} size={9} /> {t}</>
                                  : t
                                }
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* empty state */}
      {!loading && !profile && !error && (
        <div className="glass-card text-center py-16 text-dark-400">
          <GitBranch size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a GitHub username to view their developer journey</p>
        </div>
      )}
    </div>
  )
}
