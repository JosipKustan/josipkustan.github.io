import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { Eyebrow } from './vintage/VintageKit'
import { useIsMobile } from '../hooks/useMediaQuery'

// ─────────────────────────────────────────────────────────────────────────────
// Connect / "newsroom hub" diagram. Inspired by Stripe's "connect to existing
// systems" graph: a central NewsLabs node wired to three clusters of connected
// systems, with animated "data packet" pulses flowing along dashed connectors.
//
//   LEFT — Ingest sources (news content you pull/import) flow RIGHT through the
//          Ingest pill into the core.
//   TOP  — Live feed sources (continuous real-time streams) flow DOWN through the
//          Live feed pill into the core.
//   BOTTOM — the LLMs (Gemini, OpenAI, Anthropic, Grok, Local) flow UP into the core
//          via an "LLMs" hub, each chip badged with its brand mark.
//   RIGHT — the core publishes OUT to "Your newsroom" (site · app · newsletter),
//          which fans out to its own Integrations (CMS, Social buffers, Image
//          services).
//
// NewsLabs + Your newsroom sit as the central pair straddling the middle, wrapped in
// a dashed boundary so they read as one system; inbound flow (left/top/bottom)
// converges on the core, then radiates right through the newsroom to its integrations.
// Where each flow line crosses the boundary a slow, faint orange "raindrop" ripple
// pings (see HUB_BOX / IMPACTS).
//
// Geometry trick: the diagram lives in a fixed 1000×660 logical coordinate space.
// The wrapper is a container (`container-type: inline-size`) with that exact
// aspect-ratio, so 1 logical unit == 0.1cqw at every width. Nodes are HTML
// positioned in cqw (so text stays crisp and scales as one unit); the connectors
// are an SVG with a matching viewBox (uniform scale → no stroke distortion).
// Connector endpoints land *inside* the node they touch, so the opaque node box
// hides the join — the same approach as the reference.
// ─────────────────────────────────────────────────────────────────────────────

const VB = { w: 1000, h: 660 }
// logical coord → cqw. height is locked to width by the aspect-ratio, so x and y
// share the same factor (coord / 10).
const cq = (n: number) => `${n / 10}cqw`

type Pt = { x: number; y: number }

