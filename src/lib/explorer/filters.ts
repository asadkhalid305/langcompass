import { ALLOWED_DIFFICULTY_STAGES, ALLOWED_LEVELS } from "../constants"
import type { TopicCatalogItem, TopicId } from "../types"
import { normalizeSearchText } from "../utils"
import type { ExplorerFilterOptions, ExplorerFilters } from "./types"

const EMPTY_TOPIC_ID_SET = new Set<TopicId>()

const sortLexicographically = (values: string[]): string[] => [...values].sort((a, b) => a.localeCompare(b))

const normalizeCollection = (values: string[]): Set<string> =>
  new Set(values.map((value) => normalizeSearchText(value)).filter((value) => value.length > 0))

const matchesStringFilter = (value: string, selectedValues: string[]): boolean => {
  if (selectedValues.length === 0) return true
  const normalizedValue = normalizeSearchText(value)
  const normalizedSelection = normalizeCollection(selectedValues)
  return normalizedSelection.has(normalizedValue)
}

export const topicMatchesFilters = (
  topic: TopicCatalogItem,
  filters: ExplorerFilters,
  detailTopicIds?: ReadonlySet<TopicId>,
): boolean => {
  const safeDetailIds = detailTopicIds ?? EMPTY_TOPIC_ID_SET

  if (filters.levels.length > 0 && !filters.levels.includes(topic.level)) return false
  if (filters.difficultyStages.length > 0 && !filters.difficultyStages.includes(topic.difficultyStage)) return false
  if (!matchesStringFilter(topic.category, filters.categories)) return false
  if (!matchesStringFilter(topic.group, filters.groups)) return false
  if (filters.hasDetailFile === "with_detail" && !safeDetailIds.has(topic.id)) return false
  if (filters.hasDetailFile === "without_detail" && safeDetailIds.has(topic.id)) return false

  return true
}

export const applyTopicFilters = (
  topics: TopicCatalogItem[],
  filters: ExplorerFilters,
  detailTopicIds?: ReadonlySet<TopicId>,
): TopicCatalogItem[] => topics.filter((topic) => topicMatchesFilters(topic, filters, detailTopicIds))

export const getExplorerFilterOptions = (
  topics: TopicCatalogItem[],
  detailTopicIds?: ReadonlySet<TopicId>,
): ExplorerFilterOptions => {
  const categories = sortLexicographically(Array.from(new Set(topics.map((topic) => topic.category))))
  const groups = sortLexicographically(Array.from(new Set(topics.map((topic) => topic.group))))
  const levels = ALLOWED_LEVELS.filter((level) => topics.some((topic) => topic.level === level))
  const difficultyStages = ALLOWED_DIFFICULTY_STAGES.filter((stage) =>
    topics.some((topic) => topic.difficultyStage === stage),
  )
  const hasAnyDetail = Boolean(detailTopicIds && detailTopicIds.size > 0)

  return {
    levels,
    categories,
    groups,
    difficultyStages,
    hasDetailFile: hasAnyDetail ? ["any", "with_detail", "without_detail"] : ["any", "without_detail"],
  }
}
