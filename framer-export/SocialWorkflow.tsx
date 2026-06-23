// ─────────────────────────────────────────────────────────────────────────────
// FRAMER CODE COMPONENT — Workflows section, Card #1 "Social → Story"
// ─────────────────────────────────────────────────────────────────────────────
// Self-contained port of SocialWorkflowShowcase + SocialWorkflowCardMobile +
// social/socialContent + social/socialIcons + WorkflowCardFrame + the media-query
// / auto-advance hooks, bundled into one file so it can be pasted as a single
// Framer Code Component.
//
// The default export is the WRAPPER that swaps the desktop showcase for the
// mobile card at exactly 720px (matches the prototype's WorkflowsSection swap) —
// NOT Framer's 390 Phone breakpoint. Keep this internal swap; Framer breakpoints
// only drive the native shell around the component.
//
// PORTING NOTES
//   • Two assets must be uploaded to Framer; paste their URLs into the two consts
//     below (DOG_IMG, BRAND_RAINBOW). Originals: src/assets/dogonbeach.png and
//     public/assets/BrandRainbow.svg.
//   • var(--ink) / var(--cream) / var(--brand-orange) / var(--dark-border) /
//     var(--font-sans|display|serif|mono) are read from the site <head> token
//     block (see .claude/CLAUDE.md §0). Code Components CAN read them — left
//     verbatim. --font-mono is system monospace, no font upload needed.
//   • framer-motion + lucide-react import normally (both in Framer's sandbox).
//   • Placement: drop inside the native Workflows shell's 1200px column; set the
//     component to fit/Auto height. The card's own entrance (fade + rise) is the
//     native shell's Framer Appear effect — not included here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
  useCallback,
  forwardRef,
} from "react"
import type { ReactElement, ReactNode, CSSProperties, HTMLAttributes } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import {
  MessageCircle, Repeat2, Heart, BarChart2, Share, Play, Music, Volume2,
  ArrowBigUp, Plus, Maximize2, Send, Bookmark, Clock, ThumbsUp, MessageSquare,
  Globe, MoreHorizontal,
} from "lucide-react"

// ─── Framer assets — REPLACE with your uploaded Framer URLs ─────────────────────
const DOG_IMG = "https://REPLACE-WITH-FRAMER-URL/dogonbeach.png"
const BRAND_RAINBOW = "https://REPLACE-WITH-FRAMER-URL/BrandRainbow.svg"

// ─── Hooks (inlined from src/hooks) ─────────────────────────────────────────────
// useSyncExternalStore keeps first-paint stable (server snapshot is always false →
// desktop-first markup, then it corrects on mount).
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    cb => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", cb)
      return () => mql.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
// Page-wide cutoff — the whole layout collapses to single column at/below this.
function useIsMobile() {
  return useMediaQuery("(max-width: 720px)")
}
// Used ONLY inside the full-width card, whose two-column interior needs ~1000px+.
function useIsTightDesktop() {
  return useMediaQuery("(max-width: 1100px)")
}

// Fires `onAdvance` every `intervalMs` while `enabled`. Bumping `restartToken`
// restarts the timer from zero. Disabling and re-enabling also restarts it.
function useAutoAdvance(
  onAdvance: () => void,
  restartToken: number,
  enabled = true,
  intervalMs = 3000,
) {
  const cb = useRef(onAdvance)
  cb.current = onAdvance
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => cb.current(), intervalMs)
    return () => clearInterval(id)
  }, [restartToken, enabled, intervalMs])
}

// Pause-on-interaction. Call `notify()` whenever the user interacts; `paused`
// flips true and stays true until `ms` elapse with no further interaction.
function useInteractionPause(ms = 10000) {
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const notify = useCallback(() => {
    setPaused(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setPaused(false), ms)
  }, [ms])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  return { paused, notify }
}

// ─── Brand icon SVGs ────────────────────────────────────────────────────────────
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.13 6.33 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.56a8.18 8.18 0 0 0 4.78 1.52V6.65a4.85 4.85 0 0 1-1.01.04z" />
  </svg>
)
const RedditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
)
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)
const YouTubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

// ─── Types & content data (from social/socialContent) ───────────────────────────
type Platform = "x" | "tiktok" | "reddit" | "instagram" | "youtube" | "linkedin" | "facebook"

const PLATFORMS: { id: Platform; Icon: () => ReactElement; label: string }[] = [
  { id: "x",         Icon: XIcon,         label: "X" },
  { id: "tiktok",    Icon: TikTokIcon,    label: "TikTok" },
  { id: "reddit",    Icon: RedditIcon,    label: "Reddit" },
  { id: "instagram", Icon: InstagramIcon, label: "Instagram" },
  { id: "youtube",   Icon: YouTubeIcon,   label: "YouTube" },
  { id: "linkedin",  Icon: LinkedInIcon,  label: "LinkedIn" },
  { id: "facebook",  Icon: FacebookIcon,  label: "Facebook" },
]

// Shared auto-cycle order (deduped — both source modules declared this).
const ORDER = PLATFORMS.map(p => p.id)

