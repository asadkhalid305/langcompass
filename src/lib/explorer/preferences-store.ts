"use client"

import { useCallback, useState } from "react"

import { ALLOWED_LEVEL_OPTIONS } from "../constants/topic"
import type { TopicLevelOrAll } from "../types/topic"

export interface ExplorerPreferences {
  lastLevel?: TopicLevelOrAll
}

type ExplorerPreferencePatch = {
  lastLevel?: TopicLevelOrAll | null
}

const STORAGE_KEY = "langcompass.explorer.preferences.v1"

const normalizeTopicLevel = (value: unknown): TopicLevelOrAll | undefined => {
  if (typeof value !== "string") return undefined
  return ALLOWED_LEVEL_OPTIONS.includes(value as TopicLevelOrAll) ? (value as TopicLevelOrAll) : undefined
}

const readStoredPreferences = (): ExplorerPreferences => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      lastLevel: normalizeTopicLevel(parsed.lastLevel),
    }
  } catch {
    return {}
  }
}

const writeStoredPreferences = (value: ExplorerPreferences): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore storage write failures. Routing state remains authoritative.
  }
}

export const useExplorerPreferences = (): [ExplorerPreferences, (patch: ExplorerPreferencePatch) => void] => {
  const [preferences, setPreferences] = useState<ExplorerPreferences>(() =>
    typeof window === "undefined" ? {} : readStoredPreferences(),
  )

  const patchPreferences = useCallback((patch: ExplorerPreferencePatch) => {
    setPreferences((current) => {
      const next: ExplorerPreferences = { ...current }

      if (patch.lastLevel !== undefined) {
        if (patch.lastLevel === null) {
          delete next.lastLevel
        } else {
          next.lastLevel = patch.lastLevel
        }
      }

      writeStoredPreferences(next)
      return next
    })
  }, [])

  return [preferences, patchPreferences]
}
