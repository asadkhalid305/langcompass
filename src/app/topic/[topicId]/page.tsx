import { notFound } from "next/navigation"
import { Suspense } from "react"

import { StaticTopicBreadcrumb } from "@/components/topic-detail/static-topic-breadcrumb"
import { LearningToolsWorkspace } from "@/components/topic-detail/learning-tools-workspace"
import { TopicDetailContent } from "@/components/topic-detail/topic-detail-content"
import { TopicDetailHeader } from "@/components/topic-detail/topic-detail-header"
import { resolveTopicLinks } from "@/components/topic-detail/topic-detail-page-helpers"
import { TopicDetailSidebar } from "@/components/topic-detail/topic-detail-sidebar"
import { TopicSequenceNavigation, type TopicSequenceContext, type TopicSequenceItem } from "@/components/topic-detail/topic-sequence-navigation"
import { TopicDetailBreadcrumb } from "@/components/topic/topic-detail-breadcrumb"
import { ALLOWED_LEVEL_OPTIONS } from "@/lib/constants/topic"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailById } from "@/lib/data/topic-detail"
import { buildLearningToolsContext } from "@/lib/learning-tools"
import { getTopicModuleLabel, getTopicNeighbors } from "@/lib/explorer/selectors"
import type { TopicId, TopicLevelOrAll } from "@/lib/types/topic"

interface TopicDetailPageProps {
  params: Promise<{ topicId: string }>
}

export async function generateStaticParams() {
  const topics = await loadTopicCatalog()
  return topics.map((topic) => ({ topicId: topic.id }))
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const [{ topicId }, topics] = await Promise.all([params, loadTopicCatalog()])

  const topicsById = new Map(topics.map((topic) => [topic.id, topic]))
  const topic = topicsById.get(topicId as TopicId)

  if (!topic) {
    notFound()
  }

  const detail = await loadTopicDetailById(topic.id)
  const learningToolsContext = buildLearningToolsContext(topic, detail)
  const prerequisiteTopics = resolveTopicLinks(detail?.prerequisiteTopicIds, topicsById)
  const relatedTopics = resolveTopicLinks(detail?.relatedTopicIds ?? topic.relatedTopicIds, topicsById)
  const toSequenceItem = (item: (typeof topics)[number] | null): TopicSequenceItem | null => item ? {
    id: item.id,
    title: item.title,
    moduleLabel: getTopicModuleLabel(item),
  } : null
  const sequenceContexts = Object.fromEntries(ALLOWED_LEVEL_OPTIONS.map((level) => {
    const neighbors = getTopicNeighbors(topics, topic.id, level)
    return [level, {
      found: neighbors.found,
      previous: toSequenceItem(neighbors.previous),
      next: toSequenceItem(neighbors.next),
    }]
  })) as Record<TopicLevelOrAll, TopicSequenceContext>

  return (
    <main id="main-content" className="min-h-screen min-w-0 scroll-mt-4">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4 md:px-8 md:py-6">
        <Suspense fallback={<StaticTopicBreadcrumb topicId={topic.id} topicTitle={topic.title} level={topic.level} section={topic.section} />}>
          <TopicDetailBreadcrumb topicId={topic.id} topicTitle={topic.title} defaultLevel={topic.level} defaultSection={topic.section} />
        </Suspense>

        <TopicDetailHeader topic={topic} detail={detail} />
        <LearningToolsWorkspace key={topic.id} context={learningToolsContext} />

        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <TopicDetailContent detail={detail} topicId={topic.id} topicsById={topicsById} />
          <TopicDetailSidebar topic={topic} detail={detail} prerequisiteTopics={prerequisiteTopics} relatedTopics={relatedTopics} />
        </div>
        <Suspense>
          <TopicSequenceNavigation contexts={sequenceContexts} defaultLevel={topic.level} />
        </Suspense>
      </div>
    </main>
  )
}
