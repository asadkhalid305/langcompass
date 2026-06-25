import { ALLOWED_LEVELS, TOPIC_SECTION_ORDER } from "../constants"
import type { TopicCatalogItem, TopicLevel, TopicSection } from "../types"
import type { ExplorerLevelSection, LevelTopicCounts } from "./types"

const levelOrder = new Map<TopicLevel, number>(ALLOWED_LEVELS.map((level, index) => [level, index]))
const sectionOrder = new Map<TopicSection, number>(TOPIC_SECTION_ORDER.map((section, index) => [section, index]))

const parseModuleOrder = (topic: TopicCatalogItem): number => {
  const moduleLabel = topic.lessonRefs?.[0]?.module
  const match = typeof moduleLabel === "string" ? /^M(\d+)$/i.exec(moduleLabel.trim()) : null
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

export const getTopicModuleLabel = (topic: TopicCatalogItem): string | null => {
  const moduleLabel = topic.lessonRefs?.[0]?.module?.trim()
  return moduleLabel ? moduleLabel.toUpperCase() : null
}

export const compareTopicsByCurriculumOrder = (a: TopicCatalogItem, b: TopicCatalogItem): number => {
  const levelDelta = (levelOrder.get(a.level) ?? Number.MAX_SAFE_INTEGER) - (levelOrder.get(b.level) ?? Number.MAX_SAFE_INTEGER)
  if (levelDelta !== 0) return levelDelta

  const moduleDelta = parseModuleOrder(a) - parseModuleOrder(b)
  if (moduleDelta !== 0) return moduleDelta

  const sectionDelta = (sectionOrder.get(a.section) ?? Number.MAX_SAFE_INTEGER) - (sectionOrder.get(b.section) ?? Number.MAX_SAFE_INTEGER)
  if (sectionDelta !== 0) return sectionDelta

  return a.title.localeCompare(b.title)
}

const sortTopicsByCurriculumOrder = (topics: TopicCatalogItem[]): TopicCatalogItem[] =>
  [...topics].sort(compareTopicsByCurriculumOrder)

const dedupeTopicsById = (topics: TopicCatalogItem[]): TopicCatalogItem[] => {
  const seen = new Set<string>()
  const deduped: TopicCatalogItem[] = []

  for (const topic of topics) {
    if (seen.has(topic.id)) continue
    seen.add(topic.id)
    deduped.push(topic)
  }

  return deduped
}

const countSections = (topics: TopicCatalogItem[]): Record<TopicSection, number> => {
  const counts = {
    themes: 0,
    grammar: 0,
    communication: 0,
  } satisfies Record<TopicSection, number>

  for (const topic of topics) {
    counts[topic.section] += 1
  }

  return counts
}

export const getTopicsIntroducedInLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] =>
  sortTopicsByCurriculumOrder(topics.filter((topic) => topic.firstIntroducedIn === level))

export const getTopicsRevisitedInLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] =>
  sortTopicsByCurriculumOrder(topics.filter((topic) => topic.firstIntroducedIn !== level && topic.revisitedIn.includes(level)))

export const getTopicsForSelectedLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] => {
  const introduced = getTopicsIntroducedInLevel(topics, level)
  const revisited = getTopicsRevisitedInLevel(topics, level)
  return sortTopicsByCurriculumOrder(dedupeTopicsById([...introduced, ...revisited]))
}

export const getLevelSections = (
  topics: TopicCatalogItem[],
  level: TopicLevel,
): ExplorerLevelSection[] => {
  const introduced = getTopicsIntroducedInLevel(topics, level)
  const revisited = getTopicsRevisitedInLevel(topics, level)

  return TOPIC_SECTION_ORDER.map((section) => {
    const introducedTopics = sortTopicsByCurriculumOrder(introduced.filter((topic) => topic.section === section))
    const revisitedTopics = sortTopicsByCurriculumOrder(revisited.filter((topic) => topic.section === section))
    const topicsInSection = sortTopicsByCurriculumOrder(dedupeTopicsById([...introducedTopics, ...revisitedTopics]))

    return {
      section,
      introducedTopics,
      revisitedTopics,
      topics: topicsInSection,
    }
  }).filter((section) => section.topics.length > 0)
}

export const getLevelSectionsForAllLevels = (topics: TopicCatalogItem[]): ExplorerLevelSection[] =>
  TOPIC_SECTION_ORDER.map((section) => {
    const topicsInSection = sortTopicsByCurriculumOrder(topics.filter((topic) => topic.section === section))

    return {
      section,
      introducedTopics: topicsInSection,
      revisitedTopics: [],
      topics: topicsInSection,
    }
  }).filter((section) => section.topics.length > 0)

export const getLevelTopicCounts = (topics: TopicCatalogItem[], level: TopicLevel): LevelTopicCounts => {
  const introduced = getTopicsIntroducedInLevel(topics, level)
  const revisited = getTopicsRevisitedInLevel(topics, level)
  const allLevelTopics = dedupeTopicsById([...introduced, ...revisited])

  return {
    level,
    introducedCount: introduced.length,
    revisitedCount: revisited.length,
    totalCount: allLevelTopics.length,
    bySection: countSections(allLevelTopics),
  }
}

export const getAllLevelTopicCounts = (topics: TopicCatalogItem[]): Record<TopicLevel, LevelTopicCounts> => {
  return ALLOWED_LEVELS.reduce(
    (acc, level) => {
      acc[level] = getLevelTopicCounts(topics, level)
      return acc
    },
    {} as Record<TopicLevel, LevelTopicCounts>,
  )
}
