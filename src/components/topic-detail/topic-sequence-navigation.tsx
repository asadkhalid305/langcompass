"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { buildTopicDetailHref, parseTopicLevelOrAll } from "@/lib/explorer/navigation"
import type { TopicCatalogItem, TopicId, TopicLevelOrAll } from "@/lib/types/topic"

export interface TopicSequenceItem {
  id: TopicId
  title: string
  moduleLabel: string | null
}

export interface TopicSequenceContext {
  found: boolean
  previous: TopicSequenceItem | null
  next: TopicSequenceItem | null
}

interface TopicSequenceNavigationProps {
  contexts: Record<TopicLevelOrAll, TopicSequenceContext>
  defaultLevel: TopicCatalogItem["level"]
}

function SequenceLink({
  direction,
  topic,
  level,
}: {
  direction: "previous" | "next"
  topic: TopicSequenceItem
  level: TopicLevelOrAll
}) {
  const isPrevious = direction === "previous"

  return (
    <Link
      href={buildTopicDetailHref(topic.id, { level })}
      className={`group flex min-h-24 min-w-0 flex-1 items-center gap-3 border border-foreground/30 bg-white px-4 py-3 shadow-[3px_3px_0_#111827] transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isPrevious ? "justify-start text-left" : "justify-end text-right"}`}
      rel={isPrevious ? "prev" : "next"}
    >
      {isPrevious ? <ArrowLeft className="h-5 w-5 shrink-0 transition-transform motion-safe:group-hover:-translate-x-0.5" aria-hidden="true" /> : null}
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {isPrevious ? "Previous" : "Next"}{topic.moduleLabel ? ` · ${topic.moduleLabel}` : ""}
        </span>
        <span className="mt-1 block text-sm font-semibold leading-snug text-foreground sm:text-base">{topic.title}</span>
      </span>
      {!isPrevious ? <ArrowRight className="h-5 w-5 shrink-0 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" /> : null}
    </Link>
  )
}

export function TopicSequenceNavigation({ contexts, defaultLevel }: TopicSequenceNavigationProps) {
  const searchParams = useSearchParams()
  const requestedLevel = parseTopicLevelOrAll(searchParams.get("level")) ?? defaultLevel
  const effectiveLevel = contexts[requestedLevel].found ? requestedLevel : defaultLevel
  const context = contexts[effectiveLevel]

  if (!context.previous && !context.next) return null

  return (
    <nav className="mt-8 border-t border-border pt-6" aria-label="Lesson sequence">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Continue in this section</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {context.previous ? <SequenceLink direction="previous" topic={context.previous} level={effectiveLevel} /> : <span aria-hidden="true" />}
        {context.next ? <SequenceLink direction="next" topic={context.next} level={effectiveLevel} /> : null}
      </div>
    </nav>
  )
}
