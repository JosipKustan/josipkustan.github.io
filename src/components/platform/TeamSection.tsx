import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 11, "Built by people who've worked the desk." Credibility:
// the people behind the product. A remote, multilingual European team of former
// journalists and industry experts. Dark surface. Link → About.
//
// (Optional later: a short click-to-play editorial video can live here, never
// autoplay, with the same point made in text above it. Kept text-only for v1.)
//
// Framer note: dark Frame, centred Stack — orange mono eyebrow, Mozilla H2, Inter
// body, a brand-blue "Meet the team →" link. Scroll-in fade + rise; reduced-motion safe.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function TeamSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <section style={s.section} id="team" ref={ref}>
      <div style={s.inner}>
        <motion.div {...reveal(0)}>
          <Eyebrow tone="dark">The team</Eyebrow>
        </motion.div>
        <motion.h2 style={s.heading} {...reveal(0.08)}>
          Built by people who've worked the desk.
        </motion.h2>
        <motion.p style={s.body} {...reveal(0.16)}>
          NewsLabs is a remote team across Europe. Multilingual. Former journalists and industry
          experts who know what a production day costs.
        </motion.p>
        <motion.a
          href="#about"
          style={s.link}
          {...reveal(0.24)}
          whileHover={reduce ? undefined : { x: 3 }}
        >
          Meet the team →
        </motion.a>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: { background: 'var(--ink)', padding: 'var(--section-py) var(--section-px)' },
  inner: {
    maxWidth: '760px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '18px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4.2vw, 50px)',
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
    margin: 0,
    lineHeight: 1.05,
    maxWidth: '18ch',
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.8vw, 19px)',
    lineHeight: 1.6,
    color: 'var(--dark-muted)',
    margin: 0,
    maxWidth: '52ch',
  },
  link: {
    marginTop: '6px',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--dark-primary)',
    textDecoration: 'none',
  },
}
