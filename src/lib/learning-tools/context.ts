import type { TopicCatalogItem, TopicDetail } from "@/lib/types/topic"

import type { LearningToolsContext } from "./types"

const clean = (value: string | undefined): string => value?.replace(/\s+/g, " ").trim() ?? ""

const take = (items: Array<string | undefined>, limit: number): string[] =>
  items.map(clean).filter(Boolean).slice(0, limit)

export function buildLearningToolsContext(
  topic: TopicCatalogItem,
  detail: TopicDetail | null,
): LearningToolsContext {
  const summary = clean(detail?.summary ?? topic.summary)
  const translationSources = detail?.examples?.map((example, index) => ({
    label: `German example ${index + 1}`,
    text: example.de.trim(),
  })).filter((source) => source.text) ?? []
  const lessonParts = [
    summary,
    ...take(detail?.ruleBlocks.map((block) => `${block.title}: ${block.content}`) ?? [], 4),
    ...take(detail?.patterns ?? [], 4),
    ...take(detail?.sentenceStructure ?? [], 3),
    ...take(detail?.examples?.map((example) => `${example.de}${example.en ? ` — ${example.en}` : ""}`) ?? [], 6),
  ]

  return {
    topicId: topic.id,
    title: topic.title,
    level: topic.level,
    topicType: topic.topicType,
    hasDetail: Boolean(detail),
    summary,
    lessonText: lessonParts.filter(Boolean).join("\n"),
    translationSources,
  }
}
