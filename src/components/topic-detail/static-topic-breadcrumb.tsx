import { TopicDetailBreadcrumbContent } from "@/components/topic-detail/topic-detail-breadcrumb-content"
import { buildExplorerHref } from "@/lib/explorer/navigation"
import type { TopicCatalogItem, TopicId } from "@/lib/types/topic"

interface StaticTopicBreadcrumbProps {
  topicId: TopicId
  topicTitle: string
  level: TopicCatalogItem["level"]
  section: TopicCatalogItem["section"]
}

export function StaticTopicBreadcrumb({ topicId, topicTitle, level, section }: StaticTopicBreadcrumbProps) {
  const explorerHref = buildExplorerHref({
    level,
    topicId,
  })

  return (
    <TopicDetailBreadcrumbContent level={level} section={section} topicTitle={topicTitle} explorerHref={explorerHref} />
  )
}
