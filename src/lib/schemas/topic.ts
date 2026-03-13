import { z } from "zod"
import {
  TopicCatalogItem,
  TopicCommonMistake,
  TopicDetail,
  TopicDifficultyStage,
  TopicId,
  TopicLevel,
  TopicMemoryHook,
  TopicMiniQuizItem,
  TopicRuleBlock,
  TopicSourceStyle,
  TopicTable,
  TopicUI,
} from "../../types"
import { ALLOWED_DIFFICULTY_STAGES, ALLOWED_LEVELS } from "../constants"

const requiredString = z.string().trim().min(1)
const optionalString = z.string().trim().min(1).optional()

const topicLevelSchema = z.enum(ALLOWED_LEVELS)
const topicDifficultyStageSchema = z.enum(ALLOWED_DIFFICULTY_STAGES)
const topicLevelArraySchema = z.array(topicLevelSchema)
const stringArraySchema = z.array(requiredString).default([])

export const TopicIdSchema = z.custom<TopicId>((value) => typeof value === "string" && value.trim().length > 0, {
  message: "Expected a non-empty topic id",
})

export const TopicCatalogItemSchema: z.ZodType<TopicCatalogItem> = z.object({
  id: TopicIdSchema,
  title: requiredString,
  level: topicLevelSchema,
  category: requiredString,
  group: requiredString,
  firstIntroducedIn: topicLevelSchema,
  revisitedIn: topicLevelArraySchema,
  difficultyStage: topicDifficultyStageSchema,
  aliases: stringArraySchema,
  keywords: stringArraySchema,
})

export const TopicRuleBlockSchema: z.ZodType<TopicRuleBlock> = z.object({
  id: TopicIdSchema,
  title: requiredString,
  content: requiredString,
})

export const TopicTableSchema: z.ZodType<TopicTable> = z.object({
  id: TopicIdSchema,
  title: requiredString,
  columns: stringArraySchema,
  rows: z.array(stringArraySchema),
})

export const TopicExampleSchema = z.object({
  id: TopicIdSchema,
  de: requiredString,
  en: optionalString,
  note: optionalString,
})

export const TopicMemoryHookSchema: z.ZodType<TopicMemoryHook> = z.object({
  id: TopicIdSchema,
  title: requiredString,
  content: requiredString,
})

export const TopicCommonMistakeSchema: z.ZodType<TopicCommonMistake> = z.object({
  id: TopicIdSchema,
  wrong: requiredString,
  correct: requiredString,
  reason: requiredString,
})

export const TopicMiniQuizItemSchema: z.ZodType<TopicMiniQuizItem> = z
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

export const TopicUISchema: z.ZodType<TopicUI> = z.object({
  status: z.union([z.literal("draft"), z.literal("ready")]),
  recommendedSections: z.array(requiredString),
})

export const TopicSourceStyleSchema: z.ZodType<TopicSourceStyle> = z.object({
  origin: requiredString,
  confidence: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
  notes: optionalString,
})

export const TopicCatalogSchema = z.array(TopicCatalogItemSchema)

export const TopicDetailSchema: z.ZodType<TopicDetail> = TopicCatalogItemSchema.extend({
  summary: requiredString,
  whyItMatters: optionalString,
  prerequisiteTopicIds: z.array(TopicIdSchema).default([]).optional(),
  relatedTopicIds: z.array(TopicIdSchema).default([]).optional(),
  ruleBlocks: z.array(TopicRuleBlockSchema).min(1),
  tables: z.array(TopicTableSchema).optional(),
  examples: z.array(TopicExampleSchema).optional(),
  patterns: z.array(requiredString).optional(),
  tips: z.array(requiredString).optional(),
  memoryHooks: z.array(TopicMemoryHookSchema).optional(),
  commonMistakes: z.array(TopicCommonMistakeSchema).optional(),
  miniQuiz: z.array(TopicMiniQuizItemSchema).optional(),
  searchHints: z.array(requiredString).optional(),
  ui: TopicUISchema.optional(),
  sourceStyle: TopicSourceStyleSchema.optional(),
  updatedAt: requiredString,
})

export const TopicDetailArraySchema = z.array(TopicDetailSchema)

export const TopicDifficultyStageSchema: z.ZodType<TopicDifficultyStage> = topicDifficultyStageSchema
export const TopicLevelSchema: z.ZodType<TopicLevel> = topicLevelSchema
