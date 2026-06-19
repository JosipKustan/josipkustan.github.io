import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import newsroomImg from '../assets/NewsRoom_Old.png'
import { BOOKING_URL, BOOKING_LINK_PROPS } from '../bookingLink'

// Tiny 24px-wide blurred JPEG of the newsroom photo, inlined as a data URI so it
// paints instantly (it ships in the JS bundle, no network request). It's shown
// blurred and scaled up while the full 4.5MB PNG streams in, then the real photo
// fades over it — no more line-by-line reveal.
const NEWSROOM_LQIP =
  'data:image/jpeg;base64,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'

export default function Hero() {
  const prefersReduced = useReducedMotion()
  const imgRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // If the full image is already cached, onLoad may not fire after mount.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [])

  return (
    <section style={styles.section} id="hero">
      {/* Background photo */}
      <div style={styles.bg}>
        {/* Blurred low-res placeholder — instant paint, fades out as the real photo arrives */}
        <div
          aria-hidden
          style={{
            ...styles.bgImg,
            backgroundImage: `url(${NEWSROOM_LQIP})`,
            backgroundSize: 'cover',
            backgroundPosition: 'right 100px center',
            filter: 'saturate(0.8) sepia(0.14) contrast(1.02) blur(20px)',
            transform: 'scale(1.06)',
            opacity: loaded ? 0 : 1,
            transition: 'opacity 0.7s ease',
          }}
        />
        <img
          ref={imgRef}
          src={newsroomImg}
          alt=""
          onLoad={() => setLoaded(true)}
          style={{
            ...styles.bgImg,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        />
        <div style={styles.overlay} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        <motion.span
          style={styles.eyebrow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          Built for newsrooms
        </motion.span>

        <motion.h1
          style={styles.heading}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
        >
          Give your
          <br />
          journalists their
          <br />
          <span style={styles.highlight}>
            hours back.
            <motion.span
              style={styles.underline}
              initial={prefersReduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1], delay: 0.85 }}
            />
          </span>
        </motion.h1>

        <motion.p
          style={styles.sub}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1], delay: 0.35 }}
        >
          NewsLabs drafts the routine production work: republishing, translation, wires, and
          social monitoring. Editors decide what publishes.
        </motion.p>

        <motion.div
          style={styles.ctaRow}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.5 }}
        >
          <motion.a
            href={BOOKING_URL}
            {...BOOKING_LINK_PROPS}
            style={styles.cta}
            whileHover={{ backgroundColor: 'oklch(0.82 0.18 58.3)', scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Book a demo
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-end',
    paddingBottom: 'clamp(56px, 8vh, 100px)',
    paddingLeft: 'var(--section-px)',
    paddingRight: 'var(--section-px)',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  bgImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'right 100px center',
    // Warm the newsroom photo toward the cream/orange palette — a mild vintage
    // grade. The bottom-anchored overlay still carries text contrast.
    filter: 'saturate(0.8) sepia(0.14) contrast(1.02)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    // Two stacked scrims. The bottom-up scrim reaches higher and stays denser
    // (white headline runs three lines into the photo's bright upper band); the
    // diagonal scrim darkens the lower-left text column against the lit windows
    // on the right, while leaving the upper-right of the photo readable.
    background:
      'linear-gradient(to top, oklch(0.12 0.03 273 / 0.95) 0%, oklch(0.12 0.03 273 / 0.88) 30%, oklch(0.12 0.03 273 / 0.62) 50%, oklch(0.12 0.03 273 / 0.28) 68%, oklch(0.12 0.03 273 / 0) 84%), ' +
      'linear-gradient(105deg, oklch(0.12 0.03 273 / 0.7) 0%, oklch(0.12 0.03 273 / 0.34) 30%, oklch(0.12 0.03 273 / 0) 58%)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: 'var(--max-width)',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px',
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--brand-orange)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(52px, 8vw, 104px)',
    lineHeight: 1.0,
    letterSpacing: '-0.03em',
    color: '#ffffff',
    margin: 0,
    // Soft shadow gives the white type a crisp edge over any residual highlights
    // in the photo without reading as a hard drop-shadow.
    textShadow: '0 1px 2px rgba(10, 12, 25, 0.28), 0 2px 28px rgba(10, 12, 25, 0.4)',
  },
  highlight: {
    position: 'relative',
    display: 'inline-block',
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontWeight: 600,
    color: '#ffffff',
    background: 'rgba(255,255,255,0.12)',
    paddingLeft: '4px',
    paddingRight: '8px',
    paddingBottom: '2px',
    letterSpacing: '-0.02em',
  },
  underline: {
    position: 'absolute',
    left: '4px',
    right: 0,
    bottom: 0,
    height: '3px',
    borderRadius: '2px',
    background: 'var(--brand-orange)',
    transformOrigin: '0% 50%',
  },
  sub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 19px)',
    fontWeight: 400,
    lineHeight: 1.55,
    color: 'rgba(249, 247, 244, 0.94)',
    maxWidth: '52ch',
    margin: 0,
    textShadow: '0 1px 12px rgba(10, 12, 25, 0.45)',
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '14px 26px',
    marginTop: '8px',
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    background: 'var(--brand-orange)',
    color: 'var(--ink)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.01em',
    transition: 'background 0.15s ease',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--cream)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
}
