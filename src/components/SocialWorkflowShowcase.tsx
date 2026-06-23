import { useState } from 'react'
import { motion } from 'framer-motion'
import WorkflowCardFrame from './WorkflowCardFrame'
import SocialWorkflowCardMobile from './SocialWorkflowCardMobile'
import { PLATFORMS, type Platform } from './social/socialContent'
import { useIsTightDesktop } from '../hooks/useMediaQuery'

// Auto-cycle order — the card walks post → article → next social on its own.
const ORDER = PLATFORMS.map(p => p.id)

// ─────────────────────────────────────────────────────────────────────────────
// Desktop framing for the social workflow card.
//
// Three zones on one ink surface (no card-in-a-card):
//   1. Top-left — the editorial lead: tag, headline, standfirst.
//   2. Below it — the platform switcher: seven big buttons sitting directly on
//      the main card.
//   3. Right — a FIXED-HEIGHT stage. The white post/article card (the mobile
//      morph card in `chrome="bare"` mode) floats centered inside it, so
//      switching platforms or morphing post → article never resizes the main
//      card. Posts keep a phone-credible width per platform; every article
//      spreads to the same wider editorial column, centered, so focus barely
//      moves between states.
//
// >1100px: two columns (copy+switcher | stage). 721–1100px: single column,
// copy above the stage. (≤720px the WorkflowsSection renders the framed mobile
// card instead of this showcase.)
// ─────────────────────────────────────────────────────────────────────────────

const POST_WIDTH: Record<Platform, number> = {
  x: 420,
  tiktok: 350,
  reddit: 430,
  instagram: 400,
  youtube: 430,
  linkedin: 430,
  facebook: 430,
}
const ARTICLE_WIDTH = 540

// Tallest state across all platforms/modes (TikTok article, measured 591px)
// + breathing room, so every post and article fits without the stage ever
// changing height.
const STAGE_HEIGHT = 620

export default function SocialWorkflowShowcase() {
  const stacked = useIsTightDesktop()
  const [active, setActive] = useState<Platform>('x')

  // The card owns the post → article morph and asks us to advance the platform
  // (`onAutoAdvance`). Manual platform picks bump `interactionSignal` so the
  // card pauses its auto-loop for 10s, exactly like tapping the card.
  const [interactionSignal, setInteractionSignal] = useState(0)
  const advance = () => setActive(prev => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length])

  const pick = (id: Platform) => {
    setActive(id)
    setInteractionSignal(s => s + 1)
  }

  return (
    <WorkflowCardFrame>
      <div style={{ ...s.layout, ...(stacked ? s.layoutStacked : s.layoutWide) }}>
        <div style={s.copy}>
          <span style={s.tag}>01 · Social → Story</span>
          <h2 style={s.heading}>Turn social posts into stories</h2>
          <p style={s.standfirst}>
            A post breaks on any platform. NewsLabs reads it the way your newsroom
            would and hands a reporter a sourced draft. The raw post becomes your
            story in one step.
          </p>

          {/* Platform switcher — big buttons, directly on the ink */}
          <div style={s.switcher} role="tablist" aria-label="Pick a platform">
            {PLATFORMS.map(({ id, Icon, label }) => (
              <motion.button
                key={id}
                role="tab"
                aria-selected={active === id}
                title={label}
                style={{ ...s.platformBtn, ...(active === id ? s.platformBtnActive : {}) }}
                onClick={() => pick(id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.93 }}
              >
                <span style={s.platformIcon}><Icon /></span>
              </motion.button>
            ))}
          </div>

          <p style={s.affordance}>Pick a platform, then tap the post →</p>
        </div>

        {/* Fixed-height stage — the post/article card floats centered in it */}
        <div style={s.stage}>
          <SocialWorkflowCardMobile
            chrome="bare"
            platform={active}
            cardWidth={{ post: POST_WIDTH[active], article: ARTICLE_WIDTH }}
            onAutoAdvance={advance}
            interactionSignal={interactionSignal}
          />
        </div>
      </div>
    </WorkflowCardFrame>
  )
}

const s: Record<string, React.CSSProperties> = {
  layout: {
    position: 'relative',
    display: 'grid',
    gap: 'clamp(32px, 4.5vw, 72px)',
  },
  layoutWide: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(440px, 580px)',
    alignItems: 'start',
  },
  layoutStacked: {
    gridTemplateColumns: '1fr',
    gap: '32px',
  },
  copy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
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
    marginBottom: '16px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 3.4vw, 44px)',
    lineHeight: 1.08,
    letterSpacing: '-0.025em',
    color: '#ffffff',
    margin: '0 0 16px',
  },
  standfirst: {
    fontFamily: 'var(--font-serif)',
    fontSize: '16px',
    lineHeight: 1.65,
    color: 'oklch(0.7 0.015 85)',
    maxWidth: '46ch',
    margin: 0,
  },
  switcher: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '32px',
  },
  platformBtn: {
    width: 56,
    height: 56,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--cream)',
    border: '2px solid transparent',
    borderRadius: 14,
    color: '#0f1419',
    cursor: 'pointer',
    padding: 0,
  },
  platformBtnActive: {
    border: '2px solid var(--brand-orange)',
    boxShadow: '0 0 0 4px rgba(255,140,0,0.18)',
  },
  // The brand SVGs are hard-sized at 18px — scale them up to the bigger button.
  platformIcon: {
    display: 'flex',
    transform: 'scale(1.33)',
  },
  affordance: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'oklch(0.6 0.015 85)',
    margin: '18px 0 0',
  },
  stage: {
    position: 'relative',
    height: STAGE_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
}
