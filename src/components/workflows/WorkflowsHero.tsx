import { type CSSProperties } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Workflows page — block 2 hero. States the breadth in one line: one engine, many
// workflows, editor in control. Dark surface, no product UI — the visual is an
// abstract schematic of one engine fanning out into many labeled flows. Mirrors
// the PlatformHero structure (copy left, schematic right) so the pages match.
//
// Framer note: dark Frame, top padding clears the fixed 64px nav, faint dot-grid
// fill. Left = eyebrow (Inter caps, orange) + Mozilla H1 + Inter sub + a two-CTA
// pair (orange "Book a demo" + ghost "See the platform →"). Right = a glowing
// engine node with dashed rays fanning down to a row of labeled flow chips.
// Stagger the stages in on Appear; honour reduced-motion (show at rest).
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]
const FLOWS = ['Monitor', 'Draft', 'Translate', 'Transcribe', 'Verify']

export default function WorkflowsHero() {
  const reduce = useReducedMotion() ?? false

  const stage: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.35 + i * 0.12, ease: EASE } }),
  }

  return (
    <section style={s.section} id="workflows-hero">
      <div style={s.inner}>
        {/* Copy */}
        <div style={s.copy}>
          <motion.span
            style={s.eyebrow}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Workflows
          </motion.span>
          <motion.h1
            style={s.heading}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
          >
            Every routine job, drafted.
          </motion.h1>
          <motion.p
            style={s.sub}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
          >
            NewsLabs drafts the routine work across your desk. Your sources go in, a sourced
            draft comes out, your editor decides.
          </motion.p>
          <motion.div
            style={s.ctaRow}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.34, ease: EASE }}
          >
            <motion.a
              href="#demo"
              style={s.primary}
              whileHover={reduce ? undefined : { backgroundColor: 'oklch(0.82 0.18 58.3)', scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              Book a demo
            </motion.a>
            <motion.a
              href="#/platform"
              style={s.secondary}
              className="wh-secondary"
              whileHover={reduce ? undefined : { x: 3 }}
            >
              See the platform →
            </motion.a>
          </motion.div>
        </div>

        {/* Schematic: one engine fanning out into many labeled flows */}
        <div style={s.diagram} aria-hidden>
          <motion.div
            style={sc.engine}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          >
            {!reduce && (
              <motion.span
                style={sc.engineRing}
                animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            <img src="/assets/mark-cream.svg" alt="" style={sc.engineMark} />
            <span style={sc.engineLabel}>One engine</span>
          </motion.div>

          {/* Fan of dashed rays */}
          <motion.svg
            viewBox="0 0 300 70"
            preserveAspectRatio="none"
            style={sc.fan}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
          >
            {FLOWS.map((_, i) => {
              const x = ((i + 0.5) / FLOWS.length) * 300
              return (
                <path
                  key={i}
                  d={`M150 4 C150 36 ${x} 30 ${x} 66`}
                  stroke="var(--brand-orange)"
                  strokeWidth={1.4}
                  strokeDasharray="3 4"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </motion.svg>

          {/* Labeled flow chips */}
          <motion.div
            style={sc.flows}
            custom={1}
            variants={stage}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            {FLOWS.map(label => (
              <span key={label} style={sc.flowChip}>{label}</span>
            ))}
          </motion.div>
        </div>
      </div>
      <style>{CSS}</style>
    </section>
  )
}

const CSS = `
  .wh-secondary { transition: color 160ms var(--ease-out); }
  .wh-secondary:hover { color: #ffffff; }
`

const s: Record<string, CSSProperties> = {
  section: {
    position: 'relative',
    background: 'var(--ink)',
    padding: 'calc(64px + clamp(44px, 8vw, 88px)) var(--section-px) clamp(56px, 8vw, 100px)',
    backgroundImage: 'radial-gradient(rgba(249,247,244,0.05) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    overflow: 'hidden',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'clamp(36px, 5vw, 72px)',
  },
  copy: {
    flex: '1 1 420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '22px',
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--brand-orange)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(38px, 6vw, 76px)',
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
    color: 'var(--cream)',
    margin: 0,
    maxWidth: '13ch',
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 19px)',
    lineHeight: 1.55,
    color: 'rgba(249, 247, 244, 0.82)',
    margin: 0,
    maxWidth: '50ch',
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '14px 24px',
    marginTop: '6px',
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  secondary: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--cream)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  diagram: {
    flex: '1 1 320px',
    maxWidth: '440px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}

const sc: Record<string, CSSProperties> = {
  engine: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '150px',
    height: '92px',
    borderRadius: '16px',
    background: 'linear-gradient(150deg, var(--brand-blue), var(--primary))',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 0 48px rgba(75,101,255,0.4), 0 12px 30px rgba(0,0,0,0.45)',
  },
  engineRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '16px',
    border: '1.5px solid var(--brand-blue)',
    pointerEvents: 'none',
  },
  engineMark: { width: '34px', height: 'auto', display: 'block' },
  engineLabel: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '13px', color: '#fff', lineHeight: 1 },
  fan: { width: '100%', maxWidth: '360px', height: '60px', display: 'block' },
  flows: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: '6px',
    width: '100%',
    maxWidth: '360px',
  },
  flowChip: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F1EB 100%)',
    border: '1px solid rgba(20,24,42,0.10)',
    color: 'var(--ink)',
    borderRadius: '9px',
    padding: '7px 10px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '11.5px',
    lineHeight: 1,
    boxShadow: '0 3px 10px rgba(0,0,0,0.22)',
    whiteSpace: 'nowrap',
  },
}
