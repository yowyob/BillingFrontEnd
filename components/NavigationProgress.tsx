'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from './LoadingContext'

// Safety net: hideLoader only fires from the pathname-change effect below, so
// any pushState/replaceState that doesn't end up changing the path (query
// param updates, scroll-restoration bookkeeping, etc.) used to leave the
// overlay stuck forever. Auto-clears if that ever happens again.
const STUCK_LOADER_TIMEOUT_MS = 4000

export default function NavigationProgress() {
  const pathname = usePathname()
  const { showLoader, hideLoader } = useLoading()

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history)
    const originalReplaceState = window.history.replaceState.bind(window.history)
    let stuckTimer: ReturnType<typeof setTimeout> | null = null

    const maybeShowLoader = (url?: string | URL | null) => {
      if (!url) return
      const targetPath = new URL(url.toString(), window.location.origin).pathname
      if (targetPath === window.location.pathname) return // no actual navigation, don't show

      showLoader('Loading page...')
      if (stuckTimer) clearTimeout(stuckTimer)
      stuckTimer = setTimeout(hideLoader, STUCK_LOADER_TIMEOUT_MS)
    }

    window.history.pushState = function (state, title, url) {
      maybeShowLoader(url)
      return originalPushState(state, title, url as string)
    }

    window.history.replaceState = function (state, title, url) {
      maybeShowLoader(url)
      return originalReplaceState(state, title, url as string)
    }

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      if (stuckTimer) clearTimeout(stuckTimer)
    }
  }, [showLoader, hideLoader])

  // Hide the overlay once the new page pathname is active
  useEffect(() => {
    hideLoader()
  }, [pathname, hideLoader])

  return null
}
