import { access } from "node:fs/promises"
import { constants } from "node:fs"
import { join } from "node:path"
import { ALLOWED_DIFFICULTY_STAGES, ALLOWED_LEVELS } from "../constants"
import { TopicCatalogItem, TopicDetail, TopicId, TopicLevel } from "../types"
import { normalizeSearchText } from "./text"

export { normalizeSearchText } from "./text"

export const getAllLevelsInDisplayOrder = (): TopicLevel[] => [...ALLOWED_LEVELS]

export const getTopicsByLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] =>
  topics.filter((topic) => topic.level === level)

export const getTopicsGroupedByGroup = (topics: TopicCatalogItem[]): Record<string, TopicCatalogItem[]> => {
  const grouped: Record<string, TopicCatalogItem[]> = {}

  for (const topic of topics) {
    const groupKey = topic.group ?? topic.section
    if (!grouped[groupKey]) grouped[groupKey] = []
    grouped[groupKey].push(topic)
  }

  for (const group of Object.keys(grouped)) {
    grouped[group].sort((a, b) => a.title.localeCompare(b.title))
  }

  return grouped
}

export const getTopicById = (topics: TopicCatalogItem[], topicId: TopicId): TopicCatalogItem | undefined =>
  topics.find((topic) => topic.id === topicId)

export const buildSearchText = (topic: TopicCatalogItem | TopicDetail): string => {
  const summary = "summary" in topic && typeof topic.summary === "string" ? [topic.summary] : []
  const patterns = "patterns" in topic && Array.isArray(topic.patterns) ? topic.patterns : []
  const tips = "tips" in topic && Array.isArray(topic.tips) ? topic.tips : []
  const searchHints = "searchHints" in topic && Array.isArray(topic.searchHints) ? topic.searchHints : []
  const mentalModel =
    "mentalModel" in topic && Array.isArray(topic.mentalModel)
      ? topic.mentalModel.flatMap((item) => [item.title, item.content])
      : []
  const coverageChecklist = "coverageChecklist" in topic && Array.isArray(topic.coverageChecklist) ? topic.coverageChecklist : []
  const verbs = "verbs" in topic && Array.isArray(topic.verbs) ? topic.verbs : []
  const prepositions = "prepositions" in topic && Array.isArray(topic.prepositions) ? topic.prepositions : []
  const twoWayPrepositions =
    "twoWayPrepositions" in topic && Array.isArray(topic.twoWayPrepositions) ? topic.twoWayPrepositions : []
  const sentenceStructure =
    "sentenceStructure" in topic && Array.isArray(topic.sentenceStructure) ? topic.sentenceStructure : []
  const specialCases = "specialCases" in topic && Array.isArray(topic.specialCases) ? topic.specialCases : []

  const values = [
    topic.title,
    topic.section,
    topic.topicType,
    topic.group,
    ...(topic.aliases ?? []),
    ...(topic.keywords ?? []),
    ...summary,
    ...(topic.revisitedIn ?? []),
    ...patterns,
    ...mentalModel,
    ...coverageChecklist,
    ...verbs,
    ...prepositions,
    ...twoWayPrepositions,
    ...sentenceStructure,
    ...specialCases,
    ...tips,
    ...searchHints,
  ]

  return values
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
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
