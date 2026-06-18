import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'
import { useIsMobile } from '../../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 10, "Fits the way you publish." The integration answer
// B2B buyers look for, kept honest: NewsLabs connects to your sources and hands
// approved drafts to your CMS. It doesn't replace your CMS, and it doesn't own the
// publish step. Light surface.
//
// Visual: sources → engine → CMS, connectors labelled "connects to" /
// "hands approved drafts". Link routes to Talk to our team.
//
// Framer note: cream Frame, header (Mozilla H2 + Inter body), then a 3-node
// schematic (Your sources / NewsLabs engine / Your CMS) joined by labelled arrows
// (horizontal on desktop, vertical stack on phones), then an "Ask about an
// integration →" brand-blue link. No vendor logos unless confirmed.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const NODES: { label: string; sub: string; kind: 'side' | 'engine' }[] = [
  { label: 'Your sources', sub: 'Wires · outlets · social · video', kind: 'side' },
  { label: 'NewsLabs engine', sub: 'Drafts · traces · reviews', kind: 'engine' },
  { label: 'Your CMS', sub: 'You own the publish step', kind: 'side' },
]
const ARROW_LABELS = ['connects to', 'hands approved drafts']

export default function IntegrationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, delay: reduce ? 0 : delay, ease: EASE },
  })

  return (
    <section style={s.section} id="integration" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header style={s.header} {...reveal(0)}>
          <Eyebrow tone="light">Integration</Eyebrow>
          <h2 style={s.heading}>Fits the way you publish.</h2>
          <p style={s.body}>
            NewsLabs connects to the sources you already use and hands approved drafts to your
            newsroom's CMS. It doesn't replace your CMS, and it doesn't own the publish step.
          </p>
        </motion.header>

        <motion.div style={{ ...s.flow, flexDirection: isMobile ? 'column' : 'row' }} {...reveal(0.12)}>
          {NODES.map((n, i) => (
            <div key={n.label} style={{ ...s.flowItem, flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ ...s.node, ...(n.kind === 'engine' ? s.nodeEngine : s.nodeSide) }}>
                {n.kind === 'engine' && <img src="/assets/mark-cream.svg" alt="" style={s.engineMark} aria-hidden />}
                <span style={{ ...s.nodeLabel, ...(n.kind === 'engine' ? s.nodeLabelEngine : null) }}>{n.label}</span>
                <span style={{ ...s.nodeSub, ...(n.kind === 'engine' ? s.nodeSubEngine : null) }}>{n.sub}</span>
              </div>
              {i < NODES.length - 1 && (
                <span style={{ ...s.arrowWrap, flexDirection: isMobile ? 'row' : 'column' }} aria-hidden>
                  <span style={{ ...s.arrowGlyph, transform: isMobile ? 'rotate(90deg)' : 'none' }}>→</span>
                  <span style={s.arrowLabel}>{ARROW_LABELS[i]}</span>
                </span>
              )}
            </div>
          ))}
        </motion.div>

        <motion.a
          href="#contact"
          style={s.link}
          {...reveal(0.22)}
          whileHover={reduce ? undefined : { x: 3 }}
        >
          Ask about an integration →
        </motion.a>
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
    gap: 'clamp(32px, 4.5vw, 48px)',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', maxWidth: 680 },
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
    maxWidth: '60ch',
  },
  flow: { display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 0 },
  flowItem: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  node: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '6px',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(22px, 2.6vw, 30px)',
    minHeight: '116px',
  },
  nodeSide: {
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    boxShadow: 'var(--shadow-sm)',
  },
  nodeEngine: {
    background: 'linear-gradient(150deg, var(--brand-blue), var(--primary))',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 0 40px rgba(75,101,255,0.3), 0 12px 28px rgba(20,24,42,0.18)',
  },
  engineMark: { width: '30px', height: 'auto', marginBottom: '2px' },
  nodeLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
  },
  nodeLabelEngine: { color: '#fff' },
  nodeSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: 'var(--muted-foreground)',
  },
  nodeSubEngine: { color: 'rgba(255,255,255,0.85)' },
  arrowWrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 6px',
  },
  arrowGlyph: {
    color: 'var(--brand-orange)',
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1,
  },
  arrowLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10.5px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    whiteSpace: 'nowrap',
  },
  link: {
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--primary)',
    textDecoration: 'none',
  },
}
