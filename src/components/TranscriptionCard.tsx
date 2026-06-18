import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import onAirImg from '../assets/OnAir.png'

// ─────────────────────────────────────────────────────────────────────────────
// "Transcribe the broadcast as it airs." — the delightful version.
//
// Instead of a static tile that *describes* transcription, this card proves it:
// a real audio scrubber (play/pause + seekable waveform + running clock) whose
// playhead sweeps a council press briefing, and as the head crosses each
// timestamp the matching paragraph TYPES ITSELF IN — speaker label, timecode,
// and all — exactly the way a live transcript fills in under a reporter. Scrub
// backward and the words un-write; scrub forward and they fill in. The active
// line glows; earlier lines settle back. It auto-plays once on scroll-into-view
// (discoverable without a click), then hands control to the listener.
//
// Continues the $2.4M road-repair story from VoiceRewriteCard + FactCheckCard so
// the three cards read as one newsroom. Stays inside the design system: ink card,
// navy border, 16px radius, Mozilla Text headline, Source Serif body, orange
// accent, mono timecodes, the shared spring (320/34) and the same blinking-orange
// typewriter cursor. Reduced-motion → full transcript, head still seekable, no
// auto-run.
//
// The transcript block reserves its FULL final height from the start: a hidden
// ghost copy of the complete transcript sizes the container, and the live typed
// layer + a single skeleton block (one placeholder for the whole expected
// transcript, not per paragraph) are absolutely stacked over it. Typing never
// reflows the card; the skeleton cross-fades out once the head reaches the
// first line (and returns if you scrub back before it).
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { type: 'spring', stiffness: 320, damping: 34 } as const

const TOTAL = 26 // seconds of "audio"

// The briefing, segmented. `start` = when the head reaches the line; the line
// reveals between `start` and `end`, then holds. Same facts the other two cards
// trace, captured live off the room mic.
type Segment = { start: number; end: number; at: string; speaker: string; text: string }
const SEGMENTS: Segment[] = [
  {
    start: 2,
    end: 10,
    at: '0:02',
    speaker: 'Mayor Reyes',
    text: 'We approved the full two-point-four million for road repairs this morning. Crews break ground on Elm and 4th the week after next.',
  },
  {
    start: 13,
    end: 23,
    at: '0:13',
    speaker: 'Public Works',
    text: 'That funds eighteen miles of resurfacing, worst stretches first. Residents should expect cones up by the end of the month.',
  },
]

// One skeleton block standing in for the entire expected transcript — fills the
// reserved space until the first words land, then cross-fades out. Widths only;
// the bars distribute vertically to fill whatever height the ghost reserves.
const SKELETON_LINES = ['34%', '100%', '96%', '72%', '100%', '88%', '58%']

// Deterministic waveform (no Math.random → stable across renders/SSR).
const BARS = Array.from({ length: 46 }, (_, i) => {
  const h = Math.abs(Math.sin(i * 1.7) + 0.55 * Math.sin(i * 0.6) + 0.25 * Math.sin(i * 3.1))
  return 0.22 + 0.78 * Math.min(1, h / 1.6)
})

function clock(t: number) {
  const s = Math.max(0, Math.floor(t))
  return `0:${String(s).padStart(2, '0')}`
}

