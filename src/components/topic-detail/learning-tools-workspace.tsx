"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clipboard,
  History,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  buildPrompt,
  capabilityForTool,
  ChromeAISessionPool,
  clearResults,
  DEFAULT_LEARNING_TOOL_OPTIONS,
  detectCapabilities,
  generateWithChromeAI,
  getChromeAIEnvironment,
  GERMAN_TRANSLATION_SOURCE_LANGUAGE,
  IndexedDBLearningToolsStore,
  LEARNING_TOOL_API_LABELS,
  LEARNING_TOOL_IDS,
  LEARNING_TOOL_LABELS,
  readResults,
  readWorkspace,
  removeHistoryResults,
  TRANSLATION_TARGET_LANGUAGES,
  translationLanguageLabel,
  writeWorkspace,
  type CapabilityState,
  type GenerationState,
  type LearningToolCapabilities,
  type LearningToolId,
  type LearningToolResult,
  type LearningToolSource,
  type LearningToolsContext,
  type LearningToolTaskOptions,
} from "@/lib/learning-tools"

import { LEARNING_TOOLS_OPEN_EVENT } from "./learning-tools-context-actions"
import { GeneratedLearningText } from "./generated-learning-text"

interface LearningToolsWorkspaceProps {
  context: LearningToolsContext
}

interface ContextEventDetail {
  tool: LearningToolId
  source: LearningToolSource
}

const INITIAL_CAPABILITIES: LearningToolCapabilities = {
  translate: "checking",
  summarize: "checking",
  prompt: "checking",
  proofreader: "checking",
}

const capabilityCopy: Record<CapabilityState, string> = {
  checking: "Checking this browser…",
  unsupported: "This API is not available in this browser.",
  unavailable: "This device or language combination does not meet the current requirements.",
  downloadable: "The on-device model needs a one-time download.",
  downloading: "Downloading the on-device model…",
  ready: "Ready on this device.",
}

const resultDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

const createResultId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `result-${Date.now()}-${Math.random().toString(36).slice(2)}`

const resultOptionLabel = (result: LearningToolResult): string | null => {
  if (result.tool === "translate") return `${translationLanguageLabel(result.options.sourceLanguage)} → ${translationLanguageLabel(result.options.targetLanguage)}`
  if (result.tool === "explain") return result.options.explanationFocus.replaceAll("-", " ")
  if (result.tool === "summarize") return result.options.summaryFormat.replaceAll("-", " ")
  if (result.tool === "examples") return result.options.exampleDifficulty.replaceAll("-", " ")
  return null
}

