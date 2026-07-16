"use client"

import { History, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LEARNING_TOOL_IDS, LEARNING_TOOL_LABELS, type LearningToolId } from "@/lib/learning-tools"

import { LearningToolResultCard } from "./learning-tool-result-card"
import type { LearningToolsController } from "./use-learning-tools-controller"

interface LearningToolsResultsProps {
  controller: LearningToolsController
}

export function LearningToolsResults({ controller }: LearningToolsResultsProps) {
  return (
    <section className="mt-6 border-t border-border pt-5" aria-labelledby="learning-tools-history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="learning-tools-history" className="flex items-center gap-2 text-lg font-semibold"><History className="h-4 w-4" aria-hidden="true" />Results</h2>
        <div className="flex gap-2" role="group" aria-label="Result view">
          <Button type="button" size="sm" variant={controller.historyView === "recent" ? "default" : "outline"} onClick={() => controller.setHistoryView("recent")}>Recent</Button>
          <Button type="button" size="sm" variant={controller.historyView === "saved" ? "default" : "outline"} onClick={() => controller.setHistoryView("saved")}>Saved</Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3 border border-border bg-muted/15 p-3">
        <label className="text-xs font-semibold">Filter by tool
          <select value={controller.historyTool} onChange={(event) => controller.setHistoryTool(event.target.value as LearningToolId | "all")} className="mt-1 block min-h-10 border border-border bg-white px-2 text-sm">
            <option value="all">All tools</option>
            {LEARNING_TOOL_IDS.map((item) => <option key={item} value={item}>{LEARNING_TOOL_LABELS[item]}</option>)}
          </select>
        </label>
        <label className="flex min-h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={controller.recentEnabled} onChange={(event) => controller.updateRecentEnabled(event.target.checked)} />
          Keep recent results for seven days
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={controller.clearCurrentResults} disabled={controller.currentResults.length === 0}>
          {controller.historyView === "recent"
            ? controller.historyTool === "all" ? "Clear all recent" : `Clear recent: ${LEARNING_TOOL_LABELS[controller.historyTool]}`
            : controller.historyTool === "all" ? "Delete all saved" : `Delete saved: ${LEARNING_TOOL_LABELS[controller.historyTool]}`}
        </Button>
        {controller.results.length > 0 ? <Button type="button" variant="ghost" size="sm" onClick={controller.clearAll}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete everything</Button> : null}
      </div>

      {controller.currentResults.length === 0 ? (
        <p className="mt-3 border border-dashed border-border p-4 text-sm text-muted-foreground">No {controller.historyView} results match this view.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {controller.currentResults.map((result) => (
            <LearningToolResultCard key={result.id} controller={controller} result={result} />
          ))}
        </div>
      )}
    </section>
  )
}
