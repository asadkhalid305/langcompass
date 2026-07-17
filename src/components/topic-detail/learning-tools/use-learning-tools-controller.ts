"use client"

import { useEffect, useMemo, useState } from "react"

import {
  capabilityForTool,
  ChromeAISessionPool,
  LEARNING_TOOL_LABELS,
  removeHistoryResults,
  type LearningToolId,
  type LearningToolsContext,
  type LearningToolTaskOptions,
} from "@/lib/learning-tools"

import { LEARNING_TOOLS_OPEN_EVENT } from "../learning-tools-context-actions"
import { useLearningToolsCapabilities } from "./use-learning-tools-capabilities"
import { useLearningToolsGeneration } from "./use-learning-tools-generation"
import { useLearningToolsPersistence } from "./use-learning-tools-persistence"
import {
  useLearningToolsWorkspaceState,
  type LearningToolsOpenRequest,
} from "./use-learning-tools-workspace-state"

export function useLearningToolsController(context: LearningToolsContext) {
  const [sessionPool] = useState(() => new ChromeAISessionPool())
  const [confirmation, setConfirmation] = useState<{
    action: () => void
    confirmLabel: string
    description: string
    title: string
  } | null>(null)
  const [historyView, setHistoryView] = useState<"recent" | "saved">("recent")
  const [historyTool, setHistoryTool] = useState<LearningToolId | "all">("translate")
  const workspace = useLearningToolsWorkspaceState(context)
  const persistence = useLearningToolsPersistence()
  const capability = useLearningToolsCapabilities({
    context,
    taskOptions: workspace.taskOptions,
    sessionPool,
  })
  const generation = useLearningToolsGeneration({
    capabilities: capability.capabilities,
    clearLearnerText: workspace.clearLearnerText,
    context,
    defaultSource: workspace.defaultSource,
    learnerText: workspace.learnerText,
    persistResults: persistence.persistResults,
    refreshCapabilities: capability.refreshCapabilities,
    resultsRef: persistence.resultsRef,
    sessionPool,
    setCapabilities: capability.setCapabilities,
    source: workspace.source,
    taskOptions: workspace.taskOptions,
    tool: workspace.tool,
  })
  const { openFromContext } = workspace
  const { resetGeneration } = generation

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const request = (event as CustomEvent<LearningToolsOpenRequest>).detail
      if (!request) return
      openFromContext(request)
      setHistoryTool(request.tool)
      resetGeneration()
    }
    window.addEventListener(LEARNING_TOOLS_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(LEARNING_TOOLS_OPEN_EVENT, handleOpen)
  }, [openFromContext, resetGeneration])

  const currentCapability = capabilityForTool(workspace.tool, capability.capabilities)
  const currentResults = useMemo(() => persistence.results.filter((result) => {
    if (historyView === "recent" && (result.saved || result.topicId !== context.topicId)) return false
    if (historyView === "saved" && !result.saved) return false
    return historyTool === "all" || result.tool === historyTool
  }), [context.topicId, historyTool, historyView, persistence.results])

  const resetSourceForTool = (tool: LearningToolId) => {
    workspace.resetSourceForTool(tool)
    setHistoryTool(tool)
    generation.resetGeneration()
  }

  const setOpen = (nextOpen: boolean) => {
    workspace.setOpen(nextOpen)
    if (!nextOpen) {
      workspace.resetWorkspace()
      generation.resetGeneration()
      setHistoryView("recent")
    }
  }

  const selectTranslationSource = (index: number) => {
    workspace.selectTranslationSource(index)
    generation.resetGeneration()
  }

  const updateTaskOption = <Key extends keyof LearningToolTaskOptions>(
    key: Key,
    value: LearningToolTaskOptions[Key],
  ) => {
    workspace.updateTaskOption(key, value)
    generation.resetGeneration()
  }

  const tryAnotherSentence = () => {
    workspace.tryAnotherSentence()
    setHistoryTool("check")
    generation.resetGeneration()
  }

  const explainGeneratedExample = (sourceText: string, index: number) => {
    workspace.explainGeneratedExample(sourceText, index)
    setHistoryTool("explain")
    generation.resetGeneration()
  }

  const clearAll = () => {
    setConfirmation({
      action: persistence.clearAllResults,
      confirmLabel: "Delete everything",
      description: "Delete all recent and saved learning-tool results from this browser?",
      title: "Delete all results?",
    })
  }

  const clearCurrentResults = () => {
    const message = historyView === "recent"
      ? historyTool === "all"
        ? "Clear all recent learning-tool results? Saved results will remain."
        : `Clear recent results for ${LEARNING_TOOL_LABELS[historyTool]}? Other recent results and all saved results will remain.`
      : historyTool === "all"
        ? "Delete all saved learning-tool results from this browser? Recent results will remain."
        : `Delete saved results for ${LEARNING_TOOL_LABELS[historyTool]}? Other saved results and all recent results will remain.`
    setConfirmation({
      action: () => persistence.persistResults(removeHistoryResults(persistence.results, historyView, historyTool)),
      confirmLabel: historyView === "recent" ? "Clear results" : "Delete results",
      description: message,
      title: historyView === "recent" ? "Clear these recent results?" : "Delete these saved results?",
    })
  }

  const deleteResult = (id: string) => {
    setConfirmation({
      action: () => persistence.persistResults(persistence.results.filter((result) => result.id !== id)),
      confirmLabel: "Delete result",
      description: "Delete this generated result from this browser?",
      title: "Delete this result?",
    })
  }

  const confirmAction = () => {
    confirmation?.action()
    setConfirmation(null)
  }

  const toggleSaved = (id: string) => {
    persistence.persistResults(persistence.results.map((result) => (
      result.id === id ? { ...result, saved: !result.saved } : result
    )))
  }

  const copyText = (value: string) => {
    void navigator.clipboard.writeText(value).catch(() => {
      generation.reportError("Copy was blocked by this browser. Select the text and copy it manually.")
    })
  }

  const canGenerate = !workspace.languagePairInvalid
    && !workspace.missingTranslationSource
    && !workspace.requiresLessonDetail
    && !["checking", "unsupported", "unavailable"].includes(currentCapability)

  return {
    abort: generation.abort,
    canGenerate,
    clearAll,
    clearCurrentResults,
    confirmation,
    confirmAction,
    context,
    copyText,
    currentCapability,
    currentResults,
    deleteResult,
    desktop: workspace.desktop,
    downloadProgress: generation.downloadProgress,
    errorMessage: generation.errorMessage,
    explainGeneratedExample,
    generationState: generation.generationState,
    historyTool,
    historyView,
    isBusy: generation.isBusy,
    languagePairInvalid: workspace.languagePairInvalid,
    learnerText: workspace.learnerText,
    missingTranslationSource: workspace.missingTranslationSource,
    open: workspace.open,
    recentEnabled: persistence.recentEnabled,
    requiresLessonDetail: workspace.requiresLessonDetail,
    resetSourceForTool,
    results: persistence.results,
    runGeneration: generation.runGeneration,
    selectTranslationSource,
    sentenceFocusRequest: workspace.sentenceFocusRequest,
    setHistoryTool,
    setHistoryView,
    setLearnerText: workspace.setLearnerText,
    setConfirmation,
    setOpen,
    source: workspace.source,
    taskOptions: workspace.taskOptions,
    toggleSaved,
    tool: workspace.tool,
    translationSourceIndex: workspace.translationSourceIndex,
    tryAnotherSentence,
    updateRecentEnabled: persistence.updateRecentEnabled,
    updateTaskOption,
  }
}

export type LearningToolsController = ReturnType<typeof useLearningToolsController>
