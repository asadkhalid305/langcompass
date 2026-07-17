"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  ChromeAISessionPool,
  DEFAULT_LEARNING_TOOL_OPTIONS,
  detectCapabilities,
  getChromeAIEnvironment,
  type LearningToolCapabilities,
  type LearningToolsContext,
  type LearningToolTaskOptions,
} from "@/lib/learning-tools"

const INITIAL_CAPABILITIES: LearningToolCapabilities = {
  translate: "checking",
  summarize: "checking",
  prompt: "checking",
  proofreader: "checking",
}

interface UseLearningToolsCapabilitiesOptions {
  context: LearningToolsContext
  taskOptions: LearningToolTaskOptions
  sessionPool: ChromeAISessionPool
}

export function useLearningToolsCapabilities({
  context,
  taskOptions,
  sessionPool,
}: UseLearningToolsCapabilitiesOptions) {
  const [capabilities, setCapabilities] = useState<LearningToolCapabilities>(INITIAL_CAPABILITIES)
  const capabilityCheckRef = useRef(0)

  const refreshCapabilities = useCallback(async (
    sourceLanguage = taskOptions.sourceLanguage,
    targetLanguage = taskOptions.targetLanguage,
    summaryFormat = taskOptions.summaryFormat,
  ) => {
    const requestId = ++capabilityCheckRef.current
    const options = {
      ...DEFAULT_LEARNING_TOOL_OPTIONS,
      sourceLanguage,
      targetLanguage,
      summaryFormat,
    }
    const detected = await detectCapabilities(getChromeAIEnvironment(), options, context)
    if (requestId !== capabilityCheckRef.current) return
    setCapabilities(sessionPool.reconcileCapabilities(detected, options, context))
  }, [context, sessionPool, taskOptions.sourceLanguage, taskOptions.summaryFormat, taskOptions.targetLanguage])

  useEffect(() => {
    setCapabilities((current) => ({ ...current, translate: "checking", summarize: "checking" }))
    void refreshCapabilities()
  }, [refreshCapabilities])

  return { capabilities, setCapabilities, refreshCapabilities }
}