export default function TranscriptionCard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion() ?? false

  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const startedRef = useRef(false) // auto-play only the first time it enters view

  // Auto-play once on scroll into view — the delight is discoverable hands-free.
  useEffect(() => {
    if (inView && !startedRef.current) {
      startedRef.current = true
      if (reduce) setTime(TOTAL) // reduced-motion: just show the finished transcript
      else setPlaying(true)
    }
  }, [inView, reduce])

  // rAF transport. Advances `time`; stops (and holds) at the end.
  const rafRef = useRef<number | undefined>(undefined)
  const lastRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!playing) {
      lastRef.current = undefined
      return
    }
    const tick = (now: number) => {
      const last = lastRef.current ?? now
      lastRef.current = now
      const dt = Math.min(0.05, (now - last) / 1000) // clamp tab-switch jumps
      setTime(prev => {
        const next = prev + dt
        if (next >= TOTAL) {
          setPlaying(false)
          return TOTAL
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing])

  function toggle() {
    if (time >= TOTAL) { setTime(0); setPlaying(true); return } // replay from top
    setPlaying(p => !p)
  }

  // Seek from a pointer x within the track (also used while dragging).
  const trackRef = useRef<HTMLDivElement>(null)
  const seekTo = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    setTime(frac * TOTAL)
  }, [])

  const draggingRef = useRef(false)
  function onTrackDown(e: React.PointerEvent) {
    draggingRef.current = true
    setPlaying(false)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    seekTo(e.clientX)
  }
  function onTrackMove(e: React.PointerEvent) {
    if (draggingRef.current) seekTo(e.clientX)
  }
  function onTrackUp() { draggingRef.current = false }

  function onTrackKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); setTime(t => Math.min(TOTAL, t + 1)) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); setTime(t => Math.max(0, t - 1)) }
  }

  const frac = time / TOTAL
  const activeIdx = (() => {
    let idx = -1
    SEGMENTS.forEach((s, i) => { if (time >= s.start) idx = i })
    return idx
  })()
  // Skeleton shows until the head reaches the first line; scrub back and it returns.
  const started = time >= SEGMENTS[0].start

  return (
    <div ref={ref} style={styles.card}>
      {/* ON AIR banner — the sign lights up while the briefing is playing,
          dims back to off-air when paused. The warm glow is three stacked
          inner shadows on an overlay (inset box-shadow doesn't paint over an
          <img>, so it rides above it on a pointer-transparent layer). */}
      <motion.div
        style={styles.onAirWrap}
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.img
          src={onAirImg}
          alt="On air"
          style={styles.onAir}
          animate={reduce ? undefined : { filter: playing ? 'brightness(1.06) contrast(1.02)' : 'brightness(0.9)' }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        />
        <span style={styles.onAirInset} aria-hidden />
      </motion.div>

      <span style={styles.tag}>05 · Audio → Story</span>
      <h3 style={styles.cardTitle}>Transcribe the broadcast as it airs.</h3>

      {/* ── Audio player ─────────────────────────────────────────────── */}
      <div style={styles.player}>
        <button
          type="button"
          onClick={toggle}
          style={styles.playBtn}
          aria-label={playing ? 'Pause briefing' : time >= TOTAL ? 'Replay briefing' : 'Play briefing'}
        >
          <motion.span whileTap={{ scale: 0.86 }} style={styles.playGlyph}>
            {playing ? <PauseIcon /> : time >= TOTAL ? <ReplayIcon /> : <PlayIcon />}
          </motion.span>
        </button>

        {/* Seekable waveform = the time slider */}
        <div
          ref={trackRef}
          style={styles.track}
          role="slider"
          tabIndex={0}
          aria-label="Briefing position"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} of ${clock(TOTAL)}`}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onKeyDown={onTrackKey}
        >
          {BARS.map((h, i) => {
            const barFrac = (i + 0.5) / BARS.length
            const played = barFrac <= frac
            const live = playing && Math.abs(barFrac - frac) < 1 / BARS.length
            return (
              <span
                key={i}
                style={{
                  ...styles.bar,
                  height: `${(live ? Math.min(1, h * 1.25) : h) * 100}%`,
                  background: played ? 'var(--brand-orange)' : 'oklch(0.36 0.025 272)',
                  opacity: played ? 1 : 0.6,
                  transition: 'height 90ms ease-out, background 160ms, opacity 160ms',
                }}
              />
            )
          })}
          {/* Playhead */}
          <span style={{ ...styles.playhead, left: `${frac * 100}%` }}>
            <span style={styles.playheadKnob} />
          </span>
        </div>

        <span style={styles.clock}>
          {clock(time)} <span style={styles.clockTotal}>/ {clock(TOTAL)}</span>
        </span>
      </div>

      {/* Live indicator — only while the head is moving */}
      <div style={styles.liveRow}>
        <motion.span
          style={{ ...styles.liveDot, background: playing ? 'var(--brand-orange)' : 'oklch(0.4 0.02 270)' }}
          animate={playing ? { opacity: [1, 0.25, 1] } : { opacity: 0.5 }}
          transition={playing ? { repeat: Infinity, duration: 1.1 } : { duration: 0.2 }}
        />
        <span style={styles.liveLabel}>{playing ? 'Transcribing live' : 'Council press briefing'}</span>
      </div>

      {/* ── Transcript ───────────────────────────────────────────────── */}
      <div style={styles.transcript}>
        {/* Ghost sizer: the complete transcript laid out invisibly so the block
            owns its final height from frame one — typing never reflows the card. */}
        <div style={styles.ghost} aria-hidden>
          {SEGMENTS.map((seg, i) => (
            <div key={i} style={styles.segRow}>
              <div style={styles.segHead}>
                <span style={styles.segTime}>{seg.at}</span>
                <span style={styles.segSpeaker}>{seg.speaker}</span>
              </div>
              <p style={styles.segText}>{seg.text}</p>
            </div>
          ))}
        </div>

        {/* Live typed layer — absolutely stacked over the reserved space */}
        <motion.div
          style={styles.liveLayer}
          initial={false}
          animate={{ opacity: started ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {SEGMENTS.map((seg, i) => {
            const reached = time >= seg.start
            const span = Math.max(0.001, seg.end - seg.start)
            const prog = Math.min(1, Math.max(0, (time - seg.start) / span))
            const chars = reduce && reached ? seg.text.length : Math.floor(prog * seg.text.length)
            const typed = seg.text.slice(0, chars)
            const typing = reached && chars < seg.text.length && playing
            const active = i === activeIdx
            return (
              <div
                key={i}
                style={{
                  ...styles.segRow,
                  borderLeftColor: active ? 'var(--brand-orange)' : 'transparent',
                  opacity: reached ? (active ? 1 : 0.62) : 0.28,
                  transition: 'opacity 220ms, border-color 220ms',
                }}
              >
                <div style={styles.segHead}>
                  <span style={{ ...styles.segTime, color: active ? 'var(--brand-orange)' : 'oklch(0.55 0.015 85)' }}>
                    {seg.at}
                  </span>
                  <span style={styles.segSpeaker}>{seg.speaker}</span>
                </div>
                <p style={styles.segText}>
                  {reached ? typed : null}
                  {typing && (
                    <motion.span
                      style={styles.cursor}
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.55 }}
                    >|</motion.span>
                  )}
                </p>
              </div>
            )
          })}
        </motion.div>

        {/* Skeleton: ONE placeholder block for the whole expected transcript.
            Bars space out to fill the reserved height; shimmers until the
            first words land, then cross-fades away. */}
        <motion.div
          style={styles.skeletonLayer}
          initial={false}
          animate={{ opacity: started ? 0 : 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-hidden
        >
          {SKELETON_LINES.map((w, i) => (
            <motion.span
              key={i}
              style={{ ...styles.skeletonBar, width: w }}
              animate={!reduce && !started ? { opacity: [0.45, 0.85, 0.45] } : { opacity: 0.6 }}
              transition={
                !reduce && !started
                  ? { repeat: Infinity, duration: 1.5, delay: i * 0.12, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
            />
          ))}
        </motion.div>
      </div>

      <motion.span style={styles.hint} animate={{ opacity: 1 }} transition={SPRING}>
        {playing ? 'Scrub the waveform to jump anywhere →' : time >= TOTAL ? 'Replay or scrub to revisit a quote →' : 'Press play. The transcript writes itself →'}
      </motion.span>
    </div>
  )
}

// Minimal inline glyphs (ink-on-orange button) — no icon dependency needed.
function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 1.5 12 7 3 12.5z" fill="currentColor" /></svg>
}
function PauseIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor" /><rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor" /></svg>
}
function ReplayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 7.5a5 5 0 1 1-1.6-3.7" />
      <path d="M12.6 2v2.6H10" />
    </svg>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
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
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  onAirWrap: {
    position: 'relative',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    lineHeight: 0, // strip the inline-image baseline gap
  },
  onAir: {
    width: '100%',
    height: 'auto', // keep the image's native aspect ratio
    display: 'block',
  },
  onAirInset: {
    position: 'absolute',
    inset: 0,
    borderRadius: '12px',
    pointerEvents: 'none',
    // Three inner shadows, matching the Framer effect stack:
    boxShadow: [
      'inset 0 0 21px 4.5px rgba(254, 213, 163, 0.85)',   // FED5A3 — soft outer halo
      'inset 0 2.5px 10.95px 3px rgba(254, 213, 163, 0.85)', // FED5A3 — top falloff
      'inset 0 2.5px 18px 7px rgba(255, 140, 0, 0.85)',    // FF8C00 — orange edge
    ].join(', '),
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
    // Scale up in the wider desktop grid cell to match VoiceRewriteCard.
    fontSize: 'clamp(20px, 1.7vw, 24px)',
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
    color: 'var(--cream)',
  },
  player: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '2px',
    padding: '12px',
    background: 'oklch(0.245 0.028 272)',
    border: '1px solid oklch(0.3 0.025 272)',
    borderRadius: '12px',
  },
  playBtn: {
    flexShrink: 0,
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    padding: 0,
  },
  playGlyph: {
    display: 'grid',
    placeItems: 'center',
    marginLeft: '1px', // optically center the play triangle
  },
  track: {
    position: 'relative',
    flex: 1,
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    touchAction: 'none',
  },
  bar: {
    flex: 1,
    minWidth: 0,
    borderRadius: '2px',
  },
  playhead: {
    position: 'absolute',
    top: '-3px',
    bottom: '-3px',
    width: '2px',
    background: 'var(--cream)',
    transform: 'translateX(-1px)',
    pointerEvents: 'none',
    borderRadius: '2px',
  },
  playheadKnob: {
    position: 'absolute',
    top: '-4px',
    left: '50%',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--cream)',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 0 2px var(--ink)',
  },
  clock: {
    flexShrink: 0,
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--cream)',
    letterSpacing: '0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  clockTotal: {
    color: 'oklch(0.55 0.015 85)',
  },
  liveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  liveDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
  },
  liveLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'oklch(0.6 0.015 85)',
  },
  transcript: {
    position: 'relative',
    paddingTop: '4px',
    borderTop: '1px solid oklch(0.26 0.025 272)',
  },
  ghost: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    visibility: 'hidden',
  },
  liveLayer: {
    // `top` matches the container's paddingTop so rows overlay the ghost exactly.
    position: 'absolute',
    top: '4px',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  skeletonLayer: {
    position: 'absolute',
    top: '4px',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    // Align with the transcript text gutter (12px pad + 2px rule).
    paddingLeft: '14px',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  skeletonBar: {
    flex: 'none',
    height: '11px',
    borderRadius: '5px',
    background: 'oklch(0.29 0.025 272)',
  },
  segRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '12px',
    borderLeft: '2px solid transparent',
  },
  segHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  segTime: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  segSpeaker: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: 'var(--cream)',
  },
  segText: {
    margin: 0,
    minHeight: '2.6em',
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(14px, 1.15vw, 15.5px)',
    lineHeight: 1.6,
    color: 'var(--cream)',
    maxWidth: '58ch',
  },
  cursor: {
    display: 'inline-block',
    color: 'var(--brand-orange)',
    marginLeft: 1,
  },
  hint: {
    marginTop: 'auto',
    paddingTop: '2px',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'oklch(0.55 0.015 85)',
  },
}
