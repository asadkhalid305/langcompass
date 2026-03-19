import { buildTopicDetailHref } from "@/lib/explorer/navigation"
import type { TopicCatalogItem, TopicDetail, TopicId, TopicProgressionLevel } from "@/lib/types/topic"

export const DETAIL_SECTION_ORDER = [
  "mentalModel",
  "coreRules",
  "articlesAndForms",
  "patternsAndUsage",
  "levelProgression",
  "comparisons",
  "examples",
  "commonMistakes",
  "advancedSpecialCases",
] as const

export type DetailSectionId = (typeof DETAIL_SECTION_ORDER)[number]

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

export const hasComparisonTables = (detail: TopicDetail | null): boolean =>
  hasRows(detail?.comparisons) && detail.comparisons.some((comparison) => hasRows(comparison.table?.rows))

export const hasTables = (detail: TopicDetail | null): boolean => hasRows(detail?.tables)

export const hasCoreRules = (detail: TopicDetail | null): boolean =>
  Boolean(detail?.whyItMatters) || hasRows(detail?.ruleBlocks) || hasRows(detail?.coverageChecklist)

export const hasArticlesAndForms = (detail: TopicDetail | null): boolean => hasTables(detail)

export const hasPatternsAndUsage = (detail: TopicDetail | null): boolean =>
  hasRows(detail?.patterns) ||
  hasRows(detail?.verbs) ||
  hasRows(detail?.prepositions) ||
  hasRows(detail?.twoWayPrepositions) ||
  hasRows(detail?.sentenceStructure)

export const hasAdvancedSpecialCases = (detail: TopicDetail | null): boolean =>
  hasRows(detail?.specialCases) || hasRows(detail?.tips) || hasRows(detail?.memoryHooks)

const DETAIL_SECTION_ALIASES: Record<string, DetailSectionId> = {
  mentalModel: "mentalModel",
  ruleBlocks: "coreRules",
  coreRules: "coreRules",
  tables: "articlesAndForms",
  articlesAndForms: "articlesAndForms",
  patterns: "patternsAndUsage",
  patternsAndUsage: "patternsAndUsage",
  levelProgression: "levelProgression",
  comparisons: "comparisons",
  examples: "examples",
  commonMistakes: "commonMistakes",
  specialCases: "advancedSpecialCases",
  advancedSpecialCases: "advancedSpecialCases",
}

export const resolveDetailSectionOrder = (detail: TopicDetail | null): DetailSectionId[] => {
  const recommended = (detail?.ui?.recommendedSections ?? [])
    .map((section) => DETAIL_SECTION_ALIASES[section])
    .filter((section): section is DetailSectionId => Boolean(section))

  const ordered = recommended.concat(DETAIL_SECTION_ORDER)

  return [...new Set(ordered)]
}

export const formatChecklistLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

export const formatProgressionLevel = (level: TopicProgressionLevel): string =>
  /^[A-Z]\d(?:\.\d)?$/.test(level) ? level : `${level} level`
