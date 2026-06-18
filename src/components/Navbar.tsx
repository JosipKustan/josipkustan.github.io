import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useIsMobile } from '../hooks/useMediaQuery'

// v1 ships a deliberately small nav: Home + Pricing as routes, with Sign in and
// Book a demo on the right. Platform / Workflows / Resources / About are parked
// until those pages are ready. `match` ties each link to the active route so the
// dateline rule can slide under the current page.
const links: { label: string; href: string; match: string }[] = [
  { label: 'Home', href: '#/', match: 'home' },
  { label: 'Pricing', href: '#/pricing', match: 'pricing' },
]

function routeFromHash(): string {
  const h = window.location.hash.replace(/^#/, '')
  if (h.startsWith('/pricing')) return 'pricing'
  if (h.startsWith('/platform')) return 'platform'
  if (h.startsWith('/workflows')) return 'workflows'
  return 'home'
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [route, setRoute] = useState<string>(routeFromHash)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track the active route so the underline knows which link to sit under.
  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // The drawer only exists on mobile — close it if we grow back to desktop.
  useEffect(() => {
    if (!isMobile) setOpen(false)
  }, [isMobile])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <>
      <motion.header
        style={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Always-on legibility scrim: a soft top-down darkening so cream text
            stays readable over the bright upper band of the hero photo, with no
            hard edge against the image. */}
        <div style={styles.scrim} />

        {/* Glass plate that fades in once you scroll (or open the drawer). It sits
            over the scrim and carries the blur + hairline border. */}
        <motion.div
          style={styles.glass}
          initial={false}
          animate={{ opacity: scrolled || open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        />

        <a href="#/" style={styles.logo}>
          <img src="/assets/wordmark-dark.svg" alt="NewsLabs" style={styles.wordmark} />
        </a>

        {!isMobile && (
          <>
            <nav style={styles.nav}>
              {links.map((link, i) => {
                const active = route === link.match
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    style={{ ...styles.link, color: active ? '#ffffff' : styles.link.color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.4 }}
                    whileHover={{ color: '#ffffff' }}
                  >
                    <span style={styles.linkInner}>
                      {link.label}
                      {active && (
                        <motion.span
                          layoutId="nav-dateline"
                          style={styles.dateline}
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                    </span>
                  </motion.a>
                )
              })}
            </nav>

            <div style={styles.rightCluster}>
              <motion.a
                href="#signin"
                style={styles.signin}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ color: '#ffffff' }}
              >
                Sign in
              </motion.a>
              <motion.a
                href="#demo"
                style={styles.cta}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                whileHover={{ backgroundColor: 'oklch(0.82 0.18 58.3)', scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Book a demo
              </motion.a>
            </div>
          </>
        )}

        {isMobile && (
          <motion.button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            style={styles.hamburger}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileTap={{ scale: 0.92 }}
          >
            <Menu size={24} strokeWidth={2} />
          </motion.button>
        )}
      </motion.header>

      {/* Mobile side drawer */}
      <AnimatePresence>
        {open && isMobile && (
          <>
            <motion.div
              style={styles.backdrop}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.aside
              style={styles.drawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              role="dialog"
              aria-label="Menu"
            >
              <div style={styles.drawerHead}>
                <img src="/assets/wordmark-dark.svg" alt="NewsLabs" style={styles.wordmark} />
                <button
                  type="button"
                  aria-label="Close menu"
                  style={styles.close}
                  onClick={() => setOpen(false)}
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <nav style={styles.drawerNav}>
                {links.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    style={styles.drawerLink}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.08, duration: 0.3 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <motion.a
                href="#signin"
                style={styles.drawerSignin}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: links.length * 0.05 + 0.08, duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign in
              </motion.a>
              <motion.a
                href="#demo"
                style={styles.drawerCta}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: links.length * 0.05 + 0.14, duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
              >
                Book a demo
              </motion.a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 clamp(24px, 4vw, 64px)',
    height: '64px',
  },
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    background:
      'linear-gradient(to bottom, oklch(0.16 0.03 273 / 0.62) 0%, oklch(0.16 0.03 273 / 0.24) 55%, oklch(0.16 0.03 273 / 0) 100%)',
  },
  glass: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    background: 'oklch(0.2 0.034 273 / 0.86)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logo: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  wordmark: {
    height: '22px',
    width: 'auto',
  },
  nav: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  link: {
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    color: 'rgba(249, 247, 244, 0.82)',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
    letterSpacing: '0.01em',
  },
  linkInner: {
    position: 'relative',
    display: 'inline-block',
    paddingBottom: '4px',
  },
  dateline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '2px',
    borderRadius: '2px',
    background: 'var(--brand-orange)',
  },
  rightCluster: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexShrink: 0,
  },
  signin: {
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    color: 'rgba(249, 247, 244, 0.82)',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 18px',
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13.5px',
    fontWeight: 700,
    letterSpacing: '0.01em',
    transition: 'background 0.15s ease, transform 0.15s ease',
    whiteSpace: 'nowrap',
  },

  // ─── Mobile ───────────────────────────────────────────────────────────────
  hamburger: {
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    margin: '0 -8px 0 0',
    background: 'transparent',
    border: 'none',
    color: 'var(--cream)',
    cursor: 'pointer',
    padding: 0,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 110,
    background: 'rgba(10, 12, 22, 0.55)',
    backdropFilter: 'blur(2px)',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 120,
    width: 'min(82vw, 320px)',
    background: 'var(--ink)',
    borderLeft: '1px solid var(--dark-border)',
    boxShadow: '-16px 0 40px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 24px 28px',
  },
  drawerHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    flexShrink: 0,
  },
  close: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    margin: '0 -8px 0 0',
    background: 'transparent',
    border: 'none',
    color: 'var(--cream)',
    cursor: 'pointer',
    padding: 0,
  },
  drawerNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 16,
  },
  drawerLink: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 18,
    color: 'var(--cream)',
    padding: '14px 0',
    borderBottom: '1px solid var(--dark-border)',
    letterSpacing: '0.01em',
  },
  drawerSignin: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    padding: '13px 24px',
    background: 'transparent',
    color: 'var(--cream)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    letterSpacing: '0.01em',
  },
  drawerCta: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: '14px 24px',
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    letterSpacing: '0.01em',
  },
}
