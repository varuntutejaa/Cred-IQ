import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, CheckCircle, XCircle, AlertTriangle, RefreshCw, Plus, ExternalLink, Clock, Shield, Wifi, Zap } from 'lucide-react'

const MOCK_DEPLOYMENTS = [
  { id: 1, name: 'Portfolio Website',    url: 'varun.dev',                    platform: 'Vercel',  status: 'online', https: true,  responseMs: 142, uptime: 99.8, health: 98 },
  { id: 2, name: 'Expense Tracker App', url: 'expense-tracker.vercel.app',   platform: 'Vercel',  status: 'online', https: true,  responseMs: 210, uptime: 99.2, health: 94 },
  { id: 3, name: 'AI Resume Builder',   url: 'ai-resume.netlify.app',         platform: 'Netlify', status: 'online', https: true,  responseMs: 384, uptime: 98.7, health: 87 },
  { id: 4, name: 'Flask API Backend',   url: 'flask-api.render.com',          platform: 'Render',  status: 'slow',   https: true,  responseMs: 1840,uptime: 96.1, health: 61 },
  { id: 5, name: 'DSA Practice App',   url: 'dsa-app.github.io',             platform: 'GH Pages',status: 'online', https: true,  responseMs: 95,  uptime: 100,  health: 100 },
  { id: 6, name: 'ML Demo Project',     url: 'ml-demo.railway.app',           platform: 'Railway', status: 'offline',https: false, responseMs: null,uptime: 72.4, health: 18 },
]

const PLATFORM_COLOR = {
  'Vercel':   'bg-white/10 text-white',
  'Netlify':  'bg-teal-500/15 text-teal-300',
  'Render':   'bg-purple-500/15 text-purple-300',
  'Railway':  'bg-blue-500/15 text-blue-300',
  'GH Pages': 'bg-dark-600 text-dark-300',
}

const STATUS_CFG = {
  online:  { label: 'Online',  color: 'text-emerald-400', dot: 'bg-emerald-400', badge: 'badge-verified' },
  slow:    { label: 'Slow',    color: 'text-yellow-400',  dot: 'bg-yellow-400',  badge: 'badge-warning'  },
  offline: { label: 'Offline', color: 'text-red-400',     dot: 'bg-red-400',     badge: 'badge-danger'   },
}

export default function DeploymentChecker() {
  const [deployments, setDeployments] = useState(MOCK_DEPLOYMENTS)
  const [checking, setChecking] = useState(null)

  const recheck = async (id) => {
    setChecking(id)
    await new Promise((r) => setTimeout(r, 1500))
    setChecking(null)
  }

  const healthy  = deployments.filter((d) => d.status === 'online').length
  const avgScore = Math.round(deployments.reduce((a, b) => a + b.health, 0) / deployments.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="text-purple-400" size={22} /> Deployment Checker
          </h1>
          <p className="text-sm text-dark-300 mt-1">Verify all your deployments are live, secure, and responsive</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Deployment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Deployments', value: deployments.length, icon: Rocket,       color: 'text-brand-400',   bg: 'bg-brand-500/10 border-brand-500/20'   },
          { label: 'Online Now',        value: healthy,            icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'},
          { label: 'Avg Health Score',  value: `${avgScore}%`,    icon: Shield,       color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'      },
          { label: 'HTTPS Secured',     value: `${deployments.filter((d) => d.https).length}/${deployments.length}`, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-card gradient-border border ${bg}`}>
            <Icon size={18} className={`${color} mb-2`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-dark-300 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Deployment cards */}
      <div className="space-y-3">
        {deployments.map((d, i) => {
          const scfg = STATUS_CFG[d.status]
          const isChecking = checking === d.id
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card gradient-border"
            >
              <div className="flex items-center gap-4">
                {/* Status dot */}
                <div className="relative shrink-0">
                  <div className={`w-3 h-3 rounded-full ${scfg.dot}`} />
                  {d.status === 'online' && <div className={`absolute inset-0 rounded-full ${scfg.dot} animate-ping opacity-40`} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{d.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLOR[d.platform]}`}>{d.platform}</span>
                    {d.https && <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><Shield size={9} /> HTTPS</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <a href={`https://${d.url}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-mono transition-colors"
                    >
                      {d.url} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {/* Metrics */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-white flex items-center gap-1">
                      <Wifi size={12} className="text-dark-400" />
                      {d.responseMs ? `${d.responseMs}ms` : '—'}
                    </p>
                    <p className="text-[10px] text-dark-400">response</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white flex items-center gap-1">
                      <Clock size={12} className="text-dark-400" />
                      {d.uptime}%
                    </p>
                    <p className="text-[10px] text-dark-400">uptime</p>
                  </div>
                </div>

                {/* Health score */}
                <div className="text-center shrink-0">
                  <div className="relative w-12 h-12">
                    <svg width="48" height="48" className="rotate-[-90deg]">
                      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <motion.circle
                        cx="24" cy="24" r="18" fill="none"
                        stroke={d.health >= 80 ? '#10b981' : d.health >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 18}
                        initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - d.health / 100) }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{d.health}</span>
                  </div>
                </div>

                {/* Status badge + recheck */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={scfg.badge}>{scfg.label}</span>
                  <button onClick={() => recheck(d.id)} disabled={isChecking}
                    className="flex items-center gap-1 text-[11px] text-dark-400 hover:text-brand-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={isChecking ? 'animate-spin' : ''} />
                    {isChecking ? 'Checking...' : 'Recheck'}
                  </button>
                </div>
              </div>

              {/* Health bar */}
              <div className="mt-3 h-1 bg-dark-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${d.health}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                  className={`h-full rounded-full ${d.health >= 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : d.health >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
