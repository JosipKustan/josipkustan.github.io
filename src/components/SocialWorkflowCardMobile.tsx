import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { MessageCircle, Repeat2, Heart, BarChart2, Share, Play, Music, Volume2, ArrowBigUp, Plus, Maximize2, Send, Bookmark, Clock, ThumbsUp, MessageSquare, Globe, MoreHorizontal } from 'lucide-react'
import dogImg from '../assets/dogonbeach.png'
import { XIcon, TikTokIcon, RedditIcon, InstagramIcon, YouTubeIcon } from './social/socialIcons'
import {
  PLATFORMS, X_POST, X_ARTICLE, TIKTOK_POST, TIKTOK_ARTICLE, REDDIT_POST, REDDIT_ARTICLE,
  INSTAGRAM_POST, INSTAGRAM_ARTICLE, YOUTUBE_POST, YOUTUBE_ARTICLE, LINKEDIN_POST, LINKEDIN_ARTICLE,
  FACEBOOK_POST, FACEBOOK_ARTICLE, PLATFORM_NOTES, type Platform,
} from './social/socialContent'

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE social workflow card.
//
// A single phone-width card. Tapping it morphs a social *post* into the
// generated *article*. In every built flow the source media is ONE shared
// element (Framer Motion `layoutId`) that FLIP-animates between the post and the
// article; the surrounding chrome cross-fades around it.
//
//   • X        — the dog photo morphs from mid-tweet to the article hero.
//   • TikTok   — the dog-cover video player morphs from a full 9:16 screen into
//                an embedded TikTok block inside the article.
//   • Reddit / Instagram / YouTube — the dog photo / thumbnail morphs into the
//                article's lead hero.
//   • LinkedIn — a company document/PDF-carousel post; its document cover (the
//                dog photo) morphs into the article's lead hero.
//
// All six platforms are built; see PLATFORM_NOTES for the per-platform source
// chrome each one converts.
// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'post' | 'article'

const BUILT: Platform[] = ['x', 'tiktok', 'reddit', 'instagram', 'youtube', 'linkedin', 'facebook']
const SHARED = { type: 'spring', stiffness: 320, damping: 34 } as const

// Blue verified check, shared by X + TikTok.
const VerifiedBadge = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#4B65FF">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

// ─── Typewriter (shared by every article body) ─────────────────────────────────

