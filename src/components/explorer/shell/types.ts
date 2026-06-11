import type { TopicCatalogItem, TopicDetail, TopicLevel, TopicLevelOrAll, TopicSection } from "@/lib/types/topic"

export interface TopicDetailResponse {
  detail: TopicDetail | null
}

export interface LevelProfile {
  title: string
  description: string
}

export interface SectionSummary {
  section: TopicSection
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
  totalCount: number
  sections: Array<{
    section: TopicSection
    topics: TopicCatalogItem[]
  }>
}
