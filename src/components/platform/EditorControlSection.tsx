import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Check, Pencil, X, RotateCcw } from 'lucide-react'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 7, "The editor decides. Always." The non-negotiable:
// nothing auto-publishes. Three points + a draft preview sitting above an
// Approve · Edit · Reject · Send back control row. Dark surface.
//
// Framer note: dark Frame. Two columns (the three points stacked left; a draft-
// preview card right; stacks on phones). Preview = a cream paper Frame ("Draft ·
// awaiting review" tag + headline + body lines) over a control bar of four
// buttons (Approve primary orange, the rest ghost) and an approver byline line.
// Scroll-in: stagger the points; honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const POINTS: { title: string; body: string }[] = [
  {
    title: 'Every output is a draft.',
    body: 'Approve, edit, reject, or send back. Reachable from any draft.',
  },
  {
    title: 'Nothing publishes on its own.',
    body: 'No auto-approve, no scheduled publish, no "ready" badge without an editor behind it.',
  },
  {
    title: 'The byline stays with the journalist.',
    body: "The editor's name and time sit on every approval.",
  },
]

const ACTIONS: { label: string; icon: React.ReactNode; primary?: boolean }[] = [
  { label: 'Approve', icon: <Check size={15} strokeWidth={2.4} />, primary: true },
  { label: 'Edit', icon: <Pencil size={15} strokeWidth={2.2} /> },
  { label: 'Reject', icon: <X size={15} strokeWidth={2.4} /> },
  { label: 'Send back', icon: <RotateCcw size={15} strokeWidth={2.2} /> },
]

export default function EditorControlSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }
  const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="editor-control" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="dark">Editor control</Eyebrow>
          <h2 style={s.heading}>The editor decides. Always.</h2>
        </motion.header>

        <div style={s.cols}>
          {/* Three points */}
          <motion.div
            style={s.points}
            variants={reduce ? undefined : container}
            initial={reduce ? false : 'hidden'}
            animate={inView ? 'show' : reduce ? undefined : 'hidden'}
          >
            {POINTS.map(p => (
              <motion.div key={p.title} style={s.point} variants={reduce ? undefined : item}>
                <h3 style={s.pointTitle}>{p.title}</h3>
                <p style={s.pointBody}>{p.body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Draft preview + control bar */}
          <motion.div
            style={s.preview}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
          >
            <div style={s.paper}>
              <span style={s.paperTag}>Draft · awaiting review</span>
              <h4 style={s.paperHeadline}>Council approves €2.4M road-repair budget</h4>
              <span style={s.paperLine} />
              <span style={{ ...s.paperLine, width: '92%' }} />
              <span style={{ ...s.paperLine, width: '74%' }} />
            </div>

            <div style={s.controlBar}>
              {ACTIONS.map(a => (
                <span key={a.label} style={{ ...s.action, ...(a.primary ? s.actionPrimary : s.actionGhost) }}>
                  {a.icon}
                  {a.label}
                </span>
              ))}
            </div>

            <span style={s.byline}>Approved by an editor · name and time recorded</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--ink)',
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
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
    margin: 0,
    lineHeight: 1.05,
  },
  cols: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'clamp(28px, 4vw, 56px)',
  },
  points: {
    flex: '1 1 320px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(20px, 2.4vw, 28px)',
  },
  point: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingLeft: '18px',
    borderLeft: '2px solid var(--brand-orange)',
  },
  pointTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2vw, 22px)',
    letterSpacing: '-0.01em',
    color: 'var(--cream)',
    margin: 0,
  },
  pointBody: {
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    lineHeight: 1.55,
    color: 'var(--dark-muted)',
    margin: 0,
  },
  preview: {
    flex: '1 1 340px',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(20px, 2.4vw, 28px)',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
    background: 'var(--cream)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 22px',
  },
  paperTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  paperHeadline: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2.1vw, 22px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.18,
    color: 'var(--ink)',
    margin: '0 0 4px',
  },
  paperLine: {
    width: '100%',
    height: '7px',
    borderRadius: '4px',
    background: 'rgba(20,24,42,0.13)',
  },
  controlBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
  },
  actionPrimary: {
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
  },
  actionGhost: {
    background: 'transparent',
    color: 'var(--cream)',
    border: '1px solid var(--dark-border)',
  },
  byline: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12.5px',
    color: 'var(--dark-muted)',
  },
}
