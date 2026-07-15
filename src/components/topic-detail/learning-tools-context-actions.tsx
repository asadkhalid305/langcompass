"use client"

import { Languages, Lightbulb, ListCollapse, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { LearningToolId, LearningToolSource } from "@/lib/learning-tools"

export const LEARNING_TOOLS_OPEN_EVENT = "langcompass:open-learning-tools"

interface LearningToolsContextActionsProps {
  source: LearningToolSource
  tools?: Array<Extract<LearningToolId, "translate" | "explain" | "examples" | "summarize">>
  toolSources?: Partial<Record<LearningToolId, LearningToolSource>>
}

const actionMeta = {
  translate: { label: "Translate", Icon: Languages },
  explain: { label: "Explain", Icon: Lightbulb },
  examples: { label: "More examples", Icon: Plus },
  summarize: { label: "Summarize lesson", Icon: ListCollapse },
} as const

export function LearningToolsContextActions({
  source,
  tools = ["translate", "explain"],
  toolSources,
}: LearningToolsContextActionsProps) {
  const openTool = (tool: LearningToolId) => {
    window.dispatchEvent(new CustomEvent(LEARNING_TOOLS_OPEN_EVENT, { detail: { tool, source: toolSources?.[tool] ?? source } }))
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label={`Learning tools for ${source.label}`}>
      {tools.map((tool) => {
        const { label, Icon } = actionMeta[tool]
        return (
          <Button key={tool} type="button" variant="outline" size="sm" onClick={() => openTool(tool)}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </Button>
        )
      })}
    </div>
  )
}
