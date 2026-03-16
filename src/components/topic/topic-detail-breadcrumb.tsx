"use client"

import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { humanizeGroupLabel } from "@/lib/explorer/labels"
import { buildExplorerHref, parseTopicLevel } from "@/lib/explorer/navigation"
import type { TopicId, TopicLevel } from "@/lib/types/topic"

interface TopicDetailBreadcrumbProps {
  topicId: TopicId
  topicTitle: string
  defaultLevel: TopicLevel
  defaultGroup: string
}

export function TopicDetailBreadcrumb({ topicId, topicTitle, defaultLevel, defaultGroup }: TopicDetailBreadcrumbProps) {
  const searchParams = useSearchParams()
  const contextLevel = parseTopicLevel(searchParams.get("level")) ?? defaultLevel
  const requestedGroup = searchParams.get("group")?.trim()
  const contextGroup = requestedGroup && requestedGroup.length > 0 ? requestedGroup : defaultGroup
  const explorerHref = buildExplorerHref({
    level: contextLevel,
    group: contextGroup,
    topicId,
  })

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href={explorerHref} className="transition-colors hover:text-foreground">
          {contextLevel} Explorer
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{humanizeGroupLabel(contextGroup)}</span>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-foreground">{topicTitle}</span>
      </nav>

      <div className="mt-4 flex justify-end">
        <Button asChild variant="outline" className="rounded-none border-foreground/40 bg-white">
          <Link href={explorerHref}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to explorer
          </Link>
        </Button>
      </div>
    </>
  )
}
