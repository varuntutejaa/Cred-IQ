import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LayoutDashboard, FileText, GitBranch, Award,
  AlertOctagon, Rocket, Network, Link2, Users, Clock,
  Swords, Brain, LogOut, ChevronLeft, ChevronRight,
  Zap, Trophy, Code2, Star
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ProfileDrawer from '../shared/ProfileDrawer'

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Profile Intelligence',
    items: [
      { to: '/dashboard/resume',       icon: FileText,     label: 'Resume Verification' },
      { to: '/dashboard/github',       icon: GitBranch,    label: 'GitHub Analysis'     },
      { to: '/dashboard/certificates', icon: Award,        label: 'Certificates'        },
      { to: '/dashboard/skills',       icon: Network,      label: 'Skill Map'           },
      { to: '/dashboard/insights',     icon: Brain,        label: 'AI Insights'         },
    ],
  },
  {
    label: 'Projects',
    items: [
      { to: '/dashboard/projects',    icon: AlertOctagon, label: 'Project Scanner'       },
      { to: '/dashboard/deployments', icon: Rocket,       label: 'Deployments'           },
      { to: '/dashboard/proof-chain', icon: Link2,        label: 'Proof Chain'           },
      { to: '/dashboard/team',        icon: Users,        label: 'Team Analyzer'         },
    ],
  },
  {
    label: 'Career Journey',
    items: [
      { to: '/dashboard/timeline',     icon: Clock,   label: 'Dev Timeline'  },
      { to: '/dashboard/achievements', icon: Trophy,  label: 'Achievements'  },
      { to: '/dashboard/milestones',   icon: Star,    label: 'Milestones'    },
      { to: '/dashboard/builder',      icon: Zap,     label: 'Builder Score' },
    ],
  },
  {
    label: 'Comparisons',
    items: [
      { to: '/dashboard/battle',     icon: Swords, label: 'Portfolio Battle'      },
      { to: '/dashboard/complexity', icon: Code2,  label: 'Code Complexity'       },
    ],
  },
]

function NavItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
          isActive
            ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
            : 'text-dark-300 hover:text-white hover:bg-white/5 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={`shrink-0 ${isActive ? 'text-brand-400' : 'text-dark-400 group-hover:text-white'}`} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="whitespace-nowrap overflow-hidden text-ellipsis text-xs"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {isActive && <motion.div layoutId="sidebarActive" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-brand-400" />}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-dark-700 border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-card">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawer] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-dark-900/97 backdrop-blur-xl border-r border-white/5 overflow-hidden shadow-card"
      >
        {/* Logo row */}
        <div className="flex items-center h-14 px-3 border-b border-white/5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-glow-sm shrink-0">
            <Shield size={14} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="ml-2.5 text-base font-bold whitespace-nowrap"
              >
                Cred<span className="gradient-text">IQ</span>
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all shrink-0"
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'pt-2' : ''}>
              {group.label && !collapsed && (
                <p className="px-2.5 py-1 text-[10px] font-semibold text-dark-500 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              {group.label && collapsed && gi > 0 && (
                <div className="mx-2 my-1 h-px bg-white/5" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: avatar + logout */}
        <div className="px-2 pb-3 border-t border-white/5 pt-2 shrink-0 space-y-1">
          {/* Avatar row */}
          <button
            onClick={() => setDrawer(true)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-all group ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-xs font-black shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'Developer'}</p>
                  <p className="text-[10px] text-dark-400 truncate">{user?.email || 'demo@crediq.dev'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-dark-300 hover:text-red-400 hover:bg-red-500/8 transition-all group ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={15} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawer(false)} />
    </>
  )
}
