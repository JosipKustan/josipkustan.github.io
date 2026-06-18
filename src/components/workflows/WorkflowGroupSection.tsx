import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'
import type { WorkflowGroup } from './content'

// ─────────────────────────────────────────────────────────────────────────────
// One workflow group on the Workflows page (block 4-7). Light cream surface, a
// group header (Eyebrow loop-stage + Mozilla H2 + Inter sub), then a card grid.
// Each card pairs a small static schematic with the workflow's H3, one-liner, and
// a short body. The page scales by adding cards to a group, not by adding sections.
//
// Framer note: cream Frame, --section padding. Header Stack (orange mono Eyebrow +
// Mozilla H2 + Inter sub). An auto-grid of cards (cream fill, hairline, shadow):
// schematic Frame on top, then an Inter H3 headline, an accent one-liner, and an
// Inter body. Optional muted note under the grid (the traceability framing). Build
// ONE card Component and feed it per-workflow content + a schematic variant.
// Scroll-in: stagger the cards (fade + y 24px); hover y:-3. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function WorkflowGroupSection({ group }: { group: WorkflowGroup }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } }
  const card: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id={`wf-${group.eyebrow.toLowerCase()}`} className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="light">{group.eyebrow}</Eyebrow>
          <h2 style={s.heading}>{group.h2}</h2>
          <p style={s.sub}>{group.sub}</p>
        </motion.header>

        <motion.div
          style={s.grid}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {group.cards.map(({ headline, line, body, Schematic }) => (
            <motion.article
              key={headline}
              style={s.card}
              variants={reduce ? undefined : card}
              whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
            >
              <Schematic />
              <div style={s.text}>
                <h3 style={s.cardHeadline}>{headline}</h3>
                <p style={s.cardLine}>{line}</p>
                <p style={s.cardBody}>{body}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {group.note && (
          <motion.p
            style={s.note}
            initial={reduce ? false : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.4, ease: EASE }}
          >
            {group.note}
          </motion.p>
        )}
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--background)',
    padding: 'clamp(48px, 6vw, 80px) var(--section-px)',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(28px, 3.5vw, 40px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    maxWidth: 640,
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 3.4vw, 40px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    margin: 0,
    lineHeight: 1.05,
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 1.6vw, 17px)',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: 0,
    maxWidth: '52ch',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
    gap: 'clamp(16px, 2vw, 22px)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(18px, 2vw, 22px)',
    boxShadow: 'var(--shadow-sm)',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    padding: '0 4px 4px',
  },
  cardHeadline: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 1.9vw, 20px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    color: 'var(--foreground)',
    margin: 0,
  },
  cardLine: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: 1.4,
    color: 'var(--accent)',
    margin: 0,
  },
  cardBody: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14.5px',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: '2px 0 0',
  },
  note: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '14px',
    lineHeight: 1.5,
    color: 'var(--muted-foreground)',
    margin: 0,
    maxWidth: '70ch',
  },
}