export function LearningToolsWorkspace({ context }: LearningToolsWorkspaceProps) {
  const defaultSource = useMemo<LearningToolSource>(
    () => ({ label: `${context.title} lesson`, text: context.summary || context.lessonText }),
    [context],
  )
  const [open, setOpen] = useState(false)
  const [desktop, setDesktop] = useState(false)
  const [workspaceRestored, setWorkspaceRestored] = useState(false)
  const [tool, setTool] = useState<LearningToolId>("translate")
  const [source, setSource] = useState<LearningToolSource>(defaultSource)
  const [learnerText, setLearnerText] = useState("")
  const [taskOptions, setTaskOptions] = useState<LearningToolTaskOptions>(DEFAULT_LEARNING_TOOL_OPTIONS)
  const [capabilities, setCapabilities] = useState<LearningToolCapabilities>(INITIAL_CAPABILITIES)
  const [generationState, setGenerationState] = useState<GenerationState>("idle")
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [streamingText, setStreamingText] = useState("")
  const [results, setResults] = useState<LearningToolResult[]>([])
  const [historyView, setHistoryView] = useState<"recent" | "saved">("recent")
  const [historyTool, setHistoryTool] = useState<LearningToolId | "all">("translate")
  const [recentEnabled, setRecentEnabled] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const capabilityCheckRef = useRef(0)
  const sentenceInputRef = useRef<HTMLTextAreaElement | null>(null)
  const resultsRef = useRef<LearningToolResult[]>([])
  const sessionPoolRef = useRef<ChromeAISessionPool | null>(null)
  const resultsStoreRef = useRef<IndexedDBLearningToolsStore | null>(null)
  const broadcastRef = useRef<BroadcastChannel | null>(null)
  if (!sessionPoolRef.current) sessionPoolRef.current = new ChromeAISessionPool()

  const refreshCapabilities = useCallback(async (
    sourceLanguage: string,
    targetLanguage: string,
    summaryFormat: LearningToolTaskOptions["summaryFormat"],
  ) => {
    const requestId = ++capabilityCheckRef.current
    const options = { ...DEFAULT_LEARNING_TOOL_OPTIONS, sourceLanguage, targetLanguage, summaryFormat }
    const detected = await detectCapabilities(getChromeAIEnvironment(), options, context)
    if (requestId !== capabilityCheckRef.current) return
    setCapabilities(sessionPoolRef.current?.reconcileCapabilities(detected, options, context) ?? detected)
  }, [context])

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const workspace = readWorkspace(window.sessionStorage)
    if (workspace?.topicId === context.topicId) {
      const restoredTargetLanguage = TRANSLATION_TARGET_LANGUAGES.some((language) => language.code === workspace.options.targetLanguage)
        ? workspace.options.targetLanguage
        : "en"
      setTool(workspace.tool)
      setHistoryTool(workspace.tool)
      setSource(workspace.source)
      setLearnerText(workspace.learnerText)
      setTaskOptions({
        ...workspace.options,
        sourceLanguage: GERMAN_TRANSLATION_SOURCE_LANGUAGE,
        targetLanguage: restoredTargetLanguage,
      })
    }
    const store = new IndexedDBLearningToolsStore(window.indexedDB)
    resultsStoreRef.current = store
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
      } finally {
        setWorkspaceRestored(true)
      }
    }
    void restore()
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("langcompass-learning-tools")
      broadcastRef.current = channel
      channel.addEventListener("message", () => {
        void store.read().then((restored) => {
          resultsRef.current = restored
          setResults(restored)
        }).catch(() => undefined)
      })
    }
    return () => {
      broadcastRef.current?.close()
      broadcastRef.current = null
      store.close()
      resultsStoreRef.current = null
    }
  }, [context.topicId])

  useEffect(() => {
    void refreshCapabilities(taskOptions.sourceLanguage, taskOptions.targetLanguage, taskOptions.summaryFormat)
  }, [refreshCapabilities, taskOptions.sourceLanguage, taskOptions.summaryFormat, taskOptions.targetLanguage])

  useEffect(() => {
    if (!workspaceRestored) return
    writeWorkspace(window.sessionStorage, { topicId: context.topicId, tool, source, learnerText, options: taskOptions })
  }, [context.topicId, learnerText, source, taskOptions, tool, workspaceRestored])

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<ContextEventDetail>).detail
      if (!detail) return
      setTool(detail.tool)
      setHistoryTool(detail.tool)
      setSource(detail.tool === "summarize"
        ? { label: `${context.title} full lesson`, text: context.lessonText }
        : detail.source)
      setGenerationState("idle")
      setOpen(true)
    }
    window.addEventListener(LEARNING_TOOLS_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(LEARNING_TOOLS_OPEN_EVENT, handleOpen)
  }, [context.lessonText, context.title])

  useEffect(() => () => {
    abortRef.current?.abort()
    sessionPoolRef.current?.destroy()
  }, [])

  const currentCapability = capabilityForTool(tool, capabilities)
  const currentResults = results.filter((result) => {
    if (historyView === "recent" && (result.saved || result.topicId !== context.topicId)) return false
    if (historyView === "saved" && !result.saved) return false
    return historyTool === "all" || result.tool === historyTool
  })

  const persistResults = useCallback((nextResults: LearningToolResult[]) => {
    const sessionOnlyResults = recentEnabled ? [] : nextResults.filter((result) => !result.saved)
    resultsRef.current = nextResults
    setResults(nextResults)
    void resultsStoreRef.current?.write(nextResults).then((persisted) => {
      const merged = [...persisted, ...sessionOnlyResults.filter((result) => !persisted.some((stored) => stored.id === result.id))]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      resultsRef.current = merged
      setResults(merged)
      broadcastRef.current?.postMessage("results-changed")
    }).catch(() => undefined)
  }, [recentEnabled])

  const updateTaskOption = <Key extends keyof LearningToolTaskOptions>(key: Key, value: LearningToolTaskOptions[Key]) => {
    setTaskOptions((current) => ({ ...current, [key]: value }))
    setGenerationState("idle")
    setStreamingText("")
  }

  const runGeneration = useCallback(
    async (options?: {
      nextTool?: LearningToolId
      nextSource?: LearningToolSource
      nextLearnerText?: string
      followUp?: "simpler" | "another"
    }) => {
      const selectedTool = options?.nextTool ?? tool
      const selectedSource = options?.nextSource ?? source
      const selectedLearnerText = options?.nextLearnerText ?? learnerText
      const selectedCapability = capabilityForTool(selectedTool, capabilities)
      if (["checking", "unsupported", "unavailable"].includes(selectedCapability)) return
      if (selectedTool === "check" && !selectedLearnerText.trim()) {
        setErrorMessage("Write a German sentence before checking it.")
        setGenerationState("error")
        return
      }

      const controller = new AbortController()
      abortRef.current = controller
      setErrorMessage("")
      setStreamingText("")
      setDownloadProgress(null)
      setGenerationState("preparing")
      const downloadExpected = selectedCapability === "downloadable" || selectedCapability === "downloading"
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

      const input =
        selectedTool === "translate"
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
          pool: sessionPoolRef.current ?? undefined,
          monitorDownload: downloadExpected,
          onDownloadProgress: setDownloadProgress,
          onSessionReady: () => {
            setCapabilities((current) => ({ ...current, [capabilityKey]: "ready" }))
            setDownloadProgress(null)
            setGenerationState("generating")
          },
          onChunk: setStreamingText,
        })
        const normalizedOutput = generated.text.trim()
        if (!normalizedOutput) throw new Error("The on-device model returned an empty result. Try again.")
        const result: LearningToolResult = {
          id: createResultId(),
          topicId: context.topicId,
          lessonTitle: context.title,
          tool: selectedTool,
          source:
            selectedTool === "check"
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
        setDownloadProgress(null)
        setGenerationState("success")
      } catch (error) {
        setDownloadProgress(null)
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
          setGenerationState("canceled")
        } else {
          setErrorMessage(error instanceof Error ? error.message : "The on-device model could not complete this request.")
          setGenerationState("error")
        }
        void refreshCapabilities(taskOptions.sourceLanguage, taskOptions.targetLanguage, taskOptions.summaryFormat)
      } finally {
        abortRef.current = null
      }
    },
    [capabilities, context, defaultSource, learnerText, persistResults, refreshCapabilities, source, taskOptions, tool],
  )

  const toggleSaved = (id: string) => {
    persistResults(results.map((result) => (result.id === id ? { ...result, saved: !result.saved } : result)))
  }

  const deleteResult = (id: string) => persistResults(results.filter((result) => result.id !== id))

  const clearAll = () => {
    if (!window.confirm("Delete all recent and saved learning-tool results from this browser?")) return
    void resultsStoreRef.current?.clearAll().then(() => broadcastRef.current?.postMessage("results-changed")).catch(() => undefined)
    resultsRef.current = []
    setResults([])
  }

  const clearRecent = () => {
    const message = historyTool === "all"
      ? "Clear all recent learning-tool results? Saved results will remain."
      : `Clear recent results for ${LEARNING_TOOL_LABELS[historyTool]}? Other recent results and all saved results will remain.`
    if (!window.confirm(message)) return
    persistResults(removeHistoryResults(results, "recent", historyTool))
  }

  const deleteAllSaved = () => {
    const message = historyTool === "all"
      ? "Delete all saved learning-tool results from this browser? Recent results will remain."
      : `Delete saved results for ${LEARNING_TOOL_LABELS[historyTool]}? Other saved results and all recent results will remain.`
    if (!window.confirm(message)) return
    persistResults(removeHistoryResults(results, "saved", historyTool))
  }

  const updateRecentEnabled = (enabled: boolean) => {
    setRecentEnabled(enabled)
    if (!enabled) {
      const next = results.filter((result) => result.saved)
      resultsRef.current = next
      setResults(next)
    }
    void resultsStoreRef.current?.setRecentEnabled(enabled).then(() => broadcastRef.current?.postMessage("results-changed")).catch(() => undefined)
  }

  const confirmDeleteResult = (id: string) => {
    if (!window.confirm("Delete this generated result from this browser?")) return
    deleteResult(id)
  }

  const copyText = (value: string) => {
    void navigator.clipboard.writeText(value).catch(() => {
      setErrorMessage("Copy was blocked by this browser. Select the text and copy it manually.")
      setGenerationState("error")
    })
  }

  const tryAnotherSentence = () => {
    setTool("check")
    setHistoryTool("check")
    setLearnerText("")
    setGenerationState("idle")
    window.requestAnimationFrame(() => sentenceInputRef.current?.focus())
  }

  const resetSourceForTool = (nextTool: LearningToolId) => {
    setTool(nextTool)
    setHistoryTool(nextTool)
    setSource(
      nextTool === "summarize"
        ? { label: `${context.title} full lesson`, text: context.lessonText }
        : nextTool === "translate" && context.translationSources[0]
          ? context.translationSources[0]
        : defaultSource,
    )
    setGenerationState("idle")
    setErrorMessage("")
    setStreamingText("")
  }

  const translationSourceIndex = context.translationSources.findIndex((candidate) => candidate.text === source.text)
  const selectTranslationSource = (index: number) => {
    const nextSource = context.translationSources[index]
    if (!nextSource) return
    setSource(nextSource)
    setGenerationState("idle")
    setErrorMessage("")
    setStreamingText("")
  }

  const languagePairInvalid = tool === "translate" && taskOptions.sourceLanguage === taskOptions.targetLanguage
  const missingTranslationSource = tool === "translate" && context.translationSources.length === 0
  const requiresLessonDetail = !context.hasDetail && (tool === "summarize" || tool === "examples")
  const canGenerate = !languagePairInvalid && !missingTranslationSource && !requiresLessonDetail && !["checking", "unsupported", "unavailable"].includes(currentCapability)
  const isBusy = generationState === "preparing" || generationState === "generating"
  const generateButtonLabel = generationState === "preparing"
    ? currentCapability === "downloading" ? "Downloading…" : "Preparing…"
    : generationState === "generating"
      ? "Generating…"
      : currentCapability === "downloadable" || currentCapability === "downloading"
        ? "Download & generate"
        : "Generate"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="mt-6 flex flex-col gap-4 border border-[#111827] bg-[#111827] px-5 py-4 text-white shadow-[5px_5px_0_#F97316] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-orange-300" aria-hidden="true" />
            Learning tools
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/70">Optional AI help generated on this device. First use may download browser-managed models and use local storage and processing power.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <SheetTrigger asChild>
            <Button className="bg-white text-[#111827] hover:bg-white/90">Open learning tools</Button>
          </SheetTrigger>
          <Button asChild variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link href="/learning-tools">Learn how it works</Link>
          </Button>
        </div>
      </div>

      <SheetContent
        side={desktop ? "right" : "bottom"}
        className={desktop ? "w-[min(46rem,92vw)] max-w-none" : "h-[92dvh] rounded-none"}
      >
        <SheetHeader className="border-b border-border pb-4 pr-12">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-5 w-5 text-orange-600" aria-hidden="true" />
            Learning tools
          </SheetTitle>
          <SheetDescription>
            Generated locally and kept separate from the curated lesson. AI output can be inaccurate. Chrome built-in AI support varies by desktop browser and device. Recent items stay on this browser for seven days; saved items stay until deleted.
          </SheetDescription>
        </SheetHeader>

        <div className="grid h-[calc(100%-7.25rem)] min-h-0 grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[13rem_minmax(0,1fr)] lg:grid-rows-1">
          <nav className="flex gap-2 overflow-x-auto border-b border-border p-3 lg:flex-col lg:border-b-0 lg:border-r" aria-label="Learning tool selection">
            {LEARNING_TOOL_IDS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => resetSourceForTool(item)}
                disabled={isBusy}
                aria-pressed={tool === item}
                className={`min-h-11 shrink-0 border px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tool === item ? "border-[#111827] bg-[#111827] text-white" : "border-border bg-white hover:bg-muted/40"
                }`}
              >
                {LEARNING_TOOL_LABELS[item]}
              </button>
            ))}
          </nav>

          <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">
            <section aria-labelledby="learning-tool-title">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Selected tool</p>
                  <h2 id="learning-tool-title" className="mt-1 text-xl font-semibold">{LEARNING_TOOL_LABELS[tool]}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{LEARNING_TOOL_API_LABELS[tool]}</p>
                </div>
                <span className="border border-border bg-muted/20 px-2 py-1 text-xs font-medium" aria-live="polite">
                  {capabilityCopy[currentCapability]}
                </span>
              </div>

              {tool === "translate" && context.translationSources.length > 0 ? (
                <label className="mt-4 block text-sm font-semibold">
                  German sentence
                  <select
                    value={translationSourceIndex >= 0 ? String(translationSourceIndex) : ""}
                    onChange={(event) => selectTranslationSource(Number(event.target.value))}
                    disabled={isBusy}
                    className="mt-2 min-h-11 w-full border border-border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {translationSourceIndex < 0 ? <option value="" disabled>Choose a German sentence</option> : null}
                    {context.translationSources.map((candidate, index) => (
                      <option key={`${candidate.label}-${candidate.text}`} value={index}>
                        {index + 1}. {candidate.text}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="mt-4 border border-border bg-muted/15 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Source context</p>
                <p className="mt-2 text-sm font-medium">{source.label}</p>
                <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{source.text}</p>
              </div>

              {tool === "check" ? (
                <div className="mt-4">
                  <label htmlFor="learning-tools-sentence" className="text-sm font-semibold">Your German sentence</label>
                  <textarea
                    ref={sentenceInputRef}
                    id="learning-tools-sentence"
                    name="learning-tools-sentence"
                    autoComplete="off"
                    value={learnerText}
                    onChange={(event) => setLearnerText(event.target.value)}
                    disabled={isBusy}
                    maxLength={1800}
                    rows={4}
                    className="mt-2 w-full resize-y border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Ich lerne Deutsch, weil …"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Your sentence is never replaced or sent to a server. If recent history is enabled, it is saved with the result on this device.</p>
                  <p className="mt-1 text-right text-xs text-muted-foreground">{learnerText.length}/1800</p>
                </div>
              ) : null}

              {tool === "translate" ? (
                <div className="mt-4">
                  <label className="block text-sm font-semibold">Translate into
                    <select value={taskOptions.targetLanguage} onChange={(event) => updateTaskOption("targetLanguage", event.target.value)} disabled={isBusy} className="mt-2 min-h-11 w-full border border-border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                      {TRANSLATION_TARGET_LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
                    </select>
                  </label>
                </div>
              ) : null}

              {tool === "explain" ? (
                <label className="mt-4 block text-sm font-semibold">What should be explained?
                    <select value={taskOptions.explanationFocus} onChange={(event) => updateTaskOption("explanationFocus", event.target.value as LearningToolTaskOptions["explanationFocus"])} disabled={isBusy} className="mt-2 min-h-11 w-full border border-border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="overview">Meaning and usage</option><option value="word">One word or phrase</option><option value="structure">Sentence structure</option><option value="form">Why this form</option><option value="contrast">Contrast alternatives</option><option value="memory">Mental model</option><option value="table">Comparison table</option><option value="pattern">Reusable pattern</option>
                  </select>
                </label>
              ) : null}

              {tool === "summarize" ? (
                <label className="mt-4 block text-sm font-semibold">Summary format
                  <select value={taskOptions.summaryFormat} onChange={(event) => updateTaskOption("summaryFormat", event.target.value as LearningToolTaskOptions["summaryFormat"])} disabled={isBusy} className="mt-2 min-h-11 w-full border border-border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="quick-recap">Quick recap</option><option value="key-rules">Key rules</option><option value="five-bullets">Five bullets</option><option value="revision-card">Revision card</option>
                  </select>
                </label>
              ) : null}

              {tool === "examples" ? (
                <label className="mt-4 block text-sm font-semibold">Difficulty
                  <select value={taskOptions.exampleDifficulty} onChange={(event) => updateTaskOption("exampleDifficulty", event.target.value as LearningToolTaskOptions["exampleDifficulty"])} disabled={isBusy} className="mt-2 min-h-11 w-full border border-border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="easier">Easier</option><option value="same-level">Same difficulty</option><option value="challenge">More challenging</option>
                  </select>
                </label>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={() => runGeneration()} disabled={!canGenerate || isBusy}>
                  {isBusy ? <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  {generateButtonLabel}
                </Button>
                {isBusy ? (
                  <Button type="button" variant="outline" onClick={() => abortRef.current?.abort()}>
                    Cancel
                  </Button>
                ) : null}
              </div>
              {languagePairInvalid ? <p className="mt-2 text-sm text-red-700">Choose two different languages.</p> : null}
              {missingTranslationSource ? <p className="mt-2 text-sm text-amber-800">No curated German passage is available for this topic, so translation is unavailable.</p> : null}
              {requiresLessonDetail ? <p className="mt-2 text-sm text-amber-800">This topic currently has metadata only. Summaries and new examples need curated lesson detail, so this action is unavailable.</p> : null}

              {downloadProgress !== null ? (
                <div className="mt-3" aria-live="polite">
                  <div className="h-2 overflow-hidden border border-border bg-muted">
                    <div className="h-full bg-orange-500 transition-[width] motion-reduce:transition-none" style={{ width: `${Math.round(downloadProgress * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Downloaded {Math.round(downloadProgress * 100)}%. You can keep reading the lesson.</p>
                </div>
              ) : null}

              <div className={generationState === "success" || generationState === "canceled" || generationState === "error" ? "mt-3 text-sm" : "sr-only"} role="status" aria-live="polite">
                {generationState === "preparing" && currentCapability !== "downloading" ? "Preparing the on-device tool." : null}
                {generationState === "generating" ? "Generating on this device." : null}
                {generationState === "canceled" ? <p className="flex items-center gap-2 text-muted-foreground"><XCircle className="h-4 w-4" aria-hidden="true" />Generation canceled.</p> : null}
                {generationState === "error" ? <p className="flex items-center gap-2 text-red-700"><XCircle className="h-4 w-4" aria-hidden="true" />{errorMessage}</p> : null}
                {generationState === "success" ? <p className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Generated on this device.</p> : null}
              </div>

              {generationState === "generating" && streamingText ? (
                <div className="mt-3 border border-border bg-white p-4 text-sm leading-relaxed" aria-live="polite">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700">Generating locally</p>
                  <p className="mt-2 whitespace-pre-wrap">{streamingText}</p>
                </div>
              ) : null}
            </section>

            <section className="mt-6 border-t border-border pt-5" aria-labelledby="learning-tools-history">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="learning-tools-history" className="flex items-center gap-2 text-lg font-semibold"><History className="h-4 w-4" aria-hidden="true" />Results</h2>
                <div className="flex gap-2" role="group" aria-label="Result view">
                  <Button type="button" size="sm" variant={historyView === "recent" ? "default" : "outline"} onClick={() => setHistoryView("recent")}>Recent</Button>
                  <Button type="button" size="sm" variant={historyView === "saved" ? "default" : "outline"} onClick={() => setHistoryView("saved")}>Saved</Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-3 border border-border bg-muted/15 p-3">
                <label className="text-xs font-semibold">Filter by tool
                  <select value={historyTool} onChange={(event) => setHistoryTool(event.target.value as LearningToolId | "all")} className="mt-1 block min-h-10 border border-border bg-white px-2 text-sm">
                    <option value="all">All tools</option>{LEARNING_TOOL_IDS.map((item) => <option key={item} value={item}>{LEARNING_TOOL_LABELS[item]}</option>)}
                  </select>
                </label>
                <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={recentEnabled} onChange={(event) => updateRecentEnabled(event.target.checked)} />Keep recent results for seven days</label>
                {historyView === "recent" ? (
                  <Button type="button" variant="ghost" size="sm" onClick={clearRecent} disabled={currentResults.length === 0}>
                    {historyTool === "all" ? "Clear all recent" : `Clear recent: ${LEARNING_TOOL_LABELS[historyTool]}`}
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" size="sm" onClick={deleteAllSaved} disabled={currentResults.length === 0}>
                    {historyTool === "all" ? "Delete all saved" : `Delete saved: ${LEARNING_TOOL_LABELS[historyTool]}`}
                  </Button>
                )}
                {results.length > 0 ? <Button type="button" variant="ghost" size="sm" onClick={clearAll}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete everything</Button> : null}
              </div>

              {currentResults.length === 0 ? (
                <p className="mt-3 border border-dashed border-border p-4 text-sm text-muted-foreground">No {historyView} results match this view.</p>
              ) : (
                <div className="mt-3 space-y-4">
                  {currentResults.map((result) => (
                    <article key={result.id} className="border border-border bg-white p-4 shadow-[3px_3px_0_rgba(17,24,39,0.12)]">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700">AI generated · {LEARNING_TOOL_LABELS[result.tool]}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {result.lessonTitle} · {result.source.label}
                            {resultOptionLabel(result) ? ` · ${resultOptionLabel(result)}` : ""}
                            {` · ${resultDateFormatter.format(new Date(result.createdAt))}`}
                          </p>
                        </div>
                        {result.saved ? <span className="text-xs font-semibold text-emerald-700">Saved on this device only</span> : null}
                      </div>
                      <div className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">AI output can be inaccurate. Check important language details against the curated lesson.</div>
                      {result.tool === "translate" ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="border border-border p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Original · {translationLanguageLabel(result.options.sourceLanguage)}</p><p className="mt-2 whitespace-pre-wrap text-sm">{result.source.text}</p></div>
                          <div className="border border-border p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Translation · {translationLanguageLabel(result.options.targetLanguage)}</p><p className="mt-2 whitespace-pre-wrap text-sm">{result.output}</p></div>
                        </div>
                      ) : result.structured?.examples ? (
                        <div className="mt-4 space-y-3">
                          {result.structured.examples.map((example, index) => (
                            <div key={`${result.id}-${index}`} className="border border-border p-3">
                              <p className="font-medium" lang="de">{example.german}</p>
                              <details className="mt-2 text-sm"><summary className="min-h-10 cursor-pointer py-2 font-medium text-orange-700">Reveal translation</summary><p>{example.translation}</p></details>
                              <p className="mt-2 text-xs text-muted-foreground">{example.usageNote}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setTool("explain")
                                  setHistoryTool("explain")
                                  setSource({ label: `Generated example ${index + 1}`, text: example.german })
                                  setGenerationState("idle")
                                  setStreamingText("")
                                }}
                              >
                                Explain this example
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : result.structured?.sentenceCheck ? (
                        <div className="mt-4 grid gap-3">
                          <div className="border border-border p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Original</p><p className="mt-2" lang="de">{result.structured.sentenceCheck.original}</p></div>
                          <div className="border border-emerald-300 bg-emerald-50 p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-800">{result.structured.sentenceCheck.changed ? "Correction" : "Already correct"}</p><p className="mt-2 font-medium" lang="de">{result.structured.sentenceCheck.correction}</p></div>
                          <div className="border border-border p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">What changed</p>{result.structured.sentenceCheck.changes.length > 0 ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{result.structured.sentenceCheck.changes.map((change) => <li key={change}>{change}</li>)}</ul> : <p className="mt-2 text-sm">No changes suggested.</p>}</div>
                          <div className="border border-border p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Why</p><p className="mt-2 text-sm">{result.structured.sentenceCheck.explanation}</p>{result.structured.sentenceCheck.alternative ? <p className="mt-2 text-sm"><span className="font-semibold">Alternative:</span> {result.structured.sentenceCheck.alternative}</p> : null}</div>
                        </div>
                      ) : (
                        <GeneratedLearningText value={result.output} />
                      )}
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={() => copyText(result.output)}><Clipboard className="h-3.5 w-3.5" aria-hidden="true" />Copy</Button>
                        {result.structured?.sentenceCheck ? <Button type="button" variant="outline" size="sm" onClick={() => copyText(result.structured?.sentenceCheck?.correction ?? result.output)}>Copy correction</Button> : null}
                        {result.tool === "check" ? <Button type="button" variant="outline" size="sm" onClick={tryAnotherSentence}>Try another</Button> : null}
                        <Button type="button" variant="outline" size="sm" onClick={() => toggleSaved(result.id)}>{result.saved ? <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}{result.saved ? "Unsave" : "Save"}</Button>
                        <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => runGeneration({ nextTool: result.tool, nextSource: result.source, nextLearnerText: result.tool === "check" ? result.source.text : undefined })}><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Regenerate</Button>
                        {result.tool === "explain" ? <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => runGeneration({ nextTool: "explain", nextSource: result.source, followUp: "simpler" })}>Simpler</Button> : null}
                        {result.tool === "examples" ? <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => runGeneration({ nextTool: "examples", nextSource: result.source, followUp: "another" })}>Another example</Button> : null}
                        <Button type="button" variant="ghost" size="sm" onClick={() => confirmDeleteResult(result.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete</Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
