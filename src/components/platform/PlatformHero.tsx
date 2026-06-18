import { type CSSProperties } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 2 hero. Defines the product in one line: one engine,
// many workflows, editor in control. Dark surface, no product UI — the visual is
// an abstract schematic (sources → engine → draft → an editor decision gate).
//
// Framer note: dark Frame, top padding clears the fixed 64px nav. Left = eyebrow
// (Inter caps, orange) + Mozilla Text H1 + Inter sub + a two-CTA pair (orange
// "Book a demo" + ghost "See all workflows →"). Right = a vertical schematic
// panel (source chips → glowing engine node → draft card → editor gate), built
// from Frames + dashed connectors. Stagger the stages in on Appear; honour
// reduced-motion (show at rest).
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const SOURCES = ['Wires', 'Socials', 'Your data']

function Connector({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <motion.div
      style={sc.connector}
      initial={reduce ? false : { opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.3, delay, ease: EASE }}
      aria-hidden
    >
      <span style={sc.connectorLine} />
      <span style={sc.connectorHead} />
    </motion.div>
  )
}

export default function PlatformHero() {
  const reduce = useReducedMotion() ?? false

  const stage: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.35 + i * 0.12, ease: EASE },
    }),
  }

  return (
    <section style={s.section} id="platform-hero">
      <div style={s.inner}>
        {/* Copy */}
        <div style={s.copy}>
          <motion.span
            style={s.eyebrow}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            The platform
          </motion.span>
          <motion.h1
            style={s.heading}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
          >
            Your production desk, handled.
          </motion.h1>
          <motion.p
            style={s.sub}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
          >
            NewsLabs reads the sources you choose, drafts the routine work, and shows where every
            claim came from. The editor decides what publishes.
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
              href="#/workflows"
              style={s.secondary}
              className="ph-secondary"
              whileHover={reduce ? undefined : { x: 3 }}
            >
              See all workflows →
            </motion.a>
          </motion.div>
        </div>

        {/* Schematic: sources → engine → draft → editor gate */}
        <div style={s.diagram} aria-hidden>
          <motion.div style={sc.sources} custom={0} variants={stage} initial={reduce ? false : 'hidden'} animate="show">
            {SOURCES.map(src => (
              <span key={src} style={sc.sourceChip}>{src}</span>
            ))}
          </motion.div>

          <Connector reduce={reduce} delay={0.5} />

          <motion.div style={sc.engine} custom={1} variants={stage} initial={reduce ? false : 'hidden'} animate="show">
            {!reduce && (
              <motion.span
                style={sc.engineRing}
                animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            <img src="/assets/mark-cream.svg" alt="" style={sc.engineMark} />
            <span style={sc.engineLabel}>NewsLabs engine</span>
          </motion.div>

          <Connector reduce={reduce} delay={0.7} />

          <motion.div style={sc.draft} custom={2} variants={stage} initial={reduce ? false : 'hidden'} animate="show">
            <span style={sc.draftTag}>Draft</span>
            <span style={sc.draftLine} />
            <span style={{ ...sc.draftLine, width: '78%' }} />
            <span style={{ ...sc.draftLine, width: '88%' }} />
          </motion.div>

          <Connector reduce={reduce} delay={0.9} />

          <motion.div style={sc.gate} custom={3} variants={stage} initial={reduce ? false : 'hidden'} animate="show">
            <span style={sc.gateLabel}>Editor decides</span>
            <span style={sc.gateActions}>
              <span style={{ ...sc.gatePill, ...sc.gateApprove }}>Approve</span>
              <span style={{ ...sc.gatePill, ...sc.gateReject }}>Reject</span>
            </span>
          </motion.div>
        </div>
      </div>
      <style>{CSS}</style>
    </section>
  )
}

const CSS = `
  .ph-secondary { transition: color 160ms var(--ease-out); }
  .ph-secondary:hover { color: #ffffff; }
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
    maxWidth: '14ch',
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
    maxWidth: '420px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}

const sc: Record<string, CSSProperties> = {
  sources: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
  },
  sourceChip: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F1EB 100%)',
    border: '1px solid rgba(20,24,42,0.10)',
    color: 'var(--ink)',
    borderRadius: '10px',
    padding: '8px 14px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '13px',
    lineHeight: 1,
    boxShadow: '0 3px 10px rgba(0,0,0,0.22)',
  },
  connector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '34px',
    transformOrigin: 'top center',
  },
  connectorLine: {
    width: '2px',
    flex: 1,
    background: 'repeating-linear-gradient(to bottom, var(--brand-orange) 0 4px, transparent 4px 9px)',
  },
  connectorHead: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '6px solid var(--brand-orange)',
  },
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
  draft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    width: '210px',
    padding: '16px 18px',
    background: 'var(--cream)',
    borderRadius: '12px',
    boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
  },
  draftTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  draftLine: {
    width: '100%',
    height: '7px',
    borderRadius: '4px',
    background: 'rgba(20,24,42,0.14)',
  },
  gate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '210px',
    padding: '16px 18px',
    background: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: '12px',
  },
  gateLabel: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '13.5px',
    color: 'var(--cream)',
  },
  gateActions: { display: 'flex', gap: '8px' },
  gatePill: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '12px',
    padding: '6px 12px',
    borderRadius: '999px',
  },
  gateApprove: { background: 'var(--brand-orange)', color: 'var(--ink)' },
  gateReject: { background: 'transparent', color: 'var(--dark-muted)', border: '1px solid var(--dark-border)' },
}
