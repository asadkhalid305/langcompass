import type { TopicCatalogItem, TopicLevel, TopicSection } from "../types"
export type TopicSearchBoostField = "title" | "alias" | null

export interface TopicSearchConfig {
  threshold?: number
  minMatchCharLength?: number
  limit?: number
  exactMatchBoost?: boolean
}

export interface TopicSearchRunOptions {
  limit?: number
  exactMatchBoost?: boolean
}

export interface TopicSearchResult {
  topic: TopicCatalogItem
  score: number
  rawScore: number
  isExactBoosted: boolean
  boostedField: TopicSearchBoostField
}

export interface ExplorerTopicGroup {
  section: TopicSection
  group: string
  introducedTopics: TopicCatalogItem[]
  revisitedTopics: TopicCatalogItem[]
  topics: TopicCatalogItem[]
}

export interface ExplorerLevelSection {
  section: TopicSection
  introducedTopics: TopicCatalogItem[]
  revisitedTopics: TopicCatalogItem[]
  topics: TopicCatalogItem[]
  groups: ExplorerTopicGroup[]
}

export interface LevelTopicCounts {
  level: TopicLevel
  introducedCount: number
  revisitedCount: number
  totalCount: number
  bySection: Record<TopicSection, number>
  byGroup: Record<string, number>
}
