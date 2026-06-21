import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, X, ArrowRight } from 'lucide-react'
import RecruiterSidebar    from '../components/recruiter/RecruiterSidebar'
import RecruiterHome        from '../components/recruiter/RecruiterHome'
import CandidateSearch      from '../components/recruiter/CandidateSearch'
import QuickVerify          from '../components/recruiter/QuickVerify'
import Shortlists           from '../components/recruiter/Shortlists'
import Reports              from '../components/recruiter/Reports'
import RecruiterAnalytics   from '../components/recruiter/RecruiterAnalytics'
import VibeCodeDetector     from '../components/recruiter/VibeCodeDetector'
import CandidateComparison  from '../components/dashboard/CandidateComparison'
import CandidateProfileView from '../components/recruiter/CandidateProfileView'
import { useRecruiter }     from '../context/RecruiterContext'
import toast from 'react-hot-toast'

function AddCandidateModal({ onClose }) {
  const navigate  = useNavigate()
  const [input, setInput] = useState('')

  const go = (path) => {
    onClose()
    navigate(path)
  }

  const handleSearch = () => {
    const handle = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '').replace('@', '')
    if (!handle) { toast.error('Enter a GitHub username'); return }
    onClose()
    navigate(`/recruiter/candidate/${handle}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative glass-card gradient-border w-full max-w-lg shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all">
          <X size={14} />
        </button>

        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-3">
            <Search size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Find your first candidate</h2>
          <p className="text-sm text-dark-400 mt-1">Enter a GitHub username to verify and review their developer profile.</p>
        </div>

        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm font-mono">@</span>
            <input type="text" placeholder="github-username" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60 transition-all"
            />
          </div>
          <button onClick={handleSearch}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white font-semibold rounded-xl px-5 py-3 text-sm shadow-glow transition-all"
          >
            Go <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex gap-2 pt-4 border-t border-white/5">
          <button onClick={() => go('/recruiter/verify')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl glass border border-white/10 hover:border-brand-500/30 text-dark-300 hover:text-brand-300 text-xs font-medium transition-all"
          >
            <Zap size={13} /> Quick Verify
          </button>
          <button onClick={() => go('/recruiter/search')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl glass border border-white/10 hover:border-purple-500/30 text-dark-300 hover:text-purple-300 text-xs font-medium transition-all"
          >
            <Search size={13} /> Browse Candidates
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function RecruiterDashboardInner({ collapsed, setCollapsed }) {
  const { candidates } = useRecruiter()
  const [modalOpen, setModal] = useState(candidates.length === 0)

  return (
    <>
      <AnimatePresence>
        {modalOpen && <AddCandidateModal onClose={() => setModal(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-dark-950 flex">
        <RecruiterSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <motion.main
          animate={{ paddingLeft: collapsed ? 64 : 220 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex-1 min-h-screen overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto px-6 py-7">
            <Routes>
              <Route index                       element={<RecruiterHome onAddCandidate={() => setModal(true)} />} />
              <Route path="search"               element={<CandidateSearch />}          />
              <Route path="verify"               element={<QuickVerify />}              />
              <Route path="vibe"                 element={<VibeCodeDetector />}         />
              <Route path="comparison"           element={<CandidateComparison />}      />
              <Route path="shortlists"           element={<Shortlists />}               />
              <Route path="reports"              element={<Reports />}                  />
              <Route path="analytics"            element={<RecruiterAnalytics />}       />
              <Route path="candidate/:username"  element={<CandidateProfileView />}    />
            </Routes>
          </div>
        </motion.main>
      </div>
    </>
  )
}

export default function RecruiterDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  return <RecruiterDashboardInner collapsed={collapsed} setCollapsed={setCollapsed} />
}
