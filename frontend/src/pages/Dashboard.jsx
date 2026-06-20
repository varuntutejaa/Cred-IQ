import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHome from '../components/dashboard/DashboardHome'
import ResumeVerifier from '../components/dashboard/ResumeVerifier'
import GitHubAnalyzer from '../components/dashboard/GitHubAnalyzer'
import CertificateVerifier from '../components/dashboard/CertificateVerifier'
import ProjectScanner from '../components/dashboard/ProjectScanner'
import DeploymentChecker from '../components/dashboard/DeploymentChecker'
import SkillMap from '../components/dashboard/SkillMap'
import ProofChain from '../components/dashboard/ProofChain'
import TeamAnalyzer from '../components/dashboard/TeamAnalyzer'
import DevTimeline from '../components/dashboard/DevTimeline'
import PortfolioBattle from '../components/dashboard/PortfolioBattle'
import AIInsights from '../components/dashboard/AIInsights'
import BuilderConfidence from '../components/dashboard/BuilderConfidence'
import Achievements from '../components/dashboard/Achievements'
import Milestones from '../components/dashboard/Milestones'
import CodeComplexity from '../components/dashboard/CodeComplexity'

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="flex-1 min-h-screen overflow-auto"
      >
        <div className="max-w-[1400px] mx-auto p-6">
          <Routes>
            <Route index                     element={<DashboardHome />}       />
            <Route path="resume"             element={<ResumeVerifier />}      />
            <Route path="github"             element={<GitHubAnalyzer />}      />
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
            <Route path="battle"             element={<PortfolioBattle />}     />
            <Route path="complexity"         element={<CodeComplexity />}      />
            <Route path="insights"           element={<AIInsights />}          />
          </Routes>
        </div>
      </motion.main>
    </div>
  )
}
