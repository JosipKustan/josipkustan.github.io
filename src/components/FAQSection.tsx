import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { Tombstone } from './vintage/VintageKit'

// FAQ reimagined as a printed Q&A / interview column ("On the record").
// Each entry is a newspaper item: a section number in the gutter, the question
// set as a Mozilla Text headline, a thin burnt-orange rule that *draws in* from
// the left beneath it, and the answer as a Source Serif editorial column led by
// a drop-cap. Closed entries are flat, ruled rows on the cream canvas; the open
// entry lifts onto a sheet of white "paper" with a soft, ink-tinted shadow — the
// row morphs into a card (border-radius + lift animate together). Refined
// exponential easing, a single controlled spring on the +/× mark, no bounce.
// Multiple panels can be open at once. Reduced-motion → instant open/close, no
// draw / lift / stagger.

export type Block = { p: string } | { list: string[] }
export type Faq = { q: string; a: Block[] }

const FAQS: Faq[] = [
  {
    q: 'What is NewsLabs and who is it for?',
    a: [
      {
        p: 'NewsLabs is an AI-powered newsroom assistant designed specifically for journalists, editors, and editorial teams. It helps reporters research, structure, draft, and optimize news articles faster, without compromising accuracy or editorial standards.',
      },
      {
        p: "Whether you're a digital-first newsroom, a legacy publisher, or a niche vertical publication, NewsLabs is built to support professional journalistic workflows.",
      },
    ],
  },
  {
    q: 'How does NewsLabs ensure accuracy and prevent misinformation?',
    a: [
      { p: 'Accuracy is at the core of NewsLabs. The platform is built to:' },
      {
        list: [
          'Work with trusted sources and newsroom-approved inputs',
          'Provide transparent references and source traceability',
          'Assist with fact-checking and consistency checks',
          'Allow full editorial oversight before publication',
        ],
      },
      {
        p: 'NewsLabs supports responsible journalism by giving teams control, visibility, and final approval at every stage.',
      },
    ],
  },
  {
    q: 'How easily is NewsLabs implemented?',
    a: [
      {
        p: 'There is little to no implementation required for NewsLabs to start adding value to your team. Particular features might need certain inputs from you, but the entire setup is handled by our internal team.',
      },
    ],
  },
  {
    q: 'Does NewsLabs integrate with our existing newsroom systems?',
    a: [
      {
        p: 'Yes. NewsLabs is designed to integrate seamlessly into your editorial workflow and can be connected with your CMS environments. However, it can also be used independently without any direct integration with existing systems.',
      },
    ],
  },
]

// ease-out-quint — natural deceleration, no overshoot.
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// First letter of the lead paragraph becomes a floated serif drop-cap. The text
// stays one contiguous string for screen readers ("N" + "ewsLabs…" = "NewsLabs…").
function LeadParagraph({ text, tail }: { text: string; tail?: ReactNode }) {
  return (
    <p style={styles.paragraph}>
      <span style={styles.dropcap}>{text.slice(0, 1)}</span>
      {text.slice(1)}
      {tail}
    </p>
  )
}

function Answer({ blocks }: { blocks: Block[] }) {
  const last = blocks.length - 1
  const lastIsList = 'list' in blocks[last]
  return (
    <div style={styles.answer} className="faq-answer">
      {blocks.map((b, i) =>
        'list' in b ? (
          <ul key={i} style={styles.list}>
            {b.list.map((li, j) => (
              <li key={j} style={styles.listItem}>
                <span style={styles.marker} aria-hidden />
                <span>{li}</span>
              </li>
            ))}
          </ul>
        ) : i === 0 ? (
          // Drop-cap lead; if it's also the only block, it carries the end-mark.
          <LeadParagraph key={i} text={b.p} tail={i === last ? <Tombstone tone="light" /> : undefined} />
        ) : (
          <p key={i} style={styles.paragraph}>
            {b.p}
            {/* End-of-article mark closes the final paragraph (cap-to-tombstone). */}
            {i === last && <Tombstone tone="light" />}
          </p>
        ),
      )}
      {/* If the answer ends on a list, trail the mark after it instead. */}
      {lastIsList && <Tombstone tone="light" />}
    </div>
  )
}

