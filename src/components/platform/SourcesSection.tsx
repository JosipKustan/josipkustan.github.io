import { useRef, useState, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 5, "Your sources. Your rules." The control story: sources
// belong to the newsroom. NewsLabs reads only what you connect. Dark surface.
//
// Visual: a panel of toggleable source rows (wires, outlets, social, video) in
// mixed on/off states — clickable so it reads as the newsroom's own switchboard.
//
// Framer note: dark Frame. Two columns (copy left, panel right; stacks on phones).
// Panel = a --dark-card Frame with rows (category tag + source name + a toggle).
// Build the toggle as a component with On/Off variants (orange track + knob
// right / dark track + knob left), Smart-Animate the knob. Reduced-motion → no
// knob spring, still clickable.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const ROWS: { name: string; cat: string; on: boolean }[] = [
  { name: 'Reuters wire', cat: 'Wires', on: true },
  { name: 'AP wire', cat: 'Wires', on: true },
  { name: 'Council & court feeds', cat: 'Outlets', on: true },
  { name: 'X / social accounts', cat: 'Social', on: true },
  { name: 'Regional press pool', cat: 'Outlets', on: false },
  { name: 'YouTube / broadcast', cat: 'Video', on: false },
]

function Toggle({ on, onClick, reduce }: { on: boolean; onClick: () => void; reduce: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{ ...s.track, background: on ? 'var(--brand-orange)' : 'oklch(0.32 0.025 272)' }}
    >
      <motion.span
        style={s.knob}
        animate={{ x: on ? 18 : 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 30 }}
      />
    </button>
  )
}

export default function SourcesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const [states, setStates] = useState(() => ROWS.map(r => r.on))

  return (
    <section style={s.section} id="sources" ref={ref}>
      <div style={s.inner}>
        <motion.div
          style={s.copy}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="dark">Control</Eyebrow>
          <h2 style={s.heading}>Your sources. Your rules.</h2>
          <p style={s.body}>
            You set the wires, outlets, feeds, and accounts NewsLabs draws from. NewsLabs reads
            only what you connect. Source rights are configured per newsroom and respected by
            jurisdiction.
          </p>
        </motion.div>

        <motion.div
          style={s.panel}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
        >
          <div style={s.panelHead}>
            <span style={s.panelTitle}>Connected sources</span>
            <span style={s.panelHint}>Toggle what the engine reads</span>
          </div>
          {ROWS.map((row, i) => (
            <div key={row.name} style={s.row}>
              <span style={s.rowCat}>{row.cat}</span>
              <span style={s.rowName}>{row.name}</span>
              <Toggle on={states[i]} reduce={reduce} onClick={() => setStates(st => st.map((v, j) => (j === i ? !v : v)))} />
            </div>
          ))}
        </motion.div>
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'clamp(36px, 5vw, 64px)',
  },
  copy: {
    flex: '1 1 360px',
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
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 18px)',
    lineHeight: 1.6,
    color: 'var(--dark-muted)',
    margin: 0,
    maxWidth: '52ch',
  },
  panel: {
    flex: '1 1 360px',
    maxWidth: '460px',
    background: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(18px, 2vw, 26px)',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '6px 14px',
    paddingBottom: '14px',
    marginBottom: '6px',
    borderBottom: '1px solid var(--dark-border)',
  },
  panelTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--cream)',
  },
  panelHint: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12.5px',
    color: 'var(--dark-muted)',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '78px 1fr auto',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 0',
    borderBottom: '1px solid oklch(0.27 0.025 272)',
  },
  rowCat: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10.5px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--brand-orange)',
  },
  rowName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14.5px',
    fontWeight: 500,
    color: 'var(--cream)',
  },
  track: {
    position: 'relative',
    width: '44px',
    height: '26px',
    borderRadius: '999px',
    border: 'none',
    padding: '3px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 200ms var(--ease-out)',
  },
  knob: {
    display: 'block',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  },
}
