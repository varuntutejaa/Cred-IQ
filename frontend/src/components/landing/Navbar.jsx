import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, Zap, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ProfileDrawer from '../shared/ProfileDrawer'

const NAV_LINKS = [
  { label: 'Features',        href: '#features'    },
  { label: 'How It Works',    href: '#how-it-works' },
  { label: 'For Developers',  href: '#developer-flow' },
  { label: 'For Recruiters',  href: '#recruiter-flow' },
  { label: 'About',           href: '#about'        },
  { label: 'Contact',         href: '#contact'      },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [drawerOpen, setDrawer]   = useState(false)
  const { user }                  = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    setMenuOpen(false)
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-dark-900/90 backdrop-blur-xl border-b border-white/5 shadow-card' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                  <Shield size={16} className="text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse-slow" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Cred<span className="gradient-text">IQ</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.href)}
                  className="px-3.5 py-2 text-sm text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 font-medium whitespace-nowrap"
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Right: CTA or avatar */}
            <div className="flex items-center gap-3">
              {user ? (
                /* Logged-in avatar */
                <button
                  onClick={() => setDrawer(true)}
                  className="flex items-center gap-2 glass glass-hover border border-white/10 rounded-xl px-3 py-1.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-xs font-black">
                    {user.name?.[0] || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-white max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={12} className="text-dark-400 hidden md:block" />
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/login" className="text-sm text-dark-300 hover:text-white font-medium transition-colors">
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/register" className="flex items-center gap-2 btn-primary text-sm">
                      <Zap size={14} /> Get Started
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 rounded-lg glass glass-hover"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-dark-900/95 backdrop-blur-xl border-b border-white/5"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => scrollTo(l.href)}
                    className="w-full text-left px-4 py-3 text-sm text-dark-300 hover:text-white rounded-xl hover:bg-white/5 transition-all font-medium"
                  >
                    {l.label}
                  </button>
                ))}
                {!user && (
                  <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                    <Link to="/login" className="w-full text-center py-3 text-sm font-medium text-dark-300">Sign In</Link>
                    <Link to="/register" className="btn-primary text-sm text-center">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawer(false)} />
    </>
  )
}
