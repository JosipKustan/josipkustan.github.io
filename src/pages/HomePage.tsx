import Hero from '../components/Hero'
import ProblemSection from '../components/ProblemSection'
import WorkflowsSection from '../components/WorkflowsSection'
import DifferentSection from '../components/DifferentSection'
import StatsSection from '../components/StatsSection'
import FromTheDeskSection from '../components/FromTheDeskSection'
import ConnectSection from '../components/ConnectSection'
import FAQSection from '../components/FAQSection'
import FinalCTASection from '../components/FinalCTASection'

// The homepage body (blocks 2–10). Shared chrome (Navbar, Footer) is rendered
// once by App so it persists across hash-route changes.
export default function HomePage() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <WorkflowsSection />
      <DifferentSection />
      <StatsSection />
      <FromTheDeskSection />
      <ConnectSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  )
}
