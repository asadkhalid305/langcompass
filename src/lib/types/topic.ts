export type TopicLevel = "A1.1" | "A1.2" | "A2.1" | "A2.2" | "B1.1" | "B1.2" | "B2.1" | "B2.2"
export type TopicLevelOrAll = TopicLevel | "All"

export type TopicDifficultyStage = "intro" | "core" | "expanded" | "combined" | "advanced"
export type TopicProgressionLevel = "A1" | "A2" | "B1" | "B2" | TopicLevel

export type TopicId = string

export type TopicSection = "themes" | "grammar" | "communication"
export type TopicType = "theme" | "grammar" | "communication"

export type TopicGroup = string

export interface TopicLessonRef {
  curriculum: string
  module: string
  lesson?: string
}

export interface TopicCatalogItem {
  id: TopicId
  title: string
  level: TopicLevel
  section: TopicSection
  topicType: TopicType
  group?: TopicGroup
  summary: string
  relatedTopicIds: TopicId[]
  lessonRefs?: TopicLessonRef[]
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
  id?: string
  de: string
  en?: string
  note?: string
}

export interface TopicMentalModelItem {
  title: string
  content: string
}

export interface TopicMemoryHook {
  id: string
  title: string
  content: string
}

export interface TopicCommonMistake {
  id?: string
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
  recommendedSections: string[]
  status?: "draft" | "ready"
}

export interface TopicSourceStyle {
  origin: string
  confidence: "low" | "medium" | "high"
  notes?: string
}

export interface TopicLevelProgressionItem {
  level: TopicProgressionLevel
  concepts: string[]
}

export interface TopicComparison {
  topicId: TopicId
  summary: string
  table?: {
    columns: string[]
    rows: string[][]
  }
}

export interface TopicDetail extends TopicCatalogItem {
  whyItMatters?: string
  prerequisiteTopicIds?: TopicId[]
  ruleBlocks: TopicRuleBlock[]
  tables?: TopicTable[]
  examples?: TopicExample[]
  mentalModel?: TopicMentalModelItem[]
  coverageChecklist?: string[]
  patterns?: string[]
  verbs?: string[]
  prepositions?: string[]
  twoWayPrepositions?: string[]
  sentenceStructure?: string[]
  levelProgression?: TopicLevelProgressionItem[]
  comparisons?: TopicComparison[]
  specialCases?: string[]
  tips?: string[]
  memoryHooks?: TopicMemoryHook[]
  commonMistakes?: TopicCommonMistake[]
  miniQuiz?: TopicMiniQuizItem[]
  searchHints?: string[]
  ui?: TopicUI
  sourceStyle?: TopicSourceStyle
  updatedAt: string
}
