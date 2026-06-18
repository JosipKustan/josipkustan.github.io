import { useRef, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useIsMobile } from '../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Inline source citation. Wraps a phrase of running text and attributes it to a
// source. On desktop, hovering (or focusing) the highlighted phrase reveals a
// small SOURCE card — an orange "Source" tag + the attribution as a link out —
// reusing the popover look of FactCheckCard so the page keeps one sourcing
// visual. The phrase itself carries the same brand-blue highlight as the claim
// runs in that card (a resting tint that intensifies while the card is open),
// not an underline. On mobile there's no hover, so the phrase renders as plain
// text and the host section lists the sources as a caption beneath the
// paragraph instead (see DifferentSection). Traceability, not fact-checking:
// this points to where a figure came from, it does not verify it.
//
// Framer note: in Framer this is a Link with a brand-blue highlight fill
// (rgba(75,101,255,0.28) at rest → 0.92 + white text on hover) + a hover-revealed
// overlay card (orange tag, italic Source Serif attribution linking out). On the
// mobile breakpoint, drop the hover card and show a "Sources: …" caption line
// under the paragraph instead.
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  cite: string // attribution shown in the card, e.g. "Reuters Institute, University of Oxford (2025)"
  href: string // the source URL the card links out to
  children: React.ReactNode // the inline phrase being cited
}

export default function SourceCite({ cite, href, children }: Props) {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // A short close delay bridges the small gap between the phrase and the card
  // above it, so moving the pointer up into the card doesn't dismiss it.
  const show = () => {
    window.clearTimeout(timer.current)
    setOpen(true)
  }
  const hide = () => {
    timer.current = window.setTimeout(() => setOpen(false), 140)
  }

  // Mobile: no hover affordance — render plain text; the section shows sources
  // as a caption beneath the paragraph.
  if (isMobile) return <span>{children}</span>

  return (
    <span style={s.wrap} onMouseEnter={show} onMouseLeave={hide}>
      <span
        style={{ ...s.trigger, ...(open ? s.triggerActive : null) }}
        tabIndex={0}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            style={s.card}
            role="tooltip"
            initial={reduce ? false : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <span style={s.tag}>Source</span>
            <a href={href} target="_blank" rel="noopener noreferrer" style={s.citeLink}>
              {cite}
            </a>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

const s: Record<string, CSSProperties> = {
  wrap: {
    position: 'relative',
  },
  // No underline — a soft brand-blue highlight, mirroring the claim runs in the
  // "Trace every claim back to its source" card (FactCheckCard): a resting tint
  // that intensifies to full strength while the source card is open.
  trigger: {
    cursor: 'help',
    background: 'rgba(75,101,255,0.28)',
    borderRadius: '4px',
    padding: '1px 4px',
    transition: 'background 0.2s ease, color 0.2s ease',
    // keep the highlight box clean if the phrase wraps across lines
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
  } as CSSProperties,
  triggerActive: {
    background: 'rgba(75,101,255,0.92)',
    color: '#ffffff',
  },
  // The card sits just above the phrase, anchored to its start.
  card: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '8px',
    width: 'max-content',
    maxWidth: 'min(320px, 80vw)',
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '8px',
    background: '#ffffff',
    borderRadius: '10px',
    padding: '10px 13px',
    boxShadow: '0 12px 34px rgba(0,0,0,0.38)',
    textShadow: 'none',
    whiteSpace: 'normal',
    zIndex: 30,
  },
  tag: {
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
  citeLink: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '13px',
    lineHeight: 1.4,
    color: 'var(--primary)',
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
  },
}
