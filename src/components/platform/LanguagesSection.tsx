import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 9, "Built for more than one language." Translation and
// localization are first-class, not bolted on (a European multilingual market).
// Language is a property of every source, draft, and claim. Dark surface.
//
// Visual: a row of language chips (EN, DE, FR, ES, PL, IT) over a faint backdrop.
//
// Framer note: dark Frame (faint dot grid). Header (Mozilla H2 + Inter body), then
// a centred wrap of language chips (dark-card fill, navy border, mono code +
// language name). For the spec's "faint Europe outline", drop a low-opacity Europe
// SVG behind the chips. Scroll-in: stagger the chips in.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const LANGS: { code: string; name: string }[] = [
  { code: 'EN', name: 'English' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'ES', name: 'Español' },
  { code: 'PL', name: 'Polski' },
  { code: 'IT', name: 'Italiano' },
]

export default function LanguagesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }
  const chip: Variants = {
    hidden: { opacity: 0, y: 14, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 24 } },
  }

  return (
    <section style={s.section} id="languages" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="dark">Languages</Eyebrow>
          <h2 style={s.heading}>Built for more than one language.</h2>
          <p style={s.body}>
            Language is a property of every source, every draft, every claim. NewsLabs translates
            and localizes, and holds your voice across languages.
          </p>
        </motion.header>

        <motion.div
          style={s.chips}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {LANGS.map(l => (
            <motion.span key={l.code} style={s.chip} variants={reduce ? undefined : chip}>
              <span style={s.chipCode}>{l.code}</span>
              <span style={s.chipName}>{l.name}</span>
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: {
    position: 'relative',
    background: 'var(--ink)',
    padding: 'var(--section-py) var(--section-px)',
    backgroundImage: 'radial-gradient(rgba(249,247,244,0.05) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  },
  inner: {
    position: 'relative',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'clamp(28px, 4vw, 44px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    maxWidth: 640,
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
    maxWidth: '54ch',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: '999px',
    padding: '10px 18px 10px 12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
  },
  chipCode: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--brand-blue)',
    color: '#fff',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  chipName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--cream)',
  },
}
