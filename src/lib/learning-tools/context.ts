import type { TopicCatalogItem, TopicDetail } from "@/lib/types/topic"

import type { LearningToolsContext } from "./types"

const clean = (value: string | undefined): string => value?.replace(/\s+/g, " ").trim() ?? ""

const take = (items: Array<string | undefined>, limit: number): string[] =>
  items.map(clean).filter(Boolean).slice(0, limit)

const DIALOGUE_TURN_PATTERN = /\b([A-Z]):\s*([\s\S]*?)(?=\s+\b[A-Z]:\s*|$)/gu

export const splitGermanTranslationSource = (value: string): string[] => {
  const normalized = value.trim()
  const turns = Array.from(normalized.matchAll(DIALOGUE_TURN_PATTERN), (match) => clean(match[2]))

  return turns.length > 1 ? turns.filter(Boolean) : [normalized].filter(Boolean)
}

export function buildLearningToolsContext(
  topic: TopicCatalogItem,
  detail: TopicDetail | null,
): LearningToolsContext {
  const summary = clean(detail?.summary ?? topic.summary)
  const translationSources = detail?.examples?.flatMap((example, exampleIndex) =>
    splitGermanTranslationSource(example.de).map((text, turnIndex, turns) => ({
      label: turns.length > 1
        ? `German example ${exampleIndex + 1}, turn ${turnIndex + 1}`
        : `German example ${exampleIndex + 1}`,
      text,
    })),
  ) ?? []
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
