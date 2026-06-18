// FactCheckCard — Framer Code Component (self-contained, editable via Property Controls)
// ─────────────────────────────────────────────────────────────────────────────
// Paste this ENTIRE file into a new Framer Code file (Assets → Code → New File).
// Then do TWO things:
//
//   1) Set BRAND_RAINBOW_URL below to the Framer-hosted URL of BrandRainbow.svg
//      (upload it under Assets, copy its URL). Leave it as-is / "" to hide the
//      bottom-right watermark.
//
//   2) This component relies on your Site Settings → Custom Code (<head>):
//        • the :root design-tokens block  → resolves var(--ink), var(--font-*)…
//        • the Google Fonts <link>        → loads Mozilla Text / Inter / Source Serif 4
//
// ALL TEXT IS EDITABLE in Framer's right-hand panel (see addPropertyControls at
// the bottom): tag, headline, standfirst, the legend, and the Claims array —
// each claim has its own lead-in text, highlight, colour, citation, quote, and
// evidence list. Add / remove / reorder claims directly in the panel.
//
// Inlined dependencies: useIsTightDesktop (1100px hook) + WorkflowCardFrame.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
  useCallback,
  useSyncExternalStore,
  forwardRef,
} from "react"
import type { CSSProperties, ReactNode, HTMLAttributes } from "react"
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Upload BrandRainbow.svg to Framer and paste its asset URL here ("" hides it).
const BRAND_RAINBOW_URL = "REPLACE_WITH_FRAMER_BRANDRAINBOW_URL"
const HAS_RAINBOW =
  !!BRAND_RAINBOW_URL && !BRAND_RAINBOW_URL.startsWith("REPLACE_")

// ── useIsTightDesktop (inlined from hooks/useMediaQuery) ───────────────────────
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", cb)
      return () => mql.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
function useIsTightDesktop() {
  return useMediaQuery("(max-width: 1100px)")
}

// ── WorkflowCardFrame (inlined) ────────────────────────────────────────────────
// Shared ink shell: border, radius, padding, diagonal sheen + BrandRainbow wash.
const WorkflowCardFrame = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { children: ReactNode; style?: CSSProperties }
>(function WorkflowCardFrame({ children, style, ...rest }, ref) {
  return (
    <div ref={ref} style={{ ...frame.root, ...style }} {...rest}>
      <div style={frame.sheen} aria-hidden />
      {HAS_RAINBOW && <div style={frame.rainbow} aria-hidden />}
      {children}
    </div>
  )
})

