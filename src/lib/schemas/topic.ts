import { z } from "zod"
import {
  TopicComparison,
  TopicCatalogItem,
  TopicCommonMistake,
  TopicDetail,
  TopicDifficultyStage,
  TopicId,
  TopicLessonRef,
  TopicLevel,
  TopicLevelProgressionItem,
  TopicMentalModelItem,
  TopicMemoryHook,
  TopicMiniQuizItem,
  TopicProgressionLevel,
  TopicRuleBlock,
  TopicSection,
  TopicSourceStyle,
  TopicTable,
  TopicType,
  TopicUI,
} from "../types"
import {
  ALLOWED_DIFFICULTY_STAGES,
  ALLOWED_LEVELS,
  ALLOWED_TOPIC_SECTIONS,
  ALLOWED_TOPIC_TYPES,
  LEGACY_CATEGORY_TO_SECTION,
  TOPIC_TYPE_BY_SECTION,
} from "../constants"

const requiredString = z.string().trim().min(1)
const optionalString = z.string().trim().min(1).optional()

const topicLevelSchema = z.enum(ALLOWED_LEVELS)
const topicDifficultyStageSchema = z.enum(ALLOWED_DIFFICULTY_STAGES)
const topicSectionSchema = z.enum(ALLOWED_TOPIC_SECTIONS)
const topicTypeSchema = z.enum(ALLOWED_TOPIC_TYPES)
const topicLevelArraySchema = z.array(topicLevelSchema)
const stringArraySchema = z.array(requiredString).default([])
const requiredStringArraySchema = z.array(requiredString)
const topicProgressionLevelSchema = z.union([
  z.literal("A1"),
  z.literal("A2"),
  z.literal("B1"),
  z.literal("B2"),
  topicLevelSchema,
])

export const TopicIdSchema = z.custom<TopicId>((value) => typeof value === "string" && value.trim().length > 0, {
  message: "Expected a non-empty topic id",
})

const deriveTopicSection = (section: unknown, topicType: unknown, legacyCategory: unknown): TopicSection => {
  if (typeof section === "string" && ALLOWED_TOPIC_SECTIONS.includes(section as TopicSection)) {
    return section as TopicSection
  }

  if (topicType === "theme") return "themes"
  if (topicType === "grammar") return "grammar"
  if (topicType === "communication") return "communication"

  if (typeof legacyCategory === "string") {
    const normalizedCategory = legacyCategory.trim().toLowerCase()
    if (normalizedCategory in LEGACY_CATEGORY_TO_SECTION) {
      return LEGACY_CATEGORY_TO_SECTION[normalizedCategory as keyof typeof LEGACY_CATEGORY_TO_SECTION]
    }
  }

  return "grammar"
}

const normalizeTopicType = (section: TopicSection, topicType: unknown): TopicType => {
  const expectedTopicType = TOPIC_TYPE_BY_SECTION[section]

  if (typeof topicType !== "string") {
    return expectedTopicType
  }

  if (!ALLOWED_TOPIC_TYPES.includes(topicType as TopicType)) {
    return expectedTopicType
  }

  const normalized = topicType as TopicType
  return normalized === expectedTopicType ? normalized : expectedTopicType
}

const buildCatalogSummary = (input: { title: string; level: TopicLevel; section: TopicSection; group: string }): string => {
  const groupLabel = input.group.replace(/[_-]+/g, " ").trim()

  switch (input.section) {
    case "themes":
      return `${input.title} is a theme in ${input.level} that supports the ${groupLabel} module path.`
    case "communication":
      return `${input.title} is a communication topic in ${input.level} for guided practice in ${groupLabel}.`
    case "grammar":
    default:
      return `${input.title} is a grammar topic in ${input.level} that supports the ${groupLabel} learning path.`
  }
}

const baseTopicInputSchema = z.object({
  id: TopicIdSchema,
  title: requiredString,
  level: topicLevelSchema,
  section: topicSectionSchema.optional(),
  topicType: topicTypeSchema.optional(),
  category: requiredString.optional(),
  group: requiredString,
  summary: requiredString.optional(),
  relatedTopicIds: z.array(TopicIdSchema).default([]).optional(),
  lessonRefs: z
    .array(
      z.object({
        curriculum: requiredString,
        module: requiredString,
        lesson: optionalString,
      }),
    )
    .optional(),
  firstIntroducedIn: topicLevelSchema.optional(),
  revisitedIn: topicLevelArraySchema.default([]).optional(),
  difficultyStage: topicDifficultyStageSchema.default("intro").optional(),
  aliases: stringArraySchema,
  keywords: stringArraySchema,
})

const normalizeCatalogItem = (item: z.infer<typeof baseTopicInputSchema>): TopicCatalogItem => {
  const section = deriveTopicSection(item.section, item.topicType, item.category)
  const topicType = normalizeTopicType(section, item.topicType)

  return {
    id: item.id,
    title: item.title,
    level: item.level,
    section,
    topicType,
    group: item.group,
    summary: item.summary ?? buildCatalogSummary({ title: item.title, level: item.level, section, group: item.group }),
    relatedTopicIds: item.relatedTopicIds ?? [],
    lessonRefs: item.lessonRefs,
    firstIntroducedIn: item.firstIntroducedIn ?? item.level,
    revisitedIn: item.revisitedIn ?? [],
    difficultyStage: item.difficultyStage ?? "intro",
    aliases: item.aliases,
    keywords: item.keywords,
  }
}

export const TopicCatalogItemSchema = baseTopicInputSchema.transform((item): TopicCatalogItem => normalizeCatalogItem(item))

export const TopicRuleBlockSchema = z.object({
  id: TopicIdSchema,
  title: requiredString,
  content: requiredString,
})

