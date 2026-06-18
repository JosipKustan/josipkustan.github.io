import { type CSSProperties, type ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Workflow card schematics — one small static diagram per workflow, in the same
// light-surface vocabulary as the Platform hero (white "doc" cards with ink line
// bars, orange dashed connectors, blue/orange accents) so the two pages read as
// one system. Each is decorative (aria-hidden) and self-contained: it renders its
// own inset SchematicFrame and fills it.
//
// Framer note: build each as a small Frame (the SchematicFrame = a faint inset
// panel, hairline border, ~132px tall) holding stylized sub-Frames — mini doc
// cards, chips, dots, dashed connectors. They're static; only the card around them
// animates (scroll-in + hover). Keep the visual language identical to the Platform
// hero schematic so workflows feel like one engine.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  paper: '#ffffff',
  hair: 'rgba(20,24,42,0.10)',
  bar: 'rgba(20,24,42,0.14)',
  barFaint: 'rgba(20,24,42,0.09)',
  ink: 'var(--ink)',
  muted: 'rgba(20,24,42,0.5)',
  orange: 'var(--brand-orange)',
  blue: 'var(--primary)',
  accent: 'var(--accent)',
  green: 'oklch(0.6 0.13 150)',
}

// The inset panel every schematic sits in.
function Frame({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div aria-hidden style={{ ...f.frame, ...style }}>
      {children}
    </div>
  )
}

// A horizontal "text line" bar.
function Bar({ w = '100%', strong = false }: { w?: string | number; strong?: boolean }) {
  return <span style={{ ...f.bar, width: w, background: strong ? C.bar : C.barFaint }} />
}

// A small white doc card with a stack of line bars.
function Doc({ widths = ['100%', '78%', '88%'], style, head }: { widths?: (string | number)[]; style?: CSSProperties; head?: ReactNode }) {
  return (
    <div style={{ ...f.doc, ...style }}>
      {head}
      {widths.map((w, i) => (
        <Bar key={i} w={w} />
      ))}
    </div>
  )
}

// A mono uppercase micro-tag (e.g. WIRE, DRAFT).
function Tag({ children, color = C.accent }: { children: ReactNode; color?: string }) {
  return <span style={{ ...f.tag, color }}>{children}</span>
}

const ArrowRight = ({ color = C.orange }: { color?: string }) => (
  <span aria-hidden style={{ color, fontSize: 18, fontWeight: 700, lineHeight: 1, flexShrink: 0 }}>→</span>
)

// ── Group A — Watch the sources ──────────────────────────────────────────────

// Catch the story first — vertical watchlist, one "worth a story" pip lit.
export function CatchSchematic() {
  const rows = [false, false, true, false]
  return (
    <Frame style={{ flexDirection: 'column', justifyContent: 'center', gap: 9 }}>
      {rows.map((lit, i) => (
        <div key={i} style={{ ...f.watchRow, ...(lit ? f.watchRowLit : null) }}>
          <span style={{ ...f.dot, background: lit ? C.orange : C.bar, boxShadow: lit ? `0 0 8px ${C.orange}` : 'none' }} />
          <Bar w={lit ? '54%' : ['70%', '60%', '64%', '52%'][i]} strong={lit} />
          {lit && <span style={f.watchTag}>Worth a story</span>}
        </div>
      ))}
    </Frame>
  )
}

