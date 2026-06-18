import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Check } from 'lucide-react'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Pricing page — block 5. "Included for every newsroom." Reassures that core value
// isn't gated behind a higher tier: control and traceability are the product, not
// an upsell. Dark ink surface, a two-column brand-blue checklist.
//
// Framer note: ink Frame, --section padding. Orange mono Eyebrow + Mozilla H2 +
// short Inter standfirst. Below it a two-column checklist; each row = a brand-blue
// (#4B65FF) check disc + cream Inter text. Add a Phone breakpoint (≤720px) that
// collapses to one column. Scroll-in: stagger the rows (fade + y). Honour
// reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const ITEMS = [
  'The editor decides on every draft',
  'Every claim traced to its source',
  'Sources you choose, respected by jurisdiction',
  "Your newsroom's voice in every draft",
  'Onboarding on your own setup',
  'A named contact for setup and questions',
]

export default function IncludedSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  }
  const row: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  }

  return (
    <section style={s.section} id="included" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="dark">Included as standard</Eyebrow>
          <h2 style={s.heading}>Included for every newsroom.</h2>
          <p style={s.sub}>The essentials aren't gated behind a higher tier.</p>
        </motion.header>

        <motion.ul
          style={s.list}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {ITEMS.map(item => (
            <motion.li key={item} style={s.item} variants={reduce ? undefined : row}>
              <span style={s.checkDisc}><Check size={15} strokeWidth={2.6} /></span>
              {item}
            </motion.li>
          ))}
        </motion.ul>
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
    gap: 'clamp(32px, 4vw, 48px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    maxWidth: '640px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
    margin: 0,
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 1.7vw, 18px)',
    lineHeight: 1.55,
    color: 'var(--dark-muted)',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
    gap: 'clamp(14px, 1.8vw, 20px) clamp(20px, 3vw, 44px)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 1.7vw, 17px)',
    fontWeight: 500,
    lineHeight: 1.4,
    color: 'var(--cream)',
    paddingBottom: 'clamp(14px, 1.8vw, 20px)',
    borderBottom: '1px solid var(--dark-border)',
  },
  checkDisc: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'rgba(75, 101, 255, 0.16)',
    color: 'var(--brand-blue)',
    flexShrink: 0,
  },
}
