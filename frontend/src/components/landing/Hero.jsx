import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, AlertTriangle, Star, GitCommit, Code2, Zap, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import TechLogo from '../shared/TechLogo'

const GRID = Array.from({ length: 52 * 7 }, () => {
  const v = Math.random()
  if (v < 0.4) return 0; if (v < 0.6) return 1; if (v < 0.75) return 2; if (v < 0.9) return 3; return 4
})
const INTENSITY = ['bg-dark-700','bg-brand-900/60','bg-brand-700/70','bg-brand-500/80','bg-brand-400']

const FLOAT_CARDS = [
  {
    id: 1, pos: 'top-10 -left-4 md:-left-14', delay: 0,
    content: (
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center">
          <TechLogo name="Python" size={20} />
        </div>
        <div><p className="text-xs font-semibold text-white">Python · 12 repos</p><p className="text-[10px] text-dark-300">Skill verified ✓</p></div>
        <span className="ml-1 text-emerald-400 text-xs font-bold">96%</span>
      </div>
    ),
  },
  {
    id: 2, pos: 'top-1/2 -right-4 md:-right-16', delay: 1.2,
    content: (
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <TechLogo name="AWS" size={20} />
        </div>
        <div><p className="text-xs font-semibold text-white">AWS · 0 repos</p><p className="text-[10px] text-dark-300">Unverified claim ⚠</p></div>
        <AlertTriangle size={12} className="text-yellow-400 shrink-0" />
      </div>
    ),
  },
  {
    id: 3, pos: '-bottom-4 left-8 md:left-4', delay: 2.2,
    content: (
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
          <TechLogo name="React" size={20} />
        </div>
        <div><p className="text-xs font-semibold text-white">React · 7 repos</p><p className="text-[10px] text-dark-300">Skill verified ✓</p></div>
        <span className="ml-1 text-brand-400 text-xs font-bold">89%</span>
      </div>
    ),
  },
]

export default function Hero() {
  const { demoLogin, demoRecruiterLogin } = useAuth()
  const navigate = useNavigate()

  const handleDevDemo = () => { demoLogin(); toast.success('Welcome to the demo!'); navigate('/dashboard') }
  const handleRecDemo = () => { demoRecruiterLogin(); toast.success('Recruiter demo loaded!'); navigate('/recruiter') }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-500/5 to-transparent rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-xs font-semibold text-brand-300 mb-6"
            >
              <Zap size={12} className="text-brand-400" />
              Developer Verification + Recruiter Intelligence
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
            >
              Stop Trusting{' '}
              <span className="gradient-text">Resumes.</span>
              <span className="block mt-1">Start Verifying</span>
              <span className="block gradient-text">Builders.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-dark-300 leading-relaxed mb-8 max-w-xl"
            >
              CredIQ validates repositories, projects, certifications, deployments, and technical skills to reveal{' '}
              <span className="text-white font-semibold">who can actually build</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-6"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/register"
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold rounded-xl px-6 py-3.5 text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button onClick={handleDevDemo}
                  className="flex items-center gap-2 btn-secondary px-6 py-3.5 text-sm"
                >
                  <Code2 size={15} /> Verify GitHub Profile
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button onClick={handleRecDemo}
                  className="flex items-center gap-2 glass glass-hover border border-purple-500/30 text-purple-300 rounded-xl px-6 py-3.5 text-sm font-semibold"
                >
                  <Search size={15} /> Recruiter Demo
                </button>
              </motion.div>
            </motion.div>

          </div>

          {/* Right: dashboard preview */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative glass-card gradient-border overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="ml-3 h-5 flex-1 bg-white/5 rounded-md flex items-center px-3">
                  <span className="text-xs text-dark-400 font-mono">crediq.dev/dashboard</span>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Trust Score',    value: 87, color: 'text-brand-400',   bg: 'bg-brand-500/10'   },
                  { label: 'Builder Score',  value: 94, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Verified Skills',value: 14, color: 'text-cyan-400',    bg: 'bg-cyan-500/10'    },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-white/5`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-dark-300 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contribution grid */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-dark-300 flex items-center gap-1.5"><GitCommit size={12} /> Contribution Activity</p>
                  <p className="text-xs text-dark-400">Last 12 months</p>
                </div>
                <div className="grid grid-cols-[repeat(52,_1fr)] gap-[2px] overflow-hidden">
                  {GRID.map((v, i) => <div key={i} className={`aspect-square rounded-[2px] ${INTENSITY[v]}`} />)}
                </div>
              </div>

              {/* Skill bars */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-dark-300 flex items-center gap-1.5 mb-3"><Code2 size={12} /> Skill Verification</p>
                {[
                  { skill: 'Python',     status: 'verified', score: 96 },
                  { skill: 'React',      status: 'verified', score: 89 },
                  { skill: 'TypeScript', status: 'verified', score: 82 },
                  { skill: 'AWS',        status: 'warning',  score: 34 },
                  { skill: 'Docker',     status: 'verified', score: 71 },
                ].map((s) => (
                  <div key={s.skill} className="flex items-center gap-2">
                    <TechLogo name={s.skill} size={16} />
                    <span className="text-xs font-medium text-dark-200 w-20 shrink-0">{s.skill}</span>
                    <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 1, delay: 0.8 + s.score * 0.003 }}
                        className={`h-full rounded-full ${s.status === 'verified' ? 'bg-gradient-to-r from-brand-500 to-emerald-500' : 'bg-yellow-500'}`}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {s.status === 'verified'
                        ? <CheckCircle size={10} className="text-emerald-400" />
                        : <AlertTriangle size={10} className="text-yellow-400" />}
                      <span className={`text-xs font-semibold ${s.status === 'verified' ? 'text-emerald-400' : 'text-yellow-400'}`}>{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating cards */}
            {FLOAT_CARDS.map((card) => (
              <motion.div key={card.id} className={`absolute glass gradient-border rounded-xl shadow-card hidden md:block ${card.pos}`}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: card.delay, ease: 'easeInOut' }}
              >
                {card.content}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
