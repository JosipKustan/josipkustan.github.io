import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PlatformPage from './pages/PlatformPage'
import PricingPage from './pages/PricingPage'
import WorkflowsPage from './pages/WorkflowsPage'

// ─────────────────────────────────────────────────────────────────────────────
// Dependency-free hash router. Routes use a leading slash (`#/`, `#/platform`,
// `#/pricing`, `#/workflows`); bare anchors (`#demo`, `#workflows-hero`, …) are
// left alone so in-page scrolling keeps working on whichever page is mounted.
// Navbar + Footer are shared chrome, rendered once here so they persist across
// route changes.
//
// Framer note: this is just the prototype's stand-in for Framer's native multi-
// page navigation. In Framer, Home / Platform / Pricing / Workflows are separate
// page canvases; the nav links and logo become page links, and the `#/…` scheme
// disappears.
// ─────────────────────────────────────────────────────────────────────────────

type Route = 'home' | 'platform' | 'pricing' | 'workflows'

function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#/, '')
  if (h.startsWith('/platform')) return 'platform'
  if (h.startsWith('/pricing')) return 'pricing'
  if (h.startsWith('/workflows')) return 'workflows'
  return 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)

  useEffect(() => {
    const onHash = () => {
      // Only react to route hashes; bare `#anchor` links scroll in-page.
      if (!window.location.hash.startsWith('#/')) return
      setRoute(routeFromHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Jump to the top on a page switch (instant, ignoring the global smooth scroll).
  useEffect(() => {
    const el = document.documentElement
    const prev = el.style.scrollBehavior
    el.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    el.style.scrollBehavior = prev
  }, [route])

  return (
    <>
      <Navbar />
      {route === 'platform' ? (
        <PlatformPage />
      ) : route === 'pricing' ? (
        <PricingPage />
      ) : route === 'workflows' ? (
        <WorkflowsPage />
      ) : (
        <HomePage />
      )}
      <Footer />
    </>
  )
}
