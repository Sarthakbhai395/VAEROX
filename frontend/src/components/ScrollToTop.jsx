import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 * Ensures every navigation to a new route immediately resets the scroll position
 * to the top of the viewport with zero lag, preventing disorienting midway scroll locks.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
    } catch {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

export default ScrollToTop
