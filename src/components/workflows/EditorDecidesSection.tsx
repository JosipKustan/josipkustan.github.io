import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Workflows page — block 9, "Every workflow ends with you." Closes every workflow
// on the same promise: whatever the input, the output is a draft and the editor
// decides. Dark ink surface, centered statement.
//
// Framer note: ink Frame, --section padding, centered Stack. An orange icon disc
// (Lucide ShieldCheck), orange mono Eyebrow, Mozilla H2, Inter body (muted cream).
// Scroll-in: fade + y, small stagger. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function EditorDecidesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <section style={s.section} id="editor-decides" ref={ref}>
      <div style={s.inner}>
        <motion.span style={s.iconDisc} {...rise(0)}>
          <ShieldCheck size={26} strokeWidth={1.5} />
        </motion.span>
        <motion.div {...rise(0.06)}>
          <Eyebrow tone="dark">The rule</Eyebrow>
        </motion.div>
        <motion.h2 style={s.heading} {...rise(0.12)}>
          Every workflow ends with you.
        </motion.h2>
        <motion.p style={s.body} {...rise(0.18)}>
          Whatever the input, the output is a draft. NewsLabs never publishes on its own. You
          approve, edit, or reject. The byline stays with the journalist.
        </motion.p>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--ink)',
    padding: 'var(--section-py) var(--section-px)',
    borderTop: '1px solid oklch(0.28 0.025 272)',
  },
  inner: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '18px',
  },
  iconDisc: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    border: '1px solid oklch(0.3 0.025 272)',
    background: 'var(--dark-card)',
    color: 'var(--brand-orange)',
    marginBottom: '4px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(30px, 5vw, 56px)',
    lineHeight: 1.03,
    letterSpacing: '-0.03em',
    color: 'var(--cream)',
    margin: 0,
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.8vw, 19px)',
    lineHeight: 1.6,
    color: 'var(--dark-muted)',
    margin: 0,
    maxWidth: '54ch',
  },
}
