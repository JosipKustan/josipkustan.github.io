import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import WorkflowCardFrame from './WorkflowCardFrame'
import { useIsTightDesktop } from '../hooks/useMediaQuery'
import { Stamp } from './vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// "Trace every claim back to its source." — the interactive proof.
//
// Instead of describing fact-checking, the card demonstrates it: a finished news
// draft sits in the card with its factual claims highlighted. A mouse cursor
// walks from claim to claim (auto, on a loop) and, as it lands on each, the
// supporting SOURCE pops in beside it — the document/recording/dataset the claim
// traces back to, with the exact evidence highlighted in the quote.
//
// Hovering a claim by hand takes over (pauses the auto-walk and jumps straight to
// that claim). Reduced-motion → the cursor teleports instead of springing, and
// the loop still advances so the behaviour stays discoverable.
//
// Stays in the NewsLabs design system: ink card, navy border, Mozilla Text
// headline, Source Serif body, the shared 320/34 spring, and brand blue / orange
// / burnt-orange for the three claim colours. Continues the $2.4M council
// road-repair story used by VoiceRewriteCard, so the two cards feel like one
// newsroom.
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { type: 'spring', stiffness: 320, damping: 34 } as const

type ClaimColor = 'blue' | 'orange' | 'brown'

type Source = {
  cite: string                       // where the claim comes from
  quote: string                      // the supporting passage
  evidence: string[]                 // substrings of `quote` to highlight orange
}

// A draft is a list of runs; a run is either plain text or a highlighted claim.
type Run =
  | { text: string }
  | { id: string; text: string; color: ClaimColor; source: Source }

const DRAFT: Run[] = [
  { text: 'City council approved a ' },
  {
    id: 'budget',
    text: '$2.4 million budget',
    color: 'blue',
    source: {
      cite: 'City Council Minutes, Apr 3, 2026 (PDF, p.4)',
      quote: 'Motion to allocate $2.4M from the capital fund for road resurfacing carried 6–1.',
      evidence: ['$2.4M', 'road resurfacing'],
    },
  },
  { text: ' for road repairs Thursday. Work will ' },
  {
    id: 'march',
    text: 'begin in March',
    color: 'orange',
    source: {
      cite: 'Public Works briefing, recording, 0:14:22',
      quote: '“We expect crews to break ground in early March, weather permitting.”',
      evidence: ['break ground in early March'],
    },
  },
  { text: ', the public works director said, after residents reported a ' },
  {
    id: 'potholes',
    text: '30% jump in pothole complaints',
    color: 'brown',
    source: {
      cite: '311 Service Requests, Open Data Portal, Q1 2026',
      quote: 'Pothole reports rose 31% against the prior winter quarter.',
      evidence: ['rose 31%'],
    },
  },
  { text: ' over the winter.' },
]

const CLAIMS = DRAFT.filter((r): r is Extract<Run, { id: string }> => 'id' in r)

