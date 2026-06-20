import { motion } from 'framer-motion'
import {
  FileText, Award, AlertOctagon, Github, Rocket, Network,
  Link2, Users, Clock, Swords, Brain, Search
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    color: 'brand',
    title: 'Resume Verification Engine',
    desc: 'Upload your resume and watch every claim get verified against real GitHub repositories, deployments, and certifications. No more hollow bullet points.',
    tags: ['PDF Parsing', 'Skill Extraction', 'Trust Score'],
  },
  {
    icon: Award,
    color: 'yellow',
    title: 'Certification Verification',
    desc: 'Validate every certificate against issuer databases. QR code scanning, URL verification, and date authentication in seconds.',
    tags: ['Issuer Lookup', 'QR Scan', 'Metadata Check'],
  },
  {
    icon: AlertOctagon,
    color: 'red',
    title: 'Fake Project Detection',
    desc: 'Our ML engine flags suspicious repos — single commits, 2-day-old projects with 15K lines, or copy-pasted codebases. The key differentiator.',
    tags: ['Commit Analysis', 'Age Detection', 'Authenticity Score'],
  },
  {
    icon: Github,
    color: 'purple',
    title: 'GitHub Intelligence Engine',
    desc: 'Deep analysis of your GitHub presence — contributions, PR history, language distribution, star count, and open-source impact.',
    tags: ['Contribution Graph', 'Language Analysis', 'Impact Score'],
  },
  {
    icon: Rocket,
    color: 'cyan',
    title: 'Deployment Verification',
    desc: 'We ping Vercel, Netlify, Render, Railway, and GitHub Pages to confirm your projects are live, HTTPS-secured, and actually running.',
    tags: ['Live Checks', 'HTTPS Validation', 'Response Time'],
  },
  {
    icon: Network,
    color: 'green',
    title: 'Skill Evidence Mapping',
    desc: 'Every claimed skill is traced back to concrete code. Python linked to 3 repos. React linked to 2 deployed apps. Visual graph included.',
    tags: ['Evidence Chain', 'Skill Graph', 'Proof Links'],
  },
  {
    icon: Link2,
    color: 'brand',
    title: 'Proof Chain Verification',
    desc: 'Complete end-to-end chain: Resume → GitHub → Deployment → Docs → Certificate → Verified. Each link in the chain is validated.',
    tags: ['End-to-End', 'Chain Audit', 'Visual Flow'],
  },
  {
    icon: Users,
    color: 'yellow',
    title: 'Team Contribution Analyzer',
    desc: "Upload any repository and instantly see who actually built what. Commit timelines, contribution percentages, and code ownership maps.",
    tags: ['Commit Attribution', 'Ownership Maps', 'Timeline'],
  },
  {
    icon: Clock,
    color: 'cyan',
    title: 'Developer Journey Timeline',
    desc: 'Your entire coding story — from first commit to latest deployment — auto-generated as a beautiful animated timeline.',
    tags: ['Auto-Generated', 'Milestones', 'Animated'],
  },
  {
    icon: Swords,
    color: 'red',
    title: 'Portfolio Battle Mode',
    desc: 'Compare two developer portfolios head-to-head. Skills, repos, contributions, certifications — who comes out on top?',
    tags: ['Side-by-Side', 'Skill Compare', 'Match Score'],
  },
  {
    icon: Brain,
    color: 'purple',
    title: 'AI Career Insights',
    desc: 'Powered by LLM analysis — get your strengths, weaknesses, skill gaps, and a personalized learning path in seconds.',
    tags: ['LLM-Powered', 'Skill Gaps', 'Learning Path'],
  },
  {
    icon: Search,
    color: 'green',
    title: 'Recruiter Dashboard',
    desc: "Search, filter, and compare verified developers. Download full verification reports. Hire with confidence — every claim is backed by proof.",
    tags: ['Search & Filter', 'Reports', 'Verified Talent'],
  },
]

const COLOR_MAP = {
  brand:  { bg: 'bg-brand-500/10',   border: 'border-brand-500/20',   icon: 'text-brand-400',   tag: 'bg-brand-500/10 text-brand-300'  },
  yellow: { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  icon: 'text-yellow-400',  tag: 'bg-yellow-500/10 text-yellow-300' },
  red:    { bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: 'text-red-400',     tag: 'bg-red-500/10 text-red-300'       },
  purple: { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: 'text-purple-400',  tag: 'bg-purple-500/10 text-purple-300' },
  cyan:   { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    icon: 'text-cyan-400',    tag: 'bg-cyan-500/10 text-cyan-300'     },
  green:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', tag: 'bg-emerald-500/10 text-emerald-300'},
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-brand-500/30 text-xs font-semibold text-brand-300 mb-4">
            12 Verification Engines
          </div>
          <h2 className="section-title">
            Everything you need to{' '}
            <span className="gradient-text">prove your worth</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            Not another portfolio builder. CredIQ is a verification powerhouse — every feature
            exists to validate truth, detect fraud, and build trust.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((f, i) => {
            const c = COLOR_MAP[f.color]
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card glass-hover gradient-border group cursor-default"
              >
                <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed mb-4">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map((t) => (
                    <span key={t} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.tag}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
