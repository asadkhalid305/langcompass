import type { TopicCatalogItem, TopicLevel } from "../types"
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

export interface ExplorerTopicSection {
  group: string
  introducedTopics: TopicCatalogItem[]
  revisitedTopics: TopicCatalogItem[]
  topics: TopicCatalogItem[]
}

export interface LevelTopicCounts {
  level: TopicLevel
  introducedCount: number
  revisitedCount: number
  totalCount: number
  byCategory: Record<string, number>
  byGroup: Record<string, number>
}
