import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Eyebrow } from '../vintage/VintageKit'

// ─────────────────────────────────────────────────────────────────────────────
// Platform page — block 8, "Drafts that sound like you." Disarms the "it'll sound
// like a robot" objection. Voice is set per workflow by an editor, not guessed per
// draft. Light surface.
//
// Visual: two paragraph cards — the same story, two newsroom tones — each with a
// voice indicator chip.
//
// Framer note: cream Frame, header (Mozilla H2 + Inter body), then a 2-up grid of
// voice cards (cream fill, hairline border): a voice-indicator chip (orange dot +
// newsroom name + tone) over a Source Serif paragraph. Scroll-in stagger; hover y:-3.
// ─────────────────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const VOICES: { newsroom: string; tone: string; text: string }[] = [
  {
    newsroom: 'The Tribune',
    tone: 'measured',
    text: 'The council approved a €2.4 million budget for road repairs on Tuesday, following months of pressure from residents over potholes on the ring road.',
  },
  {
    newsroom: 'Metro Desk',
    tone: 'punchy',
    text: "Potholes won. After months of resident pressure, the council just signed off €2.4M to fix the ring road. Here's what changes.",
  },
]

export default function VoiceSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false

  return (
    <section style={s.section} id="voice" className="vk-paper" ref={ref}>
      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="light">Your voice</Eyebrow>
          <h2 style={s.heading}>Drafts that sound like you.</h2>
          <p style={s.body}>
            Every draft inherits your newsroom's voice settings. Voice is set per workflow by an
            editor, not guessed per draft by the system.
          </p>
        </motion.header>

        <div style={s.grid}>
          {VOICES.map((v, i) => (
            <motion.div
              key={v.newsroom}
              style={s.card}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + i * 0.1, ease: EASE }}
              whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
            >
              <span style={s.voiceChip}>
                <span style={s.voiceDot} aria-hidden />
                {v.newsroom}
                <span style={s.voiceTone}>· {v.tone}</span>
              </span>
              <p style={s.cardText}>{v.text}</p>
            </motion.div>
          ))}
        </div>
        <p style={s.note}>Same story. Same facts. Two house voices.</p>
      </div>
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  section: {
    background: 'var(--background)',
    padding: 'var(--section-py) var(--section-px)',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(28px, 4vw, 44px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: 680,
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    margin: 0,
    lineHeight: 1.05,
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.7vw, 18px)',
    lineHeight: 1.6,
    color: 'var(--muted-foreground)',
    margin: 0,
    maxWidth: '58ch',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'var(--card)',
    border: '1px solid rgba(20,24,42,0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(24px, 2.8vw, 32px)',
    boxShadow: 'var(--shadow-sm)',
  },
  voiceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    background: 'rgba(192,91,0,0.08)',
    border: '1px solid rgba(192,91,0,0.25)',
    borderRadius: '999px',
    padding: '6px 13px',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--accent)',
  },
  voiceDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--accent)',
  },
  voiceTone: {
    fontWeight: 500,
    color: 'var(--muted-foreground)',
  },
  cardText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(16px, 1.8vw, 19px)',
    lineHeight: 1.6,
    color: 'rgba(20,24,42,0.82)',
    margin: 0,
  },
  note: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '15px',
    color: 'var(--muted-foreground)',
    margin: 0,
  },
}
