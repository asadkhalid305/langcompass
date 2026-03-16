import { TopicDetailBreadcrumbContent } from "@/components/topic-detail/topic-detail-breadcrumb-content"
import { buildExplorerHref } from "@/lib/explorer/navigation"
import type { TopicCatalogItem, TopicId } from "@/lib/types/topic"

interface StaticTopicBreadcrumbProps {
  topicId: TopicId
  topicTitle: string
  level: TopicCatalogItem["level"]
  group: string
}

export function StaticTopicBreadcrumb({ topicId, topicTitle, level, group }: StaticTopicBreadcrumbProps) {
  const explorerHref = buildExplorerHref({
    level,
    group,
    topicId,
  })

  return (
    <TopicDetailBreadcrumbContent level={level} group={group} topicTitle={topicTitle} explorerHref={explorerHref} />
  )
}
