"use client"

import { useCallback, useEffect, useReducer, useRef, type Dispatch, type SetStateAction } from "react"

import {
  buildPrompt,
  capabilityForTool,
  ChromeAISessionPool,
  generateWithChromeAI,
  getChromeAIEnvironment,
  type GenerationState,
  type LearningToolCapabilities,
  type LearningToolId,
  type LearningToolResult,
  type LearningToolSource,
  type LearningToolsContext,
  type LearningToolTaskOptions,
} from "@/lib/learning-tools"

interface GenerationStatus {
  state: GenerationState
  downloadProgress: number | null
  errorMessage: string
}

type GenerationAction =
  | { type: "reset" }
  | { type: "preparing" }
  | { type: "download-progress"; progress: number }
  | { type: "generating" }
  | { type: "success" }
  | { type: "canceled" }
  | { type: "error"; message: string }

const INITIAL_GENERATION_STATUS: GenerationStatus = {
  state: "idle",
  downloadProgress: null,
  errorMessage: "",
}

const generationReducer = (_status: GenerationStatus, action: GenerationAction): GenerationStatus => {
  switch (action.type) {
    case "reset":
      return INITIAL_GENERATION_STATUS
    case "preparing":
      return { ...INITIAL_GENERATION_STATUS, state: "preparing" }
    case "download-progress":
      return { ..._status, downloadProgress: action.progress }
    case "generating":
      return { ..._status, state: "generating", downloadProgress: null }
    case "success":
      return { ..._status, state: "success", downloadProgress: null }
    case "canceled":
      return { ...INITIAL_GENERATION_STATUS, state: "canceled" }
    case "error":
      return { ...INITIAL_GENERATION_STATUS, state: "error", errorMessage: action.message }
  }
}

interface UseLearningToolsGenerationOptions {
  capabilities: LearningToolCapabilities
  clearLearnerText: () => void
  context: LearningToolsContext
  defaultSource: LearningToolSource
  learnerText: string
  persistResults: (results: LearningToolResult[]) => void
  refreshCapabilities: () => Promise<void>
  resultsRef: { current: LearningToolResult[] }
  sessionPool: ChromeAISessionPool
  setCapabilities: Dispatch<SetStateAction<LearningToolCapabilities>>
  source: LearningToolSource
  taskOptions: LearningToolTaskOptions
  tool: LearningToolId
}

export interface RunLearningToolOptions {
  nextTool?: LearningToolId
  nextSource?: LearningToolSource
  nextLearnerText?: string
  followUp?: "simpler" | "another"
}

const createResultId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `result-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function useLearningToolsGeneration({
  capabilities,
  clearLearnerText,
  context,
  defaultSource,
  learnerText,
  persistResults,
  refreshCapabilities,
  resultsRef,
  sessionPool,
  setCapabilities,
  source,
  taskOptions,
  tool,
}: UseLearningToolsGenerationOptions) {
  const [status, dispatch] = useReducer(generationReducer, INITIAL_GENERATION_STATUS)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => {
    abortRef.current?.abort()
    sessionPool.destroy()
  }, [sessionPool])

  const runGeneration = useCallback(async (options?: RunLearningToolOptions) => {
    const selectedTool = options?.nextTool ?? tool
    const selectedSource = options?.nextSource ?? source
    const selectedLearnerText = options?.nextLearnerText ?? learnerText
    const selectedCapability = capabilityForTool(selectedTool, capabilities)
    if (["checking", "unsupported", "unavailable"].includes(selectedCapability)) return
    if (selectedTool === "check" && !selectedLearnerText.trim()) {
      dispatch({ type: "error", message: "Write a German sentence before checking it." })
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    const downloadExpected = selectedCapability === "downloadable" || selectedCapability === "downloading"
    dispatch({ type: downloadExpected ? "preparing" : "generating" })
    const capabilityKey = selectedTool === "translate"
      ? "translate"
      : selectedTool === "summarize"
        ? "summarize"
        : selectedTool === "check" && ["ready", "downloadable", "downloading"].includes(capabilities.proofreader)
          ? "proofreader"
          : "prompt"
    if (downloadExpected) {
      setCapabilities((current) => ({ ...current, [capabilityKey]: "downloading" }))
    }

    const input = selectedTool === "translate"
      ? selectedSource.text
      : selectedTool === "summarize"
        ? context.lessonText
        : buildPrompt(
            selectedTool,
            context,
            selectedTool === "check" ? defaultSource : selectedSource,
            selectedLearnerText,
            options?.followUp,
            taskOptions,
          )

    try {
      const generated = await generateWithChromeAI({
        environment: getChromeAIEnvironment(),
        tool: selectedTool,
        input,
        context,
        signal: controller.signal,
        taskOptions,
        pool: sessionPool,
        monitorDownload: downloadExpected,
        onDownloadProgress: (progress) => dispatch({ type: "download-progress", progress }),
        onSessionReady: () => {
          setCapabilities((current) => ({ ...current, [capabilityKey]: "ready" }))
          dispatch({ type: "generating" })
        },
      })
      const normalizedOutput = generated.text.trim()
      if (!normalizedOutput) throw new Error("The on-device model returned an empty result. Try again.")
      const result: LearningToolResult = {
        id: createResultId(),
        topicId: context.topicId,
        lessonTitle: context.title,
        tool: selectedTool,
        source: selectedTool === "check"
          ? { label: "Your sentence", text: selectedLearnerText.trim() }
          : selectedSource,
        output: normalizedOutput,
        structured: generated.structured,
        options: taskOptions,
        generatedBy: generated.generatedBy,
        schemaVersion: 3,
        createdAt: new Date().toISOString(),
        saved: false,
      }
      persistResults([result, ...resultsRef.current])
      if (selectedTool === "check") clearLearnerText()
      setCapabilities((current) => ({
        ...current,
        [generated.generatedBy === "translator"
          ? "translate"
          : generated.generatedBy === "summarizer"
            ? "summarize"
            : generated.generatedBy === "proofreader"
              ? "proofreader"
              : "prompt"]: "ready",
      }))
      dispatch({ type: "success" })
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
        dispatch({ type: "canceled" })
      } else {
        dispatch({
          type: "error",
          message: error instanceof Error ? error.message : "The on-device model could not complete this request.",
        })
      }
      void refreshCapabilities()
    } finally {
      abortRef.current = null
    }
  }, [
    capabilities,
    clearLearnerText,
    context,
    defaultSource,
    learnerText,
    persistResults,
    refreshCapabilities,
    resultsRef,
    sessionPool,
    setCapabilities,
    source,
    taskOptions,
    tool,
  ])

  const abort = useCallback(() => abortRef.current?.abort(), [])
  const reportError = useCallback((message: string) => dispatch({ type: "error", message }), [])
  const resetGeneration = useCallback(() => dispatch({ type: "reset" }), [])

  return {
    abort,
    downloadProgress: status.downloadProgress,
    errorMessage: status.errorMessage,
    generationState: status.state,
    isBusy: status.state === "preparing" || status.state === "generating",
    reportError,
    resetGeneration,
    runGeneration,
  }
}
