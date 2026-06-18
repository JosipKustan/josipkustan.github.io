import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'
import { useIsMobile } from '../../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Workflows page — block 3, "However a story starts, the rules don't change."
// Sets the shared model once so each card below doesn't repeat it. Light surface,
// a single row: header + the
// core-loop strip (Sources → Workflow → Draft → Review → Decision). Reuses the
// loop visual idiom from the Platform page's CoreLoopSection, kept compact here.
//
// Framer note: cream Frame, --section padding. Header (Mozilla H2 + Inter body).
// Below it the loop strip = 5 labeled node Frames joined by orange arrows
// (horizontal row on desktop, vertical Stack on phones). Scroll-in: stagger the
// nodes. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = ['Sources', 'Workflow', 'Draft', 'Review', 'Decision']
const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const node: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.2 + i * 0.09, ease: EASE } }),
  }

  return (
    <section style={s.section} id="how-it-works" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="light">How it works</Eyebrow>
          <h2 style={s.heading}>However a story starts, the rules don't change.</h2>
          <p style={s.body}>
            Every workflow reads the sources you choose, drafts in your voice, and shows where each
            claim came from. Then it stops. The editor approves, edits, or rejects.
          </p>
        </motion.header>

        <div style={{ ...s.loop, flexDirection: isMobile ? 'column' : 'row' }}>
          {STAGES.map((label, i) => (
            <div key={label} style={{ ...s.loopItem, flexDirection: isMobile ? 'column' : 'row' }}>
              <motion.span
                style={s.node}
                custom={i}
                variants={reduce ? undefined : node}
                initial={reduce ? false : 'hidden'}
                animate={inView ? 'show' : reduce ? undefined : 'hidden'}
              >
                <span style={s.nodeNum}>{String(i + 1).padStart(2, '0')}</span>
                {label}
              </motion.span>
              {i < STAGES.length - 1 && (
                <span aria-hidden style={{ ...s.arrow, transform: isMobile ? 'rotate(90deg)' : 'none' }}>→</span>
              )}
            </div>
          ))}
        </div>
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
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 18px)',
    lineHeight: 1.6,
    color: 'var(--muted-foreground)',
    margin: 0,
    maxWidth: '62ch',
  },
  loop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
  },
  loopItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  node: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 14px',
    boxShadow: 'var(--shadow-sm)',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(15px, 1.7vw, 18px)',
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  nodeNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--accent)',
  },
  arrow: {
    flexShrink: 0,
    color: 'var(--brand-orange)',
    fontSize: '20px',
    fontWeight: 700,
    padding: '0 4px',
    lineHeight: 1,
  },
}
