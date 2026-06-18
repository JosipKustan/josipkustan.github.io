import type { ReactElement } from 'react'
import {
  XIcon, TikTokIcon, RedditIcon, InstagramIcon, YouTubeIcon, LinkedInIcon, FacebookIcon,
} from './socialIcons'

// ─── Types & data ─────────────────────────────────────────────────────────────
// Shared content for the desktop (SocialWorkflowCard) and mobile
// (SocialWorkflowCardMobile) workflow cards. Constants only — no components.

export type Platform = 'x' | 'tiktok' | 'reddit' | 'instagram' | 'youtube' | 'linkedin' | 'facebook'

export const PLATFORMS: { id: Platform; Icon: () => ReactElement; label: string }[] = [
  { id: 'x',         Icon: XIcon,         label: 'X' },
  { id: 'tiktok',    Icon: TikTokIcon,    label: 'TikTok' },
  { id: 'reddit',    Icon: RedditIcon,    label: 'Reddit' },
  { id: 'instagram', Icon: InstagramIcon, label: 'Instagram' },
  { id: 'youtube',   Icon: YouTubeIcon,   label: 'YouTube' },
  { id: 'linkedin',  Icon: LinkedInIcon,  label: 'LinkedIn' },
  { id: 'facebook',  Icon: FacebookIcon,  label: 'Facebook' },
]

export const X_POST = {
  name: 'National Pets',
  handle: '@nationalpets',
  time: 'May 29',
  text: "A new study tracked 3,000 adults over five years. The single strongest predictor of daily wellbeing wasn't income, sleep, or exercise. It was whether they had a pet.\n\nThe researchers called it \"the quiet variable nobody was measuring.\" Full thread below.",
  hashtags: '#pets #animalstudy',
  stats: { comments: '13.1k', retweets: '11.2k', likes: '36.3k', views: '97.4k' },
}

export const X_ARTICLE = {
  title: 'The Quiet Variable: Why Owning a Pet Predicts Wellbeing Better Than Almost Anything Else',
  body: 'A five-year longitudinal study published this week in the Journal of Social Health has identified pet ownership as one of the most consistent predictors of daily emotional wellbeing, outperforming income above a modest threshold, average sleep duration, and even frequency of social contact.\n\nThe effect held across age groups, household sizes, and pet species, though it was strongest among people who lived alone.',
}

export const TIKTOK_POST = {
  handle: '@tiktok',
  caption: 'Welcome to TikTok! 🙌⏱️',
  hashtags: ['#MakeEverySecondCount', '#MakeEverySecondCount', '#MakeEverySecondCount'],
  sound: 'original sound - tiktok',
  stats: { likes: '640.4K', comments: '16K', shares: '7180' },
}

export const TIKTOK_ARTICLE = {
  title: 'Make Every Second Count: How a 15-Second Clip Became TikTok’s Loudest Welcome',
  body: 'A short, looping welcome clip posted to TikTok’s own account has quietly become one of the platform’s most-replayed videos, racking up more than 640,000 likes and 16,000 comments in its first week.\n\nAnalysts point to the format itself, vertical, sound-on, and built to repeat, as the reason a message this simple traveled so far, so fast.',
}

export const REDDIT_POST = {
  subreddit: 'r/dogs',
  author: 'u/EscapeActive6278',
  time: '13 hr. ago',
  title: 'Took my rescue pup to the sea for the first time, he hasn’t stopped smiling since 🐶🌊',
  upvotes: '143 upvotes',
  commentsLabel: 'View 45 comments',
}

export const REDDIT_ARTICLE = {
  title: 'A Rescue Dog’s First Trip to the Sea Becomes the Week’s Feel-Good Story',
  body: 'A photograph of a recently adopted dog meeting the ocean for the first time has spread well beyond the pet forum where it was posted, drawing thousands of upvotes and hundreds of comments within hours.\n\nShelters say moments like these do real work: posts that show rescue animals thriving reliably drive a measurable bump in adoption inquiries the following week.',
}

export const INSTAGRAM_POST = {
  username: 'thebeachdogs',
  followers: '488K followers',
  likes: '2,842 likes',
  caption: 'First swim of the summer 🐶🌊',
  mention: '@thepupclub',
  commentsLabel: 'View all 40 comments',
  slides: 3, // carousel slide count
}

