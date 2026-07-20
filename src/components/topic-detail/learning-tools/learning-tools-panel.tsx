"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, LoaderCircle, Sparkles, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  LEARNING_TOOL_API_LABELS,
  LEARNING_TOOL_IDS,
  LEARNING_TOOL_LABELS,
  TRANSLATION_TARGET_LANGUAGES,
  type CapabilityState,
  type LearningToolTaskOptions,
} from "@/lib/learning-tools"

import { LearningToolsResults } from "./learning-tools-results"
import { LearningToolsModelManagement } from "./learning-tools-model-management"
import type { LearningToolsController } from "./use-learning-tools-controller"

interface LearningToolsPanelProps {
  controller: LearningToolsController
}

interface ToolOptionSelectProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  disabled: boolean
  options: Array<[string, string]>
}

function ToolOptionSelect({ label, value, onValueChange, disabled, options }: ToolOptionSelectProps) {
  return (
    <div className="mt-4 text-sm font-semibold">
      {label}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([optionValue, optionLabel]) => <SelectItem key={optionValue} value={optionValue}>{optionLabel}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )
}

const capabilityCopy: Record<CapabilityState, string> = {
  checking: "Checking this browser…",
  unsupported: "This API is not available in this browser.",
  unavailable: "This device or language combination does not meet the current requirements.",
  downloadable: "The on-device model needs a one-time download.",
  downloading: "Downloading the on-device model…",
  ready: "Ready for this tool.",
}

