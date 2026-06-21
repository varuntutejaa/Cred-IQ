import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LayoutDashboard, FileText, Award,
  AlertOctagon, Rocket, Network, Link2, Users, Clock,
  Brain, LogOut, ChevronLeft, ChevronRight,
  Zap, Trophy, Code2, Star, ExternalLink
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
    label: 'Intelligence',
    items: [
      { to: '/dashboard/resume',       icon: FileText,     label: 'Resume Verifier'  },
      { to: '/dashboard/certificates', icon: Award,        label: 'Certificates'     },
      { to: '/dashboard/skills',       icon: Network,      label: 'Skill Map'        },
      { to: '/dashboard/insights',     icon: Brain,        label: 'AI Insights'      },
    ],
  },
  {
    label: 'Projects',
    items: [
      { to: '/dashboard/projects',    icon: AlertOctagon, label: 'Project Scanner' },
      { to: '/dashboard/deployments', icon: Rocket,       label: 'Deployments'     },
      { to: '/dashboard/proof-chain', icon: Link2,        label: 'Proof Chain'     },
      { to: '/dashboard/team',        icon: Users,        label: 'Team Analyzer'   },
    ],
  },
  {
    label: 'Journey',
    items: [
      { to: '/dashboard/timeline',     icon: Clock,   label: 'Dev Timeline'  },
      { to: '/dashboard/achievements', icon: Trophy,  label: 'Achievements'  },
      { to: '/dashboard/milestones',   icon: Star,    label: 'Milestones'    },
      { to: '/dashboard/builder',      icon: Zap,     label: 'Builder Score' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/dashboard/complexity', icon: Code2, label: 'Code Complexity' },
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
        `relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-brand-500/12 text-brand-300'
            : 'text-dark-400 hover:text-dark-100 hover:bg-white/[0.04]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* active left bar */}
          {isActive && (
            <motion.div layoutId="nav-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-400"
            />
          )}

          <Icon size={15} className={`shrink-0 transition-colors ${
            isActive ? 'text-brand-400' : 'text-dark-500 group-hover:text-dark-300'
          }`} />

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.12 }}
                className="whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-dark-800 border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity duration-100">
              {item.label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-dark-800" />
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

  const initials = (user?.name || 'D').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 56 : 216 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
        style={{ background: 'rgba(2,6,23,0.97)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm shrink-0">
            <Shield size={13} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.12 }}
                className="ml-2.5 text-[15px] font-bold whitespace-nowrap tracking-tight"
              >
                Cred<span className="gradient-text">IQ</span>
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/[0.05] text-dark-500 hover:text-dark-200 transition-all shrink-0"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'pt-3' : ''}>
              {group.label && !collapsed && (
                <p className="px-2.5 pb-1 text-[9px] font-bold text-dark-600 uppercase tracking-[0.12em]">
                  {group.label}
                </p>
              )}
              {group.label && collapsed && gi > 0 && (
                <div className="mx-3 mb-2 h-px bg-white/[0.04]" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="px-2 pb-2 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* profile button */}
          <button onClick={() => setDrawer(true)}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-all group mb-1 ${collapsed ? 'justify-center' : ''}`}
          >
            {/* avatar: prefer GitHub avatar */}
            {user?.avatar
              ? <img src={user.avatar} alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
              : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                  {initials}
                </div>
            }
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-semibold text-dark-100 truncate leading-tight">{user?.name || 'Developer'}</p>
                  <p className="text-[10px] text-dark-500 truncate leading-tight mt-0.5">
                    {user?.github_username ? `@${user.github_username}` : user?.email || ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && user?.github_username && (
              <ExternalLink size={10} className="text-dark-600 group-hover:text-dark-400 shrink-0 transition-colors" />
            )}
          </button>

          {/* trust score chip */}
          {!collapsed && user?.trust_score != null && (
            <div className="mx-1 mb-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-brand-500/[0.08] border border-brand-500/[0.15]">
              <span className="text-[10px] text-dark-400">Trust Score</span>
              <span className="text-[11px] font-bold text-brand-400">{user.trust_score}/100</span>
            </div>
          )}

          {/* logout */}
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={13} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[11px] font-medium"
                >
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
