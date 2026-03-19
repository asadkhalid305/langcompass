import { ALLOWED_LEVELS, TOPIC_SECTION_ORDER } from "../constants"
import type { TopicCatalogItem, TopicLevel, TopicSection } from "../types"
import type { ExplorerLevelSection, ExplorerTopicGroup, LevelTopicCounts } from "./types"

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

const countBy = (topics: TopicCatalogItem[], selector: (topic: TopicCatalogItem) => string): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const topic of topics) {
    const key = selector(topic)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

const groupBy = (topics: TopicCatalogItem[], selector: (topic: TopicCatalogItem) => string): Map<string, TopicCatalogItem[]> => {
  const grouped = new Map<string, TopicCatalogItem[]>()

  for (const topic of topics) {
    const key = selector(topic)
    const current = grouped.get(key)
    if (current) {
      current.push(topic)
      continue
    }
    grouped.set(key, [topic])
  }

  return grouped
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

const buildExplorerTopicGroups = (
  introduced: TopicCatalogItem[],
  revisited: TopicCatalogItem[],
  section: TopicSection,
): ExplorerTopicGroup[] => {
  const introducedByGroup = groupBy(introduced, (topic) => topic.group)
  const revisitedByGroup = groupBy(revisited, (topic) => topic.group)
  const allGroups = Array.from(new Set([...introducedByGroup.keys(), ...revisitedByGroup.keys()])).sort((a, b) =>
    a.localeCompare(b),
  )

  return allGroups.map((group) => {
    const introducedTopics = sortTopicsByTitle(introducedByGroup.get(group) ?? [])
    const revisitedTopics = sortTopicsByTitle(revisitedByGroup.get(group) ?? [])

    return {
      section,
      group,
      introducedTopics,
      revisitedTopics,
      topics: sortTopicsByTitle(dedupeTopicsById([...introducedTopics, ...revisitedTopics])),
    }
  })
}

export const getLevelSectionGroups = (
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
      groups: buildExplorerTopicGroups(introducedTopics, revisitedTopics, section),
    }
  }).filter((sectionGroup) => sectionGroup.topics.length > 0)
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
    byGroup: countBy(allLevelTopics, (topic) => topic.group),
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
