#!/usr/bin/env node

import { promises as fs } from "node:fs"
import path from "node:path"
import { z } from "zod"

const repoRoot = process.cwd()
const dataRoot = path.join(repoRoot, "data")
const catalogPath = path.join(dataRoot, "topic-catalog.json")
const detailsDir = path.join(dataRoot, "topic-details")

const ALLOWED_LEVELS = ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2.1", "B2.2"]
const ALLOWED_DIFFICULTY_STAGES = ["intro", "expanded", "combined", "advanced"]

const requiredString = z.string().trim().min(1)
const topicId = requiredString
const levelSchema = z.enum(ALLOWED_LEVELS)
const difficultySchema = z.enum(ALLOWED_DIFFICULTY_STAGES)
const datetimeSchema = requiredString
const levelArray = z.array(levelSchema)

const topicCatalogItemSchema = z.object({
  id: topicId,
  title: requiredString,
  level: levelSchema,
  category: requiredString,
  group: requiredString,
  firstIntroducedIn: levelSchema,
  revisitedIn: levelArray,
  difficultyStage: difficultySchema,
  aliases: z.array(requiredString),
  keywords: z.array(requiredString),
})

const topicCatalogSchema = z.array(topicCatalogItemSchema)

const topicDetailSchema = topicCatalogItemSchema.extend({
  summary: requiredString,
  whyItMatters: requiredString.optional(),
  prerequisiteTopicIds: z.array(topicId).optional(),
  relatedTopicIds: z.array(topicId).optional(),
  ruleBlocks: z.array(
    z.object({
      id: topicId,
      title: requiredString,
      content: requiredString,
    }),
  ).min(1),
  tables: z
    .array(
      z.object({
        id: topicId,
        title: requiredString,
        columns: z.array(requiredString),
        rows: z.array(z.array(requiredString)),
      }),
    )
    .optional(),
  examples: z
    .array(
      z.object({
        id: topicId,
        de: requiredString,
        en: z.string().trim().min(1).optional(),
        note: z.string().trim().min(1).optional(),
      }),
    )
    .optional(),
  patterns: z.array(requiredString).optional(),
  tips: z.array(requiredString).optional(),
  memoryHooks: z
    .array(
      z.object({
        id: topicId,
        title: requiredString,
        content: requiredString,
      }),
    )
    .optional(),
  commonMistakes: z
    .array(
      z.object({
        id: topicId,
        wrong: requiredString,
        correct: requiredString,
        reason: requiredString,
      }),
    )
    .optional(),
  miniQuiz: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          id: topicId,
          type: z.literal("multiple_choice"),
          question: requiredString,
          options: z.array(requiredString).min(2),
          answer: requiredString,
        }),
        z.object({
          id: topicId,
          type: z.literal("fill_in_blank"),
          question: requiredString,
          options: z.array(requiredString).max(0).optional(),
          answer: requiredString,
        }),
      ]),
    )
    .optional(),
  searchHints: z.array(requiredString).optional(),
  ui: z
    .object({
      status: z.union([z.literal("draft"), z.literal("ready")]),
      recommendedSections: z.array(requiredString),
    })
    .optional(),
  sourceStyle: z
    .object({
      origin: requiredString,
      confidence: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
      notes: z.string().trim().min(1).optional(),
    })
    .optional(),
  updatedAt: datetimeSchema,
})

const printIssues = (context, issues) => {
  if (!issues.length) return
  console.log(`\n${context}`)
  for (const issue of issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)"
    console.log(`- ${path}: ${issue.message}`)
  }
}

const duplicates = (values) => {
  const counts = new Map()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value)
}

const parseJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8")
  return JSON.parse(raw)
}

const validateCatalog = async () => {
  const parsedRaw = await parseJson(catalogPath)
  const parsed = topicCatalogSchema.safeParse(parsedRaw)

  if (!parsed.success) {
    return {
      valid: false,
      items: [],
      ids: [],
      duplicateIds: [],
      issues: parsed.error.issues,
    }
  }

  const ids = parsed.data.map((item) => item.id)

  return {
    valid: true,
    items: parsed.data,
    ids,
    duplicateIds: duplicates(ids),
    issues: [],
  }
}