export const INSTAGRAM_ARTICLE = {
  title: 'Three Photos, One Happy Dog: How a Beach Carousel Won Over 2,800 Strangers',
  body: 'An Instagram carousel of a dog’s first summer swim has drawn thousands of likes and dozens of comments, the kind of gentle, shareable moment the platform’s algorithm increasingly rewards.\n\nCreators who post pets say image carousels consistently outperform single shots: each extra slide gives followers a reason to swipe, and the post a longer life in the feed.',
}

export const YOUTUBE_POST = {
  channel: 'The Dog Channel',
  title: 'He’d never seen the ocean. Watch his first reaction 🌊🐶',
}

export const YOUTUBE_ARTICLE = {
  title: 'Caught on Camera: A Dog’s First Glimpse of the Sea Racks Up Millions of Views',
  body: 'A short clip of a dog meeting the ocean for the first time has climbed YouTube’s trending feed, the latest in a long line of pet videos to find an outsized audience.\n\nPlatform data has long shown that animal footage punches above its weight: it is watched to completion more often than almost any other casual category, and it travels far beyond the channels that post it.',
}

export const LINKEDIN_POST = {
  name: 'The Pet Effect',
  tagline: 'Workplace Wellbeing · Research',
  followers: '38,402 followers',
  time: '19h',
  text: 'At our office, we believe wellbeing drives shared success. So we ran a six-month pilot: bring your dog to work, one day a week. The results surprised even us.',
  docTitle: 'The Office Dog Effect',
  pages: 5,
  reactions: '312',
  commentsLabel: '47 comments',
}

export const FACEBOOK_POST = {
  name: 'Paws & Tails Rescue',
  time: '2d',
  text: 'We took the shelter dogs to the beach for the first time today and… just look at this face. 🐶🌊 Every one of them is still looking for a home.',
  reactions: '17.2K',
  comments: '2,252',
  shares: '561',
}

export const FACEBOOK_ARTICLE = {
  title: 'A Beach Day for Shelter Dogs Turns Into a Viral Plea for Adoptions',
  body: 'A local rescue’s Facebook photo of shelter dogs seeing the ocean for the first time has been shared more than five hundred times, far outpacing the page’s usual reach.\n\nThe rescue says the post did in a day what weeks of standard adoption listings could not: its phone has not stopped ringing since.',
}

export const LINKEDIN_ARTICLE = {
  title: 'The Office Dog Effect: What Six Months of “Bring Your Dog to Work” Taught One Company',
  body: 'A six-month workplace pilot that let employees bring their dogs in one day a week reported sharp gains in self-rated wellbeing and team cohesion, alongside a noticeable dip in midweek absences.\n\nHR leaders say the appeal is less about the dogs themselves than what they signal: a workplace willing to bend its norms around the lives people actually lead.',
}

// ─── Per-platform build-out notes ──────────────────────────────────────────────
// Each platform converts a native post type into a NewsLabs story using the same
// shared-media morph as X; only the *source chrome* differs. X is built; the rest
// document the planned post type + which element is reused as the shared media.
export const PLATFORM_NOTES: Record<Platform, string> = {
  x:         'Built. Tweet (avatar + text + photo + engagement stats) → article. Photo is the shared element.',
  tiktok:    'Built. Vertical 9:16 player (dog cover + caption + rail stats + sound) → article with the post shown as an embedded TikTok block. Shared element = the dog-cover video.',
  reddit:    'Built. Dog thread (subreddit + title + photo + upvotes/comments) → article with the photo as the lead hero. Shared element = the dog photo.',
  instagram: 'Built. Carousel post (gradient-ring header + slide dots + likes/caption) → article with the active slide as the lead hero. Shared element = the dog photo.',
  youtube:   'Built. Dark 16:9 player (channel + title + red play + Watch on YouTube) → article with the thumbnail as the lead hero. Shared element = the dog thumbnail.',
  facebook:  'Built. Dog rescue post (avatar + name + text + photo + reactions/comments/shares + Like/Comment/Share bar) → article with the photo as the lead hero. Shared element = the dog photo.',
  linkedin:  'Built. Company document/PDF-carousel post (square logo header + LinkedIn wordmark + “…more” text + paged document cover with title bar / “SWIPE” hint + reactions/comments + Like/Comment/Repost/Send bar) → article with the document cover as the lead hero. Shared element = the document cover (dog photo).',
}