export function LearningToolsPanel({ controller }: LearningToolsPanelProps) {
  const sentenceInputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (controller.sentenceFocusRequest === 0) return
    window.requestAnimationFrame(() => sentenceInputRef.current?.focus())
  }, [controller.sentenceFocusRequest])

  const generateButtonLabel = controller.generationState === "preparing"
    ? controller.currentCapability === "downloading" ? "Downloading…" : "Preparing…"
    : controller.generationState === "generating"
      ? "Generating…"
      : controller.currentCapability === "downloadable" || controller.currentCapability === "downloading"
        ? "Download & generate"
        : "Generate"

  return (
    <SheetContent
      side={controller.desktop ? "right" : "bottom"}
      className={controller.desktop ? "flex w-[min(46rem,92vw)] max-w-none flex-col" : "flex h-[92dvh] flex-col rounded-none"}
    >
      <SheetHeader className="border-b border-border pb-4 pr-12">
        <SheetTitle className="flex items-center gap-2 font-display text-xl">
          <Sparkles className="h-5 w-5 text-orange-600" aria-hidden="true" />
          Learning tools
        </SheetTitle>
        <SheetDescription>
          Generated locally and kept separate from the curated lesson. AI output can be inaccurate. Chrome built-in AI support varies by desktop browser and device. Recent items stay on this browser for seven days; saved items stay until deleted.
        </SheetDescription>
        <div className="pt-1">
          <LearningToolsModelManagement />
        </div>
      </SheetHeader>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[13rem_minmax(0,1fr)] lg:grid-rows-1">
        <nav className="flex gap-2 overflow-x-auto border-b border-border p-3 lg:flex-col lg:border-b-0 lg:border-r" aria-label="Learning tool selection">
          {LEARNING_TOOL_IDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => controller.resetSourceForTool(item)}
              disabled={controller.isBusy}
              aria-pressed={controller.tool === item}
              className={`min-h-11 shrink-0 border px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                controller.tool === item ? "border-[#111827] bg-[#111827] text-white" : "border-border bg-white hover:bg-muted/40"
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
                <h2 id="learning-tool-title" className="mt-1 text-xl font-semibold">{LEARNING_TOOL_LABELS[controller.tool]}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{LEARNING_TOOL_API_LABELS[controller.tool]}</p>
              </div>
              <span className="border border-border bg-muted/20 px-2 py-1 text-xs font-medium" aria-live="polite">
                {capabilityCopy[controller.currentCapability]}
              </span>
            </div>

            {controller.tool === "translate" && controller.context.translationSources.length > 0 ? (
              <div className="mt-4">
                German sentence
                <Select
                  value={controller.translationSourceIndex >= 0 ? String(controller.translationSourceIndex) : ""}
                  onValueChange={(value) => controller.selectTranslationSource(Number(value))}
                  disabled={controller.isBusy}
                >
                  <SelectTrigger aria-label="German sentence">
                    <SelectValue placeholder="Choose a German sentence" />
                  </SelectTrigger>
                  <SelectContent>
                    {controller.context.translationSources.map((candidate, index) => (
                      <SelectItem key={`${candidate.label}-${candidate.text}`} value={String(index)}>
                      {index + 1}. {candidate.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="mt-4 border border-border bg-muted/15 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Source context</p>
              <p className="mt-2 text-sm font-medium">{controller.source.label}</p>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{controller.source.text}</p>
            </div>

            {controller.tool === "check" ? (
              <div className="mt-4">
                <label htmlFor="learning-tools-sentence" className="text-sm font-semibold">Your German sentence</label>
                <textarea
                  ref={sentenceInputRef}
                  id="learning-tools-sentence"
                  name="learning-tools-sentence"
                  autoComplete="off"
                  value={controller.learnerText}
                  onChange={(event) => controller.setLearnerText(event.target.value)}
                  disabled={controller.isBusy}
                  maxLength={1800}
                  rows={4}
                  className="mt-2 w-full resize-y border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ich lerne Deutsch, weil …"
                />
                <p className="mt-1 text-xs text-muted-foreground">Your sentence is never replaced or sent to a server. If recent history is enabled, it is saved with the result on this device.</p>
                <p className="mt-1 text-right text-xs text-muted-foreground">{controller.learnerText.length}/1800</p>
              </div>
            ) : null}

            {controller.tool === "translate" ? (
              <div className="mt-4 text-sm font-semibold">Translate into
                <Select value={controller.taskOptions.targetLanguage} onValueChange={(value) => controller.updateTaskOption("targetLanguage", value)} disabled={controller.isBusy}>
                  <SelectTrigger aria-label="Translate into"><SelectValue /></SelectTrigger>
                  <SelectContent>{TRANSLATION_TARGET_LANGUAGES.map((language) => <SelectItem key={language.code} value={language.code}>{language.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : null}

            {controller.tool === "explain" ? (
              <ToolOptionSelect label="What should be explained?" value={controller.taskOptions.explanationFocus} onValueChange={(value) => controller.updateTaskOption("explanationFocus", value as LearningToolTaskOptions["explanationFocus"])} disabled={controller.isBusy} options={[["overview", "Meaning and usage"], ["word", "One word or phrase"], ["structure", "Sentence structure"], ["form", "Why this form"], ["contrast", "Contrast alternatives"], ["memory", "Mental model"], ["table", "Comparison table"], ["pattern", "Reusable pattern"]]} />
            ) : null}

            {controller.tool === "summarize" ? (
              <ToolOptionSelect label="Summary format" value={controller.taskOptions.summaryFormat} onValueChange={(value) => controller.updateTaskOption("summaryFormat", value as LearningToolTaskOptions["summaryFormat"])} disabled={controller.isBusy} options={[["quick-recap", "Quick recap"], ["key-rules", "Key rules"], ["five-bullets", "Five bullets"], ["revision-card", "Revision card"]]} />
            ) : null}

            {controller.tool === "examples" ? (
              <ToolOptionSelect label="Difficulty" value={controller.taskOptions.exampleDifficulty} onValueChange={(value) => controller.updateTaskOption("exampleDifficulty", value as LearningToolTaskOptions["exampleDifficulty"])} disabled={controller.isBusy} options={[["easier", "Easier"], ["same-level", "Same difficulty"], ["challenge", "More challenging"]]} />
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={() => controller.runGeneration()} disabled={!controller.canGenerate || controller.isBusy}>
                {controller.isBusy ? <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                {generateButtonLabel}
              </Button>
              {controller.isBusy ? <Button type="button" variant="outline" onClick={controller.abort}>Cancel</Button> : null}
            </div>
            {controller.languagePairInvalid ? <p className="mt-2 text-sm text-red-700">Choose two different languages.</p> : null}
            {controller.missingTranslationSource ? <p className="mt-2 text-sm text-amber-800">No curated German passage is available for this topic, so translation is unavailable.</p> : null}
            {controller.requiresLessonDetail ? <p className="mt-2 text-sm text-amber-800">This topic currently has metadata only. Summaries and new examples need curated lesson detail, so this action is unavailable.</p> : null}

            {controller.downloadProgress !== null ? (
              <div className="mt-3" aria-live="polite">
                <div className="h-2 overflow-hidden border border-border bg-muted">
                  <div className="h-full bg-orange-500 transition-[width] motion-reduce:transition-none" style={{ width: `${Math.round(controller.downloadProgress * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Downloaded {Math.round(controller.downloadProgress * 100)}%. You can keep reading the lesson.</p>
              </div>
            ) : null}

            <div className={controller.generationState === "success" || controller.generationState === "canceled" || controller.generationState === "error" ? "mt-3 text-sm" : "sr-only"} role="status" aria-live="polite">
              {controller.generationState === "preparing" && controller.currentCapability !== "downloading" ? "Preparing the on-device tool." : null}
              {controller.generationState === "generating" ? "Generating on this device." : null}
              {controller.generationState === "canceled" ? <p className="flex items-center gap-2 text-muted-foreground"><XCircle className="h-4 w-4" aria-hidden="true" />Generation canceled.</p> : null}
              {controller.generationState === "error" ? <p className="flex items-center gap-2 text-red-700"><XCircle className="h-4 w-4" aria-hidden="true" />{controller.errorMessage}</p> : null}
              {controller.generationState === "success" ? <p className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Generated on this device.</p> : null}
            </div>

          </section>

          <LearningToolsResults controller={controller} />
        </div>
      </div>
    </SheetContent>
  )
}
