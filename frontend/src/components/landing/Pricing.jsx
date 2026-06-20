import { motion } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-yellow-500/30 text-xs font-semibold text-yellow-300 mb-6">
            <Clock size={12} /> Coming Soon
          </div>
          <h2 className="section-title">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            We're currently free during our beta. Paid plans launching soon with premium features for recruiters and enterprises.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 glass-card gradient-border max-w-md mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles size={24} className="text-brand-400" />
              <h3 className="text-2xl font-bold">Beta Access</h3>
            </div>
            <p className="text-5xl font-black gradient-text mb-2">Free</p>
            <p className="text-dark-300 text-sm mb-6">Full access during our beta period</p>
            <ul className="text-left space-y-2 mb-6">
              {[
                'Resume Verification',
                'GitHub Analysis',
                'Fake Project Detection',
                'Certification Verification',
                'AI Career Insights',
                'Portfolio Battle Mode',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-dark-200">
                  <span className="text-accent-green">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="btn-primary w-full">
              Join Beta — It's Free
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
