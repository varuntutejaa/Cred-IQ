import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Filter, Download, CheckCircle, Github, Award,
  Rocket, Star, MapPin, Briefcase, TrendingUp, Eye
} from 'lucide-react'

const CANDIDATES = [
  {
    id: 1, name: 'Varun T.',    handle: 'varun-dev',    avatar: 'V', color: '#6366f1',
    title: 'Full Stack Developer', location: 'Bangalore, IN', exp: '3 years',
    trustScore: 87, githubScore: 92, repos: 47, deployments: 9, certifications: 6,
    skills: ['Python', 'React', 'Flask', 'MongoDB'], open: true,
  },
  {
    id: 2, name: 'Priya S.',   handle: 'priya-dev',   avatar: 'P', color: '#10b981',
    title: 'Frontend Engineer',    location: 'Mumbai, IN',     exp: '2 years',
    trustScore: 79, githubScore: 84, repos: 31, deployments: 6, certifications: 8,
    skills: ['JavaScript', 'Vue', 'Node.js', 'PostgreSQL'], open: true,
  },
  {
    id: 3, name: 'Arjun M.',   handle: 'arjunm',      avatar: 'A', color: '#f59e0b',
    title: 'Backend Engineer',     location: 'Hyderabad, IN',  exp: '4 years',
    trustScore: 91, githubScore: 89, repos: 62, deployments: 14, certifications: 4,
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'], open: false,
  },
  {
    id: 4, name: 'Sneha R.',   handle: 'snehadev',    avatar: 'S', color: '#ec4899',
    title: 'ML Engineer',          location: 'Chennai, IN',    exp: '2 years',
    trustScore: 74, githubScore: 71, repos: 24, deployments: 3, certifications: 5,
    skills: ['Python', 'TensorFlow', 'scikit-learn', 'FastAPI'], open: true,
  },
  {
    id: 5, name: 'Rohan K.',   handle: 'rohanK',      avatar: 'R', color: '#06b6d4',
    title: 'DevOps Engineer',      location: 'Pune, IN',       exp: '3 years',
    trustScore: 83, githubScore: 86, repos: 38, deployments: 21, certifications: 7,
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'], open: true,
  },
]

const SKILL_FILTERS = ['All', 'Python', 'React', 'AWS', 'Docker', 'Java', 'TypeScript']

export default function RecruiterView() {
  const [query, setQuery]       = useState('')
  const [skillFilter, setSkill] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = CANDIDATES.filter((c) => {
    const matchQ = !query || c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
      c.title.toLowerCase().includes(query.toLowerCase())
    const matchS = skillFilter === 'All' || c.skills.some((s) => s.includes(skillFilter))
    return matchQ && matchS
  })

  const sel = selected ? CANDIDATES.find((c) => c.id === selected) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-emerald-400" size={22} /> Recruiter Dashboard
          </h1>
          <p className="text-sm text-dark-300 mt-1">Search, filter, and compare verified developer candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-400">{CANDIDATES.length} verified candidates</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" placeholder="Search by name, skill, or role..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SKILL_FILTERS.map((f) => (
            <button key={f} onClick={() => setSkill(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                skillFilter === f ? 'bg-brand-500 text-white shadow-glow-sm' : 'glass glass-hover text-dark-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Candidate list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(selected === c.id ? null : c.id)}
              className={`glass-card gradient-border cursor-pointer transition-all duration-200 ${
                selected === c.id ? 'border-brand-500/40 bg-brand-500/5' : 'glass-hover'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
                  style={{ background: c.color + '25', color: c.color }}>{c.avatar}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{c.name}</p>
                    <span className="text-xs font-mono" style={{ color: c.color }}>@{c.handle}</span>
                    {c.open && <span className="badge-verified text-[10px]">Open to Work</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-dark-400 flex items-center gap-1"><Briefcase size={10} />{c.title}</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1"><MapPin size={10} />{c.location}</span>
                    <span className="text-xs text-dark-400">{c.exp} exp</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {c.skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-dark-300">{s}</span>
                    ))}
                    {c.skills.length > 3 && <span className="text-[10px] text-dark-400">+{c.skills.length - 3}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-2xl font-black" style={{ color: c.color }}>{c.trustScore}</p>
                  <p className="text-[10px] text-dark-400">trust score</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-[10px] text-dark-400 flex items-center gap-0.5"><Github size={9} />{c.repos}</span>
                    <span className="text-[10px] text-dark-400 flex items-center gap-0.5"><Rocket size={9} />{c.deployments}</span>
                    <span className="text-[10px] text-dark-400 flex items-center gap-0.5"><Award size={9} />{c.certifications}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="glass-card text-center py-12 text-dark-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p>No candidates match your search</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {sel ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card gradient-border sticky top-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-3"
                  style={{ background: sel.color + '25', color: sel.color }}>{sel.avatar}</div>
                <h3 className="font-bold text-white">{sel.name}</h3>
                <p className="text-xs font-mono mt-0.5" style={{ color: sel.color }}>@{sel.handle}</p>
                <p className="text-xs text-dark-400 mt-0.5">{sel.title} · {sel.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Trust Score', value: sel.trustScore, icon: Star },
                  { label: 'GitHub',      value: sel.githubScore, icon: Github },
                  { label: 'Repos',       value: sel.repos,      icon: Github },
                  { label: 'Certs',       value: sel.certifications, icon: Award },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="glass rounded-xl p-2.5 text-center">
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="text-[10px] text-dark-400">{label}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-dark-300 mb-2">All Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {sel.skills.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">{s}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  <Eye size={14} /> View Full Profile
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                  <Download size={14} /> Download Report
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card gradient-border text-center py-12 text-dark-400">
              <Eye size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a candidate to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
