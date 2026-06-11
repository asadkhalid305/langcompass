import { notFound } from "next/navigation"
import { Suspense } from "react"

import { StaticTopicBreadcrumb } from "@/components/topic-detail/static-topic-breadcrumb"
import { TopicDetailContent } from "@/components/topic-detail/topic-detail-content"
import { TopicDetailHeader } from "@/components/topic-detail/topic-detail-header"
import { resolveTopicLinks } from "@/components/topic-detail/topic-detail-page-helpers"
import { TopicDetailSidebar } from "@/components/topic-detail/topic-detail-sidebar"
import { TopicDetailBreadcrumb } from "@/components/topic/topic-detail-breadcrumb"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailById } from "@/lib/data/topic-detail"
import type { TopicId } from "@/lib/types/topic"

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
  const prerequisiteTopics = resolveTopicLinks(detail?.prerequisiteTopicIds, topicsById)
  const relatedTopics = resolveTopicLinks(detail?.relatedTopicIds ?? topic.relatedTopicIds, topicsById)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
        <Suspense fallback={<StaticTopicBreadcrumb topicId={topic.id} topicTitle={topic.title} level={topic.level} section={topic.section} />}>
          <TopicDetailBreadcrumb topicId={topic.id} topicTitle={topic.title} defaultLevel={topic.level} defaultSection={topic.section} />
        </Suspense>

        <TopicDetailHeader topic={topic} detail={detail} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <TopicDetailContent detail={detail} topicId={topic.id} topicsById={topicsById} />
          <TopicDetailSidebar topic={topic} detail={detail} prerequisiteTopics={prerequisiteTopics} relatedTopics={relatedTopics} />
        </div>
      </div>
    </main>
  )
}
