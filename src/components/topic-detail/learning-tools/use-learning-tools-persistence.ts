"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  clearResults,
  IndexedDBLearningToolsStore,
  readResults,
  type LearningToolResult,
} from "@/lib/learning-tools"

const RESULTS_CHANNEL = "langcompass-learning-tools"

export function useLearningToolsPersistence() {
  const [results, setResults] = useState<LearningToolResult[]>([])
  const [recentEnabled, setRecentEnabled] = useState(true)
  const resultsRef = useRef<LearningToolResult[]>([])
  const storeRef = useRef<IndexedDBLearningToolsStore | null>(null)
  const broadcastRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const store = new IndexedDBLearningToolsStore(window.indexedDB)
    storeRef.current = store

    const restore = async () => {
      try {
        let restoredResults = await store.read()
        const legacyResults = readResults(window.localStorage)
        if (restoredResults.length === 0 && legacyResults.length > 0) {
          restoredResults = await store.write(legacyResults)
          clearResults(window.localStorage)
        }
        resultsRef.current = restoredResults
        setResults(restoredResults)
        setRecentEnabled(await store.getRecentEnabled())
      } catch {
        resultsRef.current = []
        setResults([])
      }
    }

    void restore()

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(RESULTS_CHANNEL)
      broadcastRef.current = channel
      channel.addEventListener("message", () => {
        void store.read().then((storedResults) => {
          resultsRef.current = storedResults
          setResults(storedResults)
        }).catch(() => undefined)
      })
    }

    return () => {
      broadcastRef.current?.close()
      broadcastRef.current = null
      store.close()
      storeRef.current = null
    }
  }, [])

  const persistResults = useCallback((nextResults: LearningToolResult[]) => {
    const sessionOnlyResults = recentEnabled ? [] : nextResults.filter((result) => !result.saved)
    resultsRef.current = nextResults
    setResults(nextResults)
    void storeRef.current?.write(nextResults).then((persisted) => {
      const merged = [...persisted, ...sessionOnlyResults.filter((result) => !persisted.some((stored) => stored.id === result.id))]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      resultsRef.current = merged
      setResults(merged)
      broadcastRef.current?.postMessage("results-changed")
    }).catch(() => undefined)
  }, [recentEnabled])

  const clearAllResults = useCallback(() => {
    void storeRef.current?.clearAll().then(() => {
      broadcastRef.current?.postMessage("results-changed")
    }).catch(() => undefined)
    resultsRef.current = []
    setResults([])
  }, [])

  const updateRecentEnabled = useCallback((enabled: boolean) => {
    setRecentEnabled(enabled)
    if (!enabled) {
      const savedResults = resultsRef.current.filter((result) => result.saved)
      resultsRef.current = savedResults
      setResults(savedResults)
    }
    void storeRef.current?.setRecentEnabled(enabled).then(() => {
      broadcastRef.current?.postMessage("results-changed")
    }).catch(() => undefined)
  }, [])

  return {
    clearAllResults,
    persistResults,
    recentEnabled,
    results,
    resultsRef,
    updateRecentEnabled,
  }
}
