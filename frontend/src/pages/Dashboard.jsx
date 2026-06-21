import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, ArrowRight, X, Loader2 } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHome from '../components/dashboard/DashboardHome'
import ResumeVerifier from '../components/dashboard/ResumeVerifier'
import CertificateVerifier from '../components/dashboard/CertificateVerifier'
import ProjectScanner from '../components/dashboard/ProjectScanner'
import DeploymentChecker from '../components/dashboard/DeploymentChecker'
import SkillMap from '../components/dashboard/SkillMap'
import ProofChain from '../components/dashboard/ProofChain'
import TeamAnalyzer from '../components/dashboard/TeamAnalyzer'
import DevTimeline from '../components/dashboard/DevTimeline'
import AIInsights from '../components/dashboard/AIInsights'
import BuilderConfidence from '../components/dashboard/BuilderConfidence'
import Achievements from '../components/dashboard/Achievements'
import Milestones from '../components/dashboard/Milestones'
import CodeComplexity from '../components/dashboard/CodeComplexity'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

function GitHubPromptModal({ onClose }) {
  const { user, updateUser } = useAuth()
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const username = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '').replace('@', '')
    if (!username) { toast.error('Enter a GitHub username'); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/demo', {
        github_username: username,
        role: user?.role || 'developer',
      })
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      updateUser(data.user)
      localStorage.setItem('ciq_demo_user',  JSON.stringify(data.user))
      localStorage.setItem('ciq_demo_token', data.token)
      toast.success('GitHub profile connected!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'GitHub user not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative glass-card gradient-border w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all">
          <X size={14} />
        </button>

        <div className="mb-5">
          <div className="w-10 h-10 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center mb-3">
            <Github size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Connect your GitHub</h2>
          <p className="text-sm text-dark-400 mt-1">
            Enter your GitHub username to load your real repos, trust score, and activity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm font-mono">@</span>
            <input type="text" placeholder="your-github-username"
              value={input} onChange={(e) => setInput(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <button type="submit" disabled={loading || !input.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <Loader2 size={15} className="animate-spin" />
              : <><span>Load My Profile</span><ArrowRight size={15} /></>
            }
          </button>
        </form>

        <button onClick={onClose} className="w-full mt-3 text-xs text-dark-500 hover:text-dark-300 transition-colors py-1.5">
          Skip for now
        </button>
      </motion.div>
    </div>
  )
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [collapsed,   setCollapsed]   = useState(false)

  // Only show prompt if no github_username at all (Google/Email users)
  // GitHub OAuth users already have github_username set — skip the modal
  const [showPrompt, setShowPrompt] = useState(!user?.github_username)

  // Auto-enrich GitHub OAuth users who have username but no trust score yet
  useEffect(() => {
    if (!user?.github_username || user?.trust_score) return
    Promise.all([
      axios.get(`/api/github/analyze/${user.github_username}`),
      axios.get(`/api/recruiter/quick-verify/${user.github_username}`),
    ]).then(([{ data: p }, { data: v }]) => {
      updateUser({
        trust_score:    v.trust_score?.total   ?? null,
        builder_score:  v.builder_score?.total ?? null,
        languages:      p.languages   || [],
        top_repos:      p.top_repos   || [],
        public_repos:   p.public_repos  || 0,
        total_stars:    p.total_stars   || 0,
        total_forks:    p.total_forks   || 0,
        followers:      p.followers     || 0,
        following:      p.following     || 0,
        commit_count:   p.commit_count  || 0,
        account_age_days:   p.account_age_days   || 0,
        account_created_at: p.account_created_at || null,
        bio:      p.bio      || user?.bio      || '',
        location: p.location || user?.location || '',
        avatar:   p.avatar   || user?.avatar,
        trust_breakdown:   v.trust_score?.dimensions   || {},
        builder_breakdown: v.builder_score?.dimensions || {},
      })
    }).catch(() => {})
  }, [user?.github_username])

  return (
    <div className="min-h-screen flex" style={{ background: '#020617' }}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-brand-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <AnimatePresence>
        {showPrompt && <GitHubPromptModal onClose={() => setShowPrompt(false)} />}
      </AnimatePresence>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="relative z-10 flex-1 min-h-screen overflow-auto"
      >
        <div className="max-w-[1360px] mx-auto p-6">
          <Routes>
            <Route index                     element={<DashboardHome />}       />
            <Route path="resume"             element={<ResumeVerifier />}      />
            <Route path="certificates"       element={<CertificateVerifier />} />
            <Route path="projects"           element={<ProjectScanner />}      />
            <Route path="deployments"        element={<DeploymentChecker />}   />
            <Route path="skills"             element={<SkillMap />}            />
            <Route path="proof-chain"        element={<ProofChain />}          />
            <Route path="team"               element={<TeamAnalyzer />}        />
            <Route path="timeline"           element={<DevTimeline />}         />
            <Route path="achievements"       element={<Achievements />}        />
            <Route path="milestones"         element={<Milestones />}          />
            <Route path="builder"            element={<BuilderConfidence />}   />
            <Route path="complexity"         element={<CodeComplexity />}      />
            <Route path="insights"           element={<AIInsights />}          />
          </Routes>
        </div>
      </motion.main>
    </div>
  )
}
