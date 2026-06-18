import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 12, "What NewsLabs is not." Disarms the "is this just
// ChatGPT / a CMS / a fact-checker?" doubts in one block. Light surface.
//
// Framer note: cream Frame, header (Mozilla H2). A 2-up grid of items: a small ✕
// disc + a bold "Not a …" lead-in + an Inter clause. Scroll-in stagger.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const ITEMS: { lead: string; rest: string }[] = [
  { lead: 'Not a CMS.', rest: 'It hands drafts to yours; it doesn’t host or publish.' },
  { lead: 'Not a fact-checker.', rest: 'It shows sources; the editor verifies.' },
  { lead: 'Not a newsroom replacement.', rest: 'It drafts the routine work, not the journalism.' },
  { lead: 'Not a generic assistant.', rest: 'Every workflow is shaped by the newsroom job it serves.' },
]

export default function WhatItsNotSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }
  const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="what-its-not" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="light">The boundaries</Eyebrow>
          <h2 style={s.heading}>What NewsLabs is not.</h2>
        </motion.header>

        <motion.div
          style={s.grid}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {ITEMS.map(it => (
            <motion.div key={it.lead} style={s.item} variants={reduce ? undefined : item}>
              <span style={s.mark} aria-hidden><X size={15} strokeWidth={2.6} /></span>
              <p style={s.text}>
                <span style={s.lead}>{it.lead}</span> {it.rest}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: { background: 'var(--background)', padding: 'var(--section-py) var(--section-px)' },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(28px, 4vw, 44px)',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    margin: 0,
    lineHeight: 1.05,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  item: {
    display: 'flex',
    gap: '14px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(22px, 2.6vw, 28px)',
    boxShadow: 'var(--shadow-sm)',
  },
  mark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(192,91,0,0.1)',
    color: 'var(--accent)',
  },
  text: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 1.7vw, 17px)',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  lead: {
    fontWeight: 700,
    color: 'var(--foreground)',
  },
}
