import Link from "next/link"
import { ArrowRight, BookOpenText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TopicMetaTags } from "@/components/topic/topic-meta-tags"
import { formatIntroducedInLabel, formatRevisitedInLabel } from "@/lib/explorer/labels"
import type { TopicCatalogItem, TopicDetail, TopicId } from "@/lib/types/topic"
import { cn } from "@/lib/utils/cn"

interface TopicPreviewPanelProps {
  topic: TopicCatalogItem | null
  detail: TopicDetail | null | undefined
  hasDetailFile: boolean
  isLoading: boolean
  loadError: string | undefined
  fullLessonHref: string | null
  relatedTopics: TopicCatalogItem[]
  onOpenTopic: (topicId: TopicId) => void
  className?: string
}

const clampPreview = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

const fallbackSummary = (topic: TopicCatalogItem): string =>
  `${topic.title} is part of the ${topic.level} ${topic.group.replace(/[_-]+/g, " ")} path in LangCompass.`

const fallbackWhyItMatters = (topic: TopicCatalogItem): string =>
  `This topic supports ${topic.category.replace(/[_-]+/g, " ")} fluency and appears in guided practice across the curriculum.`

export function TopicPreviewPanel({
  topic,
  detail,
  hasDetailFile,
  isLoading,
  loadError,
  fullLessonHref,
  relatedTopics,
  onOpenTopic,
  className,
}: TopicPreviewPanelProps) {
  if (!topic) {
    return (
      <div className="flex h-full min-h-[20rem] flex-col items-center justify-center px-6 text-center">
        <BookOpenText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium">Select a topic node</p>
        <p className="mt-1 text-sm text-muted-foreground">Preview details appear here before opening the full lesson page.</p>
      </div>
    )
  }

  const previewSummary = clampPreview(detail?.summary ?? fallbackSummary(topic), 250)
  const previewWhyItMatters = clampPreview(detail?.whyItMatters ?? fallbackWhyItMatters(topic), 220)
  const loadedDetail = hasDetailFile && detail ? detail : null
  const previewMentalModel = loadedDetail?.mentalModel?.[0]?.content
  const previewPatternsCount =
    (loadedDetail?.patterns?.length ?? 0) +
    (loadedDetail?.verbs?.length ?? 0) +
    (loadedDetail?.prepositions?.length ?? 0) +
    (loadedDetail?.twoWayPrepositions?.length ?? 0)

  return (
    <div className={cn("flex min-h-0 flex-col bg-white", className)}>
      <div className="hide-scrollbar flex-1 space-y-8 overflow-y-auto px-6 pb-6 pt-5" aria-live="polite">
        <section className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Topic preview</p>
          <h2 className="text-pretty text-3xl font-display font-bold leading-tight">{topic.title}</h2>
          <TopicMetaTags topic={topic} hasDetailFile={hasDetailFile} className="flex flex-wrap gap-2" />
        </section>

        <section className="space-y-3 border-t border-border pt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Curriculum placement</p>
          <p className="text-sm font-medium text-foreground">{formatIntroducedInLabel(topic.firstIntroducedIn)}</p>
          <p className="text-sm text-muted-foreground">{formatRevisitedInLabel(topic.revisitedIn)}</p>
        </section>

        {!hasDetailFile ? (
          <section className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detail status</p>
            <p className="text-sm text-muted-foreground">
              This topic currently has catalog metadata only. Full lesson sections can be added in a future detail file.
            </p>
          </section>
        ) : null}

        {hasDetailFile && isLoading ? (
          <section className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading preview…</p>
            <p className="text-sm text-muted-foreground">Fetching summary and section highlights.</p>
          </section>
        ) : null}

        {hasDetailFile && loadError ? (
          <section className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Preview unavailable</p>
            <p className="text-sm text-muted-foreground">{loadError}</p>
          </section>
        ) : null}

        {(!hasDetailFile || loadedDetail) && !loadError ? (
          <>
            <section className="space-y-3 border-t border-border pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What it is</p>
              <p className="text-sm leading-relaxed text-foreground">{previewSummary}</p>
            </section>

            <section className="space-y-3 border-t border-border pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Why it matters</p>
              <p className="text-sm leading-relaxed text-foreground">{previewWhyItMatters}</p>
            </section>

            {previewMentalModel ? (
              <section className="space-y-3 border-t border-border pt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mental model</p>
                <p className="text-sm leading-relaxed text-foreground">{clampPreview(previewMentalModel, 180)}</p>
              </section>
            ) : null}

            <section className="space-y-3 border-t border-border pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learning structure</p>
              <p className="text-sm text-muted-foreground">Built for concept clarity first, then patterns, contrasts, and examples.</p>
              {loadedDetail ? (
                <p className="text-xs text-muted-foreground">
                  {loadedDetail.ruleBlocks.length} core rules · {loadedDetail.examples?.length ?? 0} examples · {loadedDetail.tables?.length ?? 0} tables
                  {previewPatternsCount > 0 ? ` · ${previewPatternsCount} usage cues` : ""}
                </p>
              ) : null}
            </section>
          </>
        ) : null}

        {relatedTopics.length > 0 ? (
          <section className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Related topics</p>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.slice(0, 4).map((relatedTopic) => (
                <button
                  key={relatedTopic.id}
                  type="button"
                  onClick={() => onOpenTopic(relatedTopic.id)}
                  className="rounded-none border border-border bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  {relatedTopic.title}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="border-t border-border bg-background/65 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Ready for full lesson mode?</p>
        {fullLessonHref ? (
          <Button asChild className="h-10 w-full rounded-none border border-foreground shadow-[3px_3px_0_#111827] transition-[transform,box-shadow] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111827]">
            <Link href={fullLessonHref}>
              View full lesson
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button disabled className="h-10 w-full rounded-none border border-foreground">
            View full lesson
          </Button>
        )}
      </div>
    </div>
  )
}
