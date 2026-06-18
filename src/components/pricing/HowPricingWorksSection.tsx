import { Fragment, useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { MoveRight } from 'lucide-react'
import { useIsMobile } from '../../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Pricing page — block 3. "How pricing works." Replaces the missing price table
// with a visible three-step process so "custom" reads as clear, not opaque. Bold
// primary-blue surface, a left→right three-node schematic (number + H3 + one line),
// connected by arrows on desktop and stacked on mobile. No prices.
//
// Framer note: primary-blue Frame (--primary fill, paper grain), --section padding.
// Centered Mozilla H2 in cream (--primary-foreground). Below it three numbered step
// cards in a row (cream fill --card, number badge in brand blue, Mozilla title, Inter
// line), with a cream-tinted Lucide arrow between each on Desktop; add a Phone
// breakpoint (≤720px) that stacks them and drops the arrows.
// Scroll-in: stagger the steps (fade + y). Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const STEPS: { n: string; title: string; body: string }[] = [
  { n: '01', title: 'We scope your setup.', body: 'Your sources, your workflows, your volume, your languages.' },
  { n: '02', title: 'We send a quote.', body: "One price for what you'll actually run. No tiers, no surprise fees." },
  { n: '03', title: 'You start with support.', body: 'Onboarding and a named contact, from day one.' },
]

export default function HowPricingWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  }
  const step: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="how-pricing-works" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.h2
          style={s.heading}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          How pricing works.
        </motion.h2>

        <motion.div
          style={{ ...s.steps, flexDirection: isMobile ? 'column' : 'row' }}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {STEPS.map((st, i) => (
            <Fragment key={st.n}>
              <motion.div style={s.card} variants={reduce ? undefined : step}>
                <span style={s.num}>{st.n}</span>
                <h3 style={s.cardTitle}>{st.title}</h3>
                <p style={s.cardBody}>{st.body}</p>
              </motion.div>
              {!isMobile && i < STEPS.length - 1 && (
                <span style={s.arrow} aria-hidden><MoveRight size={22} strokeWidth={1.8} /></span>
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--primary)',
    padding: 'var(--section-py) var(--section-px)',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(32px, 4vw, 48px)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--primary-foreground)',
    margin: 0,
    textAlign: 'center',
  },
  steps: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 'clamp(12px, 1.5vw, 18px)',
    width: '100%',
  },
  card: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    background: 'var(--card)',
    border: '1px solid rgba(249, 247, 244, 0.14)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(24px, 2.8vw, 32px)',
    boxShadow: 'var(--shadow-md)',
  },
  num: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--primary)',
    background: 'rgba(20, 81, 206, 0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 10px',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2vw, 22px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    color: 'var(--foreground)',
    margin: 0,
  },
  cardBody: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14.5px',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  arrow: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'rgba(249, 247, 244, 0.55)',
    flexShrink: 0,
  },
}