const X_POST = {
  name: "National Pets",
  handle: "@nationalpets",
  time: "May 29",
  text: "A new study tracked 3,000 adults over five years. The single strongest predictor of daily wellbeing wasn't income, sleep, or exercise. It was whether they had a pet.\n\nThe researchers called it \"the quiet variable nobody was measuring.\" Full thread below.",
  hashtags: "#pets #animalstudy",
  stats: { comments: "13.1k", retweets: "11.2k", likes: "36.3k", views: "97.4k" },
}
const X_ARTICLE = {
  title: "The Quiet Variable: Why Owning a Pet Predicts Wellbeing Better Than Almost Anything Else",
  body: "A five-year longitudinal study published this week in the Journal of Social Health has identified pet ownership as one of the most consistent predictors of daily emotional wellbeing, outperforming income above a modest threshold, average sleep duration, and even frequency of social contact.\n\nThe effect held across age groups, household sizes, and pet species, though it was strongest among people who lived alone.",
}
const TIKTOK_POST = {
  handle: "@tiktok",
  caption: "Welcome to TikTok! 🙌⏱️",
  hashtags: ["#MakeEverySecondCount", "#MakeEverySecondCount", "#MakeEverySecondCount"],
  sound: "original sound - tiktok",
  stats: { likes: "640.4K", comments: "16K", shares: "7180" },
}
const TIKTOK_ARTICLE = {
  title: "Make Every Second Count: How a 15-Second Clip Became TikTok’s Loudest Welcome",
  body: "A short, looping welcome clip posted to TikTok’s own account has quietly become one of the platform’s most-replayed videos, racking up more than 640,000 likes and 16,000 comments in its first week.\n\nAnalysts point to the format itself, vertical, sound-on, and built to repeat, as the reason a message this simple traveled so far, so fast.",
}
const REDDIT_POST = {
  subreddit: "r/dogs",
  author: "u/EscapeActive6278",
  time: "13 hr. ago",
  title: "Took my rescue pup to the sea for the first time, he hasn’t stopped smiling since 🐶🌊",
  upvotes: "143 upvotes",
  commentsLabel: "View 45 comments",
}
const REDDIT_ARTICLE = {
  title: "A Rescue Dog’s First Trip to the Sea Becomes the Week’s Feel-Good Story",
  body: "A photograph of a recently adopted dog meeting the ocean for the first time has spread well beyond the pet forum where it was posted, drawing thousands of upvotes and hundreds of comments within hours.\n\nShelters say moments like these do real work: posts that show rescue animals thriving reliably drive a measurable bump in adoption inquiries the following week.",
}
const INSTAGRAM_POST = {
  username: "thebeachdogs",
  followers: "488K followers",
  likes: "2,842 likes",
  caption: "First swim of the summer 🐶🌊",
  mention: "@thepupclub",
  commentsLabel: "View all 40 comments",
  slides: 3,
}
const INSTAGRAM_ARTICLE = {
  title: "Three Photos, One Happy Dog: How a Beach Carousel Won Over 2,800 Strangers",
  body: "An Instagram carousel of a dog’s first summer swim has drawn thousands of likes and dozens of comments, the kind of gentle, shareable moment the platform’s algorithm increasingly rewards.\n\nCreators who post pets say image carousels consistently outperform single shots: each extra slide gives followers a reason to swipe, and the post a longer life in the feed.",
}
const YOUTUBE_POST = {
  channel: "The Dog Channel",
  title: "He’d never seen the ocean. Watch his first reaction 🌊🐶",
}
const YOUTUBE_ARTICLE = {
  title: "Caught on Camera: A Dog’s First Glimpse of the Sea Racks Up Millions of Views",
  body: "A short clip of a dog meeting the ocean for the first time has climbed YouTube’s trending feed, the latest in a long line of pet videos to find an outsized audience.\n\nPlatform data has long shown that animal footage punches above its weight: it is watched to completion more often than almost any other casual category, and it travels far beyond the channels that post it.",
}
const LINKEDIN_POST = {
  name: "The Pet Effect",
  tagline: "Workplace Wellbeing · Research",
  followers: "38,402 followers",
  time: "19h",
  text: "At our office, we believe wellbeing drives shared success. So we ran a six-month pilot: bring your dog to work, one day a week. The results surprised even us.",
  docTitle: "The Office Dog Effect",
  pages: 5,
  reactions: "312",
  commentsLabel: "47 comments",
}
const FACEBOOK_POST = {
  name: "Paws & Tails Rescue",
  time: "2d",
  text: "We took the shelter dogs to the beach for the first time today and… just look at this face. 🐶🌊 Every one of them is still looking for a home.",
  reactions: "17.2K",
  comments: "2,252",
  shares: "561",
}
const FACEBOOK_ARTICLE = {
  title: "A Beach Day for Shelter Dogs Turns Into a Viral Plea for Adoptions",
  body: "A local rescue’s Facebook photo of shelter dogs seeing the ocean for the first time has been shared more than five hundred times, far outpacing the page’s usual reach.\n\nThe rescue says the post did in a day what weeks of standard adoption listings could not: its phone has not stopped ringing since.",
}
const LINKEDIN_ARTICLE = {
  title: "The Office Dog Effect: What Six Months of “Bring Your Dog to Work” Taught One Company",
  body: "A six-month workplace pilot that let employees bring their dogs in one day a week reported sharp gains in self-rated wellbeing and team cohesion, alongside a noticeable dip in midweek absences.\n\nHR leaders say the appeal is less about the dogs themselves than what they signal: a workplace willing to bend its norms around the lives people actually lead.",
}
const PLATFORM_NOTES: Record<Platform, string> = {
  x:         "Built. Tweet (avatar + text + photo + engagement stats) → article. Photo is the shared element.",
  tiktok:    "Built. Vertical 9:16 player (dog cover + caption + rail stats + sound) → article with the post shown as an embedded TikTok block. Shared element = the dog-cover video.",
  reddit:    "Built. Dog thread (subreddit + title + photo + upvotes/comments) → article with the photo as the lead hero. Shared element = the dog photo.",
  instagram: "Built. Carousel post (gradient-ring header + slide dots + likes/caption) → article with the active slide as the lead hero. Shared element = the dog photo.",
  youtube:   "Built. Dark 16:9 player (channel + title + red play + Watch on YouTube) → article with the thumbnail as the lead hero. Shared element = the dog thumbnail.",
  facebook:  "Built. Dog rescue post (avatar + name + text + photo + reactions/comments/shares + Like/Comment/Share bar) → article with the photo as the lead hero. Shared element = the dog photo.",
  linkedin:  "Built. Company document/PDF-carousel post (square logo header + LinkedIn wordmark + “…more” text + paged document cover with title bar / “SWIPE” hint + reactions/comments + Like/Comment/Repost/Send bar) → article with the document cover as the lead hero. Shared element = the document cover (dog photo).",
}

// ═════════════════════════════════════════════════════════════════════════════
// MOBILE social workflow card (also used in `chrome="bare"` mode by the showcase)
// ═════════════════════════════════════════════════════════════════════════════

type Mode = "post" | "article"

// Full-chrome (mobile) card widths: posts stay phone-credible and centered in the
// stage; articles spread wider. Both cap to the container on narrow phones.
const FULL_WIDTHS = { post: 440, article: 600 } as const

const BUILT: Platform[] = ["x", "tiktok", "reddit", "instagram", "youtube", "linkedin", "facebook"]
const SHARED = { type: "spring", stiffness: 320, damping: 34 } as const

// Blue verified check, shared by X + TikTok.
const VerifiedBadge = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#4B65FF">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

// ─── Typewriter (shared by every article body) ─────────────────────────────────
function useTypewriter(text: string, delay = 0) {
  const [typed, setTyped] = useState("")
  useEffect(() => {
    let i = 0
    let iv: ReturnType<typeof setInterval>
    const to = setTimeout(() => {
      iv = setInterval(() => {
        i = Math.min(i + 4, text.length)
        setTyped(text.slice(0, i))
        if (i >= text.length) clearInterval(iv)
      }, 16)
    }, delay)
    return () => { clearTimeout(to); if (iv) clearInterval(iv) }
  }, [text, delay])
  return typed
}

function renderParas(str: string) {
  return str.split("\n\n").map((para, i, arr) => (
    <span key={i}>{para}{i < arr.length - 1 && <><br /><br /></>}</span>
  ))
}

