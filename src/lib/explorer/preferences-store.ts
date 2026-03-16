"use client"

import { useCallback, useState } from "react"

import { ALLOWED_LEVEL_OPTIONS } from "../constants/topic"
import type { TopicLevelOrAll } from "../types/topic"

export interface ExplorerPreferences {
  lastLevel?: TopicLevelOrAll
  lastGroup?: string
  lastQuery?: string
}

type ExplorerPreferencePatch = {
  lastLevel?: TopicLevelOrAll | null
  lastGroup?: string | null
  lastQuery?: string | null
}

const STORAGE_KEY = "langcompass.explorer.preferences.v1"

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

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
      lastGroup: normalizeOptionalText(parsed.lastGroup),
      lastQuery: normalizeOptionalText(parsed.lastQuery),
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

      if (patch.lastGroup !== undefined) {
        const normalized = normalizeOptionalText(patch.lastGroup)
        if (!normalized) {
          delete next.lastGroup
        } else {
          next.lastGroup = normalized
        }
      }

      if (patch.lastQuery !== undefined) {
        const normalized = normalizeOptionalText(patch.lastQuery)
        if (!normalized) {
          delete next.lastQuery
        } else {
          next.lastQuery = normalized
        }
      }

      writeStoredPreferences(next)
      return next
    })
  }, [])

  return [preferences, patchPreferences]
}