// Claim highlight colours (resting tint vs. active full-strength).
const COLORS: Record<ClaimColor, { rest: string; active: string; ink: string }> = {
  blue:   { rest: 'rgba(75,101,255,0.30)',  active: 'rgba(75,101,255,0.92)',  ink: '#ffffff' },
  orange: { rest: 'rgba(255,140,0,0.30)',   active: 'rgba(255,140,0,0.95)',   ink: '#14182A' },
  brown:  { rest: 'rgba(192,91,0,0.32)',    active: 'rgba(192,91,0,0.92)',    ink: '#ffffff' },
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// Split a quote into runs so the evidence substrings render orange-highlighted.
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

export default function FactCheckCard() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: false, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  const [active, setActive] = useState(CLAIMS[0].id)
  const [pinned, setPinned] = useState(false) // hover takes over the auto-walk
  // >1100px: put an editorial rail (chip + headline + standfirst + legend) left
  // of the draft so the wide card isn't half empty ink. Below that, stack.
  const wide = !useIsTightDesktop()

  const claimRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const popupRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0) // bump to re-measure on resize

  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [popup, setPopup] = useState({ x: 0, y: 0, ready: false })

  const activeSource = CLAIMS.find(c => c.id === active)!.source

  // ── Auto-walk the cursor across the claims while visible & un-pinned ──────────
  useEffect(() => {
    if (!inView || pinned) return
    const iv = setInterval(() => {
      setActive(prev => {
        const i = CLAIMS.findIndex(c => c.id === prev)
        return CLAIMS[(i + 1) % CLAIMS.length].id
      })
    }, 2600)
    return () => clearInterval(iv)
  }, [inView, pinned])

  // ── Re-measure on resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => setSize(s => s + 1))
    ro.observe(root)
    return () => ro.disconnect()
  }, [])

  // ── Position the cursor (tip on the claim) + the source popup beside it ───────
  useLayoutEffect(() => {
    const root = rootRef.current
    const span = claimRefs.current[active]
    if (!root || !span) return

    const r = root.getBoundingClientRect()
    const s = span.getBoundingClientRect()
    const left = s.left - r.left
    const top = s.top - r.top

    // Cursor: tip lands just under the lower-middle of the highlighted run.
    setCursor({ x: left + Math.min(s.width * 0.5, 90), y: top + s.height - 2 })

    // Popup: sits below the claim, clamped inside the card; flips above if it
    // would overflow the bottom edge.
    const popH = popupRef.current?.offsetHeight ?? 120
    const popW = popupRef.current?.offsetWidth ?? 320
    const px = clamp(left + s.width * 0.35, 16, r.width - popW - 16)
    let py = top + s.height + 18
    if (py + popH + 16 > r.height) py = top - popH - 18
    setPopup({ x: px, y: Math.max(16, py), ready: true })
  }, [active, size])

  const onClaimEnter = useCallback((id: string) => {
    setPinned(true)
    setActive(id)
  }, [])

  return (
    <WorkflowCardFrame ref={rootRef} style={s.root} onMouseLeave={() => setPinned(false)}>
      <div style={wide ? s.layoutWide : s.layout}>
        {/* Editorial rail (desktop) — chip, headline, standfirst, claim legend */}
        <div style={s.rail}>
          {wide && <span style={s.tag}>02 · Claims → Sources</span>}
          <h2 style={{ ...s.heading, ...(wide ? s.headingWide : {}) }}>
            Trace every claim<br />back to its source.
          </h2>
          {wide && (
            <>
              <p style={s.standfirst}>
                Hover any highlighted claim. The source it traces to pops in beside it,
                with the exact evidence underlined.
              </p>
              <div style={s.legend}>
                {([
                  ['blue', 'Public record'],
                  ['orange', 'On the record'],
                  ['brown', 'Open data'],
                ] as const).map(([color, label]) => (
                  <span key={color} style={s.legendItem}>
                    <span style={{ ...s.legendSwatch, background: COLORS[color].active }} />
                    {label}
                  </span>
                ))}
              </div>
              <div style={s.stampWrap}>
                <Stamp tone="dark">Sourced ✓</Stamp>
              </div>
            </>
          )}
        </div>

        {/* The draft */}
        <div style={s.draftCard}>
          <p style={s.draftText}>
            {DRAFT.map((run, i) => {
              if (!('id' in run)) return <span key={i}>{run.text}</span>
              const isActive = run.id === active
              const c = COLORS[run.color]
              return (
                <span
                  key={run.id}
                  ref={el => { claimRefs.current[run.id] = el }}
                  onMouseEnter={() => onClaimEnter(run.id)}
                  style={{
                    ...s.claim,
                    background: isActive ? c.active : c.rest,
                    color: isActive ? c.ink : 'inherit',
                    boxShadow: isActive ? `0 0 0 2px ${c.active}` : 'none',
                  }}
                >
                  {run.text}
                </span>
              )
            })}
          </p>
        </div>
      </div>

      {/* Source popup — cross-fades per active claim at its measured position */}
      <div
        ref={popupRef}
        style={{
          ...s.popupWrap,
          left: popup.x,
          top: popup.y,
          opacity: popup.ready ? 1 : 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            style={s.popup}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div style={s.popupCiteRow}>
              <span style={s.sourceTag}>Source</span>
              <span style={s.popupCite}>{activeSource.cite}</span>
            </div>
            <div style={s.popupDivider} />
            <p style={s.popupQuote}>
              {highlightEvidence(activeSource.quote, activeSource.evidence).map((part, i) =>
                part.hit
                  ? <mark key={i} style={s.evidence}>{part.text}</mark>
                  : <span key={i}>{part.text}</span>,
              )}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Animated mouse cursor */}
      <motion.div
        style={s.cursor}
        animate={{ x: cursor.x, y: cursor.y }}
        transition={reduce ? { duration: 0 } : SPRING}
        aria-hidden
      >
        <svg width="22" height="30" viewBox="0 0 12 20" style={s.cursorSvg}>
          <path
            d="M1 1 L1 17 L5 13 L8 20 L10.5 19 L7.5 12 L12 12 Z"
            fill="#ffffff"
            stroke="#14182A"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </WorkflowCardFrame>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '420px',
  },
  layout: {
    position: 'relative',
  },
  layoutWide: {
    position: 'relative',
    display: 'grid',
    // rail takes ALL the free space (a <1fr factor would leave unclaimed space
    // dangling right of the draft), so the 640px draft pins to the right
    // padding edge — same gap both sides of the card
    gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 640px)',
    gap: 'clamp(32px, 4vw, 72px)',
    // centre the shorter column against the taller one so the draft rides
    // mid-card instead of hugging the top with empty ink below it
    alignItems: 'center',
  },
  rail: {
    position: 'relative',
  },
  tag: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'oklch(0.28 0.025 272)',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'oklch(0.65 0.015 85)',
    marginBottom: '14px',
  },
  heading: {
    position: 'relative',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    lineHeight: 1.08,
    letterSpacing: '-0.025em',
    color: '#ffffff',
    margin: '0 0 28px',
  },
  headingWide: {
    margin: 0,
  },
  standfirst: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'oklch(0.68 0.015 85)',
    maxWidth: '34ch',
    margin: '18px 0 0',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    marginTop: '22px',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'oklch(0.66 0.015 85)',
  },
  legendSwatch: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  stampWrap: {
    marginTop: '28px',
  },
  draftCard: {
    position: 'relative',
    background: '#F9F7F4',
    borderRadius: '14px',
    padding: '24px 26px',
    maxWidth: '640px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.30)',
  },
  draftText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(18px, 2.2vw, 24px)',
    lineHeight: 1.7,
    color: '#14182A',
    margin: 0,
  },
  claim: {
    borderRadius: '4px',
    padding: '1px 4px',
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
    // keep the highlight box clean when a claim wraps across lines
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
  } as React.CSSProperties,
  popupWrap: {
    position: 'absolute',
    width: 'min(340px, 70%)',
    zIndex: 20,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
  },
  popup: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: '0 12px 34px rgba(0,0,0,0.38)',
  },
  popupCiteRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '8px',
  },
  sourceTag: {
    flexShrink: 0,
    padding: '2px 7px',
    background: 'var(--brand-orange)',
    borderRadius: '5px',
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#14182A',
  },
  popupCite: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '13px',
    lineHeight: 1.4,
    color: '#3d3d3d',
  },
  popupDivider: {
    height: '1px',
    background: '#e7e4de',
    margin: '0 0 8px',
  },
  popupQuote: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '14px',
    lineHeight: 1.55,
    color: '#14182A',
    margin: 0,
  },
  evidence: {
    background: 'rgba(255,140,0,0.55)',
    color: '#14182A',
    borderRadius: '3px',
    padding: '0 2px',
  },
  cursor: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 30,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))',
  },
  cursorSvg: {
    display: 'block',
  },
}
