export const LEARNING_TOOL_IDS = ["translate", "explain", "examples", "summarize", "check"] as const

export type LearningToolId = (typeof LEARNING_TOOL_IDS)[number]

export type CapabilityState =
  | "checking"
  | "unsupported"
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "ready"

export type GenerationState = "idle" | "preparing" | "generating" | "success" | "canceled" | "error"

export type ExplanationFocus = "overview" | "word" | "structure" | "form" | "contrast" | "memory" | "table" | "pattern"
export type SummaryFormat = "quick-recap" | "key-rules" | "five-bullets" | "revision-card"
export type ExampleDifficulty = "easier" | "same-level" | "challenge"

export interface LearningToolTaskOptions {
  explanationFocus: ExplanationFocus
  summaryFormat: SummaryFormat
  exampleDifficulty: ExampleDifficulty
  sourceLanguage: string
  targetLanguage: string
}

export const DEFAULT_LEARNING_TOOL_OPTIONS: LearningToolTaskOptions = {
  explanationFocus: "overview",
  summaryFormat: "quick-recap",
  exampleDifficulty: "same-level",
  sourceLanguage: "de",
  targetLanguage: "en",
}

export interface LearningToolSource {
  label: string
  text: string
}

export interface LearningToolResult {
  id: string
  topicId: string
  lessonTitle: string
  tool: LearningToolId
  source: LearningToolSource
  output: string
  structured?: {
    examples?: ExampleOutputItem[]
    sentenceCheck?: SentenceCheckOutput
  }
  options: LearningToolTaskOptions
  generatedBy: "translator" | "summarizer" | "prompt" | "proofreader"
  schemaVersion: 3
  createdAt: string
  saved: boolean
}

export interface LearningToolsWorkspaceState {
  topicId: string
  tool: LearningToolId
  source: LearningToolSource
  learnerText: string
  options: LearningToolTaskOptions
}

export interface ExampleOutputItem {
  german: string
  translation: string
  usageNote: string
}

export interface SentenceCheckOutput {
  original: string
  correction: string
  changed: boolean
  changes: string[]
  explanation: string
  alternative: string | null
}

export interface GeneratedLearningToolOutput {
  text: string
  generatedBy: LearningToolResult["generatedBy"]
  structured?: LearningToolResult["structured"]
}

export interface LearningToolsContext {
  topicId: string
  title: string
  level: string
  topicType: string
  hasDetail: boolean
  summary: string
  lessonText: string
  translationSources: LearningToolSource[]
}

export const LEARNING_TOOL_LABELS: Record<LearningToolId, string> = {
  translate: "Translate",
  explain: "Explain",
  examples: "More examples",
  summarize: "Summarize lesson",
  check: "Check my sentence",
}

export const LEARNING_TOOL_API_LABELS: Record<LearningToolId, string> = {
  translate: "Chrome Translator API · Supported desktop devices",
  summarize: "Chrome Summarizer API · Supported desktop devices",
  explain: "Chrome Prompt API · Availability varies by Chrome version and device",
  examples: "Chrome Prompt API · Availability varies by Chrome version and device",
  check: "Chrome Prompt API · Availability varies by Chrome version and device",
}
