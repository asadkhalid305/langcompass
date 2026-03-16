"use client"

import { useSearchParams } from "next/navigation"

import { TopicDetailBreadcrumbContent } from "@/components/topic-detail/topic-detail-breadcrumb-content"
import { buildExplorerHref, parseTopicLevel } from "@/lib/explorer/navigation"
import type { TopicId, TopicLevel } from "@/lib/types/topic"

interface TopicDetailBreadcrumbProps {
  topicId: TopicId
  topicTitle: string
  defaultLevel: TopicLevel
  defaultGroup: string
}

export function TopicDetailBreadcrumb({ topicId, topicTitle, defaultLevel, defaultGroup }: TopicDetailBreadcrumbProps) {
  const searchParams = useSearchParams()
  const contextLevel = parseTopicLevel(searchParams.get("level")) ?? defaultLevel
  const requestedGroup = searchParams.get("group")?.trim()
  const contextGroup = requestedGroup && requestedGroup.length > 0 ? requestedGroup : defaultGroup
  const explorerHref = buildExplorerHref({
    level: contextLevel,
    group: contextGroup,
    topicId,
  })

  return (
    <TopicDetailBreadcrumbContent level={contextLevel} group={contextGroup} topicTitle={topicTitle} explorerHref={explorerHref} />
  )
}
