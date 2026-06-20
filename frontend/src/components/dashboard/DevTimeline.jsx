import { motion } from 'framer-motion'
import { Clock, Github, Code2, Award, Rocket, Star, Trophy, Zap } from 'lucide-react'

const TIMELINE = [
  {
    date: 'Aug 2021',
    icon: Github,
    color: 'brand',
    title: 'Started Coding',
    desc: 'Created first GitHub account. First commit: "Hello World in Python".',
    tags: ['Python', 'GitHub'],
    milestone: true,
  },
  {
    date: 'Jan 2022',
    icon: Code2,
    color: 'cyan',
    title: 'First Real Project',
    desc: 'Built a command-line Expense Tracker in Python. 47 commits over 3 weeks.',
    tags: ['Python', 'CLI', 'File I/O'],
  },
  {
    date: 'May 2022',
    icon: Star,
    color: 'yellow',
    title: 'First GitHub Star',
    desc: 'DSA Solutions repository hit 50+ stars. Community recognition for clean code.',
    tags: ['DSA', 'Open Source'],
  },
  {
    date: 'Aug 2022',
    icon: Code2,
    color: 'green',
    title: 'Went Full Stack',
    desc: 'Added React and Flask to the skill set. Built first REST API with MongoDB.',
    tags: ['React', 'Flask', 'MongoDB', 'REST'],
    milestone: true,
  },
  {
    date: 'Nov 2022',
    icon: Rocket,
    color: 'purple',
    title: 'First Deployment',
    desc: 'Deployed portfolio website to Vercel. First time real users could visit a project.',
    tags: ['Vercel', 'React', 'CSS'],
  },
  {
    date: 'Feb 2023',
    icon: Trophy,
    color: 'yellow',
    title: 'Hackathon Winner',
    desc: 'Won 1st place at college hackathon with AI Resume Builder. 243 commits in 36 hours.',
    tags: ['Hackathon', 'AI', 'TypeScript'],
    milestone: true,
  },
  {
    date: 'Jul 2023',
    icon: Award,
    color: 'brand',
    title: 'Certification — Meta Frontend',
    desc: 'Completed Meta Frontend Developer Professional Certificate on Coursera.',
    tags: ['Certificate', 'React', 'Meta'],
  },
  {
    date: 'Oct 2023',
    icon: Award,
    color: 'yellow',
    title: 'AWS Certification',
    desc: 'Passed AWS Solutions Architect Associate exam. 98/100 trust score.',
    tags: ['AWS', 'Cloud', 'Certificate'],
    milestone: true,
  },
  {
    date: 'Mar 2024',
    icon: Star,
    color: 'green',
    title: '300+ GitHub Stars',
    desc: 'Combined repositories crossed 300 stars. Top contributor in 2 open source projects.',
    tags: ['Open Source', 'Community'],
  },
  {
    date: 'Jun 2024',
    icon: Zap,
    color: 'brand',
    title: 'CredIQ Profile Created',
    desc: 'Verified developer identity established. Trust Score: 87/100. 14 skills verified.',
    tags: ['CredIQ', 'Verified'],
    milestone: true,
  },
]

const COLOR = {
  brand:  'bg-brand-500/15 border-brand-500/30 text-brand-400',
  cyan:   'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
  green:  'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  yellow: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  purple: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
}
const DOT_COLOR = {
  brand: 'bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]',
  cyan:  'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]',
  green: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  yellow:'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  purple:'bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]',
}

export default function DevTimeline() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-cyan-400" size={22} /> Developer Journey Timeline
        </h1>
        <p className="text-sm text-dark-300 mt-1">Your complete coding story — auto-generated from GitHub and certifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Years Coding',   value: '3+', color: 'text-brand-400' },
          { label: 'Total Commits',  value: '1.2K', color: 'text-emerald-400' },
          { label: 'Certifications', value: '6', color: 'text-yellow-400' },
          { label: 'Major Milestones', value: '5', color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card gradient-border text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-dark-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-white/5 to-transparent" />

        <div className="space-y-4 pl-12">
          {TIMELINE.map((ev, i) => {
            const Icon = ev.icon
            const cc = COLOR[ev.color]
            const dc = DOT_COLOR[ev.color]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="relative"
              >
                {/* Dot */}
                <div className={`absolute -left-[35px] top-4 w-3 h-3 rounded-full ${dc} ${ev.milestone ? 'scale-125' : ''}`} />

                {/* Card */}
                <div className={`glass-card glass-hover gradient-border ${ev.milestone ? 'border-l-2 ' + cc.split(' ')[2] : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cc}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{ev.title}</h3>
                        {ev.milestone && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/25 font-semibold">
                            Milestone
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark-400 mt-0.5">{ev.date}</p>
                      <p className="text-sm text-dark-300 mt-1.5 leading-relaxed">{ev.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ev.tags.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-dark-300">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
