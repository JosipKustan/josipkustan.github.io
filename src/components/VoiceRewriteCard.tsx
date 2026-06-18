import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import megaphoneImg from '../assets/HandWithMegaphone.png'
import { useIsNarrowGrid } from '../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// "Republish a story in your voice." — the delightful version.
//
// The product promise is "your voice", so the card proves it instead of just
// describing it: a flat wire-service lede sits in the card, and on first scroll
// into view (or on tap) it strikes through while the house-voice rewrite TYPES
// itself in beneath — same facts, your words. Each further tap cycles to a
// different newsroom's voice (same story, distinct house style), so the moment
// stays fresh on repeat and the value prop lands harder each time.
//
// Stays fully inside the NewsLabs design system: ink card, navy border, 16px
// radius, Mozilla Text headline, Source Serif body, orange accent, and the SAME
// typewriter (16ms / 4-chars, blinking orange cursor) + spring (320/34) used by
// the social workflow cards. Reduced-motion is respected.
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { type: 'spring', stiffness: 320, damping: 34 } as const

// The same story, in three different newsroom voices.
const WIRE = 'City council approved a $2.4 million budget for road repairs Thursday, officials said.'

const VOICES = [
  {
    name: 'The Tribune',
    line: 'Your streets are finally getting fixed. The council just put $2.4M behind the repairs, and here’s exactly where the money goes.',
  },
  {
    name: 'The Courier',
    line: 'Smoother roads are on the way. On Thursday the council committed $2.4 million to the repairs neighbors have been asking about for months.',
  },
  {
    name: 'Metro Desk',
    line: '$2.4 million. That’s what the council signed off on Thursday to fix the roads you drive every single day.',
  },
]

// The longest voice line (by length). Rendered invisibly behind the live text
// to reserve the paragraph's height, so typing / cycling between voices never
// reflows and resizes the card.
const LONGEST_LINE = VOICES.reduce((a, b) => (b.line.length > a.line.length ? b : a)).line

// Shared typewriter — identical cadence to the social cards (16ms / 4 chars).
// Honours reduced-motion by rendering the full text immediately.
function useTypewriter(text: string, active: boolean, instant: boolean) {
  const [typed, setTyped] = useState('')
  useEffect(() => {
    if (!active) { setTyped(''); return }
    if (instant) { setTyped(text); return }
    let i = 0
    setTyped('')
    const iv = setInterval(() => {
      i = Math.min(i + 4, text.length)
      setTyped(text.slice(0, i))
      if (i >= text.length) clearInterval(iv)
    }, 16)
    return () => clearInterval(iv)
  }, [text, active, instant])
  return typed
}