const frame: Record<string, CSSProperties> = {
  root: {
    position: "relative",
    width: "100%",
    background: "var(--ink)",
    border: "1px solid oklch(0.28 0.025 272)",
    borderRadius: "20px",
    padding:
      "clamp(24px, 3.5vw, 40px) clamp(16px, 3.5vw, 44px) clamp(24px, 3.5vw, 44px)",
    overflow: "hidden",
  },
  sheen: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 38%), " +
      "radial-gradient(120% 60% at 100% 100%, rgba(75,101,255,0.10) 0%, rgba(75,101,255,0) 60%)",
  },
  rainbow: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    backgroundImage: `url(${BRAND_RAINBOW_URL})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right bottom",
    backgroundSize: "40%",
    opacity: 0.22,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// "Trace every claim back to its source." — the interactive proof.
//
// A finished news draft sits in the card with its factual claims highlighted. A
// mouse cursor walks claim → claim (auto, on a loop) and, as it lands on each,
// the supporting SOURCE pops in beside it — the document/recording/dataset the
// claim traces back to, with the exact evidence highlighted in the quote.
// Hovering a claim by hand takes over (pauses the auto-walk, jumps to it).
// Reduced-motion → the cursor teleports and the loop still advances.
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { type: "spring", stiffness: 320, damping: 34 } as const

type ClaimColor = "blue" | "orange" | "brown"

type Claim = {
  lead: string // plain text that runs BEFORE this highlighted claim
  text: string // the highlighted claim text itself
  color: ClaimColor
  cite: string // where the claim comes from
  quote: string // the supporting passage
  evidence: string[] // substrings of `quote` to highlight orange
}

type LegendEntry = { color: ClaimColor; label: string }

type FactCheckCardProps = {
  tag: string
  headline: string // newlines render as line breaks
  standfirst: string
  claims: Claim[]
  tail: string // plain text after the final claim
  legend: LegendEntry[]
}

// Claim highlight colours (resting tint vs. active full-strength). These are the
// fixed brand colours — content (which claim is which colour) is data, set per
// claim via the `color` property control.
const COLORS: Record<ClaimColor, { rest: string; active: string; ink: string }> =
  {
    blue: { rest: "rgba(75,101,255,0.30)", active: "rgba(75,101,255,0.92)", ink: "#ffffff" },
    orange: { rest: "rgba(255,140,0,0.30)", active: "rgba(255,140,0,0.95)", ink: "#14182A" },
    brown: { rest: "rgba(192,91,0,0.32)", active: "rgba(192,91,0,0.92)", ink: "#ffffff" },
  }

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

// Split a quote into runs so the evidence substrings render orange-highlighted.
function highlightEvidence(quote: string, evidence: string[]) {
  const ranges: [number, number][] = []
  for (const e of evidence) {
    if (!e) continue
    const i = quote.indexOf(e)
    if (i >= 0) ranges.push([i, i + e.length])
  }
  ranges.sort((a, b) => a[0] - b[0])
  const out: { text: string; hit: boolean }[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (start < cursor) continue // skip overlaps
    if (start > cursor) out.push({ text: quote.slice(cursor, start), hit: false })
    out.push({ text: quote.slice(start, end), hit: true })
    cursor = end
  }
  if (cursor < quote.length) out.push({ text: quote.slice(cursor), hit: false })
  return out
}

// ── Defaults (also mirrored in addPropertyControls below) ──────────────────────
const DEFAULT_CLAIMS: Claim[] = [
  {
    lead: "City council approved a ",
    text: "$2.4 million budget",
    color: "blue",
    cite: "City Council Minutes — Apr 3, 2026 (PDF, p.4)",
    quote:
      "Motion to allocate $2.4M from the capital fund for road resurfacing carried 6–1.",
    evidence: ["$2.4M", "road resurfacing"],
  },
  {
    lead: " for road repairs Thursday. Work will ",
    text: "begin in March",
    color: "orange",
    cite: "Public Works briefing — recording, 0:14:22",
    quote:
      "“We expect crews to break ground in early March, weather permitting.”",
    evidence: ["break ground in early March"],
  },
  {
    lead: ", the public works director said, after residents reported a ",
    text: "30% jump in pothole complaints",
    color: "brown",
    cite: "311 Service Requests — Open Data Portal, Q1 2026",
    quote: "Pothole reports rose 31% against the prior winter quarter.",
    evidence: ["rose 31%"],
  },
]

const DEFAULT_LEGEND: LegendEntry[] = [
  { color: "blue", label: "Public record" },
  { color: "orange", label: "On the record" },
  { color: "brown", label: "Open data" },
]

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function FactCheckCard({
  tag = "02 · Claims → Sources",
  headline = "Trace every claim\nback to its source.",
  standfirst = "Hover any highlighted claim — the source it traces to pops in beside it, with the exact evidence underlined.",
  claims = DEFAULT_CLAIMS,
  tail = " over the winter.",
  legend = DEFAULT_LEGEND,
}: FactCheckCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: false, margin: "-80px" })
  const reduce = useReducedMotion() ?? false

  // >1100px: put an editorial rail (chip + headline + standfirst + legend) left
  // of the draft so the wide card isn't half empty ink. Below that, stack.
  const wide = !useIsTightDesktop()

  // `active` is an index into `claims`.
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false) // hover takes over the auto-walk

  const claimRefs = useRef<Record<number, HTMLSpanElement | null>>({})
  const popupRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0) // bump to re-measure on resize

  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [popup, setPopup] = useState({ x: 0, y: 0, ready: false })

  const headlineLines = useMemo(() => headline.split("\n"), [headline])
  const activeClaim = claims[active] ?? claims[0]

  // ── Keep `active` valid if the claims array shrinks (panel edits) ─────────────
  useEffect(() => {
    if (active >= claims.length) setActive(0)
  }, [claims.length, active])

  // ── Auto-walk the cursor across the claims while visible & un-pinned ──────────
  useEffect(() => {
    if (!inView || pinned || claims.length <= 1) return
    const iv = setInterval(() => {
      setActive((prev) => (prev + 1) % claims.length)
    }, 2600)
    return () => clearInterval(iv)
  }, [inView, pinned, claims.length])

  // ── Re-measure on resize ───────────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => setSize((n) => n + 1))
    ro.observe(root)
    return () => ro.disconnect()
  }, [])

  // ── Position the cursor (tip on the claim) + the source popup beside it ───────
  useLayoutEffect(() => {
    const root = rootRef.current
    const span = claimRefs.current[active]
    if (!root || !span) return

    const r = root.getBoundingClientRect()
    const sp = span.getBoundingClientRect()
    const left = sp.left - r.left
    const top = sp.top - r.top

    // Cursor: tip lands just under the lower-middle of the highlighted run.
    setCursor({ x: left + Math.min(sp.width * 0.5, 90), y: top + sp.height - 2 })

    // Popup: sits below the claim, clamped inside the card; flips above if it
    // would overflow the bottom edge.
    const popH = popupRef.current?.offsetHeight ?? 120
    const popW = popupRef.current?.offsetWidth ?? 320
    const px = clamp(left + sp.width * 0.35, 16, r.width - popW - 16)
    let py = top + sp.height + 18
    if (py + popH + 16 > r.height) py = top - popH - 18
    setPopup({ x: px, y: Math.max(16, py), ready: true })
  }, [active, size, claims])

  const onClaimEnter = useCallback((i: number) => {
    setPinned(true)
    setActive(i)
  }, [])

  return (
    <WorkflowCardFrame
      ref={rootRef}
      style={s.root}
      onMouseLeave={() => setPinned(false)}
    >
      <div style={wide ? s.layoutWide : s.layout}>
        {/* Editorial rail (desktop) — chip, headline, standfirst, claim legend */}
        <div style={s.rail}>
          {wide && tag && <span style={s.tag}>{tag}</span>}
          <h2 style={{ ...s.heading, ...(wide ? s.headingWide : {}) }}>
            {headlineLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headlineLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          {wide && (
            <>
              {standfirst && <p style={s.standfirst}>{standfirst}</p>}
              <div style={s.legend}>
                {legend.map((entry, i) => (
                  <span key={i} style={s.legendItem}>
                    <span
                      style={{
                        ...s.legendSwatch,
                        background: (COLORS[entry.color] ?? COLORS.blue).active,
                      }}
                    />
                    {entry.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* The draft */}
        <div style={s.draftCard}>
          <p style={s.draftText}>
            {claims.map((c, i) => {
              const isActive = i === active
              const col = COLORS[c.color] ?? COLORS.blue
              return (
                <span key={i}>
                  <span>{c.lead}</span>
                  <span
                    ref={(el) => {
                      claimRefs.current[i] = el
                    }}
                    onMouseEnter={() => onClaimEnter(i)}
                    style={{
                      ...s.claim,
                      background: isActive ? col.active : col.rest,
                      color: isActive ? col.ink : "inherit",
                      boxShadow: isActive ? `0 0 0 2px ${col.active}` : "none",
                    }}
                  >
                    {c.text}
                  </span>
                </span>
              )
            })}
            <span>{tail}</span>
          </p>
        </div>
      </div>

      {/* Source popup — cross-fades per active claim at its measured position */}
      {activeClaim && (
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
                <span style={s.popupCite}>{activeClaim.cite}</span>
              </div>
              <div style={s.popupDivider} />
              <p style={s.popupQuote}>
                {highlightEvidence(activeClaim.quote, activeClaim.evidence).map(
                  (part, i) =>
                    part.hit ? (
                      <mark key={i} style={s.evidence}>
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

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

// ── Property Controls — everything editable in Framer's right-hand panel ───────
addPropertyControls(FactCheckCard, {
  tag: {
    type: ControlType.String,
    title: "Tag",
    defaultValue: "02 · Claims → Sources",
  },
  headline: {
    type: ControlType.String,
    title: "Headline",
    displayTextArea: true,
    description: "Use line breaks for the multi-line headline.",
    defaultValue: "Trace every claim\nback to its source.",
  },
  standfirst: {
    type: ControlType.String,
    title: "Standfirst",
    displayTextArea: true,
    defaultValue:
      "Hover any highlighted claim — the source it traces to pops in beside it, with the exact evidence underlined.",
  },
  claims: {
    type: ControlType.Array,
    title: "Claims",
    control: {
      type: ControlType.Object,
      controls: {
        lead: {
          type: ControlType.String,
          title: "Lead-in text",
          displayTextArea: true,
          description: "Plain text shown before this highlighted claim.",
          defaultValue: "",
        },
        text: {
          type: ControlType.String,
          title: "Claim",
          defaultValue: "highlighted claim",
        },
        color: {
          type: ControlType.Enum,
          title: "Colour",
          options: ["blue", "orange", "brown"],
          optionTitles: [
            "Blue · public record",
            "Orange · on the record",
            "Brown · open data",
          ],
          defaultValue: "blue",
        },
        cite: {
          type: ControlType.String,
          title: "Source",
          defaultValue: "Source citation",
        },
        quote: {
          type: ControlType.String,
          title: "Quote",
          displayTextArea: true,
          defaultValue: "The supporting passage from the source.",
        },
        evidence: {
          type: ControlType.Array,
          title: "Evidence",
          description:
            "Exact substrings of the quote to highlight orange. Must match the quote text.",
          control: { type: ControlType.String },
          defaultValue: [],
        },
      },
    },
    defaultValue: DEFAULT_CLAIMS,
  },
  tail: {
    type: ControlType.String,
    title: "Trailing text",
    description: "Plain text after the final claim.",
    defaultValue: " over the winter.",
  },
  legend: {
    type: ControlType.Array,
    title: "Legend",
    control: {
      type: ControlType.Object,
      controls: {
        color: {
          type: ControlType.Enum,
          title: "Colour",
          options: ["blue", "orange", "brown"],
          optionTitles: ["Blue", "Orange", "Brown"],
          defaultValue: "blue",
        },
        label: {
          type: ControlType.String,
          title: "Label",
          defaultValue: "Label",
        },
      },
    },
    defaultValue: DEFAULT_LEGEND,
  },
})

const s: Record<string, CSSProperties> = {
  root: {
    minHeight: "420px",
  },
  layout: {
    position: "relative",
  },
  layoutWide: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) minmax(0, 640px)",
    gap: "clamp(32px, 4vw, 72px)",
    alignItems: "center",
  },
  rail: {
    position: "relative",
  },
  tag: {
    display: "inline-block",
    padding: "4px 10px",
    background: "oklch(0.28 0.025 272)",
    borderRadius: "6px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "oklch(0.65 0.015 85)",
    marginBottom: "14px",
  },
  heading: {
    position: "relative",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 4vw, 46px)",
    lineHeight: 1.08,
    letterSpacing: "-0.025em",
    color: "#ffffff",
    margin: "0 0 28px",
  },
  headingWide: {
    margin: 0,
  },
  standfirst: {
    fontFamily: "var(--font-serif)",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "oklch(0.68 0.015 85)",
    maxWidth: "34ch",
    margin: "18px 0 0",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "22px",
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "oklch(0.66 0.015 85)",
  },
  legendSwatch: {
    width: "10px",
    height: "10px",
    borderRadius: "3px",
    flexShrink: 0,
  },
  draftCard: {
    position: "relative",
    background: "#F9F7F4",
    borderRadius: "14px",
    padding: "24px 26px",
    maxWidth: "640px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
  },
  draftText: {
    fontFamily: "var(--font-serif)",
    fontSize: "clamp(18px, 2.2vw, 24px)",
    lineHeight: 1.7,
    color: "#14182A",
    margin: 0,
  },
  claim: {
    borderRadius: "4px",
    padding: "1px 4px",
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
    WebkitBoxDecorationBreak: "clone",
    boxDecorationBreak: "clone",
  } as CSSProperties,
  popupWrap: {
    position: "absolute",
    width: "min(340px, 70%)",
    zIndex: 20,
    transition: "opacity 0.2s ease",
    pointerEvents: "none",
  },
  popup: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "14px 16px",
    boxShadow: "0 12px 34px rgba(0,0,0,0.38)",
  },
  popupCiteRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "8px",
  },
  sourceTag: {
    flexShrink: 0,
    padding: "2px 7px",
    background: "var(--brand-orange)",
    borderRadius: "5px",
    fontFamily: "var(--font-sans)",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#14182A",
  },
  popupCite: {
    fontFamily: "var(--font-serif)",
    fontStyle: "italic",
    fontSize: "13px",
    lineHeight: 1.4,
    color: "#3d3d3d",
  },
  popupDivider: {
    height: "1px",
    background: "#e7e4de",
    margin: "0 0 8px",
  },
  popupQuote: {
    fontFamily: "var(--font-serif)",
    fontStyle: "italic",
    fontSize: "14px",
    lineHeight: 1.55,
    color: "#14182A",
    margin: 0,
  },
  evidence: {
    background: "rgba(255,140,0,0.55)",
    color: "#14182A",
    borderRadius: "3px",
    padding: "0 2px",
  },
  cursor: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 30,
    pointerEvents: "none",
    filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
  },
  cursorSvg: {
    display: "block",
  },
}
