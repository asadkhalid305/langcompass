import Link from "next/link"

import { LangCompassMark } from "@/components/branding/langcompass-logo"
import { TopicCurriculumPlacement } from "@/components/topic/topic-curriculum-placement"
import { TopicMetaTags } from "@/components/topic/topic-meta-tags"
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

const sidebarSectionClassName = "border border-white/15 bg-white/5 px-4 py-3"
const sidebarEyebrowClassName = "text-[11px] font-bold uppercase tracking-[0.18em] text-white/60"

function TopicLinkSection({ title, topics }: TopicLinkSectionProps) {
  if (topics.length === 0) return null

  return (
    <section className={sidebarSectionClassName}>
      <p className={sidebarEyebrowClassName}>{title}</p>
      <div className="mt-3 space-y-2">
        {topics.map((topic) =>
          topic.href ? (
            <Link
              key={topic.id}
              href={topic.href}
              className="block border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              {topic.title}
            </Link>
          ) : (
            <p key={topic.id} className="border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/65">
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
    <aside className="space-y-4 border border-[#111827] bg-[#111827] p-4 text-white shadow-[6px_6px_0_#F97316] lg:sticky lg:top-6 lg:h-fit">
      <section className={sidebarSectionClassName}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={sidebarEyebrowClassName}>Lesson map</p>
            <p className="mt-2 text-lg font-display font-bold leading-tight text-white">{topic.title}</p>
          </div>
          <LangCompassMark className="h-10 w-10" />
        </div>
        <TopicMetaTags topic={topic} hasDetailFile={Boolean(detail)} tone="dark" className="mt-4 flex flex-wrap gap-2" />
      </section>

      <TopicCurriculumPlacement
        topic={topic}
        className={sidebarSectionClassName}
        titleClassName={sidebarEyebrowClassName}
        introducedClassName="text-white"
        revisitedClassName="text-white/65"
      />

      <TopicLinkSection title="Prerequisites" topics={prerequisiteTopics} />
      <TopicLinkSection title="Related topics" topics={relatedTopics} />

      {hasRows(detail?.searchHints) ? (
        <section className={sidebarSectionClassName}>
          <p className={sidebarEyebrowClassName}>Search hints</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {detail.searchHints.map((hint) => (
              <span key={hint} className="border border-white/15 bg-white/5 px-2 py-1 text-xs text-white">
                {hint}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {detail?.sourceStyle ? (
        <section className={sidebarSectionClassName}>
          <p className={sidebarEyebrowClassName}>Source metadata</p>
          <p className="mt-3 text-sm text-white">Origin: {detail.sourceStyle.origin}</p>
          <p className="mt-1 text-sm text-white">Confidence: {detail.sourceStyle.confidence}</p>
          {detail.sourceStyle.notes ? <p className="mt-2 text-xs text-white/65">{detail.sourceStyle.notes}</p> : null}
        </section>
      ) : null}

      {detail?.updatedAt ? (
        <section className={sidebarSectionClassName}>
          <p className={sidebarEyebrowClassName}>Last updated</p>
          <p className="mt-2 text-sm text-white">{formatDate(detail.updatedAt)}</p>
        </section>
      ) : null}
    </aside>
  )
}
