import type { TopicCatalogItem, TopicDetail, TopicLevel, TopicLevelOrAll } from "@/lib/types/topic"

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
