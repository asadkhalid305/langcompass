import type { TopicCatalogItem, TopicDetail, TopicId, TopicLevel, TopicLevelOrAll } from "@/lib/types/topic"

export interface LangCompassShellRouteState {
  selectedLevel?: TopicLevelOrAll
  focusedGroup?: string | null
  selectedTopicId?: TopicId | null
  searchQuery?: string
}

export interface TopicDetailResponse {
  detail: TopicDetail | null
}

export interface LevelProfile {
  title: string
  description: string
}

export interface GroupSummary {
  group: string
  category: string
  totalCount: number
  introducedCount: number
  revisitedCount: number
}

export type LevelCounts = Record<
  TopicLevelOrAll,
  {
    totalCount: number
    introducedCount: number
    revisitedCount: number
  }
>

export interface SearchResultGroup {
  level: TopicLevel
  topics: TopicCatalogItem[]
}