export default function VoiceRewriteCard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion() ?? false
  // True once the 2-up grid has collapsed to a single column (~773px) — the
  // megaphone drops into the corner and the card opens up room beneath the text.
  const narrowGrid = useIsNarrowGrid()

  // `started` flips on first in-view OR first tap; `voice` cycles on each tap.
  const [started, setStarted] = useState(false)
  const [voice, setVoice] = useState(0)

  // Drive the megaphone's springy wobble from the card (the actual button) so
  // the image can stay pointer-events:none and never swallow a card tap.
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const wobble = reduce ? 0 : pressed ? 9 : hovering ? -5 : 0

  // Auto-play once when it scrolls into view, so the delight is discoverable
  // without a tap. Tap then drives the compounding voice variation.
  useEffect(() => {
    if (inView) setStarted(true)
  }, [inView])

  const v = VOICES[voice]
  const typed = useTypewriter(v.line, started, reduce)
  const typing = started && typed.length > 0 && typed.length < v.line.length

  function handleTap() {
    if (!started) { setStarted(true); return }
    setVoice(p => (p + 1) % VOICES.length)
  }

  return (
    <div
      ref={ref}
      // Single-column: reserve a clear strip beneath the text so the corner
      // megaphone hangs in empty space instead of over the last lines.
      style={narrowGrid ? { ...styles.card, paddingBottom: '76px' } : styles.card}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label="Republish a story in your voice. Tap to hear another newsroom voice"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap() } }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setPressed(false) }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
    >
      <span style={styles.tag}>04 · Wire → Draft</span>
      <h3 style={styles.cardTitle}>Republish a story in your voice.</h3>

      {/* Wire lede — dims + strikes through once the rewrite begins. */}
      <div style={styles.wireRow}>
        <span style={styles.wireLabel}>Wire</span>
        <span style={styles.wireText}>{WIRE}</span>
      </div>

      {/* House-voice rewrite — types itself in, bylined with the voice name. */}
      <div style={styles.voiceBlock}>
        <AnimatePresence mode="wait">
          <motion.span
            key={v.name}
            style={styles.voiceByline}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: started ? 1 : 0, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            ↳ in the voice of <strong style={styles.voiceName}>{v.name}</strong>
          </motion.span>
        </AnimatePresence>

        {/* The live line is positioned over an invisible ghost of the longest
            voice, so the reserved height is constant regardless of which voice
            is showing or how far the typewriter has got — the card never jumps. */}
        <div style={styles.voiceLineWrap}>
        <p style={styles.voiceLineGhost} aria-hidden>{LONGEST_LINE}</p>
        <p style={styles.voiceLine}>
          {started ? typed : ' '}
          {typing && (
            <motion.span
              style={styles.cursor}
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.55 }}
            >|</motion.span>
          )}
        </p>
        </div>
      </div>

      {/* Affordance — switches from "rewrite" to "another voice" once playing. */}
      <motion.span
        style={styles.hint}
        animate={{ opacity: 1 }}
        transition={SPRING}
      >
        {started ? 'Tap for another newsroom’s voice →' : 'Tap to rewrite it in your voice →'}
      </motion.span>

      {/* A hand reaches up from below the card holding a megaphone — "amplify
          your voice". Decorative (pointer-events:none): while the grid is 2-up
          it's centred at the bottom, oversized, breaking the frame; once the
          grid collapses to a single column (~773px) the card runs full width, so
          the megaphone shrinks into the bottom-right corner and hangs mostly
          below the frame, clear of the reserved bottom strip. It springs into a
          small rotation while the card is hovered or pressed. */}
      <motion.img
        src={megaphoneImg}
        alt=""
        aria-hidden
        draggable={false}
        style={narrowGrid ? styles.megaphoneCorner : styles.megaphone}
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0, rotate: wobble } : {}}
        transition={{
          default: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
          // Springy, slightly under-damped so the wobble overshoots and settles.
          rotate: { type: 'spring', stiffness: 340, damping: 11 },
        }}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    height: '100%',
    boxSizing: 'border-box',
    background: 'var(--ink)',
    border: '1px solid oklch(0.28 0.025 272)',
    borderRadius: '16px',
    // Match WorkflowCardFrame's breathing padding so the grid stays a matched set.
    padding: 'clamp(24px, 2.4vw, 32px) clamp(16px, 2.2vw, 30px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    // overflow stays visible so the megaphone can hang past the bottom edge.
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
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    // Scale up in the wider desktop grid cell so it doesn't read like a blown-up
    // phone card; holds at 20px on mobile.
    fontSize: 'clamp(20px, 1.7vw, 24px)',
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
    color: 'var(--cream)',
  },
  wireRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    marginTop: '2px',
  },
  wireLabel: {
    flexShrink: 0,
    marginTop: '2px',
    padding: '2px 6px',
    border: '1px solid oklch(0.34 0.025 272)',
    borderRadius: '4px',
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'oklch(0.5 0.015 85)',
  },
  wireText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(13px, 1.05vw, 15px)',
    lineHeight: 1.55,
    color: 'oklch(0.72 0.015 85)',
    maxWidth: '58ch',
  },
  voiceBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingTop: '4px',
    borderTop: '1px solid oklch(0.26 0.025 272)',
  },
  voiceByline: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: 'oklch(0.6 0.015 85)',
  },
  voiceName: {
    color: 'var(--brand-orange)',
    fontWeight: 700,
  },
  // Wrapper sizes to the invisible ghost; the live line is layered on top so
  // the block's height stays fixed across voices and through the typewriter.
  voiceLineWrap: {
    position: 'relative',
  },
  voiceLineGhost: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(14px, 1.15vw, 16px)',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '58ch',
    visibility: 'hidden',
  },
  voiceLine: {
    position: 'absolute',
    inset: 0,
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(14px, 1.15vw, 16px)',
    lineHeight: 1.65,
    color: 'var(--cream)',
    margin: 0,
    maxWidth: '58ch',
  },
  cursor: {
    display: 'inline-block',
    color: 'var(--brand-orange)',
    marginLeft: 1,
  },
  hint: {
    marginTop: '2px',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'oklch(0.55 0.015 85)',
    // Keep the hint clear of the megaphone in the bottom-right corner.
    maxWidth: '60%',
  },
  megaphone: {
    position: 'absolute',
    // Horizontally centred: left/right 0 + auto margins centre a fixed-width
    // absolute element without a transform (leaves Framer's `y` animation free).
    left: 0,
    right: 0,
    marginInline: 'auto',
    // Hand rises up from below: the image's bottom hangs past the card's
    // bottom edge.
    bottom: '-80px',
    // Oversized on purpose — a share of the card large enough to break the
    // frame and dominate the empty lower region.
    width: 'clamp(320px, 58%, 640px)',
    height: 'auto',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 1,
    // Pivot from the bottom (where the hand grips) so the wobble reads as
    // someone waving the megaphone rather than spinning the whole image.
    transformOrigin: 'center bottom',
    filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))',
  },
  // Single-column (≤773px): a small accent tucked into the bottom-right corner,
  // pulled well below the frame so the hand hangs outside the card and only the
  // megaphone peeks in — it sits in the reserved bottom strip, clear of the text.
  megaphoneCorner: {
    position: 'absolute',
    left: 'auto',
    right: '-10px',
    bottom: '-46px',
    width: 'clamp(104px, 17vw, 150px)',
    height: 'auto',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 1,
    transformOrigin: 'right bottom',
    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.45))',
  },
}
