import { useRef, type CSSProperties, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { LayoutGrid, Database, Languages, LifeBuoy } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Pricing page — block 4. "What your price is built on." A scannable four-up row
// of value cards: what drives the number, all of it set by the newsroom. No prices.
// Light cream surface.
//
// Framer note: cream Frame (paper grain), --section padding. Left-aligned header
// (Mozilla H2 + Inter sub). Auto-grid of four cards (cream fill, border): a
// brand-blue icon disc (Lucide 24px), a Mozilla H3, an Inter 2-sentence body.
// Scroll-in: stagger the cards (fade + y); hover y:-3. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const CARDS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <LayoutGrid size={22} strokeWidth={1.6} />,
    title: 'The workflows you run.',
    body: "Pick the workflows your newsroom needs. You don't pay for the ones you don't.",
  },
  {
    icon: <Database size={22} strokeWidth={1.6} />,
    title: 'Your sources and volume.',
    body: "Price scales with the sources you connect and the drafts you produce. Start small, grow when you're ready.",
  },
  {
    icon: <Languages size={22} strokeWidth={1.6} />,
    title: 'The languages you cover.',
    body: 'Translation and localization scale with the languages your newsroom works in.',
  },
  {
    icon: <LifeBuoy size={22} strokeWidth={1.6} />,
    title: 'The support you want.',
    body: 'Onboarding and a named contact are included. Add deeper help if your team wants it.',
  },
]

export default function PriceBuiltOnSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  }
  const card: Variants = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="price-built-on" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <h2 style={s.heading}>What your price is built on.</h2>
          <p style={s.sub}>A handful of things shape the number. All of them are yours to set.</p>
        </motion.header>

        <motion.div
          style={s.grid}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {CARDS.map(c => (
            <motion.article
              key={c.title}
              style={s.card}
              variants={reduce ? undefined : card}
              whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
            >
              <span style={s.iconDisc}>{c.icon}</span>
              <h3 style={s.cardTitle}>{c.title}</h3>
              <p style={s.cardBody}>{c.body}</p>
            </motion.article>
          ))}
        </motion.div>
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
    color: 'var(--foreground)',
    margin: 0,
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 1.7vw, 18px)',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    background: 'var(--card)',
    border: '1px solid rgba(20, 24, 42, 0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(24px, 2.8vw, 32px)',
    boxShadow: 'var(--shadow-sm)',
  },
  iconDisc: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '46px',
    height: '46px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(20, 81, 206, 0.08)',
    color: 'var(--primary)',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2vw, 22px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    color: 'var(--foreground)',
    margin: 0,
  },
  cardBody: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14.5px',
    lineHeight: 1.55,
    color: 'var(--muted-foreground)',
    margin: 0,
  },
}
