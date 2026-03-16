import { useEffect, useState } from "react"

export function useDesktopViewport() {
  const [isDesktopViewport, setIsDesktopViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateViewport = () => {
      setIsDesktopViewport(mediaQuery.matches)
    }

    updateViewport()
    mediaQuery.addEventListener("change", updateViewport)

    return () => {
      mediaQuery.removeEventListener("change", updateViewport)
    }
  }, [])

  return isDesktopViewport
}
