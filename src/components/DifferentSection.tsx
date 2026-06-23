import { useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { ShieldCheck, Link2, Users } from 'lucide-react'
import { Eyebrow, PaperTearEdge, BottomPaperTearEdge } from './vintage/VintageKit'
import SourceCite from './SourceCite'
import { useIsMobile } from '../hooks/useMediaQuery'
import typewriterBg from '../assets/Typewritercloseup.png'

// Real, attributed adoption figures behind the opening line (no fabricated
// numbers). The Reuters Institute figure is UK journalists — keep that
// attribution so it stays defensible if challenged. Traceability, not truth.
const REUTERS_SRC = {
  cite: 'Reuters Institute, University of Oxford (2025)',
  href: 'https://reutersinstitute.politics.ox.ac.uk/ai-adoption-uk-journalists-and-their-newsrooms-surveying-applications-approaches-and-attitudes',
}
const AP_SRC = {
  cite: 'Associated Press (2024)',
  href: 'https://www.researchgate.net/publication/379668724_Generative_AI_in_Journalism_The_Evolution_of_Newswork_and_Ethics_in_a_Generative_Information_Ecosystem?channel=doi&linkId=6614c3cc43f8df018de7606c&showFulltext=true',
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 5 — "How NewsLabs is different". Dark ink surface. Pre-empts the
// "isn't this just ChatGPT?" objection by accepting it head-on: reporters already use
// AI, so rather than deny it, NewsLabs makes the work something the desk can stand
// behind. Human accountability is the spine — the byline (and the judgement) stays
// human. The opening line backs the concession with two real, attributed adoption
// figures (Reuters Institute / Oxford, AP) rendered as inline SourceCite citations:
// on desktop each highlighted phrase reveals a SOURCE card linking out; on mobile the
// sources drop to a caption line under the paragraph. Three pillars carry the theme:
//   1. Sources you can stand behind — drafts only from the wires/feeds you set; every
//                                     claim carries its source (traceability, NOT
//                                     fact-checking) so the desk can defend it.
//   2. A human signs off            — AI drafts inside your structure/tone; an editor
//                                     approves, edits, or rejects every line and owns
//                                     the call.
//   3. Held to your standards       — tuned to your newsroom, its languages, and the
//                                     standards it's judged by, by former journalists.
//                                     Not a blank prompt box.
//
// This section sits directly below the cream Workflows section, so it carries the
// page's one torn-paper seam: the cream "page" above tears away to reveal this
// dark report (PaperTearEdge, sheet = the Workflows background). Moved here from
// StatsSection when block 5 was inserted between Workflows and Stats.
//
// Framer note: dark ink Frame, --section padding, position relative. Fill = the
// Typewritercloseup.png photo at full opacity (ink solid behind as the fallback). Pin
// the PaperTear.svg image full-bleed to the top (recolour its sheet to the page bg so
// the intact top vanishes into the Workflows section above). Header = orange mono
// Eyebrow + Mozilla Text H2 + an Inter standfirst (muted cream, max ~60ch), CENTRED
// with a soft text-shadow for legibility over the photo. Below
// it an auto-grid of three pillar cards styled as editorial entries echoing the
// FAQ column (--dark-card fill, navy border, lg radius, soft ink lift shadow):
// a two-column grid of a Lucide icon (24px, 1.5 stroke, orange) in the gutter, then
// a Mozilla Text title, a 48px burnt-orange rule that draws in from the left (scaleX 0→1),
// and a Source Serif body led by an orange drop-cap first letter. Scroll-in:
// stagger the cards (fade + y 28px, ~0.1s) with the rule drawing in beneath each
// title; hover y:-3. Honour reduced-motion (no draw-in, static drop-cap/rule).
// ─────────────────────────────────────────────────────────────────────────────

const PILLARS: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: <Link2 size={24} strokeWidth={1.5} />,
    title: 'Sources you can stand behind.',
    body: 'A general chatbot fills the gaps by inventing them, and the desk wears it. NewsLabs drafts only from the wires and feeds you choose, and every claim carries the source it came from, so you can defend every line.',
  },
  {
    icon: <ShieldCheck size={24} strokeWidth={1.5} />,
    title: 'A human signs off.',
    body: "Nothing is published on the AI's say-so. Drafts resemble your newsroom style and tone, including the entire copy structure, as well as headlines. An editor approves, edits, and gets further edits with NewsLabs. The call and the responsibility stay with the desk.",
  },
  {
    icon: <Users size={24} strokeWidth={1.5} />,
    title: 'Held to your standards.',
    body: "Tuned to how your newsroom works, the languages it works in, and the standards it's judged by, built by former journalists. Not a blank prompt box that answers to no one. A full newsroom that outputs the highest quality pieces.",
  },
]

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export default function DifferentSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  }
  const card: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }
  // Burnt-orange rule draws in from the left beneath each title, echoing the FAQ
  // editorial column. Propagates with the parent card's hidden/show state.
  const rule: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 0.45, ease: EASE, delay: 0.1 } },
  }

  return (
    <section style={s.section} id="different" ref={ref}>
      {/* The cream Workflows "page" above tears away here to reveal the dark report. */}
      <PaperTearEdge sheet="var(--background)" />

      <div style={s.inner}>
        <motion.header
          style={s.header}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Eyebrow tone="dark">How NewsLabs is different</Eyebrow>
          <h2 style={s.heading}>Not a chatbot. A newsroom.</h2>
          <p style={s.standfirst}>
            Your reporters already use AI. A{' '}
            <SourceCite cite={REUTERS_SRC.cite} href={REUTERS_SRC.href}>
              Reuters Institute survey of 1,004 journalists found 56% use it at least weekly
            </SourceCite>
            , and an{' '}
            <SourceCite cite={AP_SRC.cite} href={AP_SRC.href}>
              Associated Press study put newsroom use near 70%
            </SourceCite>
            .
          </p>
          <p style={s.standfirst}>
            So instead of pretending otherwise, NewsLabs gives them a version they can control
            and stand behind. Every claim carries its source, nothing leaves the desk until an
            editor signs off, and the byline stays human.
          </p>
          {isMobile && (
            <p style={s.sourceLine}>
              Sources:{' '}
              <a href={REUTERS_SRC.href} target="_blank" rel="noopener noreferrer" style={s.sourceLink}>
                {REUTERS_SRC.cite}
              </a>
              {' · '}
              <a href={AP_SRC.href} target="_blank" rel="noopener noreferrer" style={s.sourceLink}>
                {AP_SRC.cite}
              </a>
            </p>
          )}
        </motion.header>

        <motion.div
          style={s.grid}
          variants={reduce ? undefined : container}
          initial={reduce ? false : 'hidden'}
          animate={inView ? 'show' : reduce ? undefined : 'hidden'}
        >
          {PILLARS.map(p => (
            <motion.article
              key={p.title}
              style={s.card}
              variants={reduce ? undefined : card}
              whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.18 } }}
            >
              <span style={s.icon} aria-hidden>
                {p.icon}
              </span>
              <div style={s.cardBody}>
                <h3 style={s.cardTitle}>{p.title}</h3>
                <motion.span
                  style={s.rule}
                  variants={reduce ? undefined : rule}
                  aria-hidden
                />
                <p style={s.body}>
                  <span style={s.dropcap}>{p.body.slice(0, 1)}</span>
                  {p.body.slice(1)}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Full-width torn-paper seam closing the section, mirroring the cream tear
          at the top. The cream sheet rises from the bottom and its ragged top edge
          reveals the typewriter photo above. ~3× the default height for a deeper tear. */}
      <BottomPaperTearEdge height="clamp(144px, 21vw, 300px)" />
    </section>
  )
}