function TypedBody({ text, style, delay = 0 }: { text: string; style: CSSProperties; delay?: number }) {
  const typed = useTypewriter(text, delay)
  const typing = typed.length > 0 && typed.length < text.length
  return (
    <p style={{ ...style, position: "relative", margin: 0 }}>
      <span aria-hidden style={{ visibility: "hidden" }}>{renderParas(text)}</span>
      <span style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        {renderParas(typed)}
        {typing && (
          <motion.span
            style={m.cursor}
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.55 }}
          >|</motion.span>
        )}
      </span>
    </p>
  )
}

// ─── Shared media (the one reused element) ─────────────────────────────────────
function SharedMedia({ mode }: { mode: Mode }) {
  return (
    <motion.div layoutId="x-media" layout style={m.media} transition={SHARED}>
      <motion.img
        key={mode}
        src={DOG_IMG}
        alt=""
        style={m.mediaImg}
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.div>
  )
}

// ─── Post chrome (everything that ISN'T the photo) ─────────────────────────────
function PostChrome() {
  return (
    <motion.div
      style={m.fadeBlock}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div style={m.postHeader}>
        <div style={m.avatar}><span style={m.avatarInitial}>N</span></div>
        <div style={m.meta}>
          <div style={m.nameRow}>
            <span style={m.name}>{X_POST.name}</span>
            <VerifiedBadge />
            <span style={m.handle}>{X_POST.handle} · {X_POST.time}</span>
          </div>
        </div>
        <div style={m.xLogo}><XIcon /></div>
      </div>
      <div style={m.postBody}>
        {X_POST.text.split("\n\n").map((para, i) => (
          <p key={i} style={m.postPara}>{para}</p>
        ))}
        <p style={m.hashtags}>{X_POST.hashtags}</p>
      </div>
    </motion.div>
  )
}

function PostStats() {
  return (
    <motion.div
      style={m.stats}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {([
        { Icon: MessageCircle, label: X_POST.stats.comments },
        { Icon: Repeat2,       label: X_POST.stats.retweets },
        { Icon: Heart,         label: X_POST.stats.likes },
        { Icon: BarChart2,     label: X_POST.stats.views },
      ] as const).map(({ Icon, label }) => (
        <span key={label} style={m.stat}>
          <Icon size={14} strokeWidth={1.8} />
          {label}
        </span>
      ))}
      <Share size={14} strokeWidth={1.8} style={{ marginLeft: "auto", color: "#536471" }} />
    </motion.div>
  )
}

// ─── X article chrome (headline + typewriter body) ─────────────────────────────
function ArticleChrome() {
  return (
    <motion.div
      layout="position"
      style={m.articleContent}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ opacity: { duration: 0.25, delay: 0.05 }, layout: SHARED }}
    >
      <h3 style={m.articleTitle}>{X_ARTICLE.title}</h3>
      <TypedBody text={X_ARTICLE.body} style={m.articleBody} />
    </motion.div>
  )
}

// ─── TikTok flow ───────────────────────────────────────────────────────────────
function TikTokCover({ embedded }: { embedded?: boolean }) {
  return (
    <motion.div layoutId="tiktok-media" layout style={embedded ? tt.embedCover : tt.cover} transition={SHARED}>
      <img src={DOG_IMG} alt="" style={m.mediaImg} />
      <div style={tt.coverShade} />
      <div style={tt.playWrap}>
        <Play size={embedded ? 22 : 30} fill="rgba(255,255,255,0.92)" strokeWidth={0} />
      </div>
    </motion.div>
  )
}

function RailStat({ Icon, label }: { Icon: typeof Heart; label: string }) {
  return (
    <div style={tt.railStat}>
      <Icon size={26} fill="#fff" strokeWidth={0} />
      <span style={tt.railLabel}>{label}</span>
    </div>
  )
}