const validateTopicDetails = async (validTopicIds) => {
  const validIds = new Set(validTopicIds)
  const entries = await fs.readdir(detailsDir, { withFileTypes: true })
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))

  const valid = []
  const invalidIds = []
  const filenameMismatches = []
  const duplicateIds = []
  const fileIssues = []
  const referenceIssues = []

  const seenIds = []

  for (const file of jsonFiles) {
    const filePath = path.join(detailsDir, file.name)
    const fileId = file.name.replace(/\.json$/i, "")

    try {
      const parsedFile = await parseJson(filePath)
      const parsed = topicDetailSchema.safeParse(parsedFile)
      if (!parsed.success) {
        fileIssues.push({ file: file.name, issues: parsed.error.issues })
        continue
      }

      if (parsed.data.id !== fileId) {
        filenameMismatches.push(`${file.name}: id "${parsed.data.id}" != filename "${fileId}"`)
      }

      if (!validIds.has(parsed.data.id)) {
        invalidIds.push(parsed.data.id)
      }

      seenIds.push(parsed.data.id)

      for (const reference of parsed.data.prerequisiteTopicIds ?? []) {
        if (!validIds.has(reference)) {
          referenceIssues.push(
            `${file.name}: ${parsed.data.id} prerequisiteTopicIds references invalid id "${reference}"`,
          )
        }
      }
      for (const reference of parsed.data.relatedTopicIds ?? []) {
        if (!validIds.has(reference)) {
          referenceIssues.push(`${file.name}: ${parsed.data.id} relatedTopicIds references invalid id "${reference}"`)
        }
      }

      valid.push(parsed.data)
    } catch (error) {
      fileIssues.push({ file: file.name, issues: [{ path: ["json"], message: error.message }] })
    }
  }

  return {
    count: valid.length,
    items: valid,
    duplicateIds: duplicates(seenIds),
    invalidIds,
    filenameMismatches,
    fileIssues,
    referenceIssues,
  }
}

async function main() {
  let hasFailures = false

  console.log("LangCompass topic data validation")

  const catalog = await validateCatalog()
  if (!catalog.valid) {
    hasFailures = true
    printIssues("topic-catalog.json schema issues", catalog.issues)
  }

  if (catalog.duplicateIds.length > 0) {
    hasFailures = true
    console.log("\nDuplicate topic ids in topic-catalog.json:")
    for (const duplicate of catalog.duplicateIds) {
      console.log(`- ${duplicate}`)
    }
  }

  if (!catalog.valid) {
    console.log("\n❌ Failed: topic-catalog.json must be valid before topic-details can be checked.")
    process.exitCode = 1
    return
  }

  const details = await validateTopicDetails(catalog.ids)

  if (details.fileIssues.length > 0) {
    hasFailures = true
    for (const fileIssue of details.fileIssues) {
      printIssues(`topic-details/${fileIssue.file} schema issues`, fileIssue.issues)
    }
  }

  if (details.duplicateIds.length > 0) {
    hasFailures = true
    console.log("\nDuplicate topic ids in topic-details:")
    for (const duplicate of details.duplicateIds) {
      console.log(`- ${duplicate}`)
    }
  }

  if (details.invalidIds.length > 0) {
    hasFailures = true
    console.log("\ntopic-details files whose id is missing from topic-catalog.json:")
    for (const invalidId of details.invalidIds) {
      console.log(`- ${invalidId}`)
    }
  }

  if (details.filenameMismatches.length > 0) {
    hasFailures = true
    console.log("\nFilename/id mismatches in topic-details:")
    for (const mismatch of details.filenameMismatches) {
      console.log(`- ${mismatch}`)
    }
  }

  if (details.referenceIssues.length > 0) {
    hasFailures = true
    console.log("\nInvalid references in topic-details:")
    for (const issue of details.referenceIssues) {
      console.log(`- ${issue}`)
    }
  }

  if (hasFailures) {
    console.log("\nValidation status: ❌ failed")
    process.exitCode = 1
    return
  }

  console.log("\nValidation status: ✅ passed")
  console.log(`Catalog entries: ${catalog.items.length}`)
  console.log(`Detail entries: ${details.count}`)
}

main().catch((error) => {
  console.error(`\nUnexpected failure: ${error.message}`)
  process.exit(1)
})
