"use client"

import { useSearchParams } from "next/navigation"

import { TopicDetailBreadcrumbContent } from "@/components/topic-detail/topic-detail-breadcrumb-content"
import { buildExplorerHref, parseTopicLevelOrAll } from "@/lib/explorer/navigation"
import type { TopicId, TopicLevel, TopicSection } from "@/lib/types/topic"

interface TopicDetailBreadcrumbProps {
  topicId: TopicId
  topicTitle: string
  defaultLevel: TopicLevel
  defaultSection: TopicSection
}

export function TopicDetailBreadcrumb({ topicId, topicTitle, defaultLevel, defaultSection }: TopicDetailBreadcrumbProps) {
  const searchParams = useSearchParams()
  const contextLevel = parseTopicLevelOrAll(searchParams.get("level")) ?? defaultLevel
  const explorerHref = buildExplorerHref({
    level: contextLevel,
    topicId,
  })

  return (
    <TopicDetailBreadcrumbContent level={contextLevel} section={defaultSection} topicTitle={topicTitle} explorerHref={explorerHref} />
  )
}
