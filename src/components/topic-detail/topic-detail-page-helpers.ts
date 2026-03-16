import { buildTopicDetailHref } from "@/lib/explorer/navigation"
import type { TopicCatalogItem, TopicId } from "@/lib/types/topic"

export interface TopicLinkItem {
  id: TopicId
  title: string
  href: string | null
}

const fallbackTitleFromId = (id: string): string =>
  id
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

export const formatDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(parsed)
}

export const resolveTopicLinks = (topicIds: TopicId[] | undefined, topicsById: Map<TopicId, TopicCatalogItem>): TopicLinkItem[] =>
  (topicIds ?? []).map((topicId) => {
    const foundTopic = topicsById.get(topicId)
    if (!foundTopic) {
      return {
        id: topicId,
        title: fallbackTitleFromId(topicId),
        href: null,
      }
    }

    return {
      id: topicId,
      title: foundTopic.title,
      href: buildTopicDetailHref(foundTopic.id, {
        level: foundTopic.level,
        group: foundTopic.group,
      }),
    }
  })

export const hasRows = <T,>(value: T[] | undefined): value is T[] => Array.isArray(value) && value.length > 0