// Orthogonal path with rounded corners through a list of waypoints (the Stripe
// connector look). Corner radius is clamped to half the shorter adjacent leg.
function rounded(pts: Pt[], r = 16): string {
  if (pts.length < 2) return ''
  if (pts.length === 2) return `M${pts[0].x} ${pts[0].y}L${pts[1].x} ${pts[1].y}`
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1]
    const l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1
    const l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1
    const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2)
    const a = { x: p1.x + ((p0.x - p1.x) / l1) * r1, y: p1.y + ((p0.y - p1.y) / l1) * r1 }
    const b = { x: p1.x + ((p2.x - p1.x) / l2) * r2, y: p1.y + ((p2.y - p1.y) / l2) * r2 }
    d += `L${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${p1.x} ${p1.y} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  }
  const last = pts[pts.length - 1]
  d += `L${last.x} ${last.y}`
  return d
}

// Each connector is ordered source → destination so a single dash-offset
// animation (0 → -1) sends every packet "forward" along the flow.
const CONNECTORS: { pts: Pt[]; delay: number }[] = [
  // Left: Ingest sources → Ingest pill → core (flowing right)
  { pts: [{ x: 205, y: 330 }, { x: 275, y: 330 }], delay: 0.0 },
  { pts: [{ x: 318, y: 330 }, { x: 380, y: 330 }], delay: 0.55 },
  // Top: Live feed sources → Live feed pill → core (flowing down)
  { pts: [{ x: 420, y: 92 }, { x: 420, y: 186 }], delay: 0.25 },
  { pts: [{ x: 420, y: 205 }, { x: 420, y: 275 }], delay: 0.8 },
  // Right: core → your newsroom (central pair) → Integrations hub → its chips
  { pts: [{ x: 475, y: 330 }, { x: 540, y: 330 }], delay: 0.6 },
  { pts: [{ x: 690, y: 330 }, { x: 745, y: 330 }], delay: 0.85 },
  { pts: [{ x: 822, y: 330 }, { x: 836, y: 330 }, { x: 836, y: 240 }, { x: 895, y: 240 }], delay: 1.0 },
  { pts: [{ x: 822, y: 330 }, { x: 895, y: 330 }], delay: 1.1 },
  { pts: [{ x: 822, y: 330 }, { x: 836, y: 330 }, { x: 836, y: 420 }, { x: 895, y: 420 }], delay: 1.2 },
  // Bottom: LLM chips → LLMs hub → core (flowing up)
  { pts: [{ x: 140, y: 600 }, { x: 140, y: 545 }, { x: 420, y: 545 }, { x: 420, y: 480 }], delay: 0.1 },
  { pts: [{ x: 280, y: 600 }, { x: 280, y: 545 }, { x: 420, y: 545 }, { x: 420, y: 480 }], delay: 0.3 },
  { pts: [{ x: 420, y: 600 }, { x: 420, y: 480 }], delay: 0.5 },
  { pts: [{ x: 560, y: 600 }, { x: 560, y: 545 }, { x: 420, y: 545 }, { x: 420, y: 480 }], delay: 0.7 },
  { pts: [{ x: 700, y: 600 }, { x: 700, y: 545 }, { x: 420, y: 545 }, { x: 420, y: 480 }], delay: 0.9 },
  { pts: [{ x: 420, y: 455 }, { x: 420, y: 395 }], delay: 1.3 },
]

// Dashed "one system" boundary wrapping the NewsLabs core + Your newsroom pair, so
// they read as a single unit. Sized so every external flow line crosses one of its
// edges (the impact points below).
const HUB_BOX = { x: 325, y: 240, w: 400, h: 180, r: 30 }
// Where each flow line crosses the boundary — a raindrop ripple pings here as the
// orange packets pass. Staggered so the four edges don't pulse in unison.
const IMPACTS: { x: number; y: number; delay: number }[] = [
  { x: 420, y: 240, delay: 0.0 },   // Live feed → top edge
  { x: 325, y: 330, delay: 0.9 },   // Ingest → left edge
  { x: 420, y: 420, delay: 1.8 },   // LLMs → bottom edge
  { x: 725, y: 330, delay: 2.6 },   // newsroom → Integrations hub, right edge
]

// Inbound sources, categorised by ingestion route. Each cluster feeds its own pill:
// Ingest = news-content sources you pull/import; Live feed = continuous real-time streams.
const INGEST = ['Socials', 'Breaking news', 'Wires', 'Your data']
const LIVE = ['Real-time data', 'Transcription', 'Broadcast']
const MODELS: { label: string; x: number; icon: React.ReactNode }[] = [
  { label: 'Gemini', x: 140, icon: <GeminiIcon /> },
  { label: 'OpenAI', x: 280, icon: <OpenAIIcon /> },
  { label: 'Anthropic', x: 420, icon: <AnthropicIcon /> },
  { label: 'Grok', x: 560, icon: <GrokIcon /> },
  { label: 'Local models', x: 700, icon: <LocalIcon /> },
]
// Label → mark lookup so the mobile chip row can reuse the same icons.
const MODEL_ICONS: Record<string, React.ReactNode> = Object.fromEntries(MODELS.map(m => [m.label, m.icon]))
const INTEGRATIONS: { label: string; y: number }[] = [
  { label: 'CMS', y: 240 },
  { label: 'Social buffers', y: 330 },
  { label: 'Your custom services', y: 420 },
]

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]
const SPRING = { type: 'spring', stiffness: 320, damping: 26 } as const

const groupV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } } }
const nodeV: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: SPRING },
}

// A label sitting at a logical (x,y), centred on that point. The inner motion.div
// carries the scroll-in scale/fade (variants propagate from the nodes layer).
function Node({ x, y, children, style }: { x: number; y: number; children: React.ReactNode; style: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', left: cq(x), top: cq(y), transform: 'translate(-50%, -50%)' }}>
      <motion.div variants={nodeV} style={style}>
        {children}
      </motion.div>
    </div>
  )
}

// Broadcast "live" red — recording/on-air red, distinct from the warm brand orange.
const LIVE_RED = '#FF3B30'

// A status dot leading each source chip: a calm blue dot for ingest (stored/pulled
// sources), a pulsing red broadcast dot for live ones. The live dot gets a radar
// "ping" ring (same idiom as the core's pulse), staggered per chip so the three live
// channels breathe out of sync. Reduced-motion → solid dot, no ping.
function SourceDot({ live, reduce, index = 0, mobile = false }: { live?: boolean; reduce: boolean; index?: number; mobile?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        ...(mobile ? s.mDot : s.dot),
        background: live ? LIVE_RED : 'var(--primary)',
        boxShadow: live ? `0 0 6px ${LIVE_RED}` : 'none',
      }}
    >
      {live && !reduce && (
        <motion.span
          style={s.dotRing}
          animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: index * 0.35 }}
        />
      )}
    </span>
  )
}

// A categorised cluster of cream source chips, centred on (x,y) — sits above its pill.
// Chips carry the shared `nodeV` variant so they fade/scale in under the nodes-layer
// stagger. `maxWidth` (in cqw) controls how the chips wrap. Each chip lifts on hover
// and leads with a SourceDot (red + pulsing for `live` clusters).
//
// Framer note: build ONE source-chip Component (paper-bevel cream fill, ink text,
// subtle border, leading status dot) with a hover-lift variant. The dot is a small
// circle — blue for ingest, red with a looping scale/fade "ping" ring for live. Place
// two wrapped Stacks, one per category, each pinned above its pill.
function Cluster({ x, y, items, maxWidth, live, reduce }: { x: number; y: number; items: string[]; maxWidth: string; live?: boolean; reduce: boolean }) {
  return (
    <div style={{ position: 'absolute', left: cq(x), top: cq(y), transform: 'translate(-50%, -50%)' }}>
      <div style={{ ...s.cluster, maxWidth }}>
        {items.map((label, i) => (
          <motion.span
            key={label}
            variants={nodeV}
            style={s.sourceChip}
            whileHover={reduce ? undefined : { y: -3, scale: 1.05 }}
          >
            <SourceDot live={live} reduce={reduce} index={i} />
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--brand-blue)" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18"
        stroke="var(--brand-blue)"
        strokeWidth="1.6"
      />
    </svg>
  )
}

// ── LLM brand marks. Full-colour where the brand has one (Gemini gradient,
// Anthropic clay); OpenAI + Grok are monochrome brands → rendered cream so they
// read on the dark chips. "Local models" is generic, so a cream cpu glyph. Paths
// from simple-icons (OpenAI/Anthropic/Gemini) + svgl (Grok). ──
function OpenAIIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  )
}

function AnthropicIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#D97757" aria-hidden>
      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
    </svg>
  )
}

function GeminiIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="url(#geminiGrad)" aria-hidden>
      <defs>
        <linearGradient id="geminiGrad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9168C0" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
    </svg>
  )
}

function GrokIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden>
      <path d="M395.479 633.828L735.91 381.105C752.599 368.715 776.454 373.548 784.406 392.792C826.26 494.285 807.561 616.253 724.288 699.996C641.016 783.739 525.151 802.104 419.247 760.277L303.556 814.143C469.49 928.202 670.987 899.995 796.901 773.282C896.776 672.843 927.708 535.937 898.785 412.476L899.047 412.739C857.105 231.37 909.358 158.874 1016.4 10.6326C1018.93 7.11771 1021.47 3.60279 1024 0L883.144 141.651V141.212L395.392 633.916" />
      <path d="M325.226 695.251C206.128 580.84 226.662 403.776 328.285 301.668C403.431 226.097 526.549 195.254 634.026 240.596L749.454 186.994C728.657 171.88 702.007 155.623 671.424 144.2C533.19 86.9942 367.693 115.465 255.323 228.382C147.234 337.081 113.244 504.215 171.613 646.833C215.216 753.423 143.739 828.818 71.7385 904.916C46.2237 931.893 20.6216 958.87 0 987.429L325.139 695.339" />
    </svg>
  )
}

function LocalIcon() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
    </svg>
  )
}

function HubDiagram({ inView, reduce }: { inView: boolean; reduce: boolean }) {
  return (
    <div style={s.diagram}>
      {/* Connectors (behind the nodes). Uniform scale → matching viewBox aspect. */}
      <motion.svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={s.svg}
        initial={reduce ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
        aria-hidden
      >
        {/* Dashed "one system" boundary around the NewsLabs + newsroom pair —
            a clearly-visible orange that breathes gently. */}
        <motion.rect
          x={HUB_BOX.x} y={HUB_BOX.y} width={HUB_BOX.w} height={HUB_BOX.h} rx={HUB_BOX.r} ry={HUB_BOX.r}
          fill="none" stroke="var(--brand-orange)" strokeWidth={1.8}
          strokeDasharray="5 7" vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { opacity: 0.5 }}
          animate={reduce ? { opacity: 0.6 } : { opacity: [0.5, 0.75, 0.5] }}
          transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {CONNECTORS.map((c, i) => {
          const d = rounded(c.pts)
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(249,247,244,0.14)" strokeWidth={1.3}
                strokeLinecap="round" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
              {!reduce && (
                <path
                  className="hub-flow" d={d} fill="none" stroke="var(--brand-orange)" strokeWidth={2.4}
                  strokeLinecap="round" pathLength={1} strokeDasharray="0.06 0.94" strokeDashoffset={0}
                  vectorEffect="non-scaling-stroke" style={{ animationDelay: `${c.delay}s` }}
                />
              )}
            </g>
          )
        })}

        {/* Raindrop ripples where the orange flow lines cross the boundary. Slow +
            low-opacity on purpose — an ambient ping, not a strong pulse. */}
        {!reduce && IMPACTS.map((p, i) => (
          <motion.circle
            key={`ripple-${i}`}
            cx={p.x} cy={p.y} fill="none" stroke="var(--brand-orange)" strokeWidth={1.3}
            vectorEffect="non-scaling-stroke"
            initial={{ r: 1, opacity: 0 }}
            animate={{ r: [1, 22], opacity: [0, 0.2, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeOut', delay: p.delay, repeatDelay: 1.4 }}
          />
        ))}
      </motion.svg>

      {/* Nodes (above the connectors), staggered in on scroll. */}
      <motion.div
        style={s.nodes}
        variants={groupV}
        initial={reduce ? false : 'hidden'}
        animate={inView ? 'show' : reduce ? undefined : 'hidden'}
      >
        {/* Ingest sources — cream-chip column on the LEFT, flowing right into the core. */}
        <Cluster x={130} y={330} items={INGEST} maxWidth="16cqw" reduce={reduce} />
        {/* Live feed sources — cream-chip cluster on TOP, the live chips pulse red. */}
        <Cluster x={420} y={58} items={LIVE} maxWidth="20cqw" reduce={reduce} live />

        {/* Ingest pill (left) + Live feed pill (top) */}
        <Node x={300} y={330} style={s.hub}>Ingest</Node>
        <Node x={420} y={195} style={s.hub}>Live feed</Node>

        {/* Core */}
        <Node x={420} y={330} style={s.coreWrap}>
          <div style={s.core}>
            <img src="/assets/mark-cream.svg" alt="" aria-hidden style={s.coreMark} />
            <span style={s.coreText}>NewsLabs</span>
          </div>
        </Node>

        {/* LLMs (bottom) */}
        <Node x={420} y={470} style={s.hub}>LLMs</Node>
        {MODELS.map(m => (
          <Node key={m.label} x={m.x} y={600} style={{ ...s.chip, gap: '0.5cqw' }}>
            <span style={s.modelIcon}>{m.icon}</span>
            {m.label}
          </Node>
        ))}

        {/* Your newsroom — central pair with the core */}
        <Node x={595} y={330} style={s.out}>
          <span style={s.outIcon}><GlobeIcon /></span>
          <span style={s.outCol}>
            <span style={s.outTitle}>Your newsroom</span>
            <span style={s.outSub}>Site · App · Newsletter</span>
          </span>
        </Node>

        {/* Integrations — a hub pill (matching Ingest / LLMs) leading the newsroom's
            connected tools, which fan off it on the right */}
        <Node x={768} y={330} style={s.hub}>Integrations</Node>
        {INTEGRATIONS.map(it => (
          <Node key={it.label} x={920} y={it.y} style={s.chip}>{it.label}</Node>
        ))}
      </motion.div>
    </div>
  )
}

// ── Mobile: the same story, stacked vertically with short flowing connectors ──
function MConn({ reduce, h = 34 }: { reduce: boolean; h?: number }) {
  return (
    <svg width="2" height={h} viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      <path d="M1 0V100" fill="none" stroke="rgba(249,247,244,0.16)" strokeWidth={1.3} strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
      {!reduce && (
        <path className="hub-flow" d="M1 0V100" fill="none" stroke="var(--brand-orange)" strokeWidth={2.4}
          strokeLinecap="round" pathLength={1} strokeDasharray="0.14 0.86" strokeDashoffset={0} vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  )
}

function MGroup({ label, items, reduce, delay, cream, live, renderIcon }: { label: string; items: string[]; reduce: boolean; delay: number; cream?: boolean; live?: boolean; renderIcon?: (label: string) => React.ReactNode }) {
  return (
    <motion.div
      style={s.mGroup}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      <span style={s.mHub}>{label}</span>
      <div style={s.mChips}>
        {items.map((it, i) => (
          <span key={it} style={cream ? s.mSourceChip : s.mChip}>
            {cream && <SourceDot live={live} reduce={reduce} index={i} mobile />}
            {renderIcon && <span style={s.mModelIcon}>{renderIcon(it)}</span>}
            {it}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// A left-aligned vertical list for the mobile "outputs" footer (LLMs / Integrations).
// LLM rows lead with the brand mark; integration rows lead with a small orange dot.
function MList({ label, items, reduce, delay, renderIcon }: { label: string; items: string[]; reduce: boolean; delay: number; renderIcon?: (label: string) => React.ReactNode }) {
  return (
    <motion.div
      style={s.mList}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      <span style={s.mHub}>{label}</span>
      <div style={s.mListBox}>
        {items.map(it => (
          <div key={it} style={s.mListRow}>
            {renderIcon ? <span style={s.mListIcon}>{renderIcon(it)}</span> : <span style={s.mListBullet} aria-hidden />}
            <span>{it}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Mobile: a compact stack — inbound sources up top, the NewsLabs + newsroom pair
// boxed together as one system in the middle, and the LLMs / Integrations as
// left-aligned lists at the bottom.
function HubDiagramMobile({ reduce }: { reduce: boolean }) {
  return (
    <div style={s.mWrap}>
      {/* TOP — inbound sources */}
      <MGroup label="Ingest" items={INGEST} reduce={reduce} delay={0} cream />
      <MConn reduce={reduce} h={26} />
      <MGroup label="Live feed" items={LIVE} reduce={reduce} delay={0.05} cream live />
      <MConn reduce={reduce} />

      {/* MIDDLE — NewsLabs + Your newsroom, boxed as one system */}
      <motion.div
        style={s.mPair}
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={SPRING}
      >
        <div style={s.mCore}>
          <img src="/assets/mark-cream.svg" alt="" aria-hidden style={s.mCoreMark} />
          <span style={s.mCoreText}>NewsLabs</span>
        </div>
        <div style={s.mOutWrap}>
          <span style={s.mOutIcon}><GlobeIcon /></span>
          <span style={s.mOutCol}>
            <span style={s.mOutTitle}>Your newsroom</span>
            <span style={s.mOutSub}>Site · App · Newsletter</span>
          </span>
        </div>
      </motion.div>
      <MConn reduce={reduce} />

      {/* BOTTOM — outputs as left-aligned lists */}
      <div style={s.mLists}>
        <MList label="LLMs" items={MODELS.map(m => m.label)} reduce={reduce} delay={0.05} renderIcon={l => MODEL_ICONS[l]} />
        <MList label="Integrations" items={INTEGRATIONS.map(i => i.label)} reduce={reduce} delay={0.1} />
      </div>
    </div>
  )
}

export default function ConnectSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  return (
    <section style={s.section} id="connect" ref={ref}>
      <style>{CSS}</style>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Eyebrow tone="dark">The newsroom hub</Eyebrow>
          <h2 style={s.heading}>Connects to everything you run.</h2>
          <p style={s.standfirst}>
            Pull in every signal: socials, wires, broadcast, your own data. Run it through the models you
            trust, and publish straight to the tools your newsroom already lives in. NewsLabs sits in the
            middle, wiring it together.
          </p>
        </motion.header>

        {isMobile ? <HubDiagramMobile reduce={reduce} /> : <HubDiagram inView={inView} reduce={reduce} />}
      </div>
    </section>
  )
}

// The dash-offset flow + reduced-motion guard. One period (0.06 + 0.94 = 1.0)
// over pathLength 1 → exactly one packet per line, looping seamlessly.
const CSS = `
  .hub-flow {
    animation: hub-flow 2.6s linear infinite;
    filter: drop-shadow(0 0 3px rgba(255,140,0,0.85));
  }
  @keyframes hub-flow { to { stroke-dashoffset: -1; } }
  @media (prefers-reduced-motion: reduce) { .hub-flow { animation: none; opacity: 0; } }
