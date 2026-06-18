import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from './vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Block 7 — "From the desk". One human voice and one piece of thinking, side by
// side: a testimonial card and a blog card, equal width, in a single row. Light
// cream surface (breaks the dark run between Stats and Connect).
//
// v1 uses ONE anonymized pull quote (no customer logos / named stories yet).
//
// Framer note: cream Frame (paper grain), --section padding. Mozilla Text H2
// ("From the desk."). Below it a 2-up Grid of equal-width cards that wraps to one
// column on phones. Card A = a Source Serif pull-quote with a burnt-orange quote
// glyph + an Inter caption attribution pinned to the bottom. Card B = an orange
// mono "From the blog" eyebrow, an Inter H3 title, and a brand-blue
// "Read on the blog ->" link pinned to the bottom. Scroll-in: stagger the two
// cards (fade + y 28px); hover y:-3. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function FromTheDeskSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  }
  const card: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="from-the-desk" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.h2
          style={s.heading}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          From the desk.
        </motion.h2>

        <motion.div
          style={s.grid}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {/* Card A — testimonial (one anonymized pull quote for v1) */}
          <motion.figure
            style={s.card}
            variants={reduce ? undefined : card}
            whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
          >
            <span aria-hidden style={s.quoteMark}>&ldquo;</span>
            <blockquote style={s.quote}>This changes how we work.</blockquote>
            <figcaption style={s.attribution}>Editor-in-chief, national daily</figcaption>
          </motion.figure>

          {/* Card B — blog */}
          <motion.article
            style={s.card}
            variants={reduce ? undefined : card}
            whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
          >
            <Eyebrow tone="light">From the blog</Eyebrow>
            <h3 style={s.blogTitle}>
              What to automate in the newsroom, and what to keep human.
            </h3>
            <a href="#blog" style={s.blogLink} className="ftd-link">
              Read on the blog →
            </a>
          </motion.article>
        </motion.div>
      </div>
      <style>{CSS}</style>
    </section>
  )
}

const CSS = `
  .ftd-link { transition: color 160ms var(--ease-out); }
  .ftd-link:hover { color: var(--brand-blue); }
`

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--background)',
    padding: 'var(--section-py) var(--section-px)',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(32px, 4vw, 48px)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
    alignItems: 'stretch',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    background: 'var(--card)',
    border: '1px solid rgba(20, 24, 42, 0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(28px, 3.4vw, 40px)',
    boxShadow: 'var(--shadow-sm)',
    margin: 0,
  },
  quoteMark: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    fontSize: '64px',
    lineHeight: 0.6,
    color: 'var(--accent)',
    height: '34px',
  },
  quote: {
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    fontSize: 'clamp(24px, 3vw, 34px)',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
    margin: 0,
  },
  attribution: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12.5px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    marginTop: 'auto',
    paddingTop: '8px',
  },
  blogTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 'clamp(20px, 2.4vw, 26px)',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
    margin: '2px 0 0',
  },
  blogLink: {
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--primary)',
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: 'auto',
    paddingTop: '8px',
  },
}
