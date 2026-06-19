import { useId, type CSSProperties, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Vintage newsroom kit — small, reusable print-furniture components shared
// across the page so the retro treatment stays one source of truth.
//
//   SectionRule  — the newspaper "Oxford rule" (thick-over-thin double rule),
//                  optionally broken by a centred mono caption (a dateline).
//   Eyebrow      — the dot-leading mono kicker, with an optional folio ("No. 02").
//                  Consolidates the near-identical eyebrows in Stats + FAQ.
//   Tombstone    — the end-of-article square (∎) appended after editorial copy.
//   CropMarks    — four corner registration marks for a "proof sheet" feel.
//
// Every component takes a `tone` ('light' = ink-on-cream, 'dark' = cream-on-ink)
// so the same kit serves both surface types. Motion (the rule draw-in) honours
// reduced-motion per the house pattern (`useReducedMotion() ?? false`).
// ─────────────────────────────────────────────────────────────────────────────

type Tone = 'light' | 'dark'

const RULE = {
  light: { thick: 'rgba(20,24,42,0.85)', thin: 'rgba(20,24,42,0.25)', caption: 'rgba(20,24,42,0.55)' },
  dark:  { thick: 'rgba(249,247,244,0.70)', thin: 'rgba(249,247,244,0.22)', caption: 'oklch(0.62 0.015 85)' },
} as const

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function SectionRule({
  tone = 'dark',
  label,
  align = 'center',
  maxWidth,
}: {
  tone?: Tone
  label?: string
  align?: 'left' | 'center' | 'right'
  maxWidth?: number | string
}) {
  const reduce = useReducedMotion() ?? false
  const c = RULE[tone]

  const draw = reduce
    ? {}
    : {
        initial: { scaleX: 0 },
        whileInView: { scaleX: 1 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.45, ease: EASE },
      }

  // The stacked double rule itself (thick over thin).
  const doubleRule = (flex?: number) => (
    <motion.div
      style={{ ...r.double, flex: flex ?? 'initial', transformOrigin: align === 'right' ? 'right' : 'left' }}
      {...draw}
    >
      <div style={{ ...r.line, height: 2, background: c.thick }} />
      <div style={{ ...r.line, height: 1, background: c.thin }} />
    </motion.div>
  )

  if (label) {
    // Caption breaking the rule: [rule] LABEL [rule].
    return (
      <div style={{ ...r.wrap, maxWidth }} aria-hidden>
        {doubleRule(1)}
        <span style={{ ...r.caption, color: c.caption }}>{label}</span>
        {doubleRule(1)}
      </div>
    )
  }

  return (
    <motion.div
      aria-hidden
      style={{
        ...r.double,
        maxWidth,
        transformOrigin: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
        margin: align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0 auto 0 0',
      }}
      {...draw}
    >
      <div style={{ ...r.line, height: 2, background: c.thick }} />
      <div style={{ ...r.line, height: 1, background: c.thin }} />
    </motion.div>
  )
}

export function Eyebrow({
  children,
  folio,
  tone = 'dark',
}: {
  children: ReactNode
  folio?: string
  tone?: Tone
}) {
  const color = tone === 'dark' ? 'var(--brand-orange)' : 'var(--accent)'
  return (
    <span style={{ ...r.eyebrow, color }}>
      <span style={{ ...r.eyebrowDot, background: color }} />
      {folio && <span style={r.folio}>{folio}</span>}
      {children}
    </span>
  )
}

export function Tombstone({ tone = 'dark' }: { tone?: Tone }) {
  const color = tone === 'dark' ? 'oklch(0.62 0.015 85)' : 'var(--accent)'
  return <span aria-hidden style={{ ...r.tombstone, background: color }} />
}

// Deterministic torn-paper edge path (no randomness → SSR-stable). Sawtooth with
// varied peaks across a 1200-wide viewBox; preserveAspectRatio:none lets it
// stretch to any section width.
const TORN_PATH = (() => {
  const step = 26
  const pts: string[] = []
  for (let i = 0, x = 0; x <= 1200; i++, x += step) {
    // Two interleaved sines give an irregular, hand-torn ridge between y≈3 and 15.
    const y = 8 + Math.sin(i * 1.9) * 4 + Math.sin(i * 0.7 + 1.1) * 3
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return `M0 22 L${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(' ')} L1200 22 Z`
})()

// A torn paper seam. Belongs to the LATER (lower) section in DOM order so paint
// order puts it over the section above; parent must be position:relative.
export function TornEdge({ fill, height = 22 }: { fill: string; height?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: -(height - 1), // 1px overlap to avoid a hairline seam
        left: 0,
        right: 0,
        height,
        lineHeight: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <svg width="100%" height={height} viewBox="0 0 1200 22" preserveAspectRatio="none" style={{ display: 'block' }}>
        <path d={TORN_PATH} fill={fill} />
      </svg>
    </div>
  )
}

// ── Realistic torn-paper seam (the hand-drawn PaperTear.svg art) ─────────────
// Where TornEdge is a thin procedural sawtooth, this is the elaborate ragged edge
// from src/assets/PaperTear.svg: a `sheet` (paper) that hangs DOWN over the section
// below and tears away to reveal it, a slightly darker `under` layer rimming the
// tear for depth, and a soft drop shadow falling past the torn edge.
//
// The art's flat top sits at y≈11 and its torn edge spans y≈135→424. We crop the
// viewBox to start at y=120 (just above the highest tooth) so the art's flat top —
// and the shadow band above it — are clipped out; the rendered top is therefore a
// clean, solid `sheet`-coloured edge. Set `sheet` to the *upper* section's
// background so that edge blends invisibly into it while the tear reveals the
// section behind. The art's paths are also inset ~12u from the viewBox sides
// (x spans 12→1292 of 0→1304); with preserveAspectRatio="none" that inset scaled
// up into a dark gap at each screen edge on wide viewports — so the viewBox is
// cropped horizontally to the paths' x-extent (a hair of overscan) so the sheet
// bleeds fully edge to edge. preserveAspectRatio="none" stretches it to any width.
//
// Belongs to the LOWER section (it hangs down into it, painting over the section
// above in normal DOM order); the parent must be position:relative.
const TEAR_UNDER_D =
  'M1282.54 157.449L1292 146.723L1271.25 135.011L1258.05 158.26L1248.79 158.154L1236.19 174.068L1212.1 178.377L1196.76 202.978L1179.05 221.128L1172.51 230.23L1167.53 227.418L1154.8 248.379L1140.09 247.75L1122.38 265.9L1110.89 254.294L1103.27 273.019L1081.19 281.024L1051.99 287.568L1036.1 283.713L1022.21 283.553L1010.47 282.039L986.123 296.441L983.885 284.943L974.855 292.639L946.864 284.514L934.516 290.337L927.877 286.588L923.349 299.385L905.543 304.685L898.073 300.469L887.006 322.366L879.538 318.149L868.622 317.105L858.79 306.437L848.83 300.816L810 340.73L771.5 311.2L708.992 340.73L647.5 312.944L625.82 265.9L598.445 233.672L588.5 278.679L563.569 257.251L514.028 254.726L475.991 264.116L451.622 222.032L439.28 241.596L429.632 245.77L419.891 254.726L409.534 254.464L402.298 257.595L392.768 235.639L385.532 238.77L368.932 231.727L365.195 219.119L358.764 221.901L347.343 214.988L320.552 219.466L312.346 211.163L309.746 221.77L287.352 205.38L276.191 205.467L263.067 204.032L247.887 205.857L220.575 196.336L197.743 209.638L185.413 202.952L180.94 222.632L161.281 226.038L150.514 240.603L133.579 237.139L130.855 244.009L122.744 243.475L103.085 246.881L82.9054 243.202L63.3802 263.066L48.3266 263.25L41.451 272.197L23.3471 267.481L12 296.106L22.8683 295.056L39.7025 285.007L47.746 277.311L64.1611 273.691L74.7349 263.813L88.0989 255.294L116.777 250.132L144.093 248.404L159.793 242.389L183.083 229.823L214.418 209.56L232 226.038L259 219.119L282.5 214.988L311.165 230.639L328.214 235.117L356.59 251.29L391.919 278.679L400.763 274.854L441.175 307.155L484.565 309.721L498.753 317.808L514.028 311.2L528.311 314.504L538.551 340.894L566.195 373.978L610.944 296.896L615.557 325.72L625.82 330.762L634.192 350.847L643.84 346.675L655.369 370.078L657.395 352.854L708.992 424.007L739.651 392.7L751.674 366.226L766.865 364.566L782.633 373.467L797.949 366.762L843.746 369.587L887.81 340.73L896.939 345.884L935.42 321.55L966.052 308.14L984.211 305.597L1004.05 286.096L1038.08 305.302L1068.01 286.378L1089.36 290.755L1123.44 274.172L1147.79 259.77L1163.23 248.018L1186.64 220.298L1212.55 193.984L1227.04 186.809L1239.74 183.745L1254.83 169.237L1264.56 167.055L1282.54 157.449Z'
const TEAR_SHEET_D =
  'M12 296.106L23.3471 267.481L41.451 272.197L48.3266 263.25L63.3802 263.066L82.9054 243.202L103.085 246.881L122.744 243.475L130.855 244.009L133.579 237.139L150.514 240.603L161.281 226.038L180.94 222.632L185.413 202.952L197.743 209.638L220.575 196.336L247.887 205.857L263.067 204.032L276.191 205.467L287.352 205.38L309.746 221.77L312.346 211.163L320.552 219.466L347.343 214.988L358.764 221.901L365.195 219.119L368.932 231.727L385.532 238.77L392.768 235.639L402.298 257.595L409.534 254.464L419.891 254.726L429.632 245.77L439.28 241.596L451.622 222.032L475.991 264.116L514.028 254.726L563.569 257.251L588.5 278.679L598.445 233.672L625.82 265.9L647.5 312.944L708.992 340.73L771.5 311.2L810 340.73L848.83 300.816L858.79 306.437L868.622 317.105L879.538 318.149L887.006 322.366L898.073 300.469L905.543 304.685L923.349 299.385L927.877 286.588L934.516 290.337L946.864 284.514L974.855 292.639L983.885 284.943L986.123 296.441L1010.47 282.039L1022.21 283.553L1036.1 283.713L1051.99 287.568L1081.19 281.024L1103.27 273.019L1110.89 254.294L1122.38 265.9L1140.09 247.75L1154.8 248.379L1167.53 227.418L1172.51 230.23L1179.05 221.128L1196.76 202.978L1212.1 178.377L1236.19 174.068L1248.79 158.154L1258.05 158.26L1271.25 135.011L1292 146.723L1292.01 11H12.0078L12 296.106Z'

export function PaperTearEdge({
  sheet = 'var(--cream)',
  under = '#EDEBE8',
  height = 'clamp(48px, 7vw, 100px)',
  bleed = 0,
}: {
  sheet?: string
  under?: string
  height?: number | string
  // An abs-positioned element resolves left/right against its containing block's
  // *padding box*, so left:0/right:0 already spans the full section width (= the
  // viewport) regardless of the section's --section-px padding — that's full-bleed
  // on its own. Any non-zero bleed pushes the edge PAST the viewport on both sides
  // and creates horizontal scroll (the page clip is only on <body>), so keep it 0
  // unless a host genuinely needs to extend beyond its own box.
  bleed?: number | string
}) {
  const id = useId()
  const out = typeof bleed === 'number' ? -bleed : `calc(${bleed} * -1)`
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: -2, // hairline overlap into the section above to avoid a seam line
        left: out,
        right: out,
        height,
        lineHeight: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="13 120 1278 317"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <g filter={`url(#${id})`}>
          <path d={TEAR_UNDER_D} fill={under} />
          <path d={TEAR_SHEET_D} fill={sheet} />
        </g>
        <defs>
          <filter
            id={id}
            x="0"
            y="0"
            width="1304.01"
            height="437.008"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

// ── Bottom torn-paper seam (the hand-drawn BottomTornPaper.svg art) ──────────
// The mirror of PaperTearEdge for the bottom of a section: a cream `sheet` that
// rises from the bottom edge with its ragged tear facing UP, plus four small
// `under` fragments rimming the tear for depth. Inlined (rather than used as an
// <img>/background) for the same reason as PaperTearEdge — preserveAspectRatio
// "none" lets it stretch full-bleed to any width; as an <img> the browser would
// letterbox-center the fixed 1280×383 art instead.
//
// Belongs to the section it closes; the parent must be position:relative. Set
// `sheet` to the *lower* section's background when you want it to read as a seam
// into that section (defaults to cream, the art's own colour).
const BOTTOM_TEAR_UNDER_DS = [
  'M727.651 245.977L696.992 277.283L722.5 261.5L739.674 231L748.5 220.038L763.5 231H785.949H824.5L843.5 222.863H871.5L908 194.007L940.5 170L974.5 175L999 164L1034.5 174.826H1062L1069 158.874L1095 144.031L1128.5 121L1157.5 101.295L1192 89L1215.04 56.5L1238 68L1262 37.0215L1280 20.3311V0L1270.54 10.7256L1252.56 20.3311L1242.83 22.5127L1227.74 37.0215L1215.04 40.0859L1200.55 47.2607L1174.64 73.5742L1151.23 101.295L1135.79 113.046L1111.44 127.448L1077.36 144.031L1056.01 139.654L1026.08 158.579L992.055 139.372L972.211 158.874L954.052 161.416L923.42 174.826L884.939 199.16L875.811 194.007L831.746 222.863L785.949 220.038L770.633 226.744L754.865 217.843L739.674 219.503L727.651 245.977Z',
  'M35.7461 130.587L27.7021 138.283L38.5 136.5L61 134L79 115H108L130.5 108L142 97.8847L132.093 101.681L104.776 103.409L76.0986 108.57L62.7354 117.09L52.1611 126.968L35.7461 130.587Z',
  'M171.083 83.0996L147.793 95.665L142 97.8847L178 88.3936L220 79.3145L202.418 62.8369L171.083 83.0996Z',
  'M502.028 164.477L486.753 171.084L516.311 178.996L521.5 211.5L537.5 223.354L552.5 235.5L568 226.744L574 217.843L589 202.5L607 199.16L613.819 208.5L626.5 211.5L637 231L651.5 226.744L669.5 239.371L645.395 206.13L643.369 223.354L631.84 199.951L622.192 204.124L613.819 184.039L603.558 178.996L598.944 150.173L554.195 227.255L526.552 194.17L516.311 167.78L502.028 164.477Z',
]
const BOTTOM_TEAR_SHEET_D =
  'M10.8682 148.333L0 149.383V382.5H1280V20.3311L1262 37.0215L1238 68L1215.04 56.5L1192 89L1157.5 101.295L1128.5 121L1095 144.031L1069 158.874L1062 174.826H1034.5L999 164L974.5 175L940.5 170L908 194.007L871.5 222.863H843.5L824.5 231H785.949H763.5L748.5 220.038L739.674 231L722.5 261.5L696.992 277.283L669.5 239.371L651.5 226.744L637 231L626.5 211.5L613.819 208.5L607 199.16L589 202.5L574 217.843L568 226.744L552.5 235.5L537.5 223.354L521.5 211.5L516.311 178.996L486.753 171.084L472.565 162.998L429.176 160.432L388.763 128.13L379.919 131.955L344.591 104.566L316.214 88.3936L299.165 83.916L270.5 68.2646L247 72.3955L220 79.3145L178 88.3936L142 97.8847L130.5 108L108 115H79L61 134L38.5 136.5L27.7021 138.283L10.8682 148.333Z'

export function BottomPaperTearEdge({
  sheet = 'var(--cream)',
  under = '#EDEBE8',
  height = 'clamp(48px, 7vw, 100px)',
  bleed = 0,
}: {
  sheet?: string
  under?: string
  height?: number | string
  bleed?: number | string
}) {
  const out = typeof bleed === 'number' ? -bleed : `calc(${bleed} * -1)`
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        bottom: -1, // hairline overlap into the section below to avoid a seam line
        left: out,
        right: out,
        height,
        lineHeight: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1280 383"
        preserveAspectRatio="none"
        style={{ display: 'block', filter: 'drop-shadow(0 -2px 6px rgba(0,0,0,0.35))' }}
      >
        {BOTTOM_TEAR_UNDER_DS.map((d, i) => (
          <path key={i} d={d} fill={under} />
        ))}
        <path d={BOTTOM_TEAR_SHEET_D} fill={sheet} />
      </svg>
    </div>
  )
}

export function CropMarks({ tone = 'dark' }: { tone?: Tone }) {
  const color = tone === 'dark' ? 'rgba(249,247,244,0.30)' : 'rgba(20,24,42,0.22)'
  // Four corner L-marks. Parent must be position:relative.
  return (
    <div aria-hidden style={r.cropWrap}>
      {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
        <div key={pos} style={cornerStyle(pos, color)} />
      ))}
    </div>
  )
}

function cornerStyle(pos: 'tl' | 'tr' | 'bl' | 'br', color: string): CSSProperties {
  const arm = 14
  const base: CSSProperties = {
    position: 'absolute',
    width: arm,
    height: arm,
    [pos.includes('t') ? 'top' : 'bottom']: -6,
    [pos.includes('l') ? 'left' : 'right']: -6,
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 0,
  }
  base[pos.includes('t') ? 'borderTopWidth' : 'borderBottomWidth'] = 1
  base[pos.includes('l') ? 'borderLeftWidth' : 'borderRightWidth'] = 1
  return base
}

const r: Record<string, CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  double: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    width: '100%',
  },
  line: {
    width: '100%',
    borderRadius: 2,
  },
  caption: {
    flexShrink: 0,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  folio: {
    opacity: 0.7,
    paddingRight: 2,
  },
  tombstone: {
    display: 'inline-block',
    width: '0.5em',
    height: '0.5em',
    marginLeft: '0.32em',
    verticalAlign: 'baseline',
    opacity: 0.6,
  },
  cropWrap: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
  },
}
