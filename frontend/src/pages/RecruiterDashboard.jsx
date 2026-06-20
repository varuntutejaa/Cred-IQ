import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import RecruiterSidebar    from '../components/recruiter/RecruiterSidebar'
import RecruiterHome        from '../components/recruiter/RecruiterHome'
import CandidateSearch      from '../components/recruiter/CandidateSearch'
import QuickVerify          from '../components/recruiter/QuickVerify'
import Shortlists           from '../components/recruiter/Shortlists'
import Reports              from '../components/recruiter/Reports'
import RecruiterAnalytics   from '../components/recruiter/RecruiterAnalytics'
import VibeCodeDetector     from '../components/recruiter/VibeCodeDetector'
import CandidateComparison  from '../components/dashboard/CandidateComparison'

export default function RecruiterDashboard() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <RecruiterSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <motion.main
        animate={{ paddingLeft: collapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="flex-1 min-h-screen overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-6 py-7">
          <Routes>
            <Route index               element={<RecruiterHome />}        />
            <Route path="search"       element={<CandidateSearch />}      />
            <Route path="verify"       element={<QuickVerify />}          />
            <Route path="vibe"         element={<VibeCodeDetector />}     />
            <Route path="comparison"   element={<CandidateComparison />}  />
            <Route path="shortlists"   element={<Shortlists />}           />
            <Route path="reports"      element={<Reports />}              />
            <Route path="analytics"    element={<RecruiterAnalytics />}   />
          </Routes>
        </div>
      </motion.main>
    </div>
  )
}
