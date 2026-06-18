import WorkflowsHero from '../components/workflows/WorkflowsHero'
import HowItWorksSection from '../components/workflows/HowItWorksSection'
import WorkflowGroupSection from '../components/workflows/WorkflowGroupSection'
import MoreToComeSection from '../components/workflows/MoreToComeSection'
import EditorDecidesSection from '../components/workflows/EditorDecidesSection'
import FinalCTASection from '../components/FinalCTASection'
import { GROUPS } from '../components/workflows/content'

// Workflows page body (blocks 2-10). The homepage shows a curated five; this page
// shows the full, growing set, grouped by where each workflow sits on the core
// loop (Watch → Draft → Translate → Verify). The page scales by adding cards to a
// group, not by adding sections. Shared chrome (Navbar, Footer) is rendered once
// by App. Block 10 reuses the homepage Final CTA with workflows-level copy.

export default function WorkflowsPage() {
  return (
    <main>
      <WorkflowsHero />
      <HowItWorksSection />
      {GROUPS.map(group => (
        <WorkflowGroupSection key={group.eyebrow} group={group} />
      ))}
      <MoreToComeSection />
      <EditorDecidesSection />
      <FinalCTASection heading="See these on your own desk." />
    </main>
  )
}