function Item({ faq, index, reduce }: { faq: Faq; index: number; reduce: boolean }) {
  const [open, setOpen] = useState(index === 0)
  const panelId = `faq-panel-${index}`
  const qId = `faq-q-${index}`
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      className="faq-item"
      data-open={open}
      style={{ ...styles.item, ...(open ? styles.itemOpen : null) }}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    >
      <button
        type="button"
        className="faq-trigger"
        style={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
      >
        <span className="faq-num" style={styles.num} aria-hidden>
          {num}
        </span>
        <span id={qId} style={styles.question}>
          {faq.q}
        </span>
        <motion.span
          className="faq-icon"
          style={styles.icon}
          animate={{ rotate: open ? 45 : 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={qId}
            style={styles.panel}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: EASE }}
          >
            <div style={styles.panelInner}>
              <motion.div
                style={styles.rule}
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={reduce ? undefined : { scaleX: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.04 }}
              />
              <Answer blocks={faq.a} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// `faqs` is parameterized so both pages reuse this signature "On the record."
// column (homepage default; the Platform page passes its own platform-level Q&A).
export default function FAQSection({ faqs = FAQS }: { faqs?: Faq[] } = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  return (
    <section style={styles.section} id="faq" className="vk-paper" ref={ref}>
      <style>{CSS}</style>
      <div style={styles.inner}>
        <motion.header
          style={styles.header}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <h2 style={styles.heading}>On the record.</h2>
          <p style={styles.standfirst}>
            The questions every newsroom asks before they run with NewsLabs, answered straight.
          </p>
        </motion.header>

        <div style={styles.cards}>
          {faqs.map((faq, i) => (
            <Item key={i} faq={faq} index={i} reduce={reduce} />
          ))}
        </div>

        <motion.div
          style={styles.signoffRow}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p style={styles.signoff}>
            Off the record, we&rsquo;d tell you the same thing.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// State-dependent colour + hover/focus/selection live here: things inline styles
// can't express. Layout and spacing stay inline (matches the rest of the site).
const CSS = `
  .faq-trigger { -webkit-tap-highlight-color: transparent; }
  .faq-trigger:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 4px;
    border-radius: var(--radius-md);
  }
  .faq-num { color: rgba(20, 24, 42, 0.34); transition: color 220ms var(--ease-out); }
  .faq-icon { color: rgba(20, 24, 42, 0.40); transition: color 200ms var(--ease-out); }
  .faq-trigger:hover .faq-num { color: rgba(20, 24, 42, 0.62); }
  .faq-trigger:hover .faq-icon { color: var(--ink); }
  .faq-item[data-open="true"] .faq-num { color: var(--accent); }
  .faq-item[data-open="true"] .faq-icon { color: var(--ink); }
  .faq-answer ::selection { background: rgba(192, 91, 0, 0.20); }
`

const styles: Record<string, React.CSSProperties> = {
  section: {
    background: 'var(--background)',
    padding: 'var(--section-py) var(--section-px)',
  },
  inner: {
    maxWidth: '820px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(26px, 4.5vw, 40px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  eyebrowDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(34px, 5.2vw, 56px)',
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    margin: 0,
    lineHeight: 1.0,
  },
  standfirst: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(16px, 1.9vw, 19px)',
    lineHeight: 1.5,
    color: 'rgba(20, 24, 42, 0.58)',
    margin: '2px 0 0',
    maxWidth: '46ch',
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    // Editorial entries, each opened by a hairline rule; a small gap keeps the
    // lifted white "sheets" from butting together when more than one is open.
    gap: 'clamp(12px, 1.6vw, 16px)',
  },
  item: {
    // gutter for the section number + horizontal padding, shared by the trigger
    // row and the answer column so the answer aligns under the question.
    ['--faq-gutter' as string]: 'clamp(34px, 5vw, 46px)',
    ['--faq-pad-x' as string]: 'clamp(20px, 3vw, 30px)',
    position: 'relative',
    borderTop: '1px solid rgba(20, 24, 42, 0.10)',
    borderRadius: '0px',
    background: 'transparent',
    transition:
      'background 260ms var(--ease-out), box-shadow 320ms var(--ease-out), border-color 200ms var(--ease-out), border-radius 260ms var(--ease-out)',
  },
  itemOpen: {
    background: '#ffffff',
    borderTopColor: 'transparent',
    borderRadius: 'var(--radius-lg)',
    boxShadow:
      '0 18px 44px -14px rgba(20, 24, 42, 0.18), 0 4px 12px -6px rgba(20, 24, 42, 0.10)',
  },
  trigger: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'var(--faq-gutter) 1fr auto',
    alignItems: 'start',
    columnGap: '16px',
    padding: 'clamp(20px, 2.6vw, 27px) var(--faq-pad-x)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  num: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(12px, 1.4vw, 14px)',
    fontWeight: 500,
    letterSpacing: '0.04em',
    fontVariantNumeric: 'tabular-nums',
    paddingTop: 'clamp(3px, 0.5vw, 6px)',
  },
  question: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2.2vw, 23px)',
    letterSpacing: '-0.01em',
    color: 'var(--ink)',
    lineHeight: 1.26,
    margin: 0,
  },
  icon: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    paddingTop: '3px',
  },
  panel: {
    overflow: 'hidden',
  },
  panelInner: {
    paddingTop: 0,
    paddingRight: 'var(--faq-pad-x)',
    paddingBottom: 'clamp(22px, 3vw, 30px)',
    paddingLeft: 'calc(var(--faq-pad-x) + var(--faq-gutter) + 16px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rule: {
    width: '48px',
    height: '2px',
    borderRadius: '2px',
    background: 'var(--accent)',
    transformOrigin: 'left center',
  },
  answer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  paragraph: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(15.5px, 1.6vw, 17.5px)',
    lineHeight: 1.62,
    color: 'rgba(20, 24, 42, 0.72)',
    margin: 0,
  },
  dropcap: {
    float: 'left',
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    fontSize: '3.05em',
    lineHeight: 0.78,
    paddingTop: '0.06em',
    paddingRight: '0.09em',
    color: 'var(--accent)',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    gap: '12px',
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(15.5px, 1.6vw, 17.5px)',
    lineHeight: 1.5,
    color: 'rgba(20, 24, 42, 0.72)',
  },
  marker: {
    flexShrink: 0,
    width: '6px',
    height: '6px',
    marginTop: '0.5em',
    borderRadius: '1.5px',
    background: 'var(--accent)',
  },
  signoffRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  signoff: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: 'clamp(14px, 1.5vw, 16px)',
    lineHeight: 1.5,
    color: 'rgba(20, 24, 42, 0.48)',
    margin: 0,
  },
}
