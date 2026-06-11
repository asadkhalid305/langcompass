import { ALLOWED_LEVELS, TOPIC_SECTION_ORDER } from "../constants"
import type { TopicCatalogItem, TopicLevel, TopicSection } from "../types"
import type { ExplorerLevelSection, LevelTopicCounts } from "./types"

const sortTopicsByTitle = (topics: TopicCatalogItem[]): TopicCatalogItem[] =>
  [...topics].sort((a, b) => a.title.localeCompare(b.title))

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
  sortTopicsByTitle(topics.filter((topic) => topic.firstIntroducedIn === level))

export const getTopicsRevisitedInLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] =>
  sortTopicsByTitle(topics.filter((topic) => topic.firstIntroducedIn !== level && topic.revisitedIn.includes(level)))

export const getTopicsForSelectedLevel = (topics: TopicCatalogItem[], level: TopicLevel): TopicCatalogItem[] => {
  const introduced = getTopicsIntroducedInLevel(topics, level)
  const revisited = getTopicsRevisitedInLevel(topics, level)
  return sortTopicsByTitle(dedupeTopicsById([...introduced, ...revisited]))
}

export const getLevelSections = (
  topics: TopicCatalogItem[],
  level: TopicLevel,
): ExplorerLevelSection[] => {
  const introduced = getTopicsIntroducedInLevel(topics, level)
  const revisited = getTopicsRevisitedInLevel(topics, level)

  return TOPIC_SECTION_ORDER.map((section) => {
    const introducedTopics = sortTopicsByTitle(introduced.filter((topic) => topic.section === section))
    const revisitedTopics = sortTopicsByTitle(revisited.filter((topic) => topic.section === section))
    const topicsInSection = sortTopicsByTitle(dedupeTopicsById([...introducedTopics, ...revisitedTopics]))

    return {
      section,
      introducedTopics,
      revisitedTopics,
      topics: topicsInSection,
    }
  }).filter((section) => section.topics.length > 0)
}

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