`

const s: Record<string, CSSProperties> = {
  section: {
    position: 'relative',
    background: 'var(--ink)',
    padding: 'var(--section-py) var(--section-px)',
    borderBottom: '1px solid oklch(0.28 0.025 272)',
    // Subtle dot grid, like the reference's plotted background.
    backgroundImage: 'radial-gradient(rgba(249,247,244,0.05) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    overflow: 'hidden',
  },
  inner: {
    position: 'relative',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(36px, 6vw, 64px)',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', maxWidth: 720 },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
    margin: 0,
    lineHeight: 1.05,
  },
  standfirst: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(15px, 1.7vw, 18px)',
    lineHeight: 1.55,
    color: 'oklch(0.72 0.015 85)',
    margin: 0,
    maxWidth: '60ch',
  },

  // ── Desktop diagram ──
  diagram: {
    position: 'relative',
    width: '100%',
    maxWidth: 1000,
    margin: '0 auto',
    aspectRatio: '1000 / 660',
    containerType: 'inline-size',
  },
  svg: { position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' },
  nodes: { position: 'absolute', inset: 0 },

  cluster: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.55cqw 0.7cqw',
  },
  sourceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.55cqw',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F1EB 100%)',
    border: '1px solid rgba(20,24,42,0.10)',
    color: 'var(--ink)',
    borderRadius: '1cqw',
    padding: '0.62cqw 1.05cqw',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 'clamp(7px, 1.3cqw, 13px)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    cursor: 'default',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 8px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.18)',
  },
  // Leading status dot on each source chip (colour set inline per ingest/live).
  dot: { position: 'relative', width: '0.62cqw', height: '0.62cqw', minWidth: 6, minHeight: 6, borderRadius: '50%', flexShrink: 0, display: 'inline-block' },
  mDot: { position: 'relative', width: 7, height: 7, borderRadius: '50%', flexShrink: 0, display: 'inline-block' },
  // The expanding "ping" ring behind the live dot.
  dotRing: { position: 'absolute', inset: 0, borderRadius: '50%', background: LIVE_RED, pointerEvents: 'none' },
  hub: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--brand-blue)',
    border: '1px solid rgba(255,255,255,0.28)',
    color: '#fff',
    borderRadius: '1cqw',
    padding: '0.8cqw 1.4cqw',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 'clamp(8px, 1.5cqw, 15px)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    boxShadow: '0 6px 20px rgba(75,101,255,0.4)',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    color: 'var(--cream)',
    borderRadius: '1cqw',
    padding: '0.7cqw 1.1cqw',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: 'clamp(7px, 1.3cqw, 13px)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  modelIcon: { width: '1.7cqw', height: '1.7cqw', minWidth: 12, minHeight: 12, flexShrink: 0, display: 'inline-flex' },
  coreWrap: { position: 'relative' },
  core: {
    position: 'relative',
    width: '12cqw',
    height: '12cqw',
    minWidth: 60,
    minHeight: 60,
    borderRadius: '1.8cqw',
    background: 'linear-gradient(150deg, var(--brand-blue), var(--primary))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5cqw',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 0 55px rgba(75,101,255,0.45), 0 12px 34px rgba(0,0,0,0.45)',
  },
  coreMark: { width: '5.2cqw', minWidth: 24, height: 'auto', display: 'block' },
  coreText: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(8px, 1.45cqw, 14px)', color: '#fff', lineHeight: 1 },

  // Sized to match the NewsLabs core (same 12cqw height + 1.8cqw radius) so the two
  // read as equal-weight anchors — input hub and output destination.
  out: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.1cqw',
    height: '12cqw',
    minHeight: 60,
    background: 'var(--dark-card)',
    border: '1px solid rgba(75,101,255,0.42)',
    borderRadius: '1.8cqw',
    padding: '0 1.8cqw',
    boxShadow: '0 0 26px rgba(75,101,255,0.2)',
  },
  outIcon: { width: '3.6cqw', height: '3.6cqw', minWidth: 22, minHeight: 22, flexShrink: 0, display: 'block' },
  outCol: { display: 'flex', flexDirection: 'column', gap: '0.25cqw' },
  outTitle: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(8px, 1.5cqw, 15px)', color: 'var(--cream)', lineHeight: 1.05, whiteSpace: 'nowrap' },
  outSub: { fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(6px, 1.1cqw, 11px)', color: 'oklch(0.62 0.015 85)', lineHeight: 1.05, whiteSpace: 'nowrap' },

  // ── Mobile diagram ──
  mWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  mGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' },
  // Mobile category label — the desktop blue hub pill, px-sized for the stacked layout.
  mHub: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--brand-blue)',
    border: '1px solid rgba(255,255,255,0.28)',
    color: '#fff',
    borderRadius: 10,
    padding: '7px 15px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    boxShadow: '0 6px 20px rgba(75,101,255,0.4)',
  },
  mChips: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 460 },
  mChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    color: 'var(--cream)',
    borderRadius: 10,
    padding: '8px 13px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: 13,
    lineHeight: 1,
  },
  mModelIcon: { width: 16, height: 16, flexShrink: 0, display: 'inline-flex' },
  mSourceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F1EB 100%)',
    border: '1px solid rgba(20,24,42,0.10)',
    color: 'var(--ink)',
    borderRadius: 11,
    padding: '8px 13px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 8px rgba(0,0,0,0.22), 0 8px 18px rgba(0,0,0,0.16)',
  },
  // Middle pair — NewsLabs + newsroom boxed together as one system (dashed orange,
  // echoing the desktop boundary).
  mPair: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '20px 22px',
    border: '1.5px dashed rgba(255,140,0,0.6)',
    borderRadius: 24,
  },
  // Bottom — two left-aligned lists side by side: a blue pill label over a cream box.
  mLists: { display: 'flex', gap: 16, width: '100%', maxWidth: 460, alignItems: 'flex-start' },
  mList: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 },
  // Cream box wrapping the list contents (matches the source-chip surface).
  mListBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 11,
    width: '100%',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F1EB 100%)',
    border: '1px solid rgba(20,24,42,0.10)',
    borderRadius: 14,
    padding: '14px 15px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 8px rgba(0,0,0,0.22), 0 8px 18px rgba(0,0,0,0.16)',
  },
  mListRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 9,
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.25,
  },
  mListIcon: { width: 17, height: 17, flexShrink: 0, display: 'inline-flex', marginTop: 1 },
  mListBullet: { width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-orange)', flexShrink: 0, marginTop: 5 },
  mCore: {
    width: 104,
    height: 104,
    borderRadius: 18,
    background: 'linear-gradient(150deg, var(--brand-blue), var(--primary))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 0 50px rgba(75,101,255,0.4), 0 12px 30px rgba(0,0,0,0.45)',
  },
  // Newsroom card — sized to match the NewsLabs core square (same 104px height + 18px
  // radius) so the boxed pair reads as two equal-weight blocks.
  mOutWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    minHeight: 104,
    background: 'var(--dark-card)',
    border: '1px solid rgba(75,101,255,0.42)',
    borderRadius: 18,
    padding: '0 20px',
    boxShadow: '0 0 26px rgba(75,101,255,0.2)',
  },
  mOutIcon: { width: 40, height: 40, flexShrink: 0, display: 'block' },
  mOutCol: { display: 'flex', flexDirection: 'column', gap: 3 },
  mOutTitle: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: 'var(--cream)', lineHeight: 1.1, whiteSpace: 'nowrap' },
  mOutSub: { fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'oklch(0.62 0.015 85)', lineHeight: 1.1, whiteSpace: 'nowrap' },
  mCoreMark: { width: 42, height: 'auto', display: 'block' },
  mCoreText: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1 },
}

// mCore reuses the cqw-based coreMark/coreText, but in the mobile (non-container)
// context those clamps resolve to their px floor — fine at this fixed 104px size.
