import type { TopicCatalogItem, TopicDifficultyStage, TopicId, TopicLevel } from "../types"

export type ExplorerDetailFileFilter = "any" | "with_detail" | "without_detail"
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

export interface ExplorerFilters {
  levels: TopicLevel[]
  categories: string[]
  groups: string[]
  difficultyStages: TopicDifficultyStage[]
  hasDetailFile: ExplorerDetailFileFilter
}

export interface ExplorerState {
  selectedLevel: TopicLevel
  searchQuery: string
  activeFilters: ExplorerFilters
  selectedTopicId: TopicId | null
}

export interface ExplorerStatePatch extends Partial<Omit<ExplorerState, "activeFilters">> {
  activeFilters?: Partial<ExplorerFilters>
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

export interface ExplorerDerivedData {
  state: ExplorerState
  visibleTopics: TopicCatalogItem[]
  searchResults: TopicSearchResult[]
  introducedTopics: TopicCatalogItem[]
  revisitedTopics: TopicCatalogItem[]
  groupedSections: ExplorerTopicSection[]
  selectedTopic: TopicCatalogItem | null
  levelCounts: LevelTopicCounts
}

export interface ExplorerFilterOptions {
  levels: TopicLevel[]
  categories: string[]
  groups: string[]
  difficultyStages: TopicDifficultyStage[]
  hasDetailFile: ExplorerDetailFileFilter[]
}

export interface BuildExplorerDataOptions {
  detailTopicIds?: ReadonlySet<TopicId>
  searchConfig?: TopicSearchConfig
}
