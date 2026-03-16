import Link from "next/link"

import { TopicCurriculumPlacement } from "@/components/topic/topic-curriculum-placement"
import type { TopicCatalogItem, TopicDetail } from "@/lib/types/topic"

import { formatDate, hasRows, type TopicLinkItem } from "./topic-detail-page-helpers"

interface TopicDetailSidebarProps {
  topic: TopicCatalogItem
  detail: TopicDetail | null
  prerequisiteTopics: TopicLinkItem[]
  relatedTopics: TopicLinkItem[]
}

interface TopicLinkSectionProps {
  title: string
  topics: TopicLinkItem[]
}

function TopicLinkSection({ title, topics }: TopicLinkSectionProps) {
  if (topics.length === 0) return null

  return (
    <section className="rounded-none border border-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {topics.map((topic) =>
          topic.href ? (
            <Link
              key={topic.id}
              href={topic.href}
              className="block border border-border bg-muted/20 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {topic.title}
            </Link>
          ) : (
            <p key={topic.id} className="border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {topic.title}
            </p>
          ),
        )}
      </div>
    </section>
  )
}

export function TopicDetailSidebar({ topic, detail, prerequisiteTopics, relatedTopics }: TopicDetailSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
      <TopicCurriculumPlacement topic={topic} className="rounded-none border border-border bg-white p-4" />

      <TopicLinkSection title="Prerequisites" topics={prerequisiteTopics} />
      <TopicLinkSection title="Related topics" topics={relatedTopics} />

      {hasRows(detail?.searchHints) ? (
        <section className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Search hints</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {detail.searchHints.map((hint) => (
              <span key={hint} className="border border-border bg-muted/20 px-2 py-1 text-xs text-foreground">
                {hint}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {detail?.sourceStyle ? (
        <section className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Source metadata</p>
          <p className="mt-3 text-sm text-foreground">Origin: {detail.sourceStyle.origin}</p>
          <p className="mt-1 text-sm text-foreground">Confidence: {detail.sourceStyle.confidence}</p>
          {detail.sourceStyle.notes ? <p className="mt-2 text-xs text-muted-foreground">{detail.sourceStyle.notes}</p> : null}
        </section>
      ) : null}

      {detail?.updatedAt ? (
        <section className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Last updated</p>
          <p className="mt-2 text-sm text-foreground">{formatDate(detail.updatedAt)}</p>
        </section>
      ) : null}
    </aside>
  )
}
