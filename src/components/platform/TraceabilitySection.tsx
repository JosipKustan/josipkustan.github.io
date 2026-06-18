import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'
import { useIsMobile } from '../../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 6, "Every claim shows its source." The trust mechanism,
// framed honestly: NewsLabs shows the source behind every claim; it does NOT
// verify truth. It makes the editor's check fast. (Framing rule: traceability,
// not fact-checking. Never call it a fact-checker.)
//
// Two columns: LEFT holds the section header (Eyebrow + Mozilla H2 + description)
// and the dark draft paragraph beneath it; RIGHT holds all three source cards,
// top-aligned beside the header so they fill the upper-right space. Claims are
// tinted by category and colour-matched to their source card (no hover, every
// source visible). On mobile the columns stack: header → draft → source cards.
// Continues the council road-repair story from the homepage cards.
//
// Framer note: cream Frame. A 2-col grid (left = header + draft, right = sources)
// that collapses to one column ≤720px, alignItems start. Draft + source cards are
// --dark-card Frames; claims = inline spans with a colour tint + matching bottom
// border; each source = category pill + cite + quote (evidence highlighted orange).
// ─────────────────────────────────────────────────────────────────────────────

type ClaimColor = 'blue' | 'orange' | 'brown'

// Each claim colour links a draft highlight to its source card and doubles as the
// category legend (blue = public record, orange = on the record, brown = open data).
const C: Record<ClaimColor, { tint: string; line: string; solid: string; onSolid: string; category: string }> = {
  blue:   { tint: 'rgba(75,101,255,0.24)', line: 'var(--brand-blue)',  solid: 'var(--brand-blue)',  onSolid: '#ffffff', category: 'Public record' },
  orange: { tint: 'rgba(255,140,0,0.26)',  line: 'var(--brand-orange)', solid: 'var(--brand-orange)', onSolid: '#14182A', category: 'On the record' },
  brown:  { tint: 'rgba(192,91,0,0.34)',   line: '#C05B00',            solid: '#C05B00',            onSolid: '#ffffff', category: 'Open data' },
}

type Run = { text: string } | { id: string; text: string; color: ClaimColor }

const DRAFT: Run[] = [
  { text: 'City council approved a ' },
  { id: 'budget', text: '$2.4 million budget', color: 'blue' },
  { text: ' for road repairs Thursday. Work will ' },
  { id: 'march', text: 'begin in March', color: 'orange' },
  { text: ', the public works director said, after residents reported a ' },
  { id: 'potholes', text: '30% jump in pothole complaints', color: 'brown' },
  { text: ' over the winter.' },
]

const SOURCES: { color: ClaimColor; cite: string; quote: string; evidence: string[] }[] = [
  {
    color: 'blue',
    cite: 'City Council Minutes, Apr 3, 2026 (PDF, p.4)',
    quote: 'Motion to allocate $2.4M from the capital fund for road resurfacing carried 6–1.',
    evidence: ['$2.4M', 'road resurfacing'],
  },
  {
    color: 'orange',
    cite: 'Public Works briefing, recording, 0:14:22',
    quote: '“We expect crews to break ground in early March, weather permitting.”',
    evidence: ['break ground in early March'],
  },
  {
    color: 'brown',
    cite: '311 Service Requests, Open Data Portal, Q1 2026',
    quote: 'Pothole reports rose 31% against the prior winter quarter.',
    evidence: ['rose 31%'],
  },
]

