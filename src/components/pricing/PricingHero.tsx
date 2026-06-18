import { type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Eye, PenLine, Languages, Mic, SearchCheck, Plus, Check } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Pricing page — block 2 hero + "Build your package" panel (Stripe's hero-left,
// package-right layout). States that pricing is custom and why, with the package
// panel right beside it.
//
// Surface note: the spec calls for a LIGHT hero, but every page on this site leads
// with a dark hero and the shared Navbar is transparent with cream links over it
// (only going ink on scroll) — a cream hero would make the nav unreadable at the
// top. So this hero stays dark (ink + dot-grid, matching PlatformHero) and the
// "package" panel is a cream card that pops off it. The rest of the page uses the
// spec's light/dark surfaces. (Flagged in CLAUDE.md.)
//
// Price-free by rule: the panel sells scope + support, never a number.
//
// Framer note: dark Frame, top padding clears the fixed 64px nav, two-column flex.
// Left = eyebrow (Inter caps orange) + Mozilla H1 + Inter body + a two-CTA pair
// (orange "Book a demo" + ghost "Talk to our team"). Right = a cream card: H3
// title, caption, a two-column workflow list (Lucide icons), a divider, a
// "What's included" caption, then a brand-blue checklist. Stagger the copy in on
// Appear; fade/rise the panel. Honour reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const WORKFLOWS: { label: string; icon: ReactNode }[] = [
  { label: 'Watch the sources', icon: <Eye size={17} strokeWidth={1.6} /> },
  { label: 'Draft the story', icon: <PenLine size={17} strokeWidth={1.6} /> },
  { label: 'Translate and localize', icon: <Languages size={17} strokeWidth={1.6} /> },
  { label: 'Transcription', icon: <Mic size={17} strokeWidth={1.6} /> },
  { label: 'Source checking', icon: <SearchCheck size={17} strokeWidth={1.6} /> },
  { label: 'and more', icon: <Plus size={17} strokeWidth={1.6} /> },
]

const INCLUDED = [
  'Onboarding on your own sources and workflows',
  'A named contact for setup and questions',
  'Editor controls and traceability on every draft',
]

export default function PricingHero() {
  const reduce = useReducedMotion() ?? false

  const copyItem = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: reduce ? 0 : delay, ease: EASE },
  })

  const listStagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.5 } },
  }
  const listRow: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  }

  return (
    <section style={s.section} id="pricing-hero">
      <div style={s.inner}>
        {/* Copy */}
        <div style={s.copy}>
          <motion.span style={s.eyebrow} {...copyItem(0)}>
            Custom pricing
          </motion.span>
          <motion.h1 style={s.heading} {...copyItem(0.08)}>
            Priced around your newsroom.
          </motion.h1>
          <motion.p style={s.body} {...copyItem(0.22)}>
            Our focus is partnership, not just a service. We adapt to your newsroom and help your
            team move to new workflows. You pay for the work you actually run, with no tiers to outgrow.
          </motion.p>
          <motion.div style={s.ctaRow} {...copyItem(0.34)}>
            <motion.a
              href="#demo"
              style={s.primary}
              whileHover={reduce ? undefined : { backgroundColor: 'oklch(0.82 0.18 58.3)', scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              Book a demo
            </motion.a>
            <motion.a
              href="#contact"
              style={s.secondary}
              className="prh-secondary"
              whileHover={reduce ? undefined : { x: 3 }}
            >
              Talk to our team
            </motion.a>
          </motion.div>
        </div>

        {/* Build-your-package panel */}
        <motion.div
          style={s.panel}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.3, ease: EASE }}
        >
          <h2 style={s.panelTitle}>Build your package.</h2>
          <p style={s.panelSub}>Work with our team to scope what your newsroom needs:</p>

          <motion.ul
            style={s.workflowList}
            variants={reduce ? undefined : listStagger}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            {WORKFLOWS.map(w => (
              <motion.li
                key={w.label}
                style={{ ...s.workflowItem, ...(w.label === 'and more' ? s.workflowItemMuted : null) }}
                variants={reduce ? undefined : listRow}
              >
                <span style={s.workflowIcon}>{w.icon}</span>
                {w.label}
              </motion.li>
            ))}
          </motion.ul>

          <div style={s.divider} />

          <span style={s.includedLabel}>What's included</span>
          <ul style={s.includedList}>
            {INCLUDED.map(item => (
              <li key={item} style={s.includedItem}>
                <span style={s.checkIcon}><Check size={15} strokeWidth={2.5} /></span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      <style>{CSS}</style>
    </section>
  )
}

const CSS = `
  .prh-secondary { transition: color 160ms var(--ease-out); }
  .prh-secondary:hover { color: #ffffff; }
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
    flex: '1 1 380px',
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
    maxWidth: '12ch',
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 19px)',
    lineHeight: 1.55,
    color: 'rgba(249, 247, 244, 0.82)',
    margin: 0,
    maxWidth: '46ch',
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

  // ── Build-your-package panel (cream card on the dark hero) ──
  panel: {
    flex: '1 1 360px',
    maxWidth: '460px',
    margin: '0 auto',
    background: 'var(--card)',
    border: '1px solid rgba(20, 24, 42, 0.08)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(26px, 3vw, 36px)',
    boxShadow: '0 24px 60px -18px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  panelTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(21px, 2.4vw, 25px)',
    letterSpacing: '-0.01em',
    color: 'var(--foreground)',
    margin: 0,
  },
  panelSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    lineHeight: 1.5,
    color: 'var(--muted-foreground)',
    margin: '8px 0 20px',
  },
  workflowList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px 16px',
  },
  workflowItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--foreground)',
  },
  workflowItemMuted: {
    color: 'var(--muted-foreground)',
    fontStyle: 'italic',
  },
  workflowIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    background: 'rgba(20, 24, 42, 0.1)',
    margin: 'clamp(20px, 2.4vw, 26px) 0',
  },
  includedLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11.5px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    marginBottom: '14px',
  },
  includedList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
  },
  includedItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    lineHeight: 1.4,
    color: 'var(--foreground)',
  },
  checkIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)',
    flexShrink: 0,
    marginTop: '1px',
  },
}