export const TopicTableSchema = z.object({
  id: TopicIdSchema,
  title: requiredString,
  columns: requiredStringArraySchema,
  rows: z.array(requiredStringArraySchema),
})

export const TopicExampleSchema = z.object({
  id: TopicIdSchema.optional(),
  de: requiredString,
  en: optionalString,
  note: optionalString,
})

export const TopicMentalModelItemSchema: z.ZodType<TopicMentalModelItem> = z.object({
  title: requiredString,
  content: requiredString,
})

export const TopicMemoryHookSchema = z.object({
  id: TopicIdSchema,
  title: requiredString,
  content: requiredString,
})

export const TopicCommonMistakeSchema = z.object({
  id: TopicIdSchema.optional(),
  wrong: requiredString,
  correct: requiredString,
  reason: requiredString,
})

export const TopicMiniQuizItemSchema = z
  .object({
    id: TopicIdSchema,
    type: z.union([z.literal("multiple_choice"), z.literal("fill_in_blank")]),
    question: requiredString,
    options: z.array(requiredString).min(2).optional(),
    answer: requiredString,
  })
  .superRefine((quiz, ctx) => {
    if (quiz.type === "multiple_choice" && !quiz.options?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "multiple_choice quizzes must include options",
        path: ["options"],
      })
    }
    if (quiz.type === "fill_in_blank" && quiz.options && quiz.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "fill_in_blank quizzes should not include options",
        path: ["options"],
      })
    }
  })

export const TopicUISchema = z.object({
  status: z.union([z.literal("draft"), z.literal("ready")]).optional(),
  recommendedSections: z.array(requiredString),
})

export const TopicLessonRefSchema: z.ZodType<TopicLessonRef> = z.object({
  curriculum: requiredString,
  module: requiredString,
  lesson: optionalString,
})

export const TopicSourceStyleSchema = z.object({
  origin: requiredString,
  confidence: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
  notes: optionalString,
})

export const TopicCatalogSchema = z.array(TopicCatalogItemSchema)

export const TopicLevelProgressionItemSchema: z.ZodType<TopicLevelProgressionItem> = z.object({
  level: topicProgressionLevelSchema,
  concepts: z.array(requiredString).min(1),
})

export const TopicComparisonSchema: z.ZodType<TopicComparison> = z.object({
  topicId: TopicIdSchema,
  summary: requiredString,
  table: z
    .object({
      columns: requiredStringArraySchema,
      rows: z.array(requiredStringArraySchema),
    })
    .optional(),
})

const topicDetailInputSchema = baseTopicInputSchema.extend({
  summary: requiredString,
  lessonRefs: z.array(TopicLessonRefSchema).optional(),
  whyItMatters: optionalString,
  prerequisiteTopicIds: z.array(TopicIdSchema).default([]).optional(),
  mentalModel: z.array(TopicMentalModelItemSchema).optional(),
  coverageChecklist: z.array(requiredString).optional(),
  ruleBlocks: z.array(TopicRuleBlockSchema).min(1),
  tables: z.array(TopicTableSchema).optional(),
  examples: z.array(TopicExampleSchema).optional(),
  patterns: z.array(requiredString).optional(),
  verbs: z.array(requiredString).optional(),
  prepositions: z.array(requiredString).optional(),
  twoWayPrepositions: z.array(requiredString).optional(),
  sentenceStructure: z.array(requiredString).optional(),
  levelProgression: z.array(TopicLevelProgressionItemSchema).optional(),
  comparisons: z.array(TopicComparisonSchema).optional(),
  specialCases: z.array(requiredString).optional(),
  tips: z.array(requiredString).optional(),
  memoryHooks: z.array(TopicMemoryHookSchema).optional(),
  commonMistakes: z.array(TopicCommonMistakeSchema).optional(),
  miniQuiz: z.array(TopicMiniQuizItemSchema).optional(),
  searchHints: z.array(requiredString).optional(),
  ui: TopicUISchema.optional(),
  sourceStyle: TopicSourceStyleSchema.optional(),
  updatedAt: requiredString,
})

export const TopicDetailSchema = topicDetailInputSchema.transform((item): TopicDetail => ({
  ...normalizeCatalogItem(item),
  whyItMatters: item.whyItMatters,
  prerequisiteTopicIds: item.prerequisiteTopicIds,
  ruleBlocks: item.ruleBlocks,
  tables: item.tables,
  examples: item.examples,
  mentalModel: item.mentalModel,
  coverageChecklist: item.coverageChecklist,
  patterns: item.patterns,
  verbs: item.verbs,
  prepositions: item.prepositions,
  twoWayPrepositions: item.twoWayPrepositions,
  sentenceStructure: item.sentenceStructure,
  levelProgression: item.levelProgression,
  comparisons: item.comparisons,
  specialCases: item.specialCases,
  tips: item.tips,
  memoryHooks: item.memoryHooks,
  commonMistakes: item.commonMistakes,
  miniQuiz: item.miniQuiz,
  searchHints: item.searchHints,
  ui: item.ui,
  sourceStyle: item.sourceStyle,
  updatedAt: item.updatedAt,
}))

export const TopicDetailArraySchema = z.array(TopicDetailSchema)

export const TopicDifficultyStageSchema: z.ZodType<TopicDifficultyStage> = topicDifficultyStageSchema
export const TopicLevelSchema: z.ZodType<TopicLevel> = topicLevelSchema
export const TopicProgressionLevelSchema: z.ZodType<TopicProgressionLevel> = topicProgressionLevelSchema
export const TopicSectionSchema: z.ZodType<TopicSection> = topicSectionSchema
export const TopicTypeSchema: z.ZodType<TopicType> = topicTypeSchema
