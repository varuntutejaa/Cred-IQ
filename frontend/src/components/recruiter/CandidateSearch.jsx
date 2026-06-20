import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, CheckCircle, Zap, X, ChevronDown, BookMarked } from 'lucide-react'
import toast from 'react-hot-toast'
import TechLogo from '../shared/TechLogo'

const ALL_CANDIDATES = [
  { id: 1,  name: 'Arjun M.',    handle: 'arjunm',       trust: 91, builder: 88, color: '#f59e0b', skills: ['Java','AWS','Docker','Spring Boot'],         exp: 4, verified: true,  shortlisted: false },
  { id: 2,  name: 'Varun T.',    handle: 'varun-dev',    trust: 87, builder: 94, color: '#6366f1', skills: ['Python','React','Flask','MongoDB'],           exp: 3, verified: true,  shortlisted: false },
  { id: 3,  name: 'Rohan K.',    handle: 'rohanK',       trust: 83, builder: 85, color: '#06b6d4', skills: ['Kubernetes','Terraform','AWS','Docker'],      exp: 5, verified: true,  shortlisted: false },
  { id: 4,  name: 'Priya S.',    handle: 'priya-dev',    trust: 79, builder: 81, color: '#10b981', skills: ['Vue','Node.js','PostgreSQL','GraphQL'],       exp: 2, verified: true,  shortlisted: false },
  { id: 5,  name: 'Sneha R.',    handle: 'snehadev',     trust: 74, builder: 72, color: '#ec4899', skills: ['Python','TensorFlow','FastAPI','PyTorch'],    exp: 3, verified: false, shortlisted: false },
  { id: 6,  name: 'Kiran B.',    handle: 'kiran-b',      trust: 88, builder: 79, color: '#8b5cf6', skills: ['TypeScript','Next.js','Prisma','PostgreSQL'], exp: 4, verified: true,  shortlisted: false },
  { id: 7,  name: 'Ananya T.',   handle: 'ananya-t',     trust: 65, builder: 68, color: '#14b8a6', skills: ['Flutter','Dart','Firebase'],                  exp: 1, verified: false, shortlisted: false },
  { id: 8,  name: 'Dev P.',      handle: 'devpatel',     trust: 92, builder: 91, color: '#f97316', skills: ['Rust','Go','WebAssembly','gRPC'],             exp: 6, verified: true,  shortlisted: false },
]

const SKILL_OPTIONS = ['Python','React','TypeScript','AWS','Docker','Kubernetes','Java','Node.js','Flutter','Rust','Go']

export default function CandidateSearch() {
  const [query,       setQuery]       = useState('')
  const [minTrust,    setMinTrust]    = useState(0)
  const [onlyVerified,setOnlyVerified]= useState(false)
  const [skillFilter, setSkillFilter] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [candidates,  setCandidates]  = useState(ALL_CANDIDATES)

  const toggleSkill = (s) => setSkillFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  const toggleShortlist = (id) => {
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, shortlisted: !c.shortlisted } : c))
    const c = candidates.find((c) => c.id === id)
    toast.success(c?.shortlisted ? 'Removed from shortlist' : 'Added to shortlist!')
  }

  const filtered = candidates.filter((c) => {
    const matchQ     = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.handle.includes(query.toLowerCase()) || c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    const matchTrust = c.trust >= minTrust
    const matchVer   = !onlyVerified || c.verified
    const matchSkill = skillFilter.length === 0 || skillFilter.every((s) => c.skills.includes(s))
    return matchQ && matchTrust && matchVer && matchSkill
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Search size={20} className="text-brand-400" /> Candidate Search</h1>
          <p className="text-sm text-dark-300 mt-1">Search, filter, and verify developer profiles</p>
        </div>
        <span className="text-xs text-dark-400 glass rounded-xl px-3 py-1.5 border border-white/5">{filtered.length} of {candidates.length} candidates</span>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" placeholder="Search by name, handle, or skill..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"><X size={14} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'glass border-white/10 text-dark-300 hover:text-white'}`}
        >
          <Filter size={14} /> Filters <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card gradient-border grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trust filter */}
              <div>
                <label className="text-xs font-semibold text-dark-300 mb-2 block">Min Trust Score: <span className="text-brand-400">{minTrust}+</span></label>
                <input type="range" min={0} max={95} step={5} value={minTrust} onChange={(e) => setMinTrust(Number(e.target.value))}
                  className="w-full accent-brand-500" />
                <div className="flex justify-between text-[10px] text-dark-500 mt-1"><span>0</span><span>50</span><span>95</span></div>
              </div>
              {/* Verified toggle */}
              <div className="flex flex-col justify-center">
                <button onClick={() => setOnlyVerified(!onlyVerified)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${onlyVerified ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'glass border-white/10 text-dark-300 hover:text-white'}`}
                >
                  <CheckCircle size={15} className={onlyVerified ? 'text-emerald-400' : ''} />
                  {onlyVerified ? 'Verified Only' : 'Show All'}
                </button>
              </div>
              {/* Skill filter */}
              <div>
                <p className="text-xs font-semibold text-dark-300 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_OPTIONS.map((s) => (
                    <button key={s} onClick={() => toggleSkill(s)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${skillFilter.includes(s) ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'bg-white/3 border-white/8 text-dark-400 hover:text-white'}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
              className="glass-card gradient-border hover:border-white/15 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: c.color + '25', color: c.color }}>
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-[10px] font-mono" style={{ color: c.color }}>@{c.handle}</p>
                  </div>
                </div>
                {c.verified && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
              </div>

              {/* Score row */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center bg-white/3 rounded-xl py-2 border border-white/5">
                  <p className="text-lg font-black" style={{ color: c.color }}>{c.trust}</p>
                  <p className="text-[9px] text-dark-400">Trust Score</p>
                </div>
                <div className="text-center bg-white/3 rounded-xl py-2 border border-white/5">
                  <p className="text-lg font-black text-emerald-400">{c.builder}%</p>
                  <p className="text-[9px] text-dark-400">Builder</p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {c.skills.slice(0, 3).map((s) => (
                  <span key={s} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-dark-300">
                    <TechLogo name={s} size={11} />{s}
                  </span>
                ))}
                {c.skills.length > 3 && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-dark-500">+{c.skills.length - 3}</span>}
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => toggleShortlist(c.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    c.shortlisted ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25' : 'glass border border-white/8 text-dark-300 hover:text-yellow-300 hover:border-yellow-500/25'
                  }`}
                >
                  <BookMarked size={11} /> {c.shortlisted ? 'Saved' : 'Shortlist'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/25 hover:bg-brand-500/25 transition-all">
                  <Zap size={11} /> Verify
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
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