// Split a quote so the evidence substrings render orange-highlighted.
function highlightEvidence(quote: string, evidence: string[]) {
  const ranges: [number, number][] = []
  for (const e of evidence) {
    const i = quote.indexOf(e)
    if (i >= 0) ranges.push([i, i + e.length])
  }
  ranges.sort((a, b) => a[0] - b[0])
  const out: { text: string; hit: boolean }[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (start > cursor) out.push({ text: quote.slice(cursor, start), hit: false })
    out.push({ text: quote.slice(start, end), hit: true })
    cursor = end
  }
  if (cursor < quote.length) out.push({ text: quote.slice(cursor), hit: false })
  return out
}

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function TraceabilitySection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section style={s.section} id="traceability" className="vk-paper" ref={ref}>
      <motion.div
        style={{ ...s.inner, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(300px, 380px)' }}
        variants={reduce ? undefined : container}
        initial={reduce ? false : 'hidden'}
        animate={inView ? 'show' : reduce ? undefined : 'hidden'}
      >
        {/* Left: header + draft */}
        <div style={s.leftCol}>
          <motion.header style={s.header} variants={reduce ? undefined : item}>
            <Eyebrow tone="light">Traceability</Eyebrow>
            <h2 style={s.heading}>Every claim shows its source.</h2>
            <p style={s.body}>
              Every draft carries the sources behind it, and every claim links to where it came
              from. NewsLabs doesn't verify truth. It makes the editor's check fast.
            </p>
          </motion.header>

          <motion.div style={s.draft} variants={reduce ? undefined : item}>
            <span style={s.draftTag}>Draft</span>
            <p style={s.draftText}>
              {DRAFT.map((run, i) => {
                if (!('id' in run)) return <span key={i}>{run.text}</span>
                const c = C[run.color]
                return (
                  <span key={run.id} style={{ ...s.claim, background: c.tint, borderBottom: `2px solid ${c.line}` }}>
                    {run.text}
                  </span>
                )
              })}
            </p>
          </motion.div>
        </div>

        {/* Right: source cards (all three, top-aligned, no left border) */}
        <div style={s.sources}>
          {SOURCES.map(src => {
            const c = C[src.color]
            return (
              <motion.div key={src.color} style={s.sourceCard} variants={reduce ? undefined : item}>
                <span style={{ ...s.category, background: c.solid, color: c.onSolid }}>{c.category}</span>
                <span style={s.cite}>{src.cite}</span>
                <span style={s.divider} aria-hidden />
                <p style={s.quote}>
                  {highlightEvidence(src.quote, src.evidence).map((part, i) =>
                    part.hit
                      ? <mark key={i} style={s.evidence}>{part.text}</mark>
                      : <span key={i}>{part.text}</span>,
                  )}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
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
    display: 'grid',
    gap: 'clamp(20px, 3vw, 40px)',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(28px, 3.5vw, 44px)',
  },
  header: {
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
    maxWidth: '54ch',
  },
  // ── Draft paragraph (dark card) ──
  draft: {
    background: 'var(--dark-card)',
    border: '1px solid oklch(0.28 0.025 272)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(26px, 3vw, 38px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  draftTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'oklch(0.65 0.015 85)',
  },
  draftText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(18px, 2.1vw, 24px)',
    lineHeight: 1.75,
    color: 'var(--cream)',
    margin: 0,
  },
  claim: {
    borderRadius: '4px',
    padding: '1px 5px',
    color: 'var(--cream)',
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
  } as CSSProperties,
  // ── Source cards (dark, stacked, uniform border) ──
  sources: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sourceCard: {
    background: 'var(--dark-card)',
    border: '1px solid oklch(0.28 0.025 272)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },
  category: {
    alignSelf: 'flex-start',
    padding: '3px 9px',
    borderRadius: '5px',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  cite: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '13px',
    lineHeight: 1.4,
    color: 'oklch(0.68 0.015 85)',
  },
  divider: {
    height: '1px',
    background: 'oklch(0.3 0.025 272)',
  },
  quote: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14.5px',
    lineHeight: 1.55,
    color: 'oklch(0.86 0.01 85)',
    margin: 0,
  },
  evidence: {
    background: 'rgba(255,140,0,0.85)',
    color: '#14182A',
    borderRadius: '3px',
    padding: '0 3px',
  },
}
