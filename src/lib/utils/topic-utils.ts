import { access } from "node:fs/promises"
import { constants } from "node:fs"
import { join } from "node:path"
import { ALLOWED_DIFFICULTY_STAGES, ALLOWED_LEVELS } from "../constants"
import { TopicCatalogItem, TopicDetail, TopicId, TopicLevel } from "../types"

export const getAllLevelsInDisplayOrder = (): TopicLevel[] => [...ALLOWED_LEVELS]

export const getTopicsByLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] =>
  topics.filter((topic) => topic.level === level)

export const getTopicsGroupedByGroup = (topics: TopicCatalogItem[]): Record<string, TopicCatalogItem[]> => {
  const grouped: Record<string, TopicCatalogItem[]> = {}

  for (const topic of topics) {
    if (!grouped[topic.group]) grouped[topic.group] = []
    grouped[topic.group].push(topic)
  }

  for (const group of Object.keys(grouped)) {
    grouped[group].sort((a, b) => a.title.localeCompare(b.title))
  }

  return grouped
}

export const getTopicById = (topics: TopicCatalogItem[], topicId: TopicId): TopicCatalogItem | undefined =>
  topics.find((topic) => topic.id === topicId)

export const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

export const buildSearchText = (topic: TopicCatalogItem | TopicDetail): string => {
  const summary = "summary" in topic && typeof topic.summary === "string" ? [topic.summary] : []
  const patterns = "patterns" in topic && Array.isArray(topic.patterns) ? topic.patterns : []
  const tips = "tips" in topic && Array.isArray(topic.tips) ? topic.tips : []
  const searchHints = "searchHints" in topic && Array.isArray(topic.searchHints) ? topic.searchHints : []

  const values = [
    topic.title,
    topic.category,
    topic.group,
    ...(topic.aliases ?? []),
    ...(topic.keywords ?? []),
    ...summary,
    ...(topic.revisitedIn ?? []),
    ...patterns,
    ...tips,
    ...searchHints,
  ]

  return values
    .filter((entry) => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => normalizeSearchText(entry))
    .join(" ")
}

export const hasTopicDetailData = async (topicId: TopicId): Promise<boolean> => {
  const detailPath = join(process.cwd(), "data", "topic-details", `${topicId}.json`)

  try {
    await access(detailPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export const getDifficultyStages = (): string[] => [...ALLOWED_DIFFICULTY_STAGES]
