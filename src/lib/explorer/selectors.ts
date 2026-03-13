import { ALLOWED_LEVELS } from "../constants"
import type { TopicCatalogItem, TopicLevel } from "../types"
import { applyTopicFilters } from "./filters"
import { searchTopics } from "./search"
import type { BuildExplorerDataOptions, ExplorerDerivedData, ExplorerState, ExplorerTopicSection, LevelTopicCounts } from "./types"

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

const countBy = (topics: TopicCatalogItem[], selector: (topic: TopicCatalogItem) => string): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const topic of topics) {
    const key = selector(topic)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

const groupByGroup = (topics: TopicCatalogItem[]): Map<string, TopicCatalogItem[]> => {
  const grouped = new Map<string, TopicCatalogItem[]>()

  for (const topic of topics) {
    const current = grouped.get(topic.group)
    if (current) {
      current.push(topic)
      continue
    }
    grouped.set(topic.group, [topic])
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

export const getGroupedTopicSectionsForLevel = (
  topics: TopicCatalogItem[],
  level: TopicLevel,
): ExplorerTopicSection[] => {
  const introduced = getTopicsIntroducedInLevel(topics, level)
  const revisited = getTopicsRevisitedInLevel(topics, level)

  const introducedByGroup = groupByGroup(introduced)
  const revisitedByGroup = groupByGroup(revisited)
  const allGroups = Array.from(new Set([...introducedByGroup.keys(), ...revisitedByGroup.keys()])).sort((a, b) =>
    a.localeCompare(b),
  )

  return allGroups.map((group) => {
    const introducedTopics = sortTopicsByTitle(introducedByGroup.get(group) ?? [])
    const revisitedTopics = sortTopicsByTitle(revisitedByGroup.get(group) ?? [])
    const topicsInGroup = sortTopicsByTitle(dedupeTopicsById([...introducedTopics, ...revisitedTopics]))

    return {
      group,
      introducedTopics,
      revisitedTopics,
      topics: topicsInGroup,
    }
  })
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
    byCategory: countBy(allLevelTopics, (topic) => topic.category),
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

export const buildExplorerData = (
  topics: TopicCatalogItem[],
  state: ExplorerState,
  options: BuildExplorerDataOptions = {},
): ExplorerDerivedData => {
  const levelTopics = getTopicsForSelectedLevel(topics, state.selectedLevel)
  const filteredTopics = applyTopicFilters(levelTopics, state.activeFilters, options.detailTopicIds)
  const searchResults = searchTopics(filteredTopics, state.searchQuery, options.searchConfig)
  const visibleTopics = searchResults.map((result) => result.topic)

  return {
    state,
    visibleTopics,
    searchResults,
    introducedTopics: getTopicsIntroducedInLevel(visibleTopics, state.selectedLevel),
    revisitedTopics: getTopicsRevisitedInLevel(visibleTopics, state.selectedLevel),
    groupedSections: getGroupedTopicSectionsForLevel(visibleTopics, state.selectedLevel),
    selectedTopic: state.selectedTopicId ? topics.find((topic) => topic.id === state.selectedTopicId) ?? null : null,
    levelCounts: getLevelTopicCounts(topics, state.selectedLevel),
  }
}
