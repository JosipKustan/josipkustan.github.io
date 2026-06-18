import { useSyncExternalStore } from 'react'

// Shared media-query hook. useSyncExternalStore keeps SSR / first-paint stable
// (server snapshot is always false → desktop-first markup, then it corrects on
// mount). Lifted out of the three components that each had a private copy.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    cb => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

// Page-wide cutoff — the whole layout collapses to single column at/below this.
export function useIsMobile() {
  return useMediaQuery('(max-width: 720px)')
}

// Used ONLY inside the three full-width workflow cards, whose two-column
// interiors need ~1000px+ to breathe. Below this they fall back to stacked.
export function useIsTightDesktop() {
  return useMediaQuery('(max-width: 1100px)')
}

// The 2-up workflow grid (minmax 340px + 16px gap, inside clamp(…,5vw,…) section
// padding) collapses to a single column at ~773px page width. The VoiceRewrite
// card watches this so its megaphone can drop into the corner the moment the
// card goes full-width — not at the page-wide 720px mobile cutoff, which left a
// 721–773px band where a full-width card still carried the oversized megaphone.
export function useIsNarrowGrid() {
  return useMediaQuery('(max-width: 773px)')
}
