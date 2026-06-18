import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'
import { useIsMobile } from '../../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 3, "How NewsLabs works." The spine of the page: the model
// the whole product sits on, drawn as a loop. Sources → Workflow → Draft → Review
// → Decision. Nothing publishes without a person. Light surface.
//
// Framer note: cream Frame, --section padding. Header (Mozilla H2 + Inter body).
// The flow = 5 numbered node Frames joined by arrow connectors (a horizontal row
// on desktop, a vertical Stack on phones). Scroll-in: stagger the nodes; honour
// reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const STAGES: { n: string; label: string; caption: string }[] = [
  { n: '01', label: 'Sources', caption: 'The wires, outlets, and feeds you choose.' },
  { n: '02', label: 'Workflow', caption: 'A drafting job runs from them.' },
  { n: '03', label: 'Draft', caption: 'Every claim traced to where it came from.' },
  { n: '04', label: 'Review', caption: 'The editor reads it against its sources.' },
  { n: '05', label: 'Decision', caption: 'Approve, edit, reject, or send back.' },
]

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

function Arrow({ vertical }: { vertical: boolean }) {
  return (
    <span aria-hidden style={{ ...s.arrow, transform: vertical ? 'rotate(90deg)' : 'none' }}>→</span>
  )
}

export default function CoreLoopSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const node: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.15 + i * 0.09, ease: EASE } }),
  }

  return (
    <section style={s.section} id="core-loop" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="light">The core loop</Eyebrow>
          <h2 style={s.heading}>How NewsLabs works.</h2>
          <p style={s.body}>
            You choose your sources. A workflow drafts from them. Every claim is traced to where
            it came from. The editor approves, edits, or rejects. Nothing publishes without a person.
          </p>
        </motion.header>

        {/* Flow */}
        <div style={{ ...s.flow, flexDirection: isMobile ? 'column' : 'row' }}>
          {STAGES.map((st, i) => (
            <div key={st.label} style={{ ...s.flowItem, flexDirection: isMobile ? 'column' : 'row' }}>
              <motion.div
                style={s.node}
                custom={i}
                variants={reduce ? undefined : node}
                initial={reduce ? false : 'hidden'}
                animate={inView ? 'show' : reduce ? undefined : 'hidden'}
              >
                <span style={s.nodeNum}>{st.n}</span>
                <span style={s.nodeLabel}>{st.label}</span>
                <span style={s.nodeCaption}>{st.caption}</span>
              </motion.div>
              {i < STAGES.length - 1 && <Arrow vertical={isMobile} />}
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
    gap: 'clamp(32px, 4.5vw, 52px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: 720,
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
  flow: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: '0',
  },
  flowItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  node: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-md)',
    padding: '18px 18px 20px',
    boxShadow: 'var(--shadow-sm)',
    height: '100%',
  },
  nodeNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--accent)',
  },
  nodeLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
  },
  nodeCaption: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    lineHeight: 1.45,
    color: 'var(--muted-foreground)',
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
