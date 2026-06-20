import { motion } from 'framer-motion'
import { Upload, Cpu, ShieldCheck, Download } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    icon: Upload,
    color: 'brand',
    title: 'Connect & Upload',
    desc: 'Link your GitHub account, upload your resume PDF, and add any certificates you want verified.',
    detail: 'OAuth GitHub integration, PDF parser, certificate upload',
  },
  {
    n: '02',
    icon: Cpu,
    color: 'purple',
    title: 'Automated Analysis',
    desc: 'Our engines cross-reference every claim — repos, commits, deployments, certificates, and skill evidence.',
    detail: 'ML-based fake detection, deployment pinger, cert verifier',
  },
  {
    n: '03',
    icon: ShieldCheck,
    color: 'green',
    title: 'Trust Score Generated',
    desc: 'Receive a comprehensive trust score with a breakdown of what\'s verified, flagged, or suspicious.',
    detail: 'Weighted scoring, per-skill breakdown, fraud flags',
  },
  {
    n: '04',
    icon: Download,
    color: 'cyan',
    title: 'Share Your Proof',
    desc: 'Share your CredIQ profile link with recruiters or download a verified PDF report.',
    detail: 'Public profile, PDF export, recruiter dashboard access',
  },
]

const COLOR = {
  brand:  'from-brand-500/20 to-brand-600/5 border-brand-500/30 text-brand-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  green:  'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
  cyan:   'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-xs font-semibold text-brand-300 mb-4">
            Simple 4-Step Process
          </div>
          <h2 className="section-title">
            How <span className="gradient-text">CredIQ</span> works
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            From upload to verified identity in under 2 minutes. No manual reviews. No waiting.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[88px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const colors = COLOR[s.color].split(' ')
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon circle */}
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br border ${colors[0]} ${colors[1]} ${colors[2]} flex items-center justify-center mb-6 shadow-card`}>
                    <Icon size={28} className={colors[3]} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-dark-300">{s.n}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-dark-300 leading-relaxed mb-3">{s.desc}</p>
                  <p className="text-[11px] text-dark-400 font-mono">{s.detail}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Trust chain demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 glass-card gradient-border max-w-3xl mx-auto"
        >
          <p className="text-sm font-semibold text-dark-300 mb-4 text-center">Live Proof Chain Example</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Resume Claim',    status: 'done'   },
              { label: '→', status: 'arrow' },
              { label: 'GitHub Repo',     status: 'done'   },
              { label: '→', status: 'arrow' },
              { label: 'Deployment',      status: 'done'   },
              { label: '→', status: 'arrow' },
              { label: 'Documentation',   status: 'warn'   },
              { label: '→', status: 'arrow' },
              { label: 'Certificate',     status: 'done'   },
              { label: '→', status: 'arrow' },
              { label: '✓ Verified',      status: 'verify' },
            ].map((c, i) => (
              c.status === 'arrow'
                ? <span key={i} className="text-dark-500 font-bold">{c.label}</span>
                : <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      c.status === 'done'   ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' :
                      c.status === 'warn'   ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25'  :
                      'bg-brand-500/15 text-brand-300 border border-brand-500/25 shadow-glow-sm'
                    }`}
                  >
                    {c.label}
                  </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
