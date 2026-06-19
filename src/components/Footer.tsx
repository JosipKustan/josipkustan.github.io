import { motion, useReducedMotion } from 'framer-motion'

// Footer — block 11. Navigation + legal only. The conversion ask now lives in its
// own Final CTA section (block 10), so the old footer CTA band + pricing/onboarding
// tiles were removed to avoid a duplicate "Book a demo" right above the footer.
//
// Shows only live v1 destinations (spec rule: trim any column/link whose page does
// not exist yet). v1 ships just three real routes — Home, Pricing, and Log in (to
// NewsLabs) — plus the LinkedIn follow. Brand block (wordmark + tagline) on the
// left, two link columns on the right, a hairline, then a legal bottom bar. Adria
// Analytics appears only here, in the legal line. A whisper-quiet BrandRainbow
// watermark sits bottom-right.
//
// Framer note: ink Frame. Top row = brand Stack (wordmark image + Inter tagline) +
// a 2-column auto-grid of link columns (NewsLabs: Home / Pricing / Log in — Follow:
// LinkedIn). Pin the BrandRainbow.svg bottom-right at ~10% opacity, clipped. Bottom
// bar = a top hairline with the © line. Scroll-in: fade + y on the grid; honour
// reduced-motion. Log in points at #signin (same destination as the navbar "Sign in").

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: 'NewsLabs',
    links: [
      ['Home', '#/'],
      ['Pricing', '#/pricing'],
      ['Log in', '#signin'],
    ],
  },
  {
    title: 'Follow',
    links: [['LinkedIn', '#linkedin']],
  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Footer() {
  const reduce = useReducedMotion() ?? false

  return (
    <footer style={styles.footer} id="footer">
      <style>{CSS}</style>
      {/* Rainbow watermark, clipped to the footer box */}
      <div style={styles.rainbowClip} aria-hidden>
        <div style={styles.rainbow} />
      </div>

      <div style={styles.inner}>
        <motion.div
          style={styles.top}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* Brand block */}
          <div style={styles.brand}>
            <img src="/assets/wordmark-dark.svg" alt="NewsLabs" style={styles.logo} />
            <p style={styles.tagline}>Your newsroom's production desk.</p>
          </div>

          {/* Link grid */}
          <nav aria-label="Footer" style={styles.grid}>
            {COLUMNS.map(col => (
              <div key={col.title} style={styles.col}>
                <h4 style={styles.colTitle}>{col.title}</h4>
                <ul style={styles.colList}>
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="nf-link" style={styles.link}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </motion.div>

        {/* Bottom bar */}
        <div style={styles.bottom}>
          <p style={styles.copy}>© 2026 NewsLabs · A product of Adria Analytics.</p>
        </div>
      </div>
    </footer>
  )
}

const CSS = `
  .nf-link { transition: color 180ms var(--ease-out); }
  .nf-link:hover { color: var(--dark-foreground); }
  .nf-link:focus-visible {
    outline: 2px solid var(--dark-primary);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }
`

const styles: Record<string, React.CSSProperties> = {
  footer: {
    position: 'relative',
    background: 'var(--ink)',
    borderTop: '1px solid var(--dark-border)',
    padding: 'clamp(56px, 7vw, 88px) var(--section-px) clamp(28px, 3vw, 40px)',
  },
  rainbowClip: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  rainbow: {
    position: 'absolute',
    right: '-40px',
    bottom: '-40px',
    width: 'clamp(220px, 26vw, 380px)',
    height: 'clamp(220px, 26vw, 380px)',
    background: 'url(/assets/BrandRainbow.svg) no-repeat right bottom',
    backgroundSize: 'contain',
    opacity: 0.1,
    pointerEvents: 'none',
  },
  inner: {
    position: 'relative',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(40px, 5vw, 64px)',
  },

  // Brand block + link grid
  top: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(36px, 5vw, 72px)',
    justifyContent: 'space-between',
  },
  brand: {
    flex: '1 1 240px',
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    height: '24px',
    width: 'auto',
  },
  tagline: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14.5px',
    lineHeight: 1.5,
    color: 'var(--dark-muted)',
    margin: 0,
  },

  // link grid
  grid: {
    flex: '2 1 480px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 'clamp(24px, 3vw, 44px)',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  colTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: '13px',
    letterSpacing: '0.02em',
    color: 'var(--dark-foreground)',
    margin: '0 0 16px',
  },
  colList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
  },
  link: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--dark-muted)',
    textDecoration: 'none',
  },

  // bottom bar
  bottom: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    paddingTop: 'clamp(28px, 3vw, 40px)',
    borderTop: '1px solid var(--dark-border)',
  },
  copy: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: 'var(--dark-muted)',
    margin: 0,
  },
}