const s: Record<string, CSSProperties> = {
  // Typewriter close-up photo fills the section at full opacity (ink solid behind as
  // a fallback). The centred header carries a soft text-shadow for legibility.
  section: {
    position: 'relative',
    backgroundColor: 'var(--ink)',
    // Navy gradient layered over the photo: it holds near-full ink through the top
    // ~40% — the band the header + standfirst occupy, where the photo otherwise
    // lightens and dropped text legibility — then fades to fully transparent by 82%
    // so the lower third of the photo still shows at full strength behind the cards.
    // Listed first so it paints over the image; sized 100% 100% so the stops map to
    // the section's own height.
    backgroundImage: `linear-gradient(180deg, #14182A 0%, #14182A 38%, rgba(20, 24, 42, 0) 82%), url(${typewriterBg})`,
    backgroundSize: '100% 100%, cover',
    backgroundPosition: 'top center, center',
    backgroundRepeat: 'no-repeat, no-repeat',
    // Extra top/bottom space (well beyond --section-py) lengthens the section so the
    // header + standfirst sit framed over the photo. Bottom padding runs deeper than
    // the top so the taller torn-paper seam clears the cards and sits with room below.
    padding: 'clamp(120px, 15vw, 220px) var(--section-px) clamp(200px, 26vw, 380px)',
  },
  inner: {
    position: 'relative',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(36px, 5vw, 56px)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    maxWidth: 720,
    alignSelf: 'center',
    textAlign: 'center',
    textShadow: '0 1px 2px rgba(0,0,0,0.6), 0 2px 16px rgba(0,0,0,0.45)',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 4vw, 46px)',
    letterSpacing: '-0.02em',
    lineHeight: 1.05,
    color: 'var(--cream)',
    margin: 0,
  },
  standfirst: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'clamp(16px, 1.9vw, 20px)',
    lineHeight: 1.55,
    color: 'oklch(0.76 0.015 85)',
    // Spacing between the two standfirst paragraphs (and before the cards) is
    // handled by the header's flex gap + the inner grid gap, so no own margin.
    margin: 0,
    maxWidth: '60ch',
  },
  // Mobile-only caption: the citations that the desktop hover cards carry inline.
  sourceLine: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    lineHeight: 1.55,
    color: 'oklch(0.66 0.015 85)',
    margin: '-12px 0 clamp(20px, 3vw, 40px)',
    maxWidth: '60ch',
  },
  sourceLink: {
    color: 'var(--brand-blue)',
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: 'clamp(16px, 2vw, 24px)',
  },
  // Editorial entry, FAQ-style: a mono section number in the gutter, the title set
  // in Mozilla Text, a drawn-in burnt-orange rule, then a Source Serif body led by
  // an orange drop-cap. Dark sheet with a soft ink lift (the dark-mode echo of the
  // FAQ "open" white card), hover y:-3.
  card: {
    display: 'grid',
    gridTemplateColumns: 'clamp(34px, 5vw, 46px) 1fr',
    columnGap: 'clamp(16px, 2vw, 20px)',
    alignItems: 'start',
    background: 'var(--dark-card)',
    border: '1px solid oklch(0.28 0.025 272)',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(26px, 3vw, 34px)',
    boxShadow:
      '0 18px 44px -18px rgba(0, 0, 0, 0.45), 0 4px 12px -6px rgba(0, 0, 0, 0.30)',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--brand-orange)',
    paddingTop: '0.1em',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(19px, 2.1vw, 23px)',
    letterSpacing: '-0.01em',
    lineHeight: 1.15,
    color: 'var(--cream)',
    margin: 0,
  },
  rule: {
    width: '48px',
    height: '2px',
    borderRadius: '2px',
    background: 'var(--brand-orange)',
    transformOrigin: 'left center',
  },
  body: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(15px, 1.6vw, 17px)',
    lineHeight: 1.62,
    color: 'var(--dark-muted)',
    margin: 0,
  },
  dropcap: {
    float: 'left',
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    fontSize: '3.05em',
    lineHeight: 0.78,
    paddingTop: '0.06em',
    paddingRight: '0.09em',
    color: 'var(--brand-orange)',
  },
}
