import { motion } from 'framer-motion'
import { Search, FileCheck, BarChart2, Download, ArrowRight, CheckCircle } from 'lucide-react'
import TechLogo from '../shared/TechLogo'

const STEPS = [
  { n: '01', icon: Search,    color: 'purple', title: 'Search Candidates',     desc: 'Find developers by skills, technologies, GitHub username, trust score, or experience level.'       },
  { n: '02', icon: FileCheck, color: 'brand',  title: 'One-Click Verification', desc: 'Enter any GitHub username and generate a full verification report in under 10 seconds.'          },
  { n: '03', icon: BarChart2, color: 'green',  title: 'Compare & Rank',        desc: 'Side-by-side portfolio comparison. Rank candidates by trust score, builder confidence, and skills.' },
  { n: '04', icon: Download,  color: 'cyan',   title: 'Download & Decide',     desc: 'Export verified PDF reports. Shortlist candidates. Make data-backed hiring decisions.'             },
]

const C = {
  purple: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
  brand:  'from-brand-500/20 to-transparent border-brand-500/30 text-brand-400',
  green:  'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
  cyan:   'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
}

const MOCK_CARD = {
  name: 'Varun T.', handle: 'varun-dev', trust: 87, builder: 94,
  skills: ['Python', 'React', 'Flask', 'MongoDB', 'TypeScript', 'Docker'],
  verified: ['Deployments: 9', 'Certs: 6', '847 commits'],
}

export default function RecruiterFlow() {
  return (
    <section id="recruiter-flow" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy + steps */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/30 text-xs font-semibold text-purple-300 mb-4">
                For Recruiters
              </div>
              <h2 className="section-title mb-4">
                Hire with{' '}
                <span className="gradient-text">proof,</span>{' '}
                not promises.
              </h2>
              <p className="text-dark-300 leading-relaxed mb-8">
                Stop spending hours manually reviewing GitHub profiles. CredIQ gives you instant, machine-verified candidate intelligence — so every hire is backed by evidence.
              </p>
            </motion.div>

            <div className="space-y-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const c = C[s.color].split(' ')
                return (
                  <motion.div key={s.n} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 ${c[0]} ${c[1]} ${c[2]}`}>
                      <Icon size={18} className={c[3]} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-0.5">{s.title}</h4>
                      <p className="text-sm text-dark-300 leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <a href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl px-6 py-3 text-sm shadow-glow transition-all">
                Start as Recruiter <ArrowRight size={14} />
              </a>
            </motion.div>
          </div>

          {/* Right: Candidate card mock */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Quick verify panel */}
            <div className="glass-card gradient-border">
              <p className="text-xs font-semibold text-dark-300 mb-3 uppercase tracking-wider">One-Click Verification</p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                  <Search size={14} className="text-dark-400" />
                  <span className="text-sm text-dark-300 font-mono">varun-dev</span>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-500 rounded-xl px-4 text-sm font-semibold text-white">
                  <CheckCircle size={13} /> Verified
                </div>
              </div>
              {/* Candidate card */}
              <div className="glass rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center font-black text-sm">V</div>
                    <div>
                      <p className="font-semibold text-white text-sm">{MOCK_CARD.name}</p>
                      <p className="text-xs text-brand-400 font-mono">@{MOCK_CARD.handle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-brand-400">{MOCK_CARD.trust}</p>
                    <p className="text-[10px] text-dark-400">Trust Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-emerald-500/8 rounded-lg p-2 border border-emerald-500/12 text-center">
                    <p className="text-lg font-black text-emerald-400">{MOCK_CARD.builder}%</p>
                    <p className="text-[10px] text-dark-400">Builder Score</p>
                  </div>
                  <div className="space-y-1">
                    {MOCK_CARD.verified.map((v) => (
                      <div key={v} className="flex items-center gap-1.5 text-[10px] text-dark-300">
                        <CheckCircle size={9} className="text-emerald-400" />{v}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_CARD.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      <TechLogo name={s} size={11} />{s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Avg Time to Verify', value: '< 10s', color: 'text-brand-400' },
                { label: 'Fake Repo Detection', value: '99%',  color: 'text-emerald-400' },
                { label: 'Recruiter Accuracy',  value: '94%',  color: 'text-purple-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card gradient-border text-center p-4">
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-dark-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
