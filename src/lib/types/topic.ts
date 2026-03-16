export type TopicLevel = "A1.1" | "A1.2" | "A2.1" | "A2.2" | "B1.1" | "B1.2" | "B2.1" | "B2.2"
export type TopicLevelOrAll = TopicLevel | "All"

export type TopicDifficultyStage = "intro" | "expanded" | "combined" | "advanced"

export type TopicId = string

export type TopicCategory = string

export type TopicGroup = string

export interface TopicCatalogItem {
  id: TopicId
  title: string
  level: TopicLevel
  category: TopicCategory
  group: TopicGroup
  firstIntroducedIn: TopicLevel
  revisitedIn: TopicLevel[]
  difficultyStage: TopicDifficultyStage
  aliases: string[]
  keywords: string[]
}

export interface TopicRuleBlock {
  id: string
  title: string
  content: string
}

export interface TopicTable {
  id: string
  title: string
  columns: string[]
  rows: string[][]
}

export interface TopicExample {
  id: string
  de: string
  en?: string
  note?: string
}

export interface TopicMemoryHook {
  id: string
  title: string
  content: string
}

export interface TopicCommonMistake {
  id: string
  wrong: string
  correct: string
  reason: string
}

export interface TopicMiniQuizItem {
  id: string
  type: "multiple_choice" | "fill_in_blank"
  question: string
  options?: string[]
  answer: string
}

export interface TopicUI {
  status: "draft" | "ready"
  recommendedSections: string[]
}

export interface TopicSourceStyle {
  origin: string
  confidence: "low" | "medium" | "high"
  notes?: string
}

export interface TopicDetail extends TopicCatalogItem {
  summary: string
  whyItMatters?: string
  prerequisiteTopicIds?: TopicId[]
  relatedTopicIds?: TopicId[]
  ruleBlocks: TopicRuleBlock[]
  tables?: TopicTable[]
  examples?: TopicExample[]
  patterns?: string[]
  tips?: string[]
  memoryHooks?: TopicMemoryHook[]
  commonMistakes?: TopicCommonMistake[]
  miniQuiz?: TopicMiniQuizItem[]
  searchHints?: string[]
  ui?: TopicUI
  sourceStyle?: TopicSourceStyle
  updatedAt: string
}
