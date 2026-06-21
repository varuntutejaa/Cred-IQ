import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, CheckCircle, X, ChevronDown, BookMarked, Eye, Loader2, Plus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import TechLogo from '../shared/TechLogo'
import { useRecruiter } from '../../context/RecruiterContext'

const SKILL_OPTIONS = ['Python','React','TypeScript','AWS','Docker','Kubernetes','Java','Node.js','Flutter','Rust','Go']

const VERDICT_STYLE = {
  'Top Candidate':      'text-yellow-400',
  'Highly Recommended': 'text-emerald-400',
  'Recommended':        'text-brand-400',
  'Needs Review':       'text-orange-400',
}

export default function CandidateSearch() {
  const navigate = useNavigate()
  const { candidates, shortlists, addCandidate, addToShortlist, createShortlist } = useRecruiter()

  const [query,        setQuery]       = useState('')
  const [minTrust,     setMinTrust]    = useState(0)
  const [onlyVerified, setOnlyVerified]= useState(false)
  const [skillFilter,  setSkillFilter] = useState([])
  const [showFilters,  setShowFilters] = useState(false)

  // Quick-add new GitHub username
  const [addInput, setAddInput] = useState('')
  const [adding,   setAdding]   = useState(false)

  const toggleSkill = (s) => setSkillFilter((prev) =>
    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
  )

  const handleShortlist = (c) => {
    if (shortlists.length === 0) {
      const sl = createShortlist('My Candidates')
      addToShortlist(sl.id, c.username)
    } else {
      addToShortlist(shortlists[0].id, c.username)
    }
    toast.success(`Added @${c.username} to shortlist`)
  }

  const handleAddNew = async () => {
    const handle = addInput.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '').replace('@', '')
    if (!handle) return
    setAdding(true)
    try {
      const [profRes, verRes] = await Promise.all([
        axios.get(`/api/github/analyze/${handle}`),
        axios.get(`/api/recruiter/quick-verify/${handle}`),
      ])
      const p = profRes.data
      const v = verRes.data
      const trust   = v.trust_score?.total   ?? 0
      const builder = v.builder_score?.total ?? 0
      const avg     = (trust + builder) / 2
      const verdict = avg >= 80 ? 'Top Candidate' : avg >= 65 ? 'Highly Recommended' : avg >= 50 ? 'Recommended' : 'Needs Review'
      addCandidate({
        username:      handle,
        name:          p.name || handle,
        avatar:        p.avatar,
        bio:           p.bio || '',
        trust_score:   trust,
        builder_score: builder,
        languages:     p.languages || [],
        top_repos:     p.top_repos  || [],
        public_repos:  p.public_repos  || 0,
        total_stars:   p.total_stars   || 0,
        followers:     p.followers     || 0,
        commit_count:  p.commit_count  || 0,
        vibe_risk:     v.vibe_analysis?.risk_score || 0,
        verdict,
      })
      toast.success(`@${handle} added`)
      setAddInput('')
    } catch {
      toast.error(`Could not find @${handle}`)
    } finally {
      setAdding(false)
    }
  }

  const filtered = candidates.filter((c) => {
    const matchQ     = !query
      || (c.name || '').toLowerCase().includes(query.toLowerCase())
      || c.username.includes(query.toLowerCase())
      || (c.languages || []).some((l) => (l.name || l).toLowerCase().includes(query.toLowerCase()))
    const matchTrust = (c.trust_score || 0) >= minTrust
    const matchSkill = skillFilter.length === 0
      || skillFilter.every((s) => (c.languages || []).some((l) => (l.name || l) === s))
    return matchQ && matchTrust && matchSkill
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search size={20} className="text-brand-400" /> Candidate Search
          </h1>
          <p className="text-sm text-dark-300 mt-1">Search and filter your verified developer profiles</p>
        </div>
        <span className="text-xs text-dark-400 glass rounded-xl px-3 py-1.5 border border-white/5">
          {filtered.length} of {candidates.length} candidates
        </span>
      </div>

      {/* Add new GitHub user */}
      <div className="glass-card gradient-border">
        <p className="text-xs font-semibold text-dark-300 mb-2">Add a new GitHub profile</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm font-mono">@</span>
            <input type="text" placeholder="github-username"
              value={addInput} onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <button onClick={handleAddNew} disabled={adding || !addInput.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white font-semibold rounded-xl px-4 py-2.5 text-sm shadow-glow disabled:opacity-50 transition-all"
          >
            {adding
              ? <Loader2 size={14} className="animate-spin" />
              : <><Plus size={14} /> Add</>
            }
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" placeholder="Search by name, handle, or skill..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
            showFilters ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'glass border-white/10 text-dark-300 hover:text-white'
          }`}
        >
          <Filter size={14} /> Filters
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card gradient-border grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-dark-300 mb-2 block">
                  Min Trust Score: <span className="text-brand-400">{minTrust}+</span>
                </label>
                <input type="range" min={0} max={95} step={5} value={minTrust}
                  onChange={(e) => setMinTrust(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-dark-500 mt-1"><span>0</span><span>50</span><span>95</span></div>
              </div>
              <div className="flex flex-col justify-center">
                <button onClick={() => setOnlyVerified(!onlyVerified)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    onlyVerified ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'glass border-white/10 text-dark-300 hover:text-white'
                  }`}
                >
                  <CheckCircle size={15} className={onlyVerified ? 'text-emerald-400' : ''} />
                  {onlyVerified ? 'Verified Only' : 'Show All'}
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold text-dark-300 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_OPTIONS.map((s) => (
                    <button key={s} onClick={() => toggleSkill(s)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                        skillFilter.includes(s)
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                          : 'bg-white/3 border-white/8 text-dark-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {candidates.length === 0 ? (
        <div className="text-center py-20">
          <Users size={40} className="mx-auto text-dark-600 mb-3" />
          <p className="text-sm text-dark-400">No candidates added yet</p>
          <p className="text-xs text-dark-500 mt-1">Add a GitHub username above to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => {
              const color = { 'Top Candidate': '#f59e0b', 'Highly Recommended': '#10b981', 'Recommended': '#6366f1', 'Needs Review': '#f97316' }[c.verdict] || '#6366f1'
              return (
                <motion.div key={c.username} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card gradient-border hover:border-white/15 transition-all group cursor-pointer"
                  onClick={() => navigate(`/recruiter/candidate/${c.username}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {c.avatar
                        ? <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-white/10" />
                        : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: color + '25', color }}
                          >{(c.name || c.username)[0]}</div>
                      }
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name || c.username}</p>
                        <p className="text-[10px] font-mono" style={{ color }}>@{c.username}</p>
                      </div>
                    </div>
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  </div>

                  {c.verdict && (
                    <p className={`text-[10px] font-semibold mb-2 ${VERDICT_STYLE[c.verdict] || 'text-dark-400'}`}>
                      {c.verdict}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center bg-white/3 rounded-xl py-2 border border-white/5">
                      <p className="text-lg font-black" style={{ color }}>{c.trust_score ?? '—'}</p>
                      <p className="text-[9px] text-dark-400">Trust</p>
                    </div>
                    <div className="text-center bg-white/3 rounded-xl py-2 border border-white/5">
                      <p className="text-lg font-black text-emerald-400">{c.builder_score ?? '—'}</p>
                      <p className="text-[9px] text-dark-400">Builder</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(c.languages || []).slice(0, 3).map((l) => (
                      <span key={l.name || l}
                        className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-dark-300"
                      >
                        <TechLogo name={l.name || l} size={11} />{l.name || l}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleShortlist(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium glass border border-white/8 text-dark-300 hover:text-yellow-300 hover:border-yellow-500/25 transition-all"
                    >
                      <BookMarked size={11} /> Shortlist
                    </button>
                    <button onClick={() => navigate(`/recruiter/candidate/${c.username}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/25 hover:bg-brand-500/25 transition-all"
                    >
                      <Eye size={11} /> View Profile
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {candidates.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search size={36} className="mx-auto text-dark-600 mb-3" />
          <p className="text-sm text-dark-400">No candidates match your filters</p>
          <button onClick={() => { setQuery(''); setMinTrust(0); setOnlyVerified(false); setSkillFilter([]) }}
            className="text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
