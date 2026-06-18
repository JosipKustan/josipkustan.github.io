import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { Rss, Building2, FileText, UserCheck, Send, Globe } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// "Catch the story first." — the delightful version of the Speed tile.
//
// Every newsroom gets the same wire feed at the same second; the edge is how
// fast it reaches publish. So the card shows a race: a "news" puck HOPS down the
// pipeline — Feed → Newsroom → Draft → Editor → Publish — the track lighting up
// behind it, and the moment it clears the last step the finished headline POPS
// into the "Published" list on the right. Then the next story drops into the
// feed and the run repeats, the published list stacking up faster than feels
// possible. Reads as "while everyone else is still reading the feed, yours is
// already live."
//
// Continues the council / city-desk stories the other three cards use, so the
// whole section reads as one newsroom. Stays in the design system: shared
// WorkflowCardFrame shell, Mozilla Text headline, Inter UI, brand orange, and
// the shared spring (320/34) — with a looser landing spring for the bounce.
// Reduced-motion → the pipeline shows complete, the list pre-filled, no loop.
//
// Layout: heading sits top-left with the vintage phone bled into the card's
// bottom-left corner; the pipeline + Published list stack in the right column.
// Below the tight-desktop cutoff the columns collapse to one stack and the
// phone drops behind the content as a low-opacity background wash.
// ─────────────────────────────────────────────────────────────────────────────

import WorkflowCardFrame from './WorkflowCardFrame'
import { useIsTightDesktop } from '../hooks/useMediaQuery'
import { Stamp } from './vintage/VintageKit'
import phoneImg from '../assets/BlueTelephone.png'

const STEPS = [
  { id: 'feed',     label: 'Feed',     Icon: Rss },
  { id: 'newsroom', label: 'Newsroom', Icon: Building2 },
  { id: 'draft',    label: 'Draft',    Icon: FileText },
  { id: 'editor',   label: 'Editor',   Icon: UserCheck },
  { id: 'publish',  label: 'Publish',  Icon: Send },
] as const

// City-desk headlines — same beat as the council story the other cards trace,
// each tagged with the desk it ran under.
const HEADLINES = [
  { title: 'Council approves $2.4M road-repair budget', section: 'City Desk' },
  { title: 'Transit board votes to extend the Blue Line', section: 'Transit' },
  { title: 'Mayor names new public-works director', section: 'Politics' },
  { title: 'School district unveils its 2026 budget', section: 'Education' },
  { title: 'Harbor cleanup clears its first milestone', section: 'Environment' },
  { title: 'Downtown small-business grants reopen Monday', section: 'Business' },
]

