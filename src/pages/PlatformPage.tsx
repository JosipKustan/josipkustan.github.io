import PlatformHero from '../components/platform/PlatformHero'
import CoreLoopSection from '../components/platform/CoreLoopSection'
import WorkflowsGroupSection from '../components/platform/WorkflowsGroupSection'
import SourcesSection from '../components/platform/SourcesSection'
import TraceabilitySection from '../components/platform/TraceabilitySection'
import EditorControlSection from '../components/platform/EditorControlSection'
import VoiceSection from '../components/platform/VoiceSection'
import LanguagesSection from '../components/platform/LanguagesSection'
import IntegrationSection from '../components/platform/IntegrationSection'
import TeamSection from '../components/platform/TeamSection'
import WhatItsNotSection from '../components/platform/WhatItsNotSection'
import FAQSection, { type Faq } from '../components/FAQSection'
import FinalCTASection from '../components/FinalCTASection'

// Platform (Product) page body, blocks 2–14. Shared chrome (Navbar, Footer) is
// rendered once by App. Blocks 13 (FAQ) and 14 (Final CTA) reuse the homepage
// components, fed platform-level copy.

// Block 13 — platform-level "On the record." Q&A (reuses the homepage FAQ column).
const PLATFORM_FAQS: Faq[] = [
  {
    q: 'How does NewsLabs prevent misinformation?',
    a: [
      {
        p: "Every draft shows its sources and every claim is traced. NewsLabs doesn't verify truth. It makes the editor's check fast, and nothing publishes without an editor.",
      },
    ],
  },
  {
    q: 'Where does our data go, and who can see our sources?',
    a: [
      {
        p: 'Your sources and drafts belong to your newsroom. Source rights are configured per newsroom and respected by jurisdiction.',
      },
    ],
  },
  {
    q: 'Does it replace our CMS?',
    a: [
      {
        p: 'No. NewsLabs drafts inside its own platform and hands approved drafts to your CMS. The publish step stays with you.',
      },
    ],
  },
  {
    q: 'Can it hold our voice across languages?',
    a: [
      {
        p: 'Yes. Voice settings apply per workflow, and language is a property of every draft.',
      },
    ],
  },
]

export default function PlatformPage() {
  return (
    <main>
      <PlatformHero />
      <CoreLoopSection />
      <WorkflowsGroupSection />
      <SourcesSection />
      <TraceabilitySection />
      <EditorControlSection />
      <VoiceSection />
      <LanguagesSection />
      <IntegrationSection />
      <TeamSection />
      <WhatItsNotSection />
      <FAQSection faqs={PLATFORM_FAQS} />
      <FinalCTASection heading="See the platform on your desk." />
    </main>
  )
}
