import { motion } from 'framer-motion'
import { GitBranch, Cpu, Shield, Share2, ArrowRight } from 'lucide-react'
import TechLogo from '../shared/TechLogo'

const STEPS = [
  { n: '01', icon: GitBranch, color: 'brand',  title: 'Connect GitHub',    desc: 'OAuth sign-in auto-imports all repositories, contributions, PRs, and commit history in seconds.'  },
  { n: '02', icon: Cpu,       color: 'purple', title: 'Auto-Analysis',     desc: 'Our engines verify every skill claim, scan for fake projects, check deployments, and validate certificates.' },
  { n: '03', icon: Shield,    color: 'green',  title: 'Trust Score Generated', desc: 'Receive your CredIQ Trust Score and Builder Confidence Score with a full breakdown of evidence.'  },
  { n: '04', icon: Share2,    color: 'cyan',   title: 'Share Your Proof',  desc: 'Share a public verified profile or download a recruiter-ready PDF verification report.'            },
]

const TECH_ORBIT = ['Python', 'React', 'TypeScript', 'Docker', 'MongoDB', 'AWS', 'Node.js', 'Kubernetes']

const C = {
  brand:  'from-brand-500/20 to-transparent border-brand-500/30 text-brand-400',
  purple: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
  green:  'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
  cyan:   'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
}

export default function DeveloperFlow() {
  return (
    <section id="developer-flow" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/4 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-xs font-semibold text-brand-300 mb-4">
            For Developers
          </div>
          <h2 className="section-title">
            Your verified identity,{' '}
            <span className="gradient-text">automatically</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            Connect GitHub once. CredIQ does the rest — verifying skills, validating projects, and building your trusted developer identity.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Connector */}
          <div className="hidden lg:block absolute top-[68px] left-[calc(12.5%+32px)] right-[calc(12.5%+32px)] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

          {STEPS.map((s, i) => {
            const Icon = s.icon
            const c = C[s.color].split(' ')
            return (
              <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br border flex items-center justify-center mb-5 shadow-card ${c[0]} ${c[1]} ${c[2]}`}>
                  <Icon size={24} className={c[3]} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-dark-300">{s.n}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed">{s.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Tech orbit strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
          className="mt-12 overflow-hidden"
        >
          <p className="text-center text-xs text-dark-500 font-medium uppercase tracking-widest mb-4">Verified across every stack</p>
          <div className="relative flex overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="flex gap-3 shrink-0"
            >
              {[...TECH_ORBIT, ...TECH_ORBIT].map((tech, i) => (
                <div key={i} className="flex items-center gap-2 glass border border-white/8 rounded-xl px-4 py-2.5 shrink-0 hover:border-white/15 transition-all">
                  <TechLogo name={tech} size={20} />
                  <span className="text-xs font-medium text-dark-300 whitespace-nowrap">{tech}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* CTA strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <a href="/register" className="inline-flex items-center gap-2 btn-primary text-sm">
            Start as Developer <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