// Stay on top of social — stream of cards, the verified one on top.
export function SocialSchematic() {
  return (
    <Frame style={{ flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
      {[true, false, false].map((verified, i) => (
        <div key={i} style={{ ...f.socialCard, opacity: i === 0 ? 1 : 0.62 - i * 0.12 }}>
          <span style={f.avatar} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <Bar w={i === 0 ? '50%' : '40%'} strong={i === 0} />
            <Bar w="80%" />
          </div>
          {verified && (
            <span style={f.verified} aria-hidden>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4 4 10-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </Frame>
  )
}

// See what a region is saying — topic query over a faint map, one region lit.
export function RegionSchematic() {
  return (
    <Frame style={{ flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
      <div style={f.searchPill}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" stroke={C.muted} strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke={C.muted} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <Bar w="56%" />
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <svg width="150" height="52" viewBox="0 0 150 52" fill="none" aria-hidden>
          {/* faint abstract landmasses */}
          <path d="M8 30 Q20 14 40 20 T78 16 Q96 12 112 22 T146 18" stroke={C.barFaint} strokeWidth="2" fill="none" />
          <path d="M14 40 Q40 34 64 40 T120 38" stroke={C.barFaint} strokeWidth="2" fill="none" />
          {/* lit region */}
          <circle cx="92" cy="22" r="13" fill={C.orange} opacity="0.16" />
          <circle cx="92" cy="22" r="4.5" fill={C.orange} />
        </svg>
        <span style={{ ...f.resultChip, position: 'absolute', right: 6, top: -2 }}>Coverage</span>
      </div>
    </Frame>
  )
}

// ── Group B — Draft the story ────────────────────────────────────────────────

// Republish in your voice — source article → arrow → styled draft + masthead.
export function RepublishSchematic() {
  return (
    <Frame style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Doc widths={['100%', '70%', '85%', '60%']} style={{ flex: 1 }} head={<Tag color={C.muted}>Source</Tag>} />
      <ArrowRight />
      <Doc
        widths={['64%', '90%']}
        style={{ flex: 1 }}
        head={<span style={{ ...f.masthead }}>The Tribune</span>}
      />
    </Frame>
  )
}

// Story from social — social card + Background chips → draft.
export function StoryFromSocialSchematic() {
  return (
    <Frame style={{ alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={f.socialCard}>
          <span style={f.avatar} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <Bar w="46%" strong />
            <Bar w="76%" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <span style={f.bgChip}>Background</span>
          <span style={f.bgChip}>Context</span>
        </div>
      </div>
      <ArrowRight />
      <Doc widths={['100%', '80%', '90%']} style={{ flex: 1 }} head={<Tag>Draft</Tag>} />
    </Frame>
  )
}

// Custom News — stacked wire/PR cards funnel into one draft.
export function CustomNewsSchematic() {
  return (
    <Frame style={{ alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {[['Wire', C.blue], ['PR', C.accent], ['Wire', C.blue]].map(([label, color], i) => (
          <div key={i} style={f.feedCard}>
            <Tag color={color as string}>{label}</Tag>
            <Bar w="64%" />
          </div>
        ))}
      </div>
      <svg width="34" height="78" viewBox="0 0 34 78" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M2 12 H18 Q30 12 30 30 V39" stroke={C.orange} strokeWidth="1.6" strokeDasharray="3 4" fill="none" />
        <path d="M2 39 H30" stroke={C.orange} strokeWidth="1.6" strokeDasharray="3 4" fill="none" />
        <path d="M2 66 H18 Q30 66 30 48 V39" stroke={C.orange} strokeWidth="1.6" strokeDasharray="3 4" fill="none" />
        <path d="M30 39 h3" stroke={C.orange} strokeWidth="1.6" fill="none" />
      </svg>
      <Doc widths={['100%', '82%']} style={{ flex: 1 }} head={<Tag>Draft</Tag>} />
    </Frame>
  )
}

// Surface angles — a topic node branching into suggested angle cards.
export function AnglesSchematic() {
  return (
    <Frame style={{ alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <span style={f.topicNode}>Topic</span>
      <svg width="30" height="86" viewBox="0 0 30 86" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M0 43 H10" stroke={C.muted} strokeWidth="1.6" />
        <path d="M10 43 V14 H30" stroke={C.muted} strokeWidth="1.6" fill="none" />
        <path d="M10 43 H30" stroke={C.muted} strokeWidth="1.6" fill="none" />
        <path d="M10 43 V72 H30" stroke={C.muted} strokeWidth="1.6" fill="none" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={f.angleCard}>
            <span style={{ ...f.dot, width: 5, height: 5, background: C.orange }} />
            <Bar w={['70%', '58%', '64%'][i]} />
          </div>
        ))}
      </div>
    </Frame>
  )
}

// ── Group C — Translate, localize, transcribe ────────────────────────────────

// Translate and localize — column of text with an EN → DE toggle.
export function TranslateSchematic() {
  return (
    <Frame style={{ flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
      <div style={f.langToggle}>
        <span style={{ ...f.langPill, ...f.langPillOff }}>EN</span>
        <ArrowRight color={C.orange} />
        <span style={{ ...f.langPill, ...f.langPillOn }}>DE</span>
      </div>
      <Doc widths={['100%', '92%', '74%', '86%']} style={{ width: '100%' }} />
    </Frame>
  )
}

// Transcription — waveform resolving into timestamped text.
export function TranscribeSchematic() {
  const bars = [10, 22, 14, 30, 18, 26, 12, 20]
  return (
    <Frame style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={f.wave}>
        {bars.map((h, i) => (
          <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: i < 4 ? C.orange : C.bar }} />
        ))}
      </div>
      <ArrowRight />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {['00:04', '00:11', '00:19'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={f.timecode}>{t}</span>
            <Bar w={['70%', '84%', '60%'][i]} />
          </div>
        ))}
      </div>
    </Frame>
  )
}

// ── Group D — Edit and verify ────────────────────────────────────────────────

// Block editor — blocks with a small quick-action menu beside a paragraph.
export function EditorSchematic() {
  return (
    <Frame style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Doc widths={['100%', '88%', '96%', '70%']} style={{ flex: 1 }} />
      <div style={f.actionMenu}>
        {['↕', '＋', '↻'].map((g, i) => (
          <span key={i} style={f.actionBtn}>{g}</span>
        ))}
      </div>
    </Frame>
  )
}

// Check claims against sources — lines ticked to sources, one flagged unsourced.
export function CheckSchematic() {
  const rows: ('ok' | 'ok' | 'flag')[] = ['ok', 'ok', 'flag']
  return (
    <Frame style={{ flexDirection: 'column', justifyContent: 'center', gap: 9 }}>
      {rows.map((state, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Bar w={['62%', '70%', '54%'][i]} />
          <span style={{ flex: 1 }} />
          {state === 'ok' ? (
            <span style={{ ...f.badge, background: C.green }} aria-hidden>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4 4 10-10" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span style={f.unsourced}>Unsourced</span>
          )}
        </div>
      ))}
    </Frame>
  )
}

// Trace every claim — a sentence linked by a dotted line to a source tag.
export function TraceSchematic() {
  return (
    <Frame style={{ flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
      <Doc widths={['100%', '84%', '92%']} style={{ width: '100%' }} />
      <svg width="100%" height="34" viewBox="0 0 240 34" preserveAspectRatio="none" aria-hidden style={{ display: 'block' }}>
        <path d="M40 0 C40 18 180 14 196 28" stroke={C.orange} strokeWidth="1.6" strokeDasharray="3 4" fill="none" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={f.sourceTag}>
          <span style={{ ...f.dot, width: 5, height: 5, background: C.orange }} />
          Reuters · 14:02
        </span>
      </div>
    </Frame>
  )
}

const f: Record<string, CSSProperties> = {
  frame: {
    position: 'relative',
    width: '100%',
    height: 132,
    borderRadius: 10,
    border: `1px solid ${C.hair}`,
    background: 'linear-gradient(160deg, #FCFBF9 0%, #F0EEE9 100%)',
    overflow: 'hidden',
    padding: 16,
    display: 'flex',
  },
  bar: { height: 6, borderRadius: 3, display: 'block', flexShrink: 0 },
  doc: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
    padding: '11px 12px',
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(20,24,42,0.06)',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block' },

  // Catch — watchlist
  watchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '6px 9px',
    borderRadius: 7,
    background: C.paper,
    border: `1px solid ${C.hair}`,
  },
  watchRowLit: { borderColor: C.orange, boxShadow: `0 0 0 1px ${C.orange}, 0 6px 16px rgba(255,140,0,0.18)` },
  watchTag: {
    marginLeft: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: C.orange,
    whiteSpace: 'nowrap',
  },

  // Social
  socialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '8px 10px',
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 8,
    boxShadow: '0 3px 9px rgba(20,24,42,0.05)',
  },
  avatar: { width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(140deg, #C7CEF5, #9AA8EE)', flexShrink: 0 },
  verified: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: C.blue,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Region
  searchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 999,
    boxShadow: '0 2px 8px rgba(20,24,42,0.06)',
  },
  resultChip: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 10,
    color: C.ink,
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 6,
    padding: '4px 8px',
    boxShadow: '0 3px 9px rgba(20,24,42,0.1)',
  },

  // Republish
  masthead: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '-0.01em',
    color: C.ink,
    marginBottom: 2,
    paddingBottom: 4,
    borderBottom: `1px solid ${C.hair}`,
  },

  // Story-from-social
  bgChip: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 9.5,
    color: C.accent,
    background: 'rgba(192,91,0,0.08)',
    border: '1px solid rgba(192,91,0,0.2)',
    borderRadius: 6,
    padding: '3px 7px',
    whiteSpace: 'nowrap',
  },

  // Custom News
  feedCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 9px',
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 7,
  },

  // Angles
  topicNode: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 11,
    color: '#fff',
    background: 'linear-gradient(150deg, var(--brand-blue), var(--primary))',
    borderRadius: 8,
    padding: '8px 11px',
    flexShrink: 0,
    boxShadow: '0 6px 16px rgba(75,101,255,0.3)',
  },
  angleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 9px',
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 7,
  },

  // Translate
  langToggle: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  langPill: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.08em',
    borderRadius: 7,
    padding: '6px 12px',
  },
  langPillOff: { color: C.muted, background: C.paper, border: `1px solid ${C.hair}` },
  langPillOn: { color: '#fff', background: C.blue, border: `1px solid ${C.blue}` },

  // Transcribe
  wave: { display: 'flex', alignItems: 'center', gap: 3, height: 40, flexShrink: 0 },
  timecode: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    fontWeight: 600,
    color: C.accent,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },

  // Editor
  actionMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    padding: 5,
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 9,
    boxShadow: '0 6px 16px rgba(20,24,42,0.12)',
    flexShrink: 0,
  },
  actionBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: C.ink,
    background: 'rgba(20,24,42,0.04)',
  },

  // Check
  badge: {
    width: 15,
    height: 15,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  unsourced: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 9,
    color: C.orange,
    background: 'rgba(255,140,0,0.1)',
    border: `1px solid ${C.orange}`,
    borderRadius: 6,
    padding: '3px 7px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  // Trace
  sourceTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-mono)',
    fontSize: 9.5,
    fontWeight: 600,
    color: C.ink,
    background: C.paper,
    border: `1px solid ${C.hair}`,
    borderRadius: 7,
    padding: '5px 9px',
    boxShadow: '0 4px 12px rgba(20,24,42,0.1)',
  },
}
