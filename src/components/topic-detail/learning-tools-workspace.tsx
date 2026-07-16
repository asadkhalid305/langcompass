"use client"

import { Sheet } from "@/components/ui/sheet"
import type { LearningToolsContext } from "@/lib/learning-tools"

import { LearningToolsLauncher } from "./learning-tools/learning-tools-launcher"
import { LearningToolsPanel } from "./learning-tools/learning-tools-panel"
import { useLearningToolsController } from "./learning-tools/use-learning-tools-controller"

interface LearningToolsWorkspaceProps {
  context: LearningToolsContext
}

export function LearningToolsWorkspace({ context }: LearningToolsWorkspaceProps) {
  const controller = useLearningToolsController(context)

  return (
    <Sheet open={controller.open} onOpenChange={controller.setOpen}>
      <LearningToolsLauncher />
      <LearningToolsPanel controller={controller} />
    </Sheet>
  )
}
