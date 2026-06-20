import { motion } from 'framer-motion'
import { Shield, Target, Lightbulb } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-xs font-semibold text-brand-300 mb-6">
              Our Mission
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              The hiring world is{' '}
              <span className="text-accent-red">broken</span>.{' '}
              <span className="gradient-text">We're fixing it.</span>
            </h2>
            <p className="text-dark-300 leading-relaxed mb-4">
              Resumes are dead. Anyone can claim "5 years of Python" or "AWS Expert" — and most
              hiring managers have no way to verify it until it's too late.
            </p>
            <p className="text-dark-300 leading-relaxed mb-4">
              CredIQ was born from the frustration of skilled developers being overlooked while
              resume-inflaters sail through. We built the infrastructure to make proof the new
              standard in technical hiring.
            </p>
            <p className="text-dark-300 leading-relaxed">
              Every feature we build asks one question: <span className="text-white font-semibold">
              "Can we prove this is true?"</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                icon: Shield,
                color: 'brand',
                title: 'Trust is the Product',
                desc: 'We don\'t just display data — we verify it. Every badge earned on CredIQ represents audited, machine-checked evidence.',
              },
              {
                icon: Target,
                color: 'green',
                title: 'For Developers First',
                desc: 'Built by devs who got overlooked despite strong skills. CredIQ levels the playing field for those who build, not just those who claim.',
              },
              {
                icon: Lightbulb,
                color: 'yellow',
                title: 'Continuous Innovation',
                desc: 'Fake project detection, AI insights, portfolio battles — we\'re constantly raising the bar on what developer verification looks like.',
              },
            ].map((v, i) => {
              const Icon = v.icon
              const colors = {
                brand: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
                green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
              }[v.color]
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card glass-hover flex gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{v.title}</h4>
                    <p className="text-sm text-dark-300">{v.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
