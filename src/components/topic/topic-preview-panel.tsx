import Link from "next/link"
import { ArrowRight, BookOpenText } from "lucide-react"
import type { ReactNode } from "react"

import { LangCompassMark } from "@/components/branding/langcompass-logo"
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
  `${topic.title} sits in the ${topic.level} ${topic.section} section of the LangCompass map.`

const fallbackWhyItMatters = (topic: TopicCatalogItem): string =>
  `This topic supports ${topic.section.replace(/[_-]+/g, " ")} fluency and appears in guided practice across the curriculum.`

interface PreviewInfoSectionProps {
  title: string
  children: ReactNode
}

function PreviewInfoSection({ title, children }: PreviewInfoSectionProps) {
  return (
    <section className="border border-white/15 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">{title}</p>
      <div className="mt-3 text-sm leading-relaxed text-white">{children}</div>
    </section>
  )
}

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

  const previewSummary = clampPreview(detail?.summary ?? topic.summary ?? fallbackSummary(topic), 250)
  const previewWhyItMatters = clampPreview(detail?.whyItMatters ?? fallbackWhyItMatters(topic), 220)
  const loadedDetail = hasDetailFile && detail ? detail : null
  const previewMentalModel = loadedDetail?.mentalModel?.[0]?.content
  const previewPatternsCount =
    (loadedDetail?.patterns?.length ?? 0) +
    (loadedDetail?.verbs?.length ?? 0) +
    (loadedDetail?.prepositions?.length ?? 0) +
    (loadedDetail?.twoWayPrepositions?.length ?? 0)

  return (
    <div className={cn("flex min-h-0 flex-col bg-[#111827] text-white", className)}>
      <div className="hide-scrollbar flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-5" aria-live="polite">
        <section className="border border-white/15 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Topic preview</p>
              <h2 className="mt-3 text-pretty text-2xl font-display font-bold leading-tight text-white">{topic.title}</h2>
            </div>
            <LangCompassMark className="h-10 w-10" />
          </div>
          <TopicMetaTags topic={topic} hasDetailFile={hasDetailFile} tone="dark" className="mt-4 flex flex-wrap gap-2" />
        </section>

        <PreviewInfoSection title="Curriculum placement">
          <p className="font-medium">{formatIntroducedInLabel(topic.firstIntroducedIn)}</p>
          <p className="mt-1 text-white/70">{formatRevisitedInLabel(topic.revisitedIn)}</p>
        </PreviewInfoSection>

        {!hasDetailFile ? (
          <PreviewInfoSection title="Detail status">
            <p className="text-white/75">
              This topic currently has catalog metadata only. Full lesson sections can be added in a future detail file.
            </p>
          </PreviewInfoSection>
        ) : null}

        {hasDetailFile && isLoading ? (
          <PreviewInfoSection title="Loading preview…">
            <p className="text-white/75">Fetching summary and section highlights.</p>
          </PreviewInfoSection>
        ) : null}

        {hasDetailFile && loadError ? (
          <PreviewInfoSection title="Preview unavailable">
            <p className="text-red-100">{loadError}</p>
          </PreviewInfoSection>
        ) : null}

        {(!hasDetailFile || loadedDetail) && !loadError ? (
          <>
            <PreviewInfoSection title="What it is">
              <p>{previewSummary}</p>
            </PreviewInfoSection>

            <PreviewInfoSection title="Why it matters">
              <p>{previewWhyItMatters}</p>
            </PreviewInfoSection>

            {previewMentalModel ? (
              <PreviewInfoSection title="Lesson focus">
                <p>{clampPreview(previewMentalModel, 180)}</p>
              </PreviewInfoSection>
            ) : null}

            <PreviewInfoSection title="Learning structure">
              <p className="text-white/75">
                Built for a clear starting point, practical language, connections, and examples.
              </p>
              {loadedDetail ? (
                <p className="mt-3 text-xs text-white/60">
                  {loadedDetail.ruleBlocks.length} building blocks · {loadedDetail.examples?.length ?? 0} examples · {loadedDetail.tables?.length ?? 0} reference tables
                  {previewPatternsCount > 0 ? ` · ${previewPatternsCount} usage cues` : ""}
                </p>
              ) : null}
            </PreviewInfoSection>
          </>
        ) : null}

        {relatedTopics.length > 0 ? (
          <PreviewInfoSection title="Related topics">
            <div className="flex flex-wrap gap-2">
              {relatedTopics.slice(0, 4).map((relatedTopic) => (
                <button
                  key={relatedTopic.id}
                  type="button"
                  onClick={() => onOpenTopic(relatedTopic.id)}
                  className="rounded-none border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {relatedTopic.title}
                </button>
              ))}
            </div>
          </PreviewInfoSection>
        ) : null}
      </div>

      <div className="border-t border-white/15 bg-[#111827] p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-white/60">Ready for full lesson mode?</p>
        {fullLessonHref ? (
          <Button asChild className="h-10 w-full rounded-none border border-white bg-white text-[#111827] transition-colors hover:bg-white/90">
            <Link href={fullLessonHref}>
              View full lesson
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button disabled className="h-10 w-full rounded-none border border-white/30 bg-white/10">
            View full lesson
          </Button>
        )}
      </div>
    </div>
  )
}