function TikTokPost() {
  return (
    <div style={tt.screen}>
      <TikTokCover />
      <motion.div
        style={tt.chrome}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div style={tt.topBar}>
          <div style={tt.topLeft}>
            <div style={tt.muteDisc}><Volume2 size={14} /></div>
            <div>
              <motion.div layoutId="tt-name" layout="position" transition={SHARED} style={tt.ttWordmark}>
                TikTok
              </motion.div>
              <motion.div layoutId="tt-handle" layout="position" transition={SHARED} style={tt.ttHandleTop}>
                {TIKTOK_POST.handle}
              </motion.div>
            </div>
          </div>
          <div style={tt.ttNote}><TikTokIcon /></div>
        </div>
        <div style={tt.rail}>
          <div style={tt.railDisc}><TikTokIcon /></div>
          <RailStat Icon={Heart} label={TIKTOK_POST.stats.likes} />
          <RailStat Icon={MessageCircle} label={TIKTOK_POST.stats.comments} />
          <RailStat Icon={Share} label={TIKTOK_POST.stats.shares} />
        </div>
        <div style={tt.caption}>
          <div style={tt.captionHandle}>
            {TIKTOK_POST.handle} <VerifiedBadge size={13} />
          </div>
          <motion.div layoutId="tt-caption" layout="position" transition={SHARED} style={tt.captionText}>
            {TIKTOK_POST.caption}
          </motion.div>
          <div style={tt.captionTags}>
            {TIKTOK_POST.hashtags.map((h, i) => (
              <span key={i} style={tt.tag}>{h}</span>
            ))}
          </div>
          <div style={tt.sound}>
            <Music size={13} />
            <span>{TIKTOK_POST.sound}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function TikTokArticle() {
  const [intro, ...rest] = TIKTOK_ARTICLE.body.split("\n\n")
  const outro = rest.join("\n\n")
  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <h3 style={m.articleTitle}>{TIKTOK_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      <div style={tt.embed}>
        <div style={tt.embedHeader}>
          <motion.span style={tt.embedLogo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
            <TikTokIcon />
          </motion.span>
          <motion.span layoutId="tt-name" layout="position" transition={SHARED} style={tt.embedTitle}>
            TikTok
          </motion.span>
          <motion.span layoutId="tt-handle" layout="position" transition={SHARED} style={tt.embedHandle}>
            {TIKTOK_POST.handle}
          </motion.span>
        </div>
        <TikTokCover embedded />
        <div style={tt.embedMeta}>
          <motion.div layoutId="tt-caption" layout="position" transition={SHARED} style={tt.embedCaption}>
            {TIKTOK_POST.caption}
          </motion.div>
          <motion.div style={tt.embedSound} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
            <Music size={12} /><span>{TIKTOK_POST.sound}</span>
          </motion.div>
          <motion.div style={tt.embedWatch} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
            Watch on TikTok
          </motion.div>
        </div>
      </div>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Reddit flow ────────────────────────────────────────────────────────────────
function RedditMedia({ showOverlay }: { showOverlay?: boolean }) {
  return (
    <motion.div layoutId="reddit-media" layout style={rd.media} transition={SHARED}>
      <img src={DOG_IMG} alt="" style={m.mediaImg} />
      {showOverlay && (
        <div style={rd.viewOnReddit}>
          <Maximize2 size={13} /> View on Reddit
        </div>
      )}
    </motion.div>
  )
}

function RedditPost() {
  return (
    <div style={rd.post}>
      <div style={rd.header}>
        <div style={rd.avatar}>🐶</div>
        <div style={rd.headerMeta}>
          <div style={rd.subRow}>
            <span style={rd.subName}>{REDDIT_POST.subreddit}</span>
            <span style={rd.joinBtn}><Plus size={13} /> Join</span>
          </div>
          <div style={rd.byline}>Posted by {REDDIT_POST.author} · {REDDIT_POST.time}</div>
        </div>
        <div style={rd.brand}>
          <span style={rd.brandLogo}><RedditIcon /></span>
          <span style={rd.brandWord}>reddit</span>
        </div>
      </div>
      <h3 style={rd.title}>{REDDIT_POST.title}</h3>
      <RedditMedia showOverlay />
      <div style={rd.footer}>
        <span style={rd.footStat}><ArrowBigUp size={18} fill="#FF4500" strokeWidth={0} /> {REDDIT_POST.upvotes}</span>
        <span style={rd.footStat}><MessageCircle size={16} strokeWidth={1.8} /> Comment</span>
      </div>
      <div style={rd.viewComments}>{REDDIT_POST.commentsLabel}</div>
    </div>
  )
}

function RedditArticle() {
  const [intro, ...rest] = REDDIT_ARTICLE.body.split("\n\n")
  const outro = rest.join("\n\n")
  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <RedditMedia />
      <h3 style={m.articleTitle}>{REDDIT_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Instagram flow ─────────────────────────────────────────────────────────────
function InstagramMedia({ showChrome }: { showChrome?: boolean }) {
  return (
    <motion.div layoutId="instagram-media" layout style={ig.media} transition={SHARED}>
      <img src={DOG_IMG} alt="" style={m.mediaImg} />
      {showChrome && (
        <>
          <div style={ig.counter}>1/{INSTAGRAM_POST.slides}</div>
          <div style={ig.dots}>
            {Array.from({ length: INSTAGRAM_POST.slides }).map((_, i) => (
              <span key={i} style={i === 0 ? ig.dotActive : ig.dot} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

function InstagramPost() {
  return (
    <div style={ig.post}>
      <div style={ig.header}>
        <div style={ig.avatarRing}><div style={ig.avatar}>🐶</div></div>
        <div style={ig.headerMeta}>
          <div style={ig.userRow}>
            <span style={ig.username}>{INSTAGRAM_POST.username}</span>
            <VerifiedBadge size={14} />
          </div>
          <div style={ig.followers}>{INSTAGRAM_POST.followers}</div>
        </div>
        <div style={ig.viewProfile}>View profile</div>
      </div>
      <InstagramMedia showChrome />
      <div style={ig.viewMore}>View more on Instagram</div>
      <div style={ig.actions}>
        <Heart size={24} strokeWidth={1.8} />
        <MessageCircle size={24} strokeWidth={1.8} />
        <Send size={23} strokeWidth={1.8} />
        <Bookmark size={23} strokeWidth={1.8} style={{ marginLeft: "auto" }} />
      </div>
      <div style={ig.likes}>{INSTAGRAM_POST.likes}</div>
      <div style={ig.captionRow}>
        <span style={ig.captionUser}>{INSTAGRAM_POST.username}</span>
        <span style={ig.captionText}>{INSTAGRAM_POST.caption}</span>
      </div>
      <div style={ig.mention}>{INSTAGRAM_POST.mention} 😘</div>
      <div style={ig.comments}>{INSTAGRAM_POST.commentsLabel}</div>
      <div style={ig.addComment}>
        <span>Add a comment…</span>
        <span style={ig.addLogo}><InstagramIcon /></span>
      </div>
    </div>
  )
}

function InstagramArticle() {
  const [intro, ...rest] = INSTAGRAM_ARTICLE.body.split("\n\n")
  const outro = rest.join("\n\n")
  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <InstagramMedia />
      <h3 style={m.articleTitle}>{INSTAGRAM_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── YouTube flow ───────────────────────────────────────────────────────────────
function YouTubeCover() {
  return (
    <motion.div layoutId="youtube-media" layout style={yt.cover} transition={SHARED}>
      <img src={DOG_IMG} alt="" style={m.mediaImg} />
      <div style={yt.playWrap}>
        <div style={yt.playBtn}>
          <Play size={22} fill="#fff" strokeWidth={0} style={{ marginLeft: 2 }} />
        </div>
      </div>
    </motion.div>
  )
}

function YouTubePlayer({ embedded }: { embedded?: boolean }) {
  return (
    <div style={embedded ? yt.embedScreen : yt.screen}>
      <YouTubeCover />
      <motion.div
        style={yt.chrome}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: embedded ? 0.05 : 0 }}
      >
        <div style={yt.shade} />
        <div style={yt.topBar}>
          <div style={yt.avatar}>🐶</div>
          <div style={yt.titleWrap}>
            <div style={yt.title}>{YOUTUBE_POST.title}</div>
            <div style={yt.channel}>{YOUTUBE_POST.channel}</div>
          </div>
        </div>
        <div style={yt.bottomLeft}>
          <Share size={20} strokeWidth={1.9} />
          <Clock size={20} strokeWidth={1.9} />
        </div>
        <div style={yt.watchOn}>
          <span>Watch on</span>
          <span style={yt.ytGlyph}><YouTubeIcon /></span>
          <span style={yt.ytWord}>YouTube</span>
        </div>
      </motion.div>
    </div>
  )
}

function YouTubePost() {
  return <YouTubePlayer />
}

function YouTubeArticle() {
  const [intro, ...rest] = YOUTUBE_ARTICLE.body.split("\n\n")
  const outro = rest.join("\n\n")
  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <h3 style={m.articleTitle}>{YOUTUBE_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      <YouTubePlayer embedded />
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── LinkedIn flow ───────────────────────────────────────────────────────────────
function LinkedInMedia({ showDoc }: { showDoc?: boolean }) {
  return (
    <motion.div layoutId="linkedin-media" layout style={li.media} transition={SHARED}>
      <img src={DOG_IMG} alt="" style={m.mediaImg} />
      {showDoc && (
        <>
          <div style={li.docBar}>
            <span style={li.docTitle}>{LINKEDIN_POST.docTitle}</span>
            <span style={li.docPages}>· {LINKEDIN_POST.pages} pages</span>
          </div>
          <div style={li.swipe}>SWIPE ›››</div>
        </>
      )}
    </motion.div>
  )
}

function LinkedInPost() {
  return (
    <div style={li.post}>
      <div style={li.header}>
        <div style={li.avatar}>🐾</div>
        <div style={li.headerMeta}>
          <div style={li.name}>{LINKEDIN_POST.name}</div>
          <div style={li.tagline}>{LINKEDIN_POST.tagline}</div>
          <div style={li.sub}>{LINKEDIN_POST.followers} · {LINKEDIN_POST.time}</div>
        </div>
        <div style={li.wordmark}>
          <span style={li.wordmarkText}>Linked</span>
          <span style={li.wordmarkBadge}>in</span>
        </div>
      </div>
      <p style={li.text}>
        {LINKEDIN_POST.text} <span style={li.more}>…more</span>
      </p>
      <LinkedInMedia showDoc />
      <div style={li.reactions}>
        <span style={li.reactIcons}>
          <span style={{ ...li.reactDisc, background: "#378FE9" }}>👍</span>
          <span style={{ ...li.reactDisc, background: "#DF704D" }}>❤️</span>
          <span style={{ ...li.reactDisc, background: "#6DAE4F" }}>👏</span>
        </span>
        <span style={li.reactCount}>{LINKEDIN_POST.reactions}</span>
        <span style={li.commentCount}>{LINKEDIN_POST.commentsLabel}</span>
      </div>
      <div style={li.actions}>
        {([
          { Icon: ThumbsUp,      label: "Like" },
          { Icon: MessageSquare, label: "Comment" },
          { Icon: Repeat2,       label: "Repost" },
          { Icon: Send,          label: "Send" },
        ] as const).map(({ Icon, label }) => (
          <span key={label} style={li.action}>
            <Icon size={18} strokeWidth={1.9} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function LinkedInArticle() {
  const [intro, ...rest] = LINKEDIN_ARTICLE.body.split("\n\n")
  const outro = rest.join("\n\n")
  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <LinkedInMedia />
      <h3 style={m.articleTitle}>{LINKEDIN_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Facebook flow ──────────────────────────────────────────────────────────────
function FacebookMedia() {
  return (
    <motion.div layoutId="facebook-media" layout style={fb.media} transition={SHARED}>
      <img src={DOG_IMG} alt="" style={m.mediaImg} />
    </motion.div>
  )
}

function FacebookPost() {
  return (
    <div style={fb.post}>
      <div style={fb.header}>
        <div style={fb.avatar}>🐾</div>
        <div style={fb.headerMeta}>
          <div style={fb.nameRow}>
            <span style={fb.name}>{FACEBOOK_POST.name}</span>
            <VerifiedBadge size={14} />
            <span style={fb.follow}>· Follow</span>
          </div>
          <div style={fb.byline}>
            {FACEBOOK_POST.time} · <Globe size={11} strokeWidth={2} style={{ marginLeft: 1 }} />
          </div>
        </div>
        <MoreHorizontal size={20} strokeWidth={2} style={{ color: "#65676b" }} />
      </div>
      <p style={fb.text}>
        {FACEBOOK_POST.text} <span style={fb.showMore}>Show more</span>
      </p>
      <FacebookMedia />
      <div style={fb.engagement}>
        <span style={fb.engGroup}>
          <span style={fb.engStat}><ThumbsUp size={15} strokeWidth={1.9} /> {FACEBOOK_POST.reactions}</span>
          <span style={fb.engStat}><MessageCircle size={15} strokeWidth={1.9} /> {FACEBOOK_POST.comments}</span>
          <span style={fb.engStat}><Share size={15} strokeWidth={1.9} /> {FACEBOOK_POST.shares}</span>
        </span>
        <span style={fb.reactEmojis}>👍😂❤️</span>
      </div>
    </div>
  )
}

function FacebookArticle() {
  const [intro, ...rest] = FACEBOOK_ARTICLE.body.split("\n\n")
  const outro = rest.join("\n\n")
  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <FacebookMedia />
      <h3 style={m.articleTitle}>{FACEBOOK_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Main mobile card ──────────────────────────────────────────────────────────
function SocialWorkflowCardMobile({
  chrome = "full",
  platform,
  cardWidth,
  onAutoAdvance,
  interactionSignal = 0,
}: {
  chrome?: "full" | "bare"
  platform?: Platform
  cardWidth?: { post: number; article: number }
  onAutoAdvance?: () => void
  interactionSignal?: number
} = {}) {
  const isFull = chrome === "full"
  const controlled = platform !== undefined
  const [internalActive, setInternalActive] = useState<Platform>("x")
  const active = platform ?? internalActive
  const [mode, setMode] = useState<Mode>("post")

  const { paused, notify } = useInteractionPause(10000)
  const advancePlatform = () => {
    if (controlled) onAutoAdvance?.()
    else setInternalActive(prev => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length])
  }
  useAutoAdvance(() => {
    if (mode === "post") setMode("article")
    else advancePlatform()
  }, 0, !paused && !isFull)

  const lastSignal = useRef(interactionSignal)
  useEffect(() => {
    if (interactionSignal !== lastSignal.current) {
      lastSignal.current = interactionSignal
      notify()
    }
  }, [interactionSignal, notify])

  const [lastActive, setLastActive] = useState(active)
  if (lastActive !== active) {
    setLastActive(active)
    setMode("post")
  }

  const isBuilt = BUILT.includes(active)
  const darkPost = mode === "post" && (active === "tiktok" || active === "youtube")
  const darkPostColor = active === "youtube" ? "#0f0f0f" : "#1a1e2c"

  const innerRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState<number>()
  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCardHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const toggle = () => {
    if (!isBuilt) return
    setMode(prev => (prev === "post" ? "article" : "post"))
    notify()
  }

  const pickPlatform = (id: Platform) => {
    setInternalActive(id)
    setMode("post")
    notify()
  }

  const widths = isFull ? FULL_WIDTHS : cardWidth
  const width = widths?.[mode]

  const card = (
    <LayoutGroup>
      <motion.div
        onClick={toggle}
        style={{ ...m.card, ...(isFull ? { maxWidth: "100%" } : {}), cursor: isBuilt ? "pointer" : "default" }}
        initial={false}
        animate={{
          backgroundColor: darkPost ? darkPostColor : "#F9F7F4",
          ...(cardHeight != null ? { height: cardHeight } : {}),
          ...(width != null ? { width } : {}),
        }}
        transition={{
          backgroundColor: SHARED,
          height: { duration: 0.2, ease: "easeInOut" },
          width: { duration: 0.2, ease: "easeInOut" },
        }}
        whileTap={isBuilt ? { scale: 0.99 } : undefined}
      >
        <div ref={innerRef} style={{ ...m.cardInner, ...(width != null ? { width } : {}), ...(isFull ? { maxWidth: "100%" } : {}) }}>
          {active === "x" && (
            mode === "post" ? (
              <>
                <AnimatePresence mode="popLayout">
                  <PostChrome key="post-chrome" />
                </AnimatePresence>
                <SharedMedia mode="post" />
                <AnimatePresence mode="popLayout">
                  <PostStats key="post-stats" />
                </AnimatePresence>
              </>
            ) : (
              <>
                <SharedMedia mode="article" />
                <AnimatePresence mode="popLayout">
                  <ArticleChrome key="article-chrome" />
                </AnimatePresence>
              </>
            )
          )}
          {active === "tiktok" && (mode === "post" ? <TikTokPost /> : <TikTokArticle />)}
          {active === "reddit" && (mode === "post" ? <RedditPost /> : <RedditArticle />)}
          {active === "instagram" && (mode === "post" ? <InstagramPost /> : <InstagramArticle />)}
          {active === "youtube" && (mode === "post" ? <YouTubePost /> : <YouTubeArticle />)}
          {active === "linkedin" && (mode === "post" ? <LinkedInPost /> : <LinkedInArticle />)}
          {active === "facebook" && (mode === "post" ? <FacebookPost /> : <FacebookArticle />)}
          {!isBuilt && <ComingSoon platform={active} />}
        </div>
      </motion.div>
    </LayoutGroup>
  )

  if (chrome === "bare") return card

  return (
    <div style={m.frame}>
      <div style={m.sheen} aria-hidden />
      <div style={m.frameRainbow} aria-hidden />
      <div style={m.iconRow}>
        {PLATFORMS.map(({ id, Icon, label }) => (
          <motion.button
            key={id}
            style={{ ...m.iconBtn, ...(active === id ? m.iconBtnActive : {}) }}
            onClick={() => pickPlatform(id)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            title={label}
          >
            <Icon />
          </motion.button>
        ))}
      </div>
      <h2 style={m.heading}>Turn social posts<br />into stories</h2>
      <AnimatePresence mode="wait">
        {isBuilt && (
          <motion.p
            key={mode}
            style={m.hint}
            initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {mode === "post" ? "Tap the card → generate the story" : "Tap again ← back to the post"}
          </motion.p>
        )}
      </AnimatePresence>
      <div style={m.stage}>
        {card}
      </div>
    </div>
  )
}

// ─── Placeholder for not-yet-built platforms ───────────────────────────────────
function ComingSoon({ platform }: { platform: Platform }) {
  const label = PLATFORMS.find(p => p.id === platform)?.label ?? ""
  return (
    <div style={m.comingSoon}>
      <p style={m.comingSoonText}>{label} flow coming soon</p>
      <p style={m.comingSoonSub}>{PLATFORM_NOTES[platform]}</p>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// DESKTOP showcase (>720px): copy + switcher | fixed-height stage with bare card
// ═════════════════════════════════════════════════════════════════════════════

const POST_WIDTH: Record<Platform, number> = {
  x: 420, tiktok: 350, reddit: 430, instagram: 400, youtube: 430, linkedin: 430, facebook: 430,
}
const ARTICLE_WIDTH = 540
const STAGE_HEIGHT = 620

// Shared shell for the full-width workflow cards (ink surface + sheen + rainbow).
type FrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  style?: CSSProperties
  rainbow?: boolean
}
const WorkflowCardFrame = forwardRef<HTMLDivElement, FrameProps>(function WorkflowCardFrame(
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

function SocialWorkflowShowcase() {
  const stacked = useIsTightDesktop()
  const [active, setActive] = useState<Platform>("x")
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

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT — wrapper that swaps showcase ↔ mobile card at exactly 720px.
// ═════════════════════════════════════════════════════════════════════════════
export default function SocialWorkflow() {
  const isMobile = useIsMobile()
  return isMobile ? <SocialWorkflowCardMobile /> : <SocialWorkflowShowcase />
}

// ═════════════════════════════════════════════════════════════════════════════
// Styles
// ═════════════════════════════════════════════════════════════════════════════

const m: Record<string, CSSProperties> = {
  frame: {
    position: "relative",
    width: "100%",
    background: "var(--ink)",
    border: "1px solid var(--dark-border)",
    borderRadius: 24,
    padding: "20px 20px 16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  sheen: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 38%), " +
      "radial-gradient(120% 60% at 100% 100%, rgba(75,101,255,0.10) 0%, rgba(75,101,255,0) 60%)",
    pointerEvents: "none",
  },
  frameRainbow: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${BRAND_RAINBOW})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right bottom",
    backgroundSize: "55%",
    opacity: 0.25,
    pointerEvents: "none",
  },
  iconRow: { position: "relative", display: "flex", gap: 8, zIndex: 1 },
  iconBtn: {
    flex: 1,
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--cream)",
    border: "2px solid transparent",
    borderRadius: 10,
    color: "#0f1419",
    cursor: "pointer",
    padding: 0,
  },
  iconBtnActive: { border: "2px solid var(--brand-orange)" },
  heading: {
    position: "relative",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 8vw, 38px)",
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    color: "#F9F7F4",
    margin: 0,
    zIndex: 1,
  },
  stage: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "var(--cream)",
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.30)",
    overflow: "hidden",
  },
  cardInner: { padding: "24px 14px", display: "flex", flexDirection: "column", gap: 10 },
  media: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
  },
  mediaImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" },
  fadeBlock: { display: "flex", flexDirection: "column", gap: 8 },
  postHeader: { display: "flex", alignItems: "flex-start", gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: "50%", background: "#14182A",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  avatarInitial: { color: "#F9F7F4", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-sans)" },
  meta: { flex: 1, minWidth: 0, paddingTop: 1 },
  nameRow: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" },
  name: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#0f1419" },
  handle: { fontFamily: "var(--font-sans)", fontSize: 13, color: "#536471" },
  xLogo: { color: "#0f1419", flexShrink: 0, opacity: 0.85 },
  postBody: { display: "flex", flexDirection: "column", gap: 4 },
  postPara: { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.5, color: "#0f1419", margin: 0 },
  hashtags: { fontFamily: "var(--font-sans)", fontSize: 14, color: "#1d9bf0", margin: "2px 0 0" },
  stats: { display: "flex", alignItems: "center", gap: 14, paddingTop: 8, borderTop: "1px solid #e7e7e7" },
  stat: { display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-sans)", fontSize: 13, color: "#536471" },
  articleContent: { display: "flex", flexDirection: "column", gap: 12 },
  articleTitle: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 22, lineHeight: 1.2, color: "#0f1419", margin: 0 },
  articleBody: { fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.65, color: "#2a2a2a", margin: 0 },
  cursor: { display: "inline-block", color: "var(--brand-orange)", marginLeft: 1 },
  hint: { position: "relative", fontFamily: "var(--font-sans)", fontSize: 12, textAlign: "center", color: "#F9F7F4", margin: 0, zIndex: 1 },
  comingSoon: { padding: "32px 8px", textAlign: "center" },
  comingSoonText: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "#0f1419", margin: 0 },
  comingSoonSub: { fontFamily: "var(--font-sans)", fontSize: 13, color: "#536471", margin: "6px 0 0" },
}

const tt: Record<string, CSSProperties> = {
  screen: {
    position: "relative",
    width: "calc(100% + 28px)",
    height: 440,
    margin: "-24px -14px",
    borderRadius: 14,
    overflow: "hidden",
    background: "var(--cream)",
  },
  cover: { position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" },
  coverShade: {
    position: "absolute", inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, " +
      "rgba(0,0,0,0) 52%, rgba(0,0,0,0.70) 100%)",
  },
  playWrap: {
    position: "absolute", inset: 0, display: "grid", placeItems: "center",
    pointerEvents: "none", zIndex: 2, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
  },
  chrome: { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", color: "#fff" },
  topBar: { position: "absolute", top: 12, left: 14, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  topLeft: { display: "flex", alignItems: "center", gap: 8 },
  muteDisc: { width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center", color: "#fff" },
  ttWordmark: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "#fff", lineHeight: 1.05 },
  ttHandleTop: { fontFamily: "var(--font-sans)", fontSize: 12, color: "rgba(255,255,255,0.82)" },
  ttNote: { color: "#fff", opacity: 0.92 },
  rail: { position: "absolute", right: 12, bottom: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  railDisc: { width: 44, height: 44, borderRadius: "50%", background: "#111", border: "1px solid rgba(255,255,255,0.3)", display: "grid", placeItems: "center", color: "#fff", marginBottom: 2 },
  railStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  railLabel: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "#fff" },
  caption: { position: "absolute", left: 14, right: 70, bottom: 14, display: "flex", flexDirection: "column", gap: 4 },
  captionHandle: { display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14 },
  captionText: { fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.4 },
  captionTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#fff" },
  sound: { display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontFamily: "var(--font-sans)", fontSize: 12 },
  embed: { border: "1px solid #e3e3e6", borderRadius: 12, overflow: "hidden", background: "var(--cream)", display: "flex", flexDirection: "column" },
  embedHeader: { display: "flex", alignItems: "center", gap: 6, padding: "10px 12px" },
  embedLogo: { color: "#0f1419", display: "flex" },
  embedTitle: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#0f1419" },
  embedHandle: { fontFamily: "var(--font-sans)", fontSize: 13, color: "#6b6b6b" },
  embedCover: { position: "relative", width: "100%", height: 200, overflow: "hidden", zIndex: 5 },
  embedMeta: { padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 },
  embedCaption: { fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.4, color: "#0f1419" },
  embedSound: { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontSize: 12, color: "#536471" },
  embedWatch: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "#fe2c55", marginTop: 2 },
}

const rd: Record<string, CSSProperties> = {
  post: { display: "flex", flexDirection: "column", gap: 10 },
  header: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "#fff", border: "1px solid #e3e3e6", display: "grid", placeItems: "center", fontSize: 20, lineHeight: 1 },
  headerMeta: { flex: 1, minWidth: 0 },
  subRow: { display: "flex", alignItems: "center", gap: 8 },
  subName: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "#0f1419" },
  joinBtn: { display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 10px", borderRadius: 999, border: "1px solid #d0d0d3", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, color: "#0f1419" },
  byline: { fontFamily: "var(--font-sans)", fontSize: 12, color: "#6b6b6b", marginTop: 1 },
  brand: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 },
  brandLogo: { color: "#FF4500", display: "flex" },
  brandWord: { fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 17, color: "#1a1a1b", letterSpacing: "-0.02em" },
  title: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: "#0f1419", margin: 0 },
  media: { position: "relative", width: "100%", height: 200, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#dfe7ea" },
  viewOnReddit: { position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12 },
  footer: { display: "flex", alignItems: "center", gap: 18, paddingTop: 2 },
  footStat: { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#6b6b6b" },
  viewComments: { width: "100%", padding: "10px", borderRadius: 999, border: "1px solid #d0d0d3", textAlign: "center", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#FF4500" },
}

const ig: Record<string, CSSProperties> = {
  post: { display: "flex", flexDirection: "column", gap: 8 },
  header: { display: "flex", alignItems: "center", gap: 10 },
  avatarRing: { width: 40, height: 40, borderRadius: "50%", flexShrink: 0, padding: 2, display: "grid", placeItems: "center", background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
  avatar: { width: "100%", height: "100%", borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontSize: 18, lineHeight: 1 },
  headerMeta: { flex: 1, minWidth: 0 },
  userRow: { display: "flex", alignItems: "center", gap: 5 },
  username: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#0f1419", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 },
  followers: { fontFamily: "var(--font-sans)", fontSize: 12, color: "#6b6b6b", marginTop: 1 },
  viewProfile: { flexShrink: 0, padding: "7px 14px", borderRadius: 8, background: "#0095F6", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13 },
  media: { position: "relative", width: "100%", height: 240, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#dfe7ea" },
  counter: { position: "absolute", top: 10, right: 10, padding: "3px 9px", borderRadius: 999, background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12 },
  dots: { position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.55)" },
  dotActive: { width: 6, height: 6, borderRadius: "50%", background: "#0095F6" },
  viewMore: { fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#0095F6", paddingBottom: 8, borderBottom: "1px solid #e7e7e7" },
  actions: { display: "flex", alignItems: "center", gap: 16, color: "#0f1419", paddingTop: 2 },
  likes: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#0f1419" },
  captionRow: { display: "flex", flexWrap: "wrap", gap: 5 },
  captionUser: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#0f1419" },
  captionText: { fontFamily: "var(--font-sans)", fontSize: 14, color: "#0f1419" },
  mention: { fontFamily: "var(--font-sans)", fontSize: 14, color: "#00376b" },
  comments: { fontFamily: "var(--font-sans)", fontSize: 14, color: "#6b6b6b" },
  addComment: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #e7e7e7", fontFamily: "var(--font-sans)", fontSize: 14, color: "#8e8e8e" },
  addLogo: { color: "#0f1419", display: "flex" },
}

const yt: Record<string, CSSProperties> = {
  screen: { position: "relative", width: "calc(100% + 28px)", height: 200, margin: "-24px -14px", borderRadius: 14, overflow: "hidden", background: "#0f0f0f" },
  embedScreen: { position: "relative", width: "100%", height: 190, borderRadius: 12, overflow: "hidden", background: "#0f0f0f" },
  cover: { position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" },
  chrome: { position: "absolute", inset: 0, zIndex: 2, color: "#fff" },
  shade: {
    position: "absolute", inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, " +
      "rgba(0,0,0,0) 60%, rgba(0,0,0,0.65) 100%)",
  },
  topBar: { position: "absolute", top: 12, left: 14, right: 14, display: "flex", gap: 10, alignItems: "flex-start" },
  avatar: { width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "#fff", display: "grid", placeItems: "center", fontSize: 17, lineHeight: 1 },
  titleWrap: { minWidth: 0, paddingTop: 1 },
  title: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: "#fff", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  channel: { fontFamily: "var(--font-sans)", fontSize: 12, color: "rgba(255,255,255,0.82)", marginTop: 2 },
  playWrap: { position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 2 },
  playBtn: { width: 58, height: 40, borderRadius: 11, background: "#FF0000", display: "grid", placeItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" },
  bottomLeft: { position: "absolute", left: 14, bottom: 14, display: "flex", gap: 16, color: "#fff", zIndex: 3 },
  watchOn: { position: "absolute", right: 12, bottom: 12, zIndex: 3, display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#fff" },
  ytGlyph: { color: "#FF0000", display: "flex" },
  ytWord: { fontFamily: "var(--font-sans)", fontWeight: 700 },
}

const li: Record<string, CSSProperties> = {
  post: { display: "flex", flexDirection: "column", gap: 10 },
  header: { display: "flex", alignItems: "flex-start", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 6, flexShrink: 0, background: "#0f1419", display: "grid", placeItems: "center", fontSize: 22, lineHeight: 1 },
  headerMeta: { flex: 1, minWidth: 0, paddingTop: 1 },
  name: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "#0f1419", lineHeight: 1.2 },
  tagline: { fontFamily: "var(--font-sans)", fontSize: 12, color: "#6b6b6b", marginTop: 1 },
  sub: { fontFamily: "var(--font-sans)", fontSize: 12, color: "#6b6b6b", marginTop: 1 },
  wordmark: { display: "flex", alignItems: "center", flexShrink: 0, paddingTop: 1 },
  wordmarkText: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 18, color: "#0a66c2", letterSpacing: "-0.02em" },
  wordmarkBadge: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, color: "#fff", background: "#0a66c2", borderRadius: 4, padding: "0 4px", marginLeft: 2, lineHeight: 1.45 },
  text: { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.5, color: "#0f1419", margin: 0 },
  more: { color: "#6b6b6b", fontWeight: 600 },
  media: { position: "relative", width: "100%", height: 250, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#dfe7ea" },
  docBar: { position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "baseline", gap: 6, padding: "12px 14px", background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)" },
  docTitle: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 16, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  docPages: { fontFamily: "var(--font-sans)", fontSize: 13, color: "rgba(255,255,255,0.85)", flexShrink: 0 },
  swipe: { position: "absolute", right: 12, bottom: 12, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" },
  reactions: { display: "flex", alignItems: "center", gap: 6, paddingBottom: 8, borderBottom: "1px solid #e7e7e7" },
  reactIcons: { display: "flex" },
  reactDisc: { width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 10, border: "1.5px solid #fff", marginLeft: -4 },
  reactCount: { fontFamily: "var(--font-sans)", fontSize: 13, color: "#6b6b6b", marginLeft: 4 },
  commentCount: { fontFamily: "var(--font-sans)", fontSize: 13, color: "#6b6b6b", marginLeft: "auto" },
  actions: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 2 },
  action: { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "#6b6b6b" },
}

const fb: Record<string, CSSProperties> = {
  post: { display: "flex", flexDirection: "column", gap: 10 },
  header: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "#e4e6eb", display: "grid", placeItems: "center", fontSize: 19, lineHeight: 1 },
  headerMeta: { flex: 1, minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", gap: 4 },
  name: { fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15, color: "#050505" },
  follow: { fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#1877F2" },
  byline: { display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--font-sans)", fontSize: 12, color: "#65676b", marginTop: 1 },
  text: { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.5, color: "#050505", margin: 0 },
  showMore: { fontWeight: 600, color: "#65676b" },
  media: { position: "relative", width: "100%", height: 220, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#dfe7ea" },
  engagement: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #e4e6eb" },
  engGroup: { display: "flex", alignItems: "center", gap: 14 },
  engStat: { display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "#65676b" },
  reactEmojis: { fontSize: 14, letterSpacing: "-2px" },
}

const frame: Record<string, CSSProperties> = {
  root: {
    position: "relative",
    background: "var(--ink)",
    border: "1px solid oklch(0.28 0.025 272)",
    borderRadius: "20px",
    padding: "clamp(24px, 3.5vw, 40px) clamp(16px, 3.5vw, 44px) clamp(24px, 3.5vw, 44px)",
    overflow: "hidden",
  },
  sheen: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 38%), " +
      "radial-gradient(120% 60% at 100% 100%, rgba(75,101,255,0.10) 0%, rgba(75,101,255,0) 60%)",
  },
  rainbow: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    backgroundImage: `url(${BRAND_RAINBOW})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right bottom",
    backgroundSize: "40%",
    opacity: 0.22,
  },
}

const s: Record<string, CSSProperties> = {
  layout: { position: "relative", display: "grid", gap: "clamp(32px, 4.5vw, 72px)" },
  layoutWide: { gridTemplateColumns: "minmax(0, 1fr) minmax(440px, 580px)", alignItems: "start" },
  layoutStacked: { gridTemplateColumns: "1fr", gap: "32px" },
  copy: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  tag: {
    display: "inline-block",
    padding: "4px 10px",
    background: "oklch(0.28 0.025 272)",
    borderRadius: "6px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "oklch(0.65 0.015 85)",
    marginBottom: "16px",
  },
  heading: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 3.4vw, 44px)",
    lineHeight: 1.08,
    letterSpacing: "-0.025em",
    color: "#ffffff",
    margin: "0 0 16px",
  },
  standfirst: {
    fontFamily: "var(--font-serif)",
    fontSize: "16px",
    lineHeight: 1.65,
    color: "oklch(0.7 0.015 85)",
    maxWidth: "46ch",
    margin: 0,
  },
  switcher: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "32px" },
  platformBtn: {
    width: 56,
    height: 56,
    display: "grid",
    placeItems: "center",
    background: "var(--cream)",
    border: "2px solid transparent",
    borderRadius: 14,
    color: "#0f1419",
    cursor: "pointer",
    padding: 0,
  },
  platformBtnActive: { border: "2px solid var(--brand-orange)", boxShadow: "0 0 0 4px rgba(255,140,0,0.18)" },
  platformIcon: { display: "flex", transform: "scale(1.33)" },
  affordance: { fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", color: "oklch(0.6 0.015 85)", margin: "18px 0 0" },
  stage: { position: "relative", height: STAGE_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 },
}