type Entry = { id: number; title: string; section: string }

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export default function SpeedWorkflowCard() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: false, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  // >1100px: lay the pipeline and the published list side by side; below that,
  // keep today's stacked column (the pipeline needs ~640px to spread its 5 nodes).
  const wide = !useIsTightDesktop()

  const trackRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const [size, setSize] = useState(0)
  const [nodeX, setNodeX] = useState<number[]>([])
  const [baseY, setBaseY] = useState(0)

  // Animation state. In reduced-motion we park the pipeline "complete" and
  // pre-fill the list so the story still reads without any looping motion.
  const [step, setStep] = useState(reduce ? STEPS.length - 1 : 0)
  const [headlineIdx, setHeadlineIdx] = useState(0)
  const [published, setPublished] = useState<Entry[]>(
    reduce
      ? HEADLINES.slice(1, 5).map((h, i) => ({ id: -i - 1, title: h.title, section: h.section }))
      : [],
  )

  const hiRef = useRef(0)   // current headline index, readable inside the async loop
  const idRef = useRef(1)   // monotonic id for published rows

  // ── Measure node centres so the puck can hop between them ─────────────────────
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const tr = track.getBoundingClientRect()
    const xs = nodeRefs.current.map(n => {
      if (!n) return 0
      const r = n.getBoundingClientRect()
      return r.left + r.width / 2 - tr.left
    })
    setNodeX(xs)
    const first = nodeRefs.current[0]
    if (first) {
      const r = first.getBoundingClientRect()
      setBaseY(r.top + r.height / 2 - tr.top)
    }
  }, [size])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(() => setSize(s => s + 1))
    ro.observe(track)
    return () => ro.disconnect()
  }, [])

  // ── The race loop: hop the puck step→step, publish, drop the next story ───────
  useEffect(() => {
    if (!inView || reduce) return
    let alive = true
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) => new Promise<void>(r => timers.push(setTimeout(r, ms)))

    ;(async () => {
      while (alive) {
        for (let i = 0; i < STEPS.length; i++) {
          setStep(i)
          await wait(i === STEPS.length - 1 ? 720 : 600)
          if (!alive) return
        }
        // Cleared Publish → push the finished headline onto the list (newest
        // first, ageing the rest) and capping what stays visible.
        const h = HEADLINES[hiRef.current]
        setPublished(prev =>
          [{ id: idRef.current++, title: h.title, section: h.section }, ...prev].slice(0, 5),
        )
        // Next story drops into the feed.
        hiRef.current = (hiRef.current + 1) % HEADLINES.length
        setHeadlineIdx(hiRef.current)
        setStep(0)
        await wait(420)
        if (!alive) return
      }
    })()

    return () => { alive = false; timers.forEach(clearTimeout) }
  }, [inView, reduce])

  const lastX = nodeX[STEPS.length - 1] ?? 0
  const firstX = nodeX[0] ?? 0
  const fillW = clamp((nodeX[step] ?? 0) - firstX, 0, lastX - firstX)

  return (
    <WorkflowCardFrame ref={rootRef} rainbow={false}>
      {/* The vintage phone — how the story used to travel. Absolutely anchored
          to the card's bottom-left corner so the image's transparent top no
          longer reserves layout space; the frame's overflow:hidden crops
          whatever bleeds past the edges. Desktop: a large foreground graphic.
          Below the cutoff: a faint wash behind the stacked content. */}
      {wide ? (
        <motion.img
          src={phoneImg}
          alt=""
          aria-hidden
          draggable={false}
          style={s.phone}
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        />
      ) : (
        <motion.img
          src={phoneImg}
          alt=""
          aria-hidden
          draggable={false}
          style={s.phoneBg}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 0.14 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}

      <div style={{ ...s.twoCol, ...(wide ? s.twoColWide : {}) }}>
        {/* ── Heading ──────────────────────────────────────── */}
        <div style={s.leftCol}>
          <div style={s.head}>
            <span style={s.tag}>03 · Feed → Published</span>
            <h2 style={s.heading}>Catch the story first.</h2>
            <p style={s.sub}>
              Every newsroom gets the same feed at the same second. NewsLabs runs it to publish before anyone else.
            </p>
          </div>
        </div>

        {/* ── Pipeline + Published list ────────────────────── */}
        <div style={s.rightCol}>
          <div style={s.pipeline}>
            <div ref={trackRef} style={s.track}>
              {/* connecting line + progress fill */}
              {nodeX.length === STEPS.length && (
                <>
                  <div style={{ ...s.line, left: firstX, top: baseY, width: lastX - firstX }} />
                  <motion.div
                    style={{ ...s.lineFill, left: firstX, top: baseY }}
                    animate={{ width: fillW }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  />
                </>
              )}

              {/* step nodes */}
              <div style={s.nodes}>
                {STEPS.map((st, i) => {
                  const state = i < step ? 'done' : i === step ? 'active' : 'idle'
                  return (
                    <div key={st.id} style={s.node}>
                      <div
                        ref={el => { nodeRefs.current[i] = el }}
                        style={{
                          ...s.circle,
                          ...(state === 'idle' ? s.circleIdle : {}),
                          ...(state === 'done' ? s.circleDone : {}),
                          ...(state === 'active' ? s.circleActive : {}),
                        }}
                      >
                        {/* pulsing ring on the active step */}
                        {state === 'active' && !reduce && (
                          <motion.span
                            style={s.pulse}
                            initial={{ opacity: 0.5, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.9 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                          />
                        )}
                        <st.Icon size={19} strokeWidth={2} />
                      </div>
                      <span style={{ ...s.nodeLabel, color: state === 'idle' ? 'oklch(0.55 0.015 85)' : 'var(--cream)' }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* the travelling "news" puck */}
              {nodeX.length === STEPS.length && !reduce && (
                <AnimatePresence>
                  <motion.div
                    key={headlineIdx}
                    style={{ ...s.puck, top: baseY - 22 }}
                    initial={{ x: firstX - 22, y: 0, opacity: 0, scale: 0.8 }}
                    animate={{ x: (nodeX[step] ?? 0) - 22, y: [0, -30, 0], opacity: 1, scale: 1 }}
                    exit={{ x: lastX - 22, y: -52, opacity: 0, scale: 0.5 }}
                    transition={{
                      x: { type: 'spring', stiffness: 280, damping: 18 }, // loose = a little landing bounce
                      y: { duration: 0.5, times: [0, 0.45, 1], ease: 'easeOut' },
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.25 },
                    }}
                  >
                    <FileText size={18} strokeWidth={2.2} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* ── Published list ─────────────────────────────── */}
          <div style={s.published}>
            <div style={s.publishedHead}>
              <span style={s.liveDot} />
              <span style={s.publishedTitle}>Published</span>
              <span style={s.publishedStamp}>
                <Stamp tone="dark">Filed</Stamp>
              </span>
            </div>

            <div style={s.list}>
              <AnimatePresence initial={false} mode="popLayout">
                {published.map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    style={s.row}
                    initial={reduce ? false : { opacity: 0, x: -16, y: -8 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  >
                    <span style={s.rowIcon}><Globe size={13} strokeWidth={2.2} /></span>
                    <span style={s.rowTitle}>{entry.title}</span>
                    <span style={s.rowSection}>{entry.section}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {published.length === 0 && (
                <p style={s.empty}>Waiting on the first story…</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkflowCardFrame>
  )
}

// The race loop streams stories into the list one at a time, capped at 5 rows
// (see the .slice(0, 5) above). Reserve that full height up front so the panel
// — and the whole card — holds steady instead of growing as rows arrive.
const MAX_ROWS = 5
const ROW_H = 38   // row: 12.5px/1.3 text + 9px·2 padding + 1px·2 border, rounded up
const ROW_GAP = 8  // matches s.list gap
const LIST_MIN_H = MAX_ROWS * ROW_H + (MAX_ROWS - 1) * ROW_GAP

const s: Record<string, React.CSSProperties> = {
  head: {
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
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 3.4vw, 40px)',
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    color: '#ffffff',
    margin: '0 0 10px',
  },
  sub: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'oklch(0.68 0.015 85)',
    maxWidth: '46ch',
    margin: 0,
  },
  twoCol: {
    position: 'relative',
    zIndex: 2, // content sits above the corner phone / mobile wash
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    alignItems: 'stretch',
  },
  twoColWide: {
    display: 'grid',
    // Heading + phone on the left; the wider right column carries the 5-node
    // stepper and the Published panel beneath it.
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)',
    gap: 'clamp(36px, 4vw, 64px)',
    alignItems: 'stretch',
  },
  leftCol: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightCol: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  pipeline: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    minHeight: '140px',
  },
  // Desktop: anchored to the card's bottom-left corner and bled slightly past
  // both edges, where the frame's overflow:hidden crops it. Sized off the card
  // width (not a flow column), so it scales with the card and its transparent
  // top harmlessly overlaps the heading instead of reserving empty space.
  phone: {
    position: 'absolute',
    left: '-8px',
    bottom: '-14px',
    zIndex: 1,
    width: 'min(50%, 660px)',
    height: 'auto',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  // Mobile: the phone drops behind the stacked content as a faint wash anchored
  // to the card's bottom-left corner (low opacity is applied via the animation).
  phoneBg: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 1,
    width: 'min(85%, 420px)',
    height: 'auto',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  track: {
    position: 'relative',
    width: '100%',
    paddingTop: '34px', // headroom for the puck's hop
  },
  line: {
    position: 'absolute',
    height: '2px',
    background: 'oklch(0.30 0.025 272)',
    transform: 'translateY(-50%)',
    borderRadius: '2px',
  },
  lineFill: {
    position: 'absolute',
    height: '2px',
    background: 'var(--brand-orange)',
    transform: 'translateY(-50%)',
    borderRadius: '2px',
    boxShadow: '0 0 10px rgba(255,140,0,0.55)',
  },
  nodes: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  node: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '64px',
  },
  circle: {
    position: 'relative',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s, color 0.3s, border-color 0.3s',
  },
  circleIdle: {
    background: 'oklch(0.24 0.028 272)',
    border: '2px solid oklch(0.30 0.025 272)',
    color: 'oklch(0.58 0.015 85)',
  },
  circleDone: {
    background: 'oklch(0.24 0.028 272)',
    border: '2px solid var(--brand-orange)',
    color: 'var(--brand-orange)',
  },
  circleActive: {
    background: 'var(--brand-orange)',
    border: '2px solid var(--brand-orange)',
    color: '#14182A',
  },
  pulse: {
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    border: '2px solid var(--brand-orange)',
    pointerEvents: 'none',
  },
  nodeLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.01em',
    transition: 'color 0.3s',
  },
  puck: {
    position: 'absolute',
    left: 0,
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(150deg, #FFB04A 0%, #FF8C00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#14182A',
    boxShadow: '0 8px 20px rgba(255,140,0,0.40)',
    zIndex: 4,
  },
  published: {
    width: '100%',
    background: 'oklch(0.232 0.028 272)',
    border: '1px solid oklch(0.30 0.025 272)',
    borderRadius: '14px',
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    // Beside the pipeline at desktop, clip the capped list cleanly to the column.
    minHeight: 0,
    overflow: 'hidden',
  },
  publishedHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  publishedStamp: {
    marginLeft: 'auto',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--brand-orange)',
    boxShadow: '0 0 0 4px rgba(255,140,0,0.18)',
  },
  publishedTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'oklch(0.7 0.015 85)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    // Hold the full 5-row height from the start so the card never jumps as
    // stories stream in.
    minHeight: LIST_MIN_H,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '9px 10px',
    background: 'oklch(0.26 0.028 272)',
    border: '1px solid oklch(0.31 0.025 272)',
    borderRadius: '9px',
  },
  rowIcon: {
    flexShrink: 0,
    color: 'var(--brand-orange)',
    display: 'flex',
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'var(--font-sans)',
    fontSize: '12.5px',
    fontWeight: 500,
    lineHeight: 1.3,
    color: 'oklch(0.92 0.01 85)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowSection: {
    flexShrink: 0,
    padding: '2px 8px',
    background: 'oklch(0.30 0.025 272)',
    borderRadius: '5px',
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'oklch(0.66 0.015 85)',
  },
  empty: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '13px',
    color: 'oklch(0.55 0.015 85)',
    margin: '4px 2px',
  },
}
