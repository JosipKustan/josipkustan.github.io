import PricingHero from '../components/pricing/PricingHero'
import HowPricingWorksSection from '../components/pricing/HowPricingWorksSection'
import PriceBuiltOnSection from '../components/pricing/PriceBuiltOnSection'
import IncludedSection from '../components/pricing/IncludedSection'
import FAQSection, { type Faq } from '../components/FAQSection'
import FinalCTASection from '../components/FinalCTASection'

// Pricing page body (blocks 2–7). Shared chrome (Navbar, Footer) is rendered once
// by App. Pricing is custom only and the page is price-free by rule — every funnel
// ends at Book a demo. Blocks 6 (FAQ) and 7 (Final CTA) reuse the homepage
// components, fed pricing copy.

// Block 6 — the money questions sales hears in the first ten minutes.
const PRICING_FAQS: Faq[] = [
  {
    q: "Why don't you publish prices?",
    a: [
      {
        p: 'Newsrooms differ too much for one price to be fair. Source rights, workflows, and volume all change the number. We quote to your setup so you pay for what you run.',
      },
    ],
  },
  {
    q: 'How is the price calculated?',
    a: [
      {
        p: "It's built on the workflows you run, the sources and volume you connect, the languages you cover, and the support you want.",
      },
    ],
  },
  {
    q: 'Is there a setup fee or a long contract?',
    a: [
      {
        p: "We'll cover terms on the call. Onboarding is included, and we scope a commitment that fits your newsroom.",
      },
    ],
  },
  {
    q: 'Can we start small and grow?',
    a: [
      {
        p: 'Yes. Start with a few workflows and add more as your team gets value. Price grows with use, not ahead of it.',
      },
    ],
  },
  {
    q: 'Who is NewsLabs for?',
    a: [
      {
        p: 'National dailies, public broadcasters, and digital publishers. If you have a production desk, we can scope a fit.',
      },
    ],
  },
  {
    q: 'How do we get a quote?',
    a: [
      {
        p: "Book a demo. We'll scope your setup and follow up with a price.",
      },
    ],
  },
]

export default function PricingPage() {
  return (
    <main>
      <PricingHero />
      <HowPricingWorksSection />
      <PriceBuiltOnSection />
      <IncludedSection />
      {/* FAQSection keeps its shared "On the record." header by design (see the
          component's note); the Pricing spec's "Pricing questions." H2 is the one
          divergence here, deferred to that shared editorial through-line. */}
      <FAQSection faqs={PRICING_FAQS} />
      <FinalCTASection
        heading="Get a price built for you."
        sub="A 30-minute call to scope your setup. We follow up with a quote."
      />
    </main>
  )
}
