import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Workflows page — block 8, "More workflows, regularly." A slim cream band that
// signals the set is growing without dating the page. Text left, a "Tell us what
// to build →" link right (routes to Talk to our team).
//
// Framer note: cream Frame holding a bordered panel; text block left (Mozilla H2 +
// Inter body), brand-blue link right. Wraps on phones. Scroll-in fade + y; honour
// reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function MoreToComeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  return (
    <section style={s.section} id="more-to-come" className="vk-paper" ref={ref}>
      <motion.div
        style={s.panel}
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <div style={s.text}>
          <h2 style={s.heading}>More workflows, regularly.</h2>
          <p style={s.body}>
            We add workflows as newsrooms ask for them. If there's a routine job eating your team's
            day, tell us on the demo.
          </p>
        </div>
        <motion.a
          href="#contact"
          style={s.link}
          className="mtc-link"
          whileHover={reduce ? undefined : { x: 3 }}
        >
          Tell us what to build →
        </motion.a>
      </motion.div>
      <style>{CSS}</style>
    </section>
  )
}

const CSS = `
  .mtc-link { transition: color 160ms var(--ease-out); }
  .mtc-link:hover { color: var(--brand-blue); }
`

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--background)',
    padding: 'clamp(40px, 5vw, 64px) var(--section-px)',
  },
  panel: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px 36px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(26px, 3.4vw, 40px)',
    boxShadow: 'var(--shadow-sm)',
  },
  text: {
    flex: '1 1 420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(24px, 3vw, 36px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    margin: 0,
    lineHeight: 1.05,
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 1.6vw, 17px)',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: 0,
    maxWidth: '54ch',
  },
  link: {
    flexShrink: 0,
    fontFamily: 'var(--font-sans)',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--primary)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
}
