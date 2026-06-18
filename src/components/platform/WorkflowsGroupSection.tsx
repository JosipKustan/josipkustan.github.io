import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 4, "One engine. Many workflows." This is where the
// Platform page leans on the workflows, like the homepage does: it names and
// groups the breadth, then sends people to the Workflows page for depth. Keep it
// compact — H3-only names, no per-workflow bodies (those live on the Workflows
// page). Light surface, grouped grid.
//
// Framer note: cream Frame. Header (Mozilla H2 + Inter sub). A 2-up auto-grid of
// group cards (cream fill, hairline border): a Mozilla group title + a list of
// workflow names (Inter, leading orange dash). Centred "See all workflows →"
// bordered link below. Scroll-in: stagger the cards; hover y:-3.
// ─────────────────────────────────────────────────────────────────────────────

const GROUPS: { label: string; items: string[] }[] = [
  {
    label: 'Watch the sources',
    items: ['Catch the story first', 'Stay on top of social', 'See what a region is saying'],
  },
  {
    label: 'Draft the story',
    items: ['Republish in your voice', 'Story from social', 'Custom News', 'Surface angles'],
  },
  {
    label: 'Translate, localize, transcribe',
    items: ['Translate and localize', 'Turn audio and video into text'],
  },
  {
    label: 'Edit and verify',
    items: ['Edit with AI or by hand', 'Check claims against sources', 'Trace every claim'],
  },
]

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function WorkflowsGroupSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }
  const card: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="workflows" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="light">The workflows</Eyebrow>
          <h2 style={s.heading}>Everything the desk does.</h2>
          <p style={s.sub}>
            Pick the work you want drafted. However a story starts, the rules don't change: your
            sources, your voice, your editor's call.
          </p>
        </motion.header>

        <motion.div
          style={s.grid}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {GROUPS.map(g => (
            <motion.div
              key={g.label}
              style={s.card}
              variants={reduce ? undefined : card}
              whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
            >
              <h3 style={s.cardTitle}>{g.label}</h3>
              <ul style={s.list}>
                {g.items.map(item => (
                  <li key={item} style={s.listItem}>
                    <span style={s.dash} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          style={s.ctaWrap}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.5, ease: EASE }}
        >
          <motion.a
            href="#/workflows"
            style={s.cta}
            whileHover={reduce ? undefined : { x: 3 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            See all workflows →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

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
    gap: 'clamp(32px, 4.5vw, 48px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: 680,
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    margin: 0,
    lineHeight: 1.05,
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 18px)',
    lineHeight: 1.6,
    color: 'var(--muted-foreground)',
    margin: 0,
    maxWidth: '58ch',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(24px, 2.6vw, 30px)',
    boxShadow: 'var(--shadow-sm)',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2vw, 21px)',
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '11px',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 500,
    lineHeight: 1.4,
    color: 'var(--foreground)',
  },
  dash: {
    flexShrink: 0,
    width: '10px',
    height: '2px',
    borderRadius: '2px',
    background: 'var(--brand-orange)',
    transform: 'translateY(-4px)',
  },
  ctaWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '13px 26px',
    border: '1px solid rgba(20, 24, 42, 0.18)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--foreground)',
    background: 'var(--card)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
}