function useTypewriter(text: string, delay = 0) {
  const [typed, setTyped] = useState('')
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

function renderParas(s: string) {
  return s.split('\n\n').map((para, i, arr) => (
    <span key={i}>{para}{i < arr.length - 1 && <><br /><br /></>}</span>
  ))
}

function TypedBody({ text, style, delay = 0 }: { text: string; style: React.CSSProperties; delay?: number }) {
  const typed = useTypewriter(text, delay)
  const typing = typed.length > 0 && typed.length < text.length
  return (
    <p style={{ ...style, position: 'relative', margin: 0 }}>
      {/* Sizer: the FULL text, invisible — reserves the final height so the card
          is sized to its max immediately and doesn't grow line-by-line as the
          typewriter runs. */}
      <span aria-hidden style={{ visibility: 'hidden' }}>{renderParas(text)}</span>
      {/* Visible typed text, overlaid on the sizer. */}
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
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
    <motion.div
      layoutId="x-media"
      layout
      style={m.media}
      transition={SHARED}
    >
      {/* Same photo in both states — keyed on mode so the swap is a subtle
          opacity settle rather than a height stretch. */}
      <motion.img
        key={mode}
        src={dogImg}
        alt=""
        style={m.mediaImg}
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </motion.div>
  )
}

// ─── Post chrome (everything that ISN'T the photo) ─────────────────────────────

function PostChrome() {
  return (
    <motion.div
      style={m.fadeBlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        {X_POST.text.split('\n\n').map((para, i) => (
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
      <Share size={14} strokeWidth={1.8} style={{ marginLeft: 'auto', color: '#536471' }} />
    </motion.div>
  )
}

// ─── X article chrome (headline + typewriter body) ─────────────────────────────

function ArticleChrome() {
  return (
    <motion.div
      layout="position"
      style={m.articleContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ opacity: { duration: 0.25, delay: 0.05 }, layout: SHARED }}
    >
      <h3 style={m.articleTitle}>{X_ARTICLE.title}</h3>
      <TypedBody text={X_ARTICLE.body} style={m.articleBody} />
    </motion.div>
  )
}

// ─── TikTok flow ───────────────────────────────────────────────────────────────
// Shared element: the dog-cover "video" (`layoutId="tiktok-media"`). Post = full
// 9:16 screen; article = the thumbnail inside an embedded TikTok block.

function TikTokCover({ embedded }: { embedded?: boolean }) {
  return (
    <motion.div
      layoutId="tiktok-media"
      layout
      style={embedded ? tt.embedCover : tt.cover}
      transition={SHARED}
    >
      <img src={dogImg} alt="" style={m.mediaImg} />
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

      {/* overlays — cross-fade out on morph */}
      <motion.div
        style={tt.chrome}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
  const [intro, ...rest] = TIKTOK_ARTICLE.body.split('\n\n')
  const outro = rest.join('\n\n')

  return (
    <motion.div
      layout="position"
      style={m.articleContent}
      transition={{ layout: SHARED }}
    >
      {/* Title + first paragraph render immediately (full opacity). They sit
          UNDER the cover, which starts as the full player and descends to the
          embed slot — uncovering them as it goes down. */}
      <h3 style={m.articleTitle}>{TIKTOK_ARTICLE.title}</h3>

      {/* First paragraph is pre-written so the embed below it doesn't get
          pushed down while text types — keeps the morph from jumping. */}
      <p style={m.articleBody}>{intro}</p>

      {/* Embedded TikTok block — sits between the paragraphs; the cover morphs
          in from the full player. */}
      <div style={tt.embed}>
        <div style={tt.embedHeader}>
          <motion.span
            style={tt.embedLogo}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
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
          <motion.div
            style={tt.embedSound}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Music size={12} /><span>{TIKTOK_POST.sound}</span>
          </motion.div>
          <motion.div
            style={tt.embedWatch}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            Watch on TikTok
          </motion.div>
        </div>
      </div>

      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Reddit flow ────────────────────────────────────────────────────────────────
// Shared element: the dog photo (`layoutId="reddit-media"`). Post = image in the
// thread; article = the same image as the lead hero. Same constant height in
// both, so it just translates up into the hero slot.

function RedditMedia({ showOverlay }: { showOverlay?: boolean }) {
  return (
    <motion.div layoutId="reddit-media" layout style={rd.media} transition={SHARED}>
      <img src={dogImg} alt="" style={m.mediaImg} />
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
  const [intro, ...rest] = REDDIT_ARTICLE.body.split('\n\n')
  const outro = rest.join('\n\n')

  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      {/* Image becomes the lead hero; title + first paragraph render immediately. */}
      <RedditMedia />
      <h3 style={m.articleTitle}>{REDDIT_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Instagram flow ─────────────────────────────────────────────────────────────
// Shared element: the active carousel slide (`layoutId="instagram-media"`). Post =
// the carousel image (slide dots + counter); article = the same slide as the lead
// hero. Constant height, so it translates up into the hero.

function InstagramMedia({ showChrome }: { showChrome?: boolean }) {
  return (
    <motion.div layoutId="instagram-media" layout style={ig.media} transition={SHARED}>
      <img src={dogImg} alt="" style={m.mediaImg} />
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
        <Bookmark size={23} strokeWidth={1.8} style={{ marginLeft: 'auto' }} />
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
  const [intro, ...rest] = INSTAGRAM_ARTICLE.body.split('\n\n')
  const outro = rest.join('\n\n')

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
// Shared element: the dog video thumbnail (`layoutId="youtube-media"`). Post = dark
// 16:9 player; article = the same thumbnail as the lead hero.

function YouTubeCover() {
  return (
    <motion.div layoutId="youtube-media" layout style={yt.cover} transition={SHARED}>
      <img src={dogImg} alt="" style={m.mediaImg} />
      {/* Red play button rides with the thumbnail across the morph. */}
      <div style={yt.playWrap}>
        <div style={yt.playBtn}>
          <Play size={22} fill="#fff" strokeWidth={0} style={{ marginLeft: 2 }} />
        </div>
      </div>
    </motion.div>
  )
}

// The authentic dark YouTube player — full-bleed in the post, a rounded embed
// in the article. The thumbnail (`YouTubeCover`) is the shared element that
// morphs between the two; the chrome cross-fades.
function YouTubePlayer({ embedded }: { embedded?: boolean }) {
  return (
    <div style={embedded ? yt.embedScreen : yt.screen}>
      <YouTubeCover />

      <motion.div
        style={yt.chrome}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
  const [intro, ...rest] = YOUTUBE_ARTICLE.body.split('\n\n')
  const outro = rest.join('\n\n')

  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      <h3 style={m.articleTitle}>{YOUTUBE_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>

      {/* Embedded YouTube player — the thumbnail morphs in from the full post. */}
      <YouTubePlayer embedded />

      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── LinkedIn flow ───────────────────────────────────────────────────────────────
// Shared element: the document cover (`layoutId="linkedin-media"`). The post is a
// company *document / PDF-carousel* update — a paged cover with a title bar and a
// "SWIPE" hint; the article reuses that same cover as the lead hero. Constant
// height in both states, so it translates up into the hero slot like Reddit/IG.

function LinkedInMedia({ showDoc }: { showDoc?: boolean }) {
  return (
    <motion.div layoutId="linkedin-media" layout style={li.media} transition={SHARED}>
      <img src={dogImg} alt="" style={m.mediaImg} />
      {showDoc && (
        <>
          {/* document title bar — the paged-carousel affordance */}
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
          <span style={{ ...li.reactDisc, background: '#378FE9' }}>👍</span>
          <span style={{ ...li.reactDisc, background: '#DF704D' }}>❤️</span>
          <span style={{ ...li.reactDisc, background: '#6DAE4F' }}>👏</span>
        </span>
        <span style={li.reactCount}>{LINKEDIN_POST.reactions}</span>
        <span style={li.commentCount}>{LINKEDIN_POST.commentsLabel}</span>
      </div>

      <div style={li.actions}>
        {([
          { Icon: ThumbsUp,      label: 'Like' },
          { Icon: MessageSquare, label: 'Comment' },
          { Icon: Repeat2,       label: 'Repost' },
          { Icon: Send,          label: 'Send' },
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
  const [intro, ...rest] = LINKEDIN_ARTICLE.body.split('\n\n')
  const outro = rest.join('\n\n')

  return (
    <motion.div layout="position" style={m.articleContent} transition={{ layout: SHARED }}>
      {/* Document cover becomes the lead hero; title + first paragraph render immediately. */}
      <LinkedInMedia />
      <h3 style={m.articleTitle}>{LINKEDIN_ARTICLE.title}</h3>
      <p style={m.articleBody}>{intro}</p>
      {outro && <TypedBody text={outro} style={m.articleBody} delay={350} />}
    </motion.div>
  )
}

// ─── Facebook flow ──────────────────────────────────────────────────────────────
// Shared element: the dog photo (`layoutId="facebook-media"`). Post = image in the
// feed post; article = the same image as the lead hero.

function FacebookMedia() {
  return (
    <motion.div layoutId="facebook-media" layout style={fb.media} transition={SHARED}>
      <img src={dogImg} alt="" style={m.mediaImg} />
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
        <MoreHorizontal size={20} strokeWidth={2} style={{ color: '#65676b' }} />
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
  const [intro, ...rest] = FACEBOOK_ARTICLE.body.split('\n\n')
  const outro = rest.join('\n\n')

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

// `chrome='bare'` drops the ink frame, icon row, headline and tap hint entirely —
// just the white morphing post/article card. The desktop SocialWorkflowShowcase
// renders it that way: it drives the platform from its own switcher (`platform`)
// and sizes the card per mode (`cardWidth` — posts stay phone-narrow, articles
// spread into a wider editorial column) inside its fixed-height stage.
export default function SocialWorkflowCardMobile({
  chrome = 'full',
  platform,
  cardWidth,
}: {
  chrome?: 'full' | 'bare'
  platform?: Platform
  cardWidth?: { post: number; article: number }
} = {}) {
  const [internalActive, setInternalActive] = useState<Platform>('x')
  const active = platform ?? internalActive
  const [mode, setMode] = useState<Mode>('post')

  // Every platform opens on its native post first — also when the platform is
  // driven from outside. Adjusted during render so the incoming platform never
  // flashes its article state for a frame.
  const [lastActive, setLastActive] = useState(active)
  if (lastActive !== active) {
    setLastActive(active)
    setMode('post')
  }

  const isBuilt = BUILT.includes(active)
  // Platforms whose post is a dark, full-bleed media player.
  const darkPost = mode === 'post' && (active === 'tiktok' || active === 'youtube')
  const darkPostColor = active === 'youtube' ? '#0f0f0f' : '#1a1e2c' // YT black / --dark-card

  // Spring the card's height to whatever the content currently measures, so it
  // grows/shrinks smoothly (real height animation — no transform-scale stretch).
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
    setMode(prev => (prev === 'post' ? 'article' : 'post'))
  }

  const pickPlatform = (id: Platform) => {
    setInternalActive(id)
    setMode('post') // every platform opens on its native post first
  }

  // Per-mode width (desktop bare mode only). Like the height, the window
  // animates to it while the content inside is laid out at the target width
  // immediately — same trick as the typewriter sizer, horizontally.
  const width = cardWidth?.[mode]

  /* Content card — tap to morph. No `layout` on the card itself: the
     shared-element photos/covers still morph via their `layoutId`, but the
     card height/width settle without FLIP-scaling (stretching) its contents. */
  const card = (
    <LayoutGroup>
      <motion.div
        onClick={toggle}
        style={{ ...m.card, cursor: isBuilt ? 'pointer' : 'default' }}
        initial={false}
        animate={{
          backgroundColor: darkPost ? darkPostColor : '#F9F7F4',
          ...(cardHeight != null ? { height: cardHeight } : {}),
          ...(width != null ? { width } : {}),
        }}
        transition={{
          backgroundColor: SHARED,
          height: { duration: 0.2, ease: 'easeInOut' },
          width: { duration: 0.2, ease: 'easeInOut' },
        }}
        whileTap={isBuilt ? { scale: 0.99 } : undefined}
      >
        <div ref={innerRef} style={{ ...m.cardInner, ...(width != null ? { width } : {}) }}>
            {active === 'x' && (
              mode === 'post' ? (
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

            {active === 'tiktok' && (
              mode === 'post' ? <TikTokPost /> : <TikTokArticle />
            )}

            {active === 'reddit' && (
              mode === 'post' ? <RedditPost /> : <RedditArticle />
            )}

            {active === 'instagram' && (
              mode === 'post' ? <InstagramPost /> : <InstagramArticle />
            )}

            {active === 'youtube' && (
              mode === 'post' ? <YouTubePost /> : <YouTubeArticle />
            )}

            {active === 'linkedin' && (
              mode === 'post' ? <LinkedInPost /> : <LinkedInArticle />
            )}

            {active === 'facebook' && (
              mode === 'post' ? <FacebookPost /> : <FacebookArticle />
            )}

            {!isBuilt && <ComingSoon platform={active} />}
        </div>
      </motion.div>
    </LayoutGroup>
  )

  if (chrome === 'bare') return card

  return (
    <div style={m.frame}>
      {/* diagonal sheen, matches the layered look in the design */}
      <div style={m.sheen} aria-hidden />
      {/* Brand rainbow watermark, anchored bottom-right at 25% opacity */}
      <div style={m.frameRainbow} aria-hidden />

      {/* Platform icon row */}
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

      {/* Tap hint — above the card so it stays put when the card resizes */}
      <AnimatePresence mode="wait">
        {isBuilt && (
          <motion.p
            key={mode}
            style={m.hint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {mode === 'post' ? 'Tap the card → generate the story' : 'Tap again ← back to the post'}
          </motion.p>
        )}
      </AnimatePresence>

      {card}
    </div>
  )
}

// ─── Placeholder for not-yet-built platforms ───────────────────────────────────

function ComingSoon({ platform }: { platform: Platform }) {
  const label = PLATFORMS.find(p => p.id === platform)?.label ?? ''
  return (
    <div style={m.comingSoon}>
      <p style={m.comingSoonText}>{label} flow coming soon</p>
      <p style={m.comingSoonSub}>{PLATFORM_NOTES[platform]}</p>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const m: Record<string, React.CSSProperties> = {
  frame: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
    margin: '0 auto',
    background: 'var(--ink)',
    border: '1px solid var(--dark-border)',
    borderRadius: 24,
    padding: '20px 20px 16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  sheen: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 38%), ' +
      'radial-gradient(120% 60% at 100% 100%, rgba(75,101,255,0.10) 0%, rgba(75,101,255,0) 60%)',
    pointerEvents: 'none',
  },
  frameRainbow: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url(/assets/BrandRainbow.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right bottom',
    backgroundSize: '55%',
    opacity: 0.25,
    pointerEvents: 'none',
  },
  iconRow: {
    position: 'relative',
    display: 'flex',
    gap: 8,
    zIndex: 1,
  },
  iconBtn: {
    flex: 1,
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--cream)',
    border: '2px solid transparent',
    borderRadius: 10,
    color: '#0f1419',
    cursor: 'pointer',
    padding: 0,
  },
  iconBtnActive: {
    border: '2px solid var(--brand-orange)',
  },
  heading: {
    position: 'relative',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'clamp(28px, 8vw, 38px)',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    color: '#F9F7F4',
    margin: 0,
    zIndex: 1,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--cream)',
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
    overflow: 'hidden',
  },
  // Padding/layout live here, not on the card, so the measured height equals
  // the card's animated height exactly.
  cardInner: {
    padding: '24px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  // shared media — sits above the surrounding chrome so it slides over the
  // text as it moves between states (reveal effect).
  media: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  mediaImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    display: 'block',
  },

  // post chrome
  fadeBlock: { display: 'flex', flexDirection: 'column', gap: 8 },
  postHeader: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: '50%', background: '#14182A',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarInitial: { color: '#F9F7F4', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-sans)' },
  meta: { flex: 1, minWidth: 0, paddingTop: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  name: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#0f1419' },
  handle: { fontFamily: 'var(--font-sans)', fontSize: 13, color: '#536471' },
  xLogo: { color: '#0f1419', flexShrink: 0, opacity: 0.85 },
  postBody: { display: 'flex', flexDirection: 'column', gap: 4 },
  postPara: { fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, color: '#0f1419', margin: 0 },
  hashtags: { fontFamily: 'var(--font-sans)', fontSize: 14, color: '#1d9bf0', margin: '2px 0 0' },
  stats: {
    display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8,
    borderTop: '1px solid #e7e7e7',
  },
  stat: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontFamily: 'var(--font-sans)', fontSize: 13, color: '#536471',
  },

  // article chrome
  articleContent: { display: 'flex', flexDirection: 'column', gap: 12 },
  articleTitle: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 22,
    lineHeight: 1.2, color: '#0f1419', margin: 0,
  },
  articleBody: {
    fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.65,
    color: '#2a2a2a', margin: 0,
  },
  cursor: { display: 'inline-block', color: 'var(--brand-orange)', marginLeft: 1 },

  // hint
  hint: {
    position: 'relative',
    fontFamily: 'var(--font-sans)', fontSize: 12, textAlign: 'center',
    color: '#F9F7F4', margin: 0, zIndex: 1,
  },

  // coming soon
  comingSoon: { padding: '32px 8px', textAlign: 'center' },
  comingSoonText: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: '#0f1419', margin: 0 },
  comingSoonSub: { fontFamily: 'var(--font-sans)', fontSize: 13, color: '#536471', margin: '6px 0 0' },
}

// ─── TikTok styles ──────────────────────────────────────────────────────────────

const tt: Record<string, React.CSSProperties> = {
  // POST — full 9:16 player
  screen: {
    position: 'relative',
    // Bleed past the card's padding (24px top/bottom, 14px sides) so the player
    // stays edge-to-edge.
    width: 'calc(100% + 28px)',
    height: 440,
    margin: '-24px -14px',
    borderRadius: 14,
    overflow: 'hidden',
    background: 'var(--cream)',
  },
  cover: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  coverShade: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, ' +
      'rgba(0,0,0,0) 52%, rgba(0,0,0,0.70) 100%)',
  },
  playWrap: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    zIndex: 2,
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
  },
  chrome: {
    position: 'absolute',
    inset: 0,
    zIndex: 3,
    pointerEvents: 'none',
    color: '#fff',
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  muteDisc: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'rgba(255,255,255,0.16)',
    display: 'grid', placeItems: 'center', color: '#fff',
  },
  ttWordmark: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.05 },
  ttHandleTop: { fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.82)' },
  ttNote: { color: '#fff', opacity: 0.92 },
  rail: {
    position: 'absolute',
    right: 12,
    bottom: 92,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  railDisc: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#111', border: '1px solid rgba(255,255,255,0.3)',
    display: 'grid', placeItems: 'center', color: '#fff', marginBottom: 2,
  },
  railStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  railLabel: { fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: '#fff' },
  caption: {
    position: 'absolute',
    left: 14,
    right: 70,
    bottom: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  captionHandle: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
  },
  captionText: { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4 },
  captionTags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tag: { fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#fff' },
  sound: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 2,
    fontFamily: 'var(--font-sans)', fontSize: 12,
  },

  // ARTICLE — embedded TikTok block
  embed: {
    border: '1px solid #e3e3e6',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--cream)',
    display: 'flex',
    flexDirection: 'column',
  },
  embedHeader: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px' },
  embedLogo: { color: '#0f1419', display: 'flex' },
  embedTitle: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#0f1419' },
  embedHandle: { fontFamily: 'var(--font-sans)', fontSize: 13, color: '#6b6b6b' },
  embedCover: {
    position: 'relative',
    width: '100%',
    height: 200,
    overflow: 'hidden',
    // Above the article title/intro so the cover occludes them while it
    // descends, then reveals them as it settles into the embed slot.
    zIndex: 5,
  },
  embedMeta: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 },
  embedCaption: { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, color: '#0f1419' },
  embedSound: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-sans)', fontSize: 12, color: '#536471',
  },
  embedWatch: { fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: '#fe2c55', marginTop: 2 },
}

// ─── Reddit styles ──────────────────────────────────────────────────────────────

const rd: Record<string, React.CSSProperties> = {
  post: { display: 'flex', flexDirection: 'column', gap: 10 },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
    background: '#fff', border: '1px solid #e3e3e6',
    display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1,
  },
  headerMeta: { flex: 1, minWidth: 0 },
  subRow: { display: 'flex', alignItems: 'center', gap: 8 },
  subName: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, color: '#0f1419' },
  joinBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '3px 10px', borderRadius: 999, border: '1px solid #d0d0d3',
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12, color: '#0f1419',
  },
  byline: { fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6b6b6b', marginTop: 1 },
  brand: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  brandLogo: { color: '#FF4500', display: 'flex' },
  brandWord: { fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 17, color: '#1a1a1b', letterSpacing: '-0.02em' },
  title: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 18,
    lineHeight: 1.25, color: '#0f1419', margin: 0,
  },
  media: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#dfe7ea',
  },
  viewOnReddit: {
    position: 'absolute', top: 10, right: 10,
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 9px', borderRadius: 8,
    background: 'rgba(0,0,0,0.55)', color: '#fff',
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
  },
  footer: { display: 'flex', alignItems: 'center', gap: 18, paddingTop: 2 },
  footStat: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#6b6b6b',
  },
  viewComments: {
    width: '100%', padding: '10px', borderRadius: 999,
    border: '1px solid #d0d0d3', textAlign: 'center',
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#FF4500',
  },
}

// ─── Instagram styles ───────────────────────────────────────────────────────────

const ig: Record<string, React.CSSProperties> = {
  post: { display: 'flex', flexDirection: 'column', gap: 8 },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  avatarRing: {
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    padding: 2, display: 'grid', placeItems: 'center',
    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
  },
  avatar: {
    width: '100%', height: '100%', borderRadius: '50%',
    background: '#fff', display: 'grid', placeItems: 'center',
    fontSize: 18, lineHeight: 1,
  },
  headerMeta: { flex: 1, minWidth: 0 },
  userRow: { display: 'flex', alignItems: 'center', gap: 5 },
  username: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#0f1419',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
  },
  followers: { fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6b6b6b', marginTop: 1 },
  viewProfile: {
    flexShrink: 0, padding: '7px 14px', borderRadius: 8,
    background: '#0095F6', color: '#fff',
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13,
  },
  media: {
    position: 'relative',
    width: '100%',
    height: 240,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#dfe7ea',
  },
  counter: {
    position: 'absolute', top: 10, right: 10,
    padding: '3px 9px', borderRadius: 999,
    background: 'rgba(0,0,0,0.55)', color: '#fff',
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12,
  },
  dots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 6, height: 6, borderRadius: '50%', background: '#0095F6' },
  viewMore: {
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#0095F6',
    paddingBottom: 8, borderBottom: '1px solid #e7e7e7',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 16, color: '#0f1419', paddingTop: 2 },
  likes: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#0f1419' },
  captionRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  captionUser: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#0f1419' },
  captionText: { fontFamily: 'var(--font-sans)', fontSize: 14, color: '#0f1419' },
  mention: { fontFamily: 'var(--font-sans)', fontSize: 14, color: '#00376b' },
  comments: { fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6b6b6b' },
  addComment: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, borderTop: '1px solid #e7e7e7',
    fontFamily: 'var(--font-sans)', fontSize: 14, color: '#8e8e8e',
  },
  addLogo: { color: '#0f1419', display: 'flex' },
}

// ─── YouTube styles ─────────────────────────────────────────────────────────────

const yt: Record<string, React.CSSProperties> = {
  // POST — dark 16:9 player (bleeds to the card edges past the padding)
  screen: {
    position: 'relative',
    width: 'calc(100% + 28px)',
    height: 200,
    margin: '-24px -14px',
    borderRadius: 14,
    overflow: 'hidden',
    background: '#0f0f0f',
  },
  // ARTICLE — same player, rounded + in-flow between the paragraphs
  embedScreen: {
    position: 'relative',
    width: '100%',
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#0f0f0f',
  },
  cover: { position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' },
  chrome: { position: 'absolute', inset: 0, zIndex: 2, color: '#fff' },
  shade: {
    position: 'absolute', inset: 0,
    background:
      'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, ' +
      'rgba(0,0,0,0) 60%, rgba(0,0,0,0.65) 100%)',
  },
  topBar: { position: 'absolute', top: 12, left: 14, right: 14, display: 'flex', gap: 10, alignItems: 'flex-start' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    background: '#fff', display: 'grid', placeItems: 'center', fontSize: 17, lineHeight: 1,
  },
  titleWrap: { minWidth: 0, paddingTop: 1 },
  title: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: '#fff',
    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
  },
  channel: { fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  playWrap: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 2 },
  playBtn: {
    width: 58, height: 40, borderRadius: 11,
    background: '#FF0000', display: 'grid', placeItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
  },
  bottomLeft: { position: 'absolute', left: 14, bottom: 14, display: 'flex', gap: 16, color: '#fff', zIndex: 3 },
  watchOn: {
    position: 'absolute', right: 12, bottom: 12, zIndex: 3,
    display: 'flex', alignItems: 'center', gap: 5,
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#fff',
  },
  ytGlyph: { color: '#FF0000', display: 'flex' },
  ytWord: { fontFamily: 'var(--font-sans)', fontWeight: 700 },
}

// ─── LinkedIn styles ──────────────────────────────────────────────────────────

const li: Record<string, React.CSSProperties> = {
  post: { display: 'flex', flexDirection: 'column', gap: 10 },
  header: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 6, flexShrink: 0,
    background: '#0f1419', display: 'grid', placeItems: 'center',
    fontSize: 22, lineHeight: 1,
  },
  headerMeta: { flex: 1, minWidth: 0, paddingTop: 1 },
  name: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, color: '#0f1419', lineHeight: 1.2 },
  tagline: { fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6b6b6b', marginTop: 1 },
  sub: { fontFamily: 'var(--font-sans)', fontSize: 12, color: '#6b6b6b', marginTop: 1 },
  wordmark: { display: 'flex', alignItems: 'center', flexShrink: 0, paddingTop: 1 },
  wordmarkText: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 18,
    color: '#0a66c2', letterSpacing: '-0.02em',
  },
  wordmarkBadge: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: '#fff',
    background: '#0a66c2', borderRadius: 4, padding: '0 4px', marginLeft: 2, lineHeight: 1.45,
  },
  text: { fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, color: '#0f1419', margin: 0 },
  more: { color: '#6b6b6b', fontWeight: 600 },
  media: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 6,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#dfe7ea',
  },
  docBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', alignItems: 'baseline', gap: 6,
    padding: '12px 14px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)',
  },
  docTitle: {
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16, color: '#fff',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  docPages: { fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.85)', flexShrink: 0 },
  swipe: {
    position: 'absolute', right: 12, bottom: 12,
    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em',
    color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)',
  },
  reactions: {
    display: 'flex', alignItems: 'center', gap: 6,
    paddingBottom: 8, borderBottom: '1px solid #e7e7e7',
  },
  reactIcons: { display: 'flex' },
  reactDisc: {
    width: 18, height: 18, borderRadius: '50%',
    display: 'grid', placeItems: 'center', fontSize: 10,
    border: '1.5px solid #fff', marginLeft: -4,
  },
  reactCount: { fontFamily: 'var(--font-sans)', fontSize: 13, color: '#6b6b6b', marginLeft: 4 },
  commentCount: { fontFamily: 'var(--font-sans)', fontSize: 13, color: '#6b6b6b', marginLeft: 'auto' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  action: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#6b6b6b',
  },
}

// ─── Facebook styles ────────────────────────────────────────────────────────────

const fb: Record<string, React.CSSProperties> = {
  post: { display: 'flex', flexDirection: 'column', gap: 10 },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    background: '#e4e6eb', display: 'grid', placeItems: 'center', fontSize: 19, lineHeight: 1,
  },
  headerMeta: { flex: 1, minWidth: 0 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 4 },
  name: { fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, color: '#050505' },
  follow: { fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: '#1877F2' },
  byline: {
    display: 'flex', alignItems: 'center', gap: 3,
    fontFamily: 'var(--font-sans)', fontSize: 12, color: '#65676b', marginTop: 1,
  },
  text: { fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.5, color: '#050505', margin: 0 },
  showMore: { fontWeight: 600, color: '#65676b' },
  media: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    background: '#dfe7ea',
  },
  engagement: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, borderTop: '1px solid #e4e6eb',
  },
  engGroup: { display: 'flex', alignItems: 'center', gap: 14 },
  engStat: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#65676b',
  },
  reactEmojis: { fontSize: 14, letterSpacing: '-2px' },
}
