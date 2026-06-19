import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import SocialWorkflowShowcase from './SocialWorkflowShowcase'
import SocialWorkflowCardMobile from './SocialWorkflowCardMobile'
import VoiceRewriteCard from './VoiceRewriteCard'
import FactCheckCard from './FactCheckCard'
import TranscriptionCard from './TranscriptionCard'
import SpeedWorkflowCard from './SpeedWorkflowCard'
import { useIsMobile } from '../hooks/useMediaQuery'

export default function WorkflowsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const isMobile = useIsMobile()

  return (
    <section style={styles.section} id="workflows" className="vk-paper" ref={ref}>
      <div style={styles.inner}>
        {/* Section header */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 style={styles.sectionTitle}>The work NewsLabs handles.</h2>
          <p style={styles.sectionSub}>
            The model drafts the production. The editor keeps the call.
          </p>
        </motion.div>

        {/* First card — full width interactive */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {isMobile ? <SocialWorkflowCardMobile /> : <SocialWorkflowShowcase />}
        </motion.div>

        {/* Full-width interactive fact-check card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          <FactCheckCard />
        </motion.div>

        {/* Full-width interactive "race to publish" speed card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.29 }}
        >
          <SpeedWorkflowCard />
        </motion.div>

        {/* Remaining workflow cards.
            On mobile the grid is a single column, so match the 40px column
            rhythm used between the full-width cards above; 2-up desktop keeps
            the tighter 16px gutter. */}
        <div style={{ ...styles.grid, gap: isMobile ? '40px' : '16px' }}>
          {/* Lead card — interactive "rewrite in your voice" delight.
              Sits above its grid siblings (z-index) so the megaphone, which
              hangs past the card's edges, isn't painted over by the next card. */}
          <motion.div
            style={{ position: 'relative', zIndex: 2 }}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] }}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
          >
            <VoiceRewriteCard />
          </motion.div>

          {/* Interactive transcription player — replaces the static tile */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.38, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] }}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
          >
            <TranscriptionCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    background: 'var(--background)',
    padding: 'var(--section-py) var(--section-px)',
  },
  inner: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  header: {
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 3.5vw, 42px)',
    letterSpacing: '-0.02em',
    color: 'var(--foreground)',
    marginBottom: '10px',
  },
  sectionSub: {
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    color: 'var(--muted-foreground)',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    // min(100%, 340px) keeps a single card from overflowing on the narrowest
    // phones while still sitting 2-up across desktop widths.
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
    gap: '16px',
  },
  ctaWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px',
  },
  sectionCta: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '13px 26px',
    border: '1px solid rgba(20, 24, 42, 0.18)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--foreground)',
    background: 'var(--card)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
}
