"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SoundType = "move" | "error" | "victory"

interface SoundMap {
  [key: string]: HTMLAudioElement | null
}

export function useSounds() {
  const soundsRef = useRef<SoundMap>({
    move: null,
    error: null,
    victory: null,
  })
  const [soundsLoaded, setSoundsLoaded] = useState(false)

  // Initialize sounds
  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window === "undefined") return

    // Create audio elements
    const moveSound = new Audio()
    const errorSound = new Audio()
    const victorySound = new Audio()

    // Set up sound sources using data URIs for simple sounds
    // These are minimal, base64-encoded audio files
    moveSound.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAB9AP//AAA="
    errorSound.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAB9AP3/"
    victorySound.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAB9AP//AAA="

    // Set volume for each sound
    moveSound.volume = 0.3
    errorSound.volume = 0.3
    victorySound.volume = 0.5

    // Store the audio elements
    soundsRef.current = {
      move: moveSound,
      error: errorSound,
      victory: victorySound,
    }

    // Mark sounds as loaded
    setSoundsLoaded(true)

    // Cleanup function
    return () => {
      Object.values(soundsRef.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.src = ""
        }
      })
    }
  }, [])

  // Play sound function with fallback
  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundsLoaded) return

      try {
        const sound = soundsRef.current[type]
        if (sound) {
          // Reset the audio to the beginning if it's already playing
          sound.currentTime = 0

          // Create a promise that resolves when the sound plays or fails
          const playPromise = sound.play()

          // Handle the promise to avoid uncaught promise errors
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log("Sound playback prevented by browser")
            })
          }
        }
      } catch (error) {
        console.log("Sound playback error, continuing without sound")
      }
    },
    [soundsLoaded],
  )

  return { playSound }
}
