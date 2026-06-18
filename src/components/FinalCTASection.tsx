import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Block 10 — Final CTA. Same energy as the pain section: BOLD, QUICK, RESOLUTE.
// One ask. Dark ink surface, big Mozilla Text headline, a single Inter sub, and
// the conversion pair (Bright "Book a demo" + ghost "Talk to our team"). Let the
// headline carry it.
//
// Framer note: ink Frame, --section padding, centered Stack. Mozilla Text H2
// (large), Inter sub (muted cream), then a button row — orange primary + ghost
// outline. Scroll-in: fade + y 24px, ~0.1s stagger. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

// Copy is parameterized so both pages reuse the same component (homepage defaults;
// the Platform page passes its own headline). The conversion pair is identical
// across pages.
export default function FinalCTASection({
  heading = 'See it in your newsroom.',
  sub = 'A 30-minute walkthrough on your workflows. No slides.',
}: {
  heading?: string
  sub?: string
} = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <section style={s.section} id="demo" ref={ref}>
      <div style={s.inner}>
        <motion.h2 style={s.heading} {...rise(0)}>
          {heading}
        </motion.h2>

        <motion.p style={s.sub} {...rise(0.1)}>
          {sub}
        </motion.p>

        <motion.div style={s.ctaRow} {...rise(0.2)}>
          <motion.a
            href="#demo"
            style={s.primary}
            whileHover={reduce ? undefined : { backgroundColor: 'oklch(0.82 0.18 58.3)', scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            Book a demo
          </motion.a>
          <motion.a
            href="#contact"
            style={s.ghost}
            className="fcta-ghost"
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            Talk to our team
          </motion.a>
        </motion.div>
      </div>
      <style>{CSS}</style>
    </section>
  )
}

const CSS = `
  .fcta-ghost { transition: border-color 200ms var(--ease-out), background 200ms var(--ease-out); }
  .fcta-ghost:hover { border-color: var(--dark-muted); background: var(--dark-card); }
`

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--ink)',
    padding: 'var(--section-py) var(--section-px)',
    borderTop: '1px solid oklch(0.28 0.025 272)',
  },
  inner: {
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(34px, 6vw, 68px)',
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
    color: 'var(--cream)',
    margin: 0,
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.8vw, 19px)',
    lineHeight: 1.55,
    color: 'var(--dark-muted)',
    margin: 0,
    maxWidth: '44ch',
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '14px',
    marginTop: '12px',
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '15px 30px',
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.01em',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  ghost: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '15px 30px',
    background: 'transparent',
    color: 'var(--cream)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.01em',
    cursor: 'pointer',
    textDecoration: 'none',
  },
}
