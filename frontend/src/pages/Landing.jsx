import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import DeveloperFlow from '../components/landing/DeveloperFlow'
import RecruiterFlow from '../components/landing/RecruiterFlow'
import HowItWorks from '../components/landing/HowItWorks'
import TrustScoreBreakdown from '../components/landing/TrustScoreBreakdown'
import BuilderConfidenceSection from '../components/landing/BuilderConfidenceSection'
import About from '../components/landing/About'
import Contact from '../components/landing/Contact'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DeveloperFlow />
        <RecruiterFlow />
        <TrustScoreBreakdown />
        <BuilderConfidenceSection />
        <HowItWorks />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
