import { useRef } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// The pain — block 3 of the IA. BOLD, QUICK, RESOLUTE: name the problem in the
// buyer's own words and land it fast. Three movements on the dark ink surface:
//   1. Scene  — Mozilla Text H2 ("The newsroom day, before NewsLabs.").
//   2. Grind  — one staccato Inter line listing where the day goes.
//   3. Turn   — the cost (first clause muted, the loss in full cream).
//   4. Resolve — the close ("That ends here.") with the orange-underlined "here.".
//
// Trimmed to three punchy sentences: the day, the cost, the close. The numbered
// grind is now one comma-spliced line; the standalone thesis ("it needed a
// machine") is gone, leaving the two strongest lines to carry the block.
//
// Framer note: dark ink Frame, --section padding, left-aligned max-width column.
// Mozilla Text H2, then a Stack that staggers in (fade + y 18px): the grind line
// (Inter 600, tight), a consequence line (first clause muted, the loss in full
// cream), and the close in Mozilla Text with the orange-underlined "here.". Add
// top margins before the consequence and close to break the movements apart.
// Honour reduced-motion (show at rest).
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const scrollToNext = () => {
    document
      .getElementById('workflows')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  }

  return (
    <section style={styles.section} id="pain" ref={ref}>
      <div style={styles.inner}>
        <motion.h2
          style={styles.heading}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          The newsroom day, before NewsLabs.
        </motion.h2>

        <motion.div
          style={styles.flow}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          <motion.p style={styles.line} variants={reduce ? undefined : item}>
            Five stories to file, an hour lost to social, thirty minutes down the wires.
          </motion.p>

          <motion.p style={styles.consequence} variants={reduce ? undefined : item}>
            <span style={styles.consequenceMuted}>The grind eats the day, </span>
            and the story only you could write never gets started.
          </motion.p>

          <motion.p style={styles.close} variants={reduce ? undefined : item}>
            That ends{' '}
            <span
              style={styles.closeAccent}
              role="button"
              tabIndex={0}
              onClick={scrollToNext}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  scrollToNext()
                }
              }}
            >
              here.
            </span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    background: 'var(--ink)',
    padding: 'var(--section-py) var(--section-px)',
  },
  inner: {
    maxWidth: '920px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    gap: 'clamp(24px, 3.5vw, 40px)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 4vw, 46px)',
    lineHeight: 1.05,
    letterSpacing: '-0.025em',
    color: 'var(--cream)',
    margin: 0,
    maxWidth: '18ch',
  },
  flow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'clamp(6px, 1vw, 12px)',
  },
  line: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 'clamp(18px, 2.6vw, 30px)',
    lineHeight: 1.22,
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
    margin: 0,
    maxWidth: '30ch',
  },
  consequence: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 'clamp(18px, 2.6vw, 30px)',
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
    margin: 0,
    marginTop: 'clamp(20px, 3vw, 34px)',
    maxWidth: '26ch',
  },
  consequenceMuted: {
    // Bumped from 0.55 → 0.74 L so it clears WCAG AAA (7:1) on the ink section
    // background (#14182A). Was 3.62:1 (AA-large only); now 7.63:1.
    color: 'oklch(0.74 0.02 85)',
  },
  close: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 4.2vw, 48px)',
    lineHeight: 1.0,
    letterSpacing: '-0.025em',
    color: 'var(--cream)',
    margin: 0,
    marginTop: 'clamp(22px, 3vw, 36px)',
  },
  closeAccent: {
    color: 'var(--cream)',
    borderBottom: '4px solid var(--brand-orange)',
    paddingBottom: '2px',
    cursor: 'pointer',
  },
}
