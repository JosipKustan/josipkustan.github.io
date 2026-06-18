import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import stackImg from '../assets/StackofPapers.png'
import { useIsMobile } from '../hooks/useMediaQuery'
import { Eyebrow } from './vintage/VintageKit'

// A "By the numbers" data report. Two hero metrics carry a supporting visual
// that proves the number — Google Discover reach gets a search-result mock whose
// #1 slot is still open for "your article", and Articles published shows a literal
// pile of newspapers. The other two stay plain count-up numbers. Numbers count up
// on scroll-into-view; positive deltas get a trend arrow that rises in after.
type Stat = {
  value: number
  prefix?: string
  suffix?: string
  label: string
  trend?: 'up'
  visual?: 'serp' | 'papers'
}

const stats: Stat[] = [
  { value: 53, prefix: '+', suffix: '%', label: 'Google Discover reach', trend: 'up', visual: 'serp' },
  { value: 23, prefix: '+', suffix: '%', label: 'Pageviews', trend: 'up' },
  { value: 93, suffix: '%', label: 'Team satisfaction' },
  { value: 50, suffix: 'K+', label: 'Articles reviewed and published', visual: 'papers' },
]

// rAF count-up to `target`, easeOutCubic so it decelerates into the final
// value. `delay` staggers each metric; reduced-motion jumps straight there.
function useCountUp(target: number, active: boolean, reduce: boolean, duration = 1150, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active || reduce) return
    let raf = 0
    let start: number | null = null
    const tick = (t: number) => {
      if (start === null) start = t
      const p = Math.min(Math.max(t - start - delay, 0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setVal(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, reduce, duration, delay])
  return reduce ? target : Math.round(val)
}

function TrendArrow({
  show, reduce, delay, color = 'var(--brand-orange)',
}: { show: boolean; reduce: boolean; delay: number; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width="0.62em"
      height="0.62em"
      fill="none"
      style={{ marginLeft: '0.12em', flexShrink: 0 }}
      initial={reduce ? false : { opacity: 0, x: -4, y: 4 }}
      animate={show ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden
    >
      <path
        d="M7 17 17 7M17 7H9M17 7v8"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" stroke="#5f6368" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#4285F4" />
      <path d="M6 11a6 6 0 0 0 12 0" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17v3" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 21h6" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Recreated Google homepage for the "Google Discover reach" panel. The "Google"
// wordmark is the count-up number "+53%" rendered in the Google brand colors
// (per-character cycle) and the search box reads "Google discover reach". The
// two homepage buttons fire the search: clicking either morphs the homepage
// into a results page — the logo shrinks into a header row beside the search
// bar and two NewsLabs results stagger in (#1 why SEO matters, #2 how we
// tackle it). Clicking the shrunken logo returns home, just like Google.
const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335']
const SERP_RESULTS = [
  {
    site: 'NewsLabs',
    url: 'newslabs.com › learn › why-seo-matters',
    title: "Why SEO matters: readers don't find newsrooms, they find stories",
    desc: 'Most news traffic now starts with a search or a Discover feed, and Google decides which version of a story gets the click. The slot above you takes the readers, the ad revenue and the subscriber. Search visibility isn’t marketing. It’s distribution.',
  },
  {
    site: 'NewsLabs',
    url: 'newslabs.com › product › search',
    title: 'How NewsLabs tackles it: every draft ships search-ready',
    desc: 'NewsLabs builds SEO into the writing itself: headlines tuned to real queries, metadata and structured data generated with the draft, and Discover-friendly formatting checked before you publish. No checklist, no plugin, no extra pass.',
  },
]
// Same spring as the workflow cards' shared-element morphs.
const googleSpring = { type: 'spring', stiffness: 320, damping: 34 } as const
function GoogleHome({ stat, inView, reduce }: { stat: Stat; inView: boolean; reduce: boolean }) {
  const value = useCountUp(stat.value, inView, reduce, 1150, 220)
  const text = `${stat.prefix ?? ''}${value}${stat.suffix ?? ''}`
  const [searched, setSearched] = useState(false)
  const layoutSpring = reduce ? { duration: 0 } : googleSpring
  const goHome = () => setSearched(false)
  return (
    <>
      <motion.div layout transition={layoutSpring} style={searched ? styles.googleHeadRow : styles.googleHeadHome}>
        <motion.div
          layout
          transition={layoutSpring}
          style={{ ...styles.googleLogo, ...(searched ? styles.googleLogoSmall : undefined) }}
          aria-label={text}
          role={searched ? 'button' : undefined}
          tabIndex={searched ? 0 : undefined}
          title={searched ? 'Back to search' : undefined}
          onClick={searched ? goHome : undefined}
          onKeyDown={searched ? e => { if (e.key === 'Enter' || e.key === ' ') goHome() } : undefined}
        >
          {text.split('').map((ch, i) => (
            <span key={i} style={{ color: GOOGLE_COLORS[i % GOOGLE_COLORS.length] }}>{ch}</span>
          ))}
          {stat.trend === 'up' && (
            <TrendArrow show={inView} reduce={reduce} delay={(220 + 1150) / 1000 + 0.05} color="#34A853" />
          )}
        </motion.div>
        <motion.div
          layout
          transition={layoutSpring}
          style={{ ...styles.googleBar, ...(searched ? styles.googleBarRow : undefined) }}
        >
          <SearchIcon />
          <span style={styles.googleQuery}>Google discover reach</span>
          <MicIcon />
        </motion.div>
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        {!searched ? (
          <motion.div
            key="home-btns"
            style={styles.googleBtns}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3 }}
          >
            <button type="button" style={styles.googleBtn} onClick={() => setSearched(true)}>
              SEO optimized search
            </button>
            <button type="button" style={styles.googleCta} onClick={() => setSearched(true)}>
              See how we do it
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="serp"
            style={styles.googleResults}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
          >
            {SERP_RESULTS.map((r, i) => (
              <motion.div
                key={r.url}
                style={styles.serpResult}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: reduce ? 0 : 0.12 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div style={styles.serpSiteRow}>
                  <span style={styles.serpFavicon}>
                    <img src="/assets/mark-navy.svg" alt="" style={styles.serpFaviconImg} />
                  </span>
                  <span style={styles.serpSiteCol}>
                    <span style={styles.serpSite}>{r.site}</span>
                    <span style={styles.serpUrl}>{r.url}</span>
                  </span>
                </div>
                <span style={styles.serpTitle}>{r.title}</span>
                <p style={styles.serpDesc}>{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M12 20.5S3.5 15 3.5 8.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 1.9C20.5 15 12 20.5 12 20.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="18" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.4 10.8 7.2-4.2M8.4 13.2l7.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Pageviews as a social-media engagement card on a cream surface with primary-blue
// accents. Hierarchy: the "+23%" rise is the hero (counts up on scroll), then the
// "Pageviews" label, then a live view count that slowly ticks up, then likes +
// shares as plain icon + number. Reduced-motion → static.
const VIEWS_BASE = 128402
const VIEW_STEPS = [2, 1, 3, 1, 2, 4, 1, 3]
function PageviewsCard({ stat, inView, reduce }: { stat: Stat; inView: boolean; reduce: boolean }) {
  const [views, setViews] = useState(VIEWS_BASE)
  useEffect(() => {
    if (!inView || reduce) return
    let i = 0
    const id = setInterval(() => setViews(v => v + VIEW_STEPS[i++ % VIEW_STEPS.length]), 480)
    return () => clearInterval(id)
  }, [inView, reduce])

  const rise = useCountUp(stat.value, inView, reduce, 1150, 220)
  const delta = `${stat.prefix ?? ''}${rise}${stat.suffix ?? ''}`
  const arrowDelay = (220 + 1150) / 1000 + 0.05

  return (
    <>
      <div style={styles.pvRise}>
        <span style={styles.pvRiseNum}>{delta}</span>
        {stat.trend === 'up' && (
          <TrendArrow show={inView} reduce={reduce} delay={arrowDelay} color="var(--primary)" />
        )}
      </div>
      <span style={styles.pvLabel}>Pageviews</span>

      <div style={styles.pvViewsRow}>
        <span style={styles.pvEye}><EyeIcon /></span>
        <span style={styles.pvViewsNum}>{views.toLocaleString('en-US')}</span>
        <span style={styles.pvViewsWord}>views</span>
      </div>

      <div style={styles.pvActions}>
        <span style={styles.pvStat}><span style={styles.pvIcon}><HeartIcon /></span>4.2K</span>
        <span style={styles.pvStat}><span style={styles.pvIcon}><ShareIcon /></span>312</span>
      </div>
    </>
  )
}

// Articles card: the newspaper stack fills the card as a cover background, with
// the count-up "50K+" and the label sitting on top in primary-blue banner bands.
function ArticlesCard({ stat, inView, reduce }: { stat: Stat; inView: boolean; reduce: boolean }) {
  const value = useCountUp(stat.value, inView, reduce, 1150, 220 + 3 * 120)
  const text = `${stat.prefix ?? ''}${value}${stat.suffix ?? ''}`
  return (
    <>
      <motion.img
        src={stackImg}
        alt="A stack of published newspapers"
        style={styles.articlesImg}
        initial={reduce ? false : { opacity: 0, scale: 1.05 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      />
      <div style={styles.articlesOverlay}>
        <div style={styles.articlesNumBand}>
          <span style={styles.articlesNum}>{text}</span>
        </div>
        <div style={styles.articlesLabelBand}>
          <span style={styles.articlesLabelText}>{stat.label}</span>
        </div>
      </div>
    </>
  )
}

function ThumbUp({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ display: 'block', filter: 'drop-shadow(0 4px 10px rgba(10,12,22,0.45))' }}>
      <path
        d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
        fill="#ffffff" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M7 11v11" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Team satisfaction: the inner blue panel fills bottom-up to 93% on scroll (in
// sync with the count-up number it reveals), and three thumbs-up pop in inside
// the card corners with a spring — fully contained, nothing overhangs the
// grid. Reduced-motion → blue pre-filled, no pop.
const THUMBS = [
  { style: { top: '14px', right: '16px' }, rot: 16, size: 'clamp(42px, 5.5vw, 60px)', delay: 0.55 },
  { style: { bottom: '14px', right: '18px' }, rot: -14, size: 'clamp(36px, 4.8vw, 52px)', delay: 0.7 },
  { style: { top: '38%', left: '16px' }, rot: -22, size: 'clamp(38px, 5vw, 56px)', delay: 0.85 },
]
function SatisfactionCard({ stat, inView, reduce }: { stat: Stat; inView: boolean; reduce: boolean }) {
  const value = useCountUp(stat.value, inView, reduce, 1150, 220 + 2 * 120)
  return (
    <>
      <div style={styles.satClip}>
        <div style={{ ...styles.satFill, height: `${value}%` }} />
        <div style={styles.satTextLayer}>
          <span style={styles.satNum}>{value}{stat.suffix ?? ''}</span>
          <span style={styles.satLabelText}>{stat.label}</span>
        </div>
      </div>
      {THUMBS.map((t, i) => (
        <motion.div
          key={i}
          style={{ ...styles.thumb, ...t.style }}
          initial={reduce ? false : { scale: 0, opacity: 0, rotate: t.rot }}
          animate={inView ? { scale: 1, opacity: 1, rotate: t.rot } : {}}
          transition={{ type: 'spring', stiffness: 320, damping: 16, delay: t.delay }}
        >
          <ThumbUp size={t.size} />
        </motion.div>
      ))}
    </>
  )
}

// Bottom-left card: the brief-to-draft turnaround as a before→after time
// reduction — the old time strikes through and the new time counts up in blue.
// Title/sub stack above the metric so it fits the narrow cell.
const BRIEF_OLD = '75 min'
const BRIEF_NEW = 9
function BriefToDraftCard({ inView, reduce }: { inView: boolean; reduce: boolean }) {
  const mins = useCountUp(BRIEF_NEW, inView, reduce, 1150, 220 + 4 * 120)
  return (
    <>
      <div style={styles.briefLeft}>
        <span style={styles.briefTitle}>Brief to draft</span>
        <span style={styles.briefSub}>From assignment to first finished draft.</span>
      </div>
      <div style={styles.briefMetric}>
        <span style={styles.briefOldWrap}>
          <span style={styles.briefOld}>{BRIEF_OLD}</span>
          <motion.span
            style={styles.briefStrike}
            initial={reduce ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </span>
        <span style={styles.briefArrow}>→</span>
        <span style={styles.briefNew}>
          <span style={styles.briefNewNum}>{mins}</span>
          <span style={styles.briefUnit}>min</span>
        </span>
      </div>
    </>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const [discover, pageviews, satisfaction, articles] = stats
  const area = (name: string) => (isMobile ? {} : { gridArea: name })
  const panelMotion = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
    whileHover: isMobile || reduce ? undefined : { y: -3 },
  })

  return (
    <section style={styles.section} id="stats" ref={ref}>
      <div style={styles.inner}>
        <motion.header
          style={styles.header}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Eyebrow tone="dark">By the numbers</Eyebrow>
          <h2 style={styles.heading}>What we observed with our partners.</h2>
        </motion.header>

        <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : styles.gridDesktop) }}>
          {/* Google Discover — recreated Google homepage, logo = the +53% count */}
          <motion.div style={{ ...styles.googlePanel, ...area('discover') }} {...panelMotion(0)}>
            <GoogleHome stat={discover} inView={inView} reduce={reduce} />
          </motion.div>

          {/* Side column — two separate cards: Pageviews (social) + Team satisfaction */}
          <div style={{ ...styles.sideCol, ...area('side') }}>
            <motion.div
              style={{ ...styles.panel, ...styles.pvCard, ...(isMobile ? {} : styles.sideCardFill) }}
              {...panelMotion(0.08)}
            >
              <PageviewsCard stat={pageviews} inView={inView} reduce={reduce} />
            </motion.div>
            <motion.div
              style={{ ...styles.panel, ...styles.satCard, ...(isMobile ? {} : styles.sideCardFill) }}
              {...panelMotion(0.14)}
            >
              <SatisfactionCard stat={satisfaction} inView={inView} reduce={reduce} />
            </motion.div>
          </div>

          {/* Articles — newspaper photo background with the number on banner bands */}
          <motion.div style={{ ...styles.articlesPanel, ...area('articles') }} {...panelMotion(0.16)}>
            <ArticlesCard stat={articles} inView={inView} reduce={reduce} />
          </motion.div>

          {/* Brief to draft — bottom-left card, before→after time reduction */}
          <motion.div style={{ ...styles.panel, ...styles.briefBand, ...area('brief') }} {...panelMotion(0.24)}>
            <BriefToDraftCard inView={inView} reduce={reduce} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Every card's hero number renders at one shared size — the biggest of the set —
// so the four metrics read as equal-weight headlines regardless of card.
const HERO_NUM = 'clamp(54px, 12vw, 92px)'

const styles: Record<string, React.CSSProperties> = {
  section: {
    position: 'relative',
    background: 'var(--ink)',
    padding: 'var(--section-py) var(--section-px)',
    borderTop: '1px solid oklch(0.28 0.025 272)',
    borderBottom: '1px solid oklch(0.28 0.025 272)',
  },
  inner: {
    position: 'relative',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(28px, 5vw, 44px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    maxWidth: '32ch',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 3.5vw, 42px)',
    letterSpacing: '-0.02em',
    lineHeight: 1.06,
    color: 'var(--cream)',
    margin: 0,
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--brand-orange)',
  },
  eyebrowDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--brand-orange)',
  },
  grid: {
    width: '100%',
    display: 'grid',
    gap: 'clamp(16px, 2.2vw, 30px)',
  },
  gridMobile: {
    gridTemplateColumns: '1fr',
  },
  // Three tracks so the two rows can split differently: top row = wide Discover
  // (cols 1-2) vs the side pair, bottom row = narrow Brief vs wide Articles
  // (cols 2-3). Matches the wireframe ~56/44 top, ~38/62 bottom.
  gridDesktop: {
    gridTemplateColumns: '1.7fr 0.8fr 2fr',
    gridTemplateAreas: '"discover discover side" "brief articles articles"',
    alignItems: 'stretch',
  },
  panel: {
    position: 'relative',
    background: 'var(--dark-card)',
    border: '1px solid oklch(0.28 0.025 272)',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(16px, 2.2vw, 30px)',
  },
  // No `minHeight: 0` here — the cards must never shrink below their content
  // (it let the satisfaction card's minHeight starve Pageviews, clipping its
  // likes/shares row at the card edge).
  sideCardFill: {
    flex: '1 1 0',
    justifyContent: 'center',
  },
  // --- Team satisfaction card: blue panel fills to 93%, thumbs pop in around it ---
  satCard: {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    padding: 0,
    borderRadius: '16px',
    overflow: 'hidden',
    minHeight: 'clamp(220px, 24vw, 250px)',
  },
  satClip: {
    position: 'absolute',
    inset: 0,
    background: 'var(--cream)',
    border: '1px solid rgba(20, 24, 42, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  satFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--primary)',
  },
  satTextLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '0 18px',
    textAlign: 'center',
  },
  satNum: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: HERO_NUM,
    letterSpacing: '-0.03em',
    color: '#ffffff',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  satLabelText: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(15px, 2.2vw, 22px)',
    fontWeight: 600,
    color: '#ffffff',
  },
  thumb: {
    position: 'absolute',
    zIndex: 2,
  },
  // --- Pageviews social card (cream surface, primary-blue accents) ---
  pvCard: {
    background: 'var(--cream)',
    border: '1px solid rgba(20, 24, 42, 0.08)',
    alignItems: 'center',
    textAlign: 'center',
    gap: '4px',
  },
  pvRise: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: HERO_NUM,
    letterSpacing: '-0.03em',
    color: 'var(--primary)',
    lineHeight: 0.95,
  },
  pvRiseNum: {
    fontVariantNumeric: 'tabular-nums',
  },
  pvLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'rgba(20, 24, 42, 0.55)',
    marginTop: '2px',
  },
  pvViewsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
  },
  pvEye: {
    color: 'var(--primary)',
    display: 'inline-flex',
  },
  pvViewsNum: {
    fontFamily: 'var(--font-sans)',
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--ink)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  pvViewsWord: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'rgba(20, 24, 42, 0.55)',
  },
  pvActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '22px',
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(20, 24, 42, 0.1)',
  },
  pvStat: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: 'var(--font-sans)',
    fontSize: '13.5px',
    fontWeight: 600,
    color: 'var(--ink)',
  },
  pvIcon: {
    color: 'var(--primary)',
    display: 'inline-flex',
  },
  // --- Articles card: newspaper photo background + primary-blue banner bands ---
  articlesPanel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    minHeight: 'clamp(240px, 26vw, 320px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--cream)',
  },
  articlesImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    zIndex: 0,
    // Archival grade so the newspaper stack reads as file stock and the blue
    // banner bands pop harder against it.
    filter: 'grayscale(0.3) sepia(0.16) contrast(1.05)',
  },
  // Inset from the card edges (wireframe: the blue band floats on the photo
  // with clear padding around it, not full-bleed).
  articlesOverlay: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    padding: '0 clamp(24px, 4vw, 56px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(10px, 1.6vw, 18px)',
  },
  articlesNumBand: {
    width: '100%',
    background: 'var(--primary)',
    padding: 'clamp(12px, 1.8vw, 20px) 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  articlesNum: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: HERO_NUM,
    letterSpacing: '-0.03em',
    color: '#ffffff',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  articlesLabelBand: {
    width: '100%',
    background: 'var(--primary)',
    padding: 'clamp(8px, 1vw, 13px) 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  articlesLabelText: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 'clamp(15px, 2.1vw, 24px)',
    color: '#ffffff',
    textAlign: 'center',
  },
  // --- Brief to draft closing band (before→after time reduction) ---
  briefBand: {
    background: 'var(--cream)',
    border: '1px solid rgba(20, 24, 42, 0.08)',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 'clamp(18px, 2vw, 28px)',
    padding: 'clamp(26px, 3vw, 40px)',
  },
  briefLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  briefTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(24px, 3.2vw, 32px)',
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
    lineHeight: 1,
  },
  briefSub: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '15px',
    color: 'rgba(20, 24, 42, 0.55)',
  },
  briefMetric: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'clamp(14px, 2vw, 26px)',
  },
  briefOldWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  briefOld: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(26px, 4vw, 40px)',
    letterSpacing: '-0.02em',
    color: 'rgba(20, 24, 42, 0.4)',
  },
  briefStrike: {
    position: 'absolute',
    left: '-2px',
    right: '-2px',
    top: '52%',
    height: '3px',
    borderRadius: '2px',
    background: 'rgba(20, 24, 42, 0.45)',
    transformOrigin: 'left center',
  },
  briefArrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(22px, 3vw, 30px)',
    color: 'rgba(20, 24, 42, 0.4)',
  },
  briefNew: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '8px',
    color: 'var(--primary)',
  },
  // Smaller than HERO_NUM — the metric shares its narrow card with the title,
  // and a 92px "9" would force the 75 → 9 row to wrap.
  briefNewNum: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(40px, 5vw, 64px)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  briefUnit: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(18px, 2.2vw, 26px)',
  },
  // --- Google homepage mock (white card on the Discover panel) ---
  googlePanel: {
    position: 'relative',
    background: '#ffffff',
    border: '1px solid #e8eaed',
    borderRadius: '16px',
    padding: 'clamp(30px, 4vw, 48px) 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  },
  googleLogo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: HERO_NUM,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  googleBar: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
    border: '1px solid #dfe1e5',
    borderRadius: '999px',
    padding: '11px 16px',
    boxShadow: '0 1px 6px rgba(32,33,36,0.12)',
  },
  googleQuery: {
    flex: 1,
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    color: '#3c4043',
    textAlign: 'left',
  },
  googleBtns: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  googleBtn: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13.5px',
    fontWeight: 500,
    color: '#3c4043',
    background: '#f8f9fa',
    border: '1px solid #f8f9fa',
    borderRadius: '8px',
    padding: '10px 16px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  googleCta: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#ffffff',
    background: 'var(--primary)',
    border: '1px solid var(--primary)',
    borderRadius: '8px',
    padding: '10px 16px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  // Homepage state: logo stacked over the search bar, centered.
  googleHeadHome: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  // Results state: shrunken logo + bar side by side under a hairline rule,
  // like Google's results header.
  googleHeadRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px 18px',
    paddingBottom: '14px',
    borderBottom: '1px solid #e8eaed',
  },
  googleLogoSmall: {
    fontSize: 'clamp(24px, 3.4vw, 34px)',
    cursor: 'pointer',
  },
  googleBarRow: {
    flex: '1 1 220px',
    width: 'auto',
    maxWidth: '420px',
  },
  // --- Search results (the SEO showcase copy) ---
  googleResults: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(18px, 2.6vw, 28px)',
    textAlign: 'left',
  },
  serpResult: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxWidth: '640px',
  },
  serpSiteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  serpFavicon: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#f1f3f4',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serpFaviconImg: {
    width: '13px',
    height: '13px',
  },
  serpSiteCol: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '1px',
  },
  serpSite: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: '#202124',
    lineHeight: 1.2,
  },
  serpUrl: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#5f6368',
    lineHeight: 1.2,
  },
  serpTitle: {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.9vw, 19px)',
    fontWeight: 500,
    color: '#1a0dab',
    lineHeight: 1.3,
    marginTop: '2px',
  },
  serpDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13.5px',
    color: '#4d5156',
    lineHeight: 1.55,
    margin: 0,
  },
}
