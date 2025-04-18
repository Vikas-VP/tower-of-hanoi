"use client"

import { useState, useEffect } from "react"

export function isMobile() {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setMobile(
        window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0,
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return mobile
}
