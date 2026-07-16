"use client"

import { Bookmark, BookmarkCheck, Clipboard, RefreshCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  LEARNING_TOOL_LABELS,
  translationLanguageLabel,
  type LearningToolResult,
} from "@/lib/learning-tools"

import { GeneratedLearningText } from "../generated-learning-text"
import type { LearningToolsController } from "./use-learning-tools-controller"

interface LearningToolResultCardProps {
  controller: LearningToolsController
  result: LearningToolResult
}

const resultDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

const resultOptionLabel = (result: LearningToolResult): string | null => {
  if (result.tool === "translate") return `${translationLanguageLabel(result.options.sourceLanguage)} → ${translationLanguageLabel(result.options.targetLanguage)}`
  if (result.tool === "explain") return result.options.explanationFocus.replaceAll("-", " ")
  if (result.tool === "summarize") return result.options.summaryFormat.replaceAll("-", " ")
  if (result.tool === "examples") return result.options.exampleDifficulty.replaceAll("-", " ")
  return null
}

export function LearningToolResultCard({ controller, result }: LearningToolResultCardProps) {
  const optionLabel = resultOptionLabel(result)

  return (
    <article className="border border-border bg-white p-4 shadow-[3px_3px_0_rgba(17,24,39,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700">AI generated · {LEARNING_TOOL_LABELS[result.tool]}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.lessonTitle} · {result.source.label}
            {optionLabel ? ` · ${optionLabel}` : ""}
            {` · ${resultDateFormatter.format(new Date(result.createdAt))}`}
          </p>
        </div>
        {result.saved ? <span className="text-xs font-semibold text-emerald-700">Saved on this device only</span> : null}
      </div>
      <div className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        AI output can be inaccurate. Check important language details against the curated lesson.
      </div>

      {result.tool === "translate" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="border border-border p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Original · {translationLanguageLabel(result.options.sourceLanguage)}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{result.source.text}</p>
          </div>
          <div className="border border-border p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Translation · {translationLanguageLabel(result.options.targetLanguage)}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{result.output}</p>
          </div>
        </div>
      ) : result.structured?.examples ? (
        <div className="mt-4 space-y-3">
          {result.structured.examples.map((example, index) => (
            <div key={`${result.id}-${example.german}`} className="border border-border p-3">
              <p className="font-medium" lang="de">{example.german}</p>
              <details className="mt-2 text-sm">
                <summary className="min-h-10 cursor-pointer py-2 font-medium text-orange-700">Reveal translation</summary>
                <p>{example.translation}</p>
              </details>
              <p className="mt-2 text-xs text-muted-foreground">{example.usageNote}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => controller.explainGeneratedExample(example.german, index)}
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
        <Button type="button" variant="outline" size="sm" onClick={() => controller.copyText(result.output)}><Clipboard className="h-3.5 w-3.5" aria-hidden="true" />Copy</Button>
        {result.structured?.sentenceCheck ? <Button type="button" variant="outline" size="sm" onClick={() => controller.copyText(result.structured?.sentenceCheck?.correction ?? result.output)}>Copy correction</Button> : null}
        {result.tool === "check" ? <Button type="button" variant="outline" size="sm" onClick={controller.tryAnotherSentence}>Try another</Button> : null}
        <Button type="button" variant="outline" size="sm" onClick={() => controller.toggleSaved(result.id)}>{result.saved ? <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}{result.saved ? "Unsave" : "Save"}</Button>
        <Button type="button" variant="outline" size="sm" disabled={controller.isBusy} onClick={() => controller.runGeneration({ nextTool: result.tool, nextSource: result.source, nextLearnerText: result.tool === "check" ? result.source.text : undefined })}><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Regenerate</Button>
        {result.tool === "explain" ? <Button type="button" variant="outline" size="sm" disabled={controller.isBusy} onClick={() => controller.runGeneration({ nextTool: "explain", nextSource: result.source, followUp: "simpler" })}>Simpler</Button> : null}
        {result.tool === "examples" ? <Button type="button" variant="outline" size="sm" disabled={controller.isBusy} onClick={() => controller.runGeneration({ nextTool: "examples", nextSource: result.source, followUp: "another" })}>Another example</Button> : null}
        <Button type="button" variant="ghost" size="sm" onClick={() => controller.deleteResult(result.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete</Button>
      </div>
    </article>
  )
}
