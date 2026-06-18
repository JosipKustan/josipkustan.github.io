import { forwardRef } from 'react'
import type { CSSProperties, ReactNode, HTMLAttributes } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Shared shell for the full-width workflow cards (SocialWorkflowCard,
// FactCheckCard). One ink surface, one border, one radius, one padding, and the
// same brand treatment: a diagonal sheen + the BrandRainbow watermark anchored
// bottom-right — so the wide cards read as a matched set.
//
// Forwards a ref to the root and spreads the rest of the div props (the cards
// attach measurement refs and onMouseLeave here). The sheen + rainbow are
// painted first; all children come after them in the DOM so any positioned card
// content stacks above the wash without needing explicit z-index.
// ─────────────────────────────────────────────────────────────────────────────

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  style?: CSSProperties
  // The BrandRainbow watermark is on by default; opt out per card (e.g. the
  // Speed card, whose bottom-left phone owns that corner instead).
  rainbow?: boolean
}

const WorkflowCardFrame = forwardRef<HTMLDivElement, Props>(function WorkflowCardFrame(
  { children, style, rainbow = true, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...frame.root, ...style }} {...rest}>
      <div style={frame.sheen} aria-hidden />
      {rainbow && <div style={frame.rainbow} aria-hidden />}
      {children}
    </div>
  )
})

export default WorkflowCardFrame

const frame: Record<string, CSSProperties> = {
  root: {
    position: 'relative',
    background: 'var(--ink)',
    border: '1px solid oklch(0.28 0.025 272)',
    borderRadius: '20px',
    // Breathe on desktop, fall back to the mobile-first 24/16 at ≤720px.
    padding: 'clamp(24px, 3.5vw, 40px) clamp(16px, 3.5vw, 44px) clamp(24px, 3.5vw, 44px)',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 38%), ' +
      'radial-gradient(120% 60% at 100% 100%, rgba(75,101,255,0.10) 0%, rgba(75,101,255,0) 60%)',
  },
  rainbow: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    backgroundImage: 'url(/assets/BrandRainbow.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right bottom',
    backgroundSize: '40%',
    opacity: 0.22,
  },
}
