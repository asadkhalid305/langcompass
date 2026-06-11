#!/usr/bin/env node

import { promises as fs } from "node:fs"
import path from "node:path"
import { z } from "zod"

const repoRoot = process.cwd()
const dataRoot = path.join(repoRoot, "data")
const catalogPath = path.join(dataRoot, "topic-catalog.json")
const detailsDir = path.join(dataRoot, "topic-details")

const ALLOWED_LEVELS = ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2.1", "B2.2"]
const ALLOWED_DIFFICULTY_STAGES = ["intro", "core", "expanded", "combined", "advanced"]
const ALLOWED_TOPIC_SECTIONS = ["themes", "grammar", "communication"]
const ALLOWED_TOPIC_TYPES = ["theme", "grammar", "communication"]

const LEGACY_CATEGORY_TO_SECTION = {
  basics: "themes",
  vocabulary: "themes",
  communication: "communication",
  grammar: "grammar",
}

const TOPIC_TYPE_BY_SECTION = {
  themes: "theme",
  grammar: "grammar",
  communication: "communication",
}

const requiredString = z.string().trim().min(1)
const optionalString = z.string().trim().min(1).optional()
const topicId = requiredString
const levelSchema = z.enum(ALLOWED_LEVELS)
const difficultySchema = z.enum(ALLOWED_DIFFICULTY_STAGES)
const sectionSchema = z.enum(ALLOWED_TOPIC_SECTIONS)
const topicTypeSchema = z.enum(ALLOWED_TOPIC_TYPES)
const datetimeSchema = requiredString
const levelArray = z.array(levelSchema)
const progressionLevelSchema = z.union([z.literal("A1"), z.literal("A2"), z.literal("B1"), z.literal("B2"), levelSchema])

const lessonRefSchema = z.object({
  curriculum: requiredString,
  module: requiredString,
  lesson: optionalString,
})

const topicCatalogItemSchema = z.object({
  id: topicId,
  title: requiredString,
  level: levelSchema,
  section: sectionSchema.optional(),
  topicType: topicTypeSchema.optional(),
  category: requiredString.optional(),
  group: requiredString.optional(),
  summary: requiredString.optional(),
  relatedTopicIds: z.array(topicId).optional(),
  lessonRefs: z.array(lessonRefSchema).optional(),
  firstIntroducedIn: levelSchema.optional(),
  revisitedIn: levelArray.optional(),
  difficultyStage: difficultySchema.optional(),
  aliases: z.array(requiredString).default([]),
  keywords: z.array(requiredString).default([]),
})

const topicCatalogSchema = z.array(topicCatalogItemSchema)

const topicDetailSchema = topicCatalogItemSchema.extend({
  summary: requiredString,
  whyItMatters: requiredString.optional(),
  prerequisiteTopicIds: z.array(topicId).optional(),
  mentalModel: z
    .array(
      z.object({
        title: requiredString,
        content: requiredString,
      }),
    )
    .optional(),
  coverageChecklist: z.array(requiredString).optional(),
  ruleBlocks: z
    .array(
      z.object({
        id: topicId,
        title: requiredString,
        content: requiredString,
      }),
    )
    .min(1),
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
        id: topicId.optional(),
        de: requiredString,
        en: optionalString,
        note: optionalString,
      }),
    )
    .optional(),
  patterns: z.array(requiredString).optional(),
  verbs: z.array(requiredString).optional(),
  prepositions: z.array(requiredString).optional(),
  twoWayPrepositions: z.array(requiredString).optional(),
  sentenceStructure: z.array(requiredString).optional(),
  levelProgression: z
    .array(
      z.object({
        level: progressionLevelSchema,
        concepts: z.array(requiredString).min(1),
      }),
    )
    .optional(),
  comparisons: z
    .array(
      z.object({
        topicId,
        summary: requiredString,
        table: z
          .object({
            columns: z.array(requiredString),
            rows: z.array(z.array(requiredString)),
          })
          .optional(),
      }),
    )
    .optional(),
  specialCases: z.array(requiredString).optional(),
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
        id: topicId.optional(),
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
      status: z.union([z.literal("draft"), z.literal("ready")]).optional(),
      recommendedSections: z.array(requiredString),
    })
    .optional(),
  sourceStyle: z
    .object({
      origin: requiredString,
      confidence: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
      notes: optionalString,
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

const printMessages = (context, messages) => {
  if (!messages.length) return
  console.log(`\n${context}`)
  for (const message of messages) {
    console.log(`- ${message}`)
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

const deriveTopicSection = (section, topicType, category) => {
  if (typeof section === "string" && ALLOWED_TOPIC_SECTIONS.includes(section)) {
    return section
  }

  if (topicType === "theme") return "themes"
  if (topicType === "grammar") return "grammar"
  if (topicType === "communication") return "communication"

  if (typeof category === "string") {
    const normalizedCategory = category.trim().toLowerCase()
    if (normalizedCategory in LEGACY_CATEGORY_TO_SECTION) {
      return LEGACY_CATEGORY_TO_SECTION[normalizedCategory]
    }
  }

  return "grammar"
}

const normalizeTopicType = (section, topicType) => {
  const expectedTopicType = TOPIC_TYPE_BY_SECTION[section]
  if (typeof topicType !== "string" || !ALLOWED_TOPIC_TYPES.includes(topicType)) {
    return expectedTopicType
  }
  return topicType === expectedTopicType ? topicType : expectedTopicType
}

const normalizeTopicGroup = (groupValue) => {
  if (typeof groupValue === "string" && groupValue.trim().length > 0) {
    return groupValue.trim()
  }

  return undefined
}

const buildCatalogSummary = ({ title, level, section, group }) => {
  const groupLabel = (group ?? section).replace(/[_-]+/g, " ").trim()

  switch (section) {
    case "themes":
      return `${title} is a theme in ${level} within the ${groupLabel} section.`
    case "communication":
      return `${title} is a communication topic in ${level} for guided practice in ${groupLabel}.`
    case "grammar":
    default:
      return `${title} is a grammar topic in ${level} within the ${groupLabel} section.`
  }
}

const normalizeCatalogItem = (item) => {
  const section = deriveTopicSection(item.section, item.topicType, item.category)
  const topicType = normalizeTopicType(section, item.topicType)
  const group = normalizeTopicGroup(item.group)

  return {
    id: item.id,
    title: item.title,
    level: item.level,
    section,
    topicType,
    group,
    summary: item.summary ?? buildCatalogSummary({ title: item.title, level: item.level, section, group }),
    relatedTopicIds: item.relatedTopicIds ?? [],
    lessonRefs: item.lessonRefs,
    firstIntroducedIn: item.firstIntroducedIn ?? item.level,
    revisitedIn: item.revisitedIn ?? [],
    difficultyStage: item.difficultyStage ?? "intro",
    aliases: item.aliases ?? [],
    keywords: item.keywords ?? [],
  }
}

const collectModelWarnings = (context, rawItem, normalizedItem) => {
  const warnings = []
  if (!rawItem.section) {
    warnings.push(`${context}: missing section, normalized to "${normalizedItem.section}"`)
  }
  if (!rawItem.topicType) {
    warnings.push(`${context}: missing topicType, normalized to "${normalizedItem.topicType}"`)
  }

  const expectedTopicType = TOPIC_TYPE_BY_SECTION[normalizedItem.section]
  if (rawItem.topicType && rawItem.topicType !== expectedTopicType) {
    warnings.push(
      `${context}: section "${normalizedItem.section}" and topicType "${rawItem.topicType}" mismatch, expected "${expectedTopicType}"`,
    )
  }

  return warnings
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
      referenceIssues: [],
      warnings: [],
    }
  }

  const items = parsed.data.map(normalizeCatalogItem)
  const ids = items.map((item) => item.id)
  const validTopicIds = new Set(ids)
  const warnings = parsed.data.flatMap((rawItem, index) =>
    collectModelWarnings(`topic-catalog.json[${index}] (${rawItem.id})`, rawItem, items[index]),
  )
  const referenceIssues = items.flatMap((item, index) =>
    item.relatedTopicIds
      .filter((reference) => !validTopicIds.has(reference))
      .map(
        (reference) =>
          `topic-catalog.json[${index}] (${item.id}): relatedTopicIds references invalid id "${reference}"`,
      ),
  )

  return {
    valid: true,
    items,
    ids,
    duplicateIds: duplicates(ids),
    issues: [],
    referenceIssues,
    warnings,
  }
}

const validateTopicDetails = async (catalogItems) => {
  const catalogById = new Map(catalogItems.map((item) => [item.id, item]))
  const validIds = new Set(catalogById.keys())
  const entries = await fs.readdir(detailsDir, { withFileTypes: true })
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))

  const valid = []
  const orphanDetailIds = []
  const filenameMismatches = []
  const duplicateIds = []
  const fileIssues = []
  const metadataMismatches = []
  const referenceIssues = []
  const warnings = []

  const seenIds = []
  const checkReference = (fileName, sourceId, fieldPath, reference) => {
    if (!validIds.has(reference)) {
      referenceIssues.push(`${fileName}: ${sourceId} ${fieldPath} references invalid id "${reference}"`)
    }
  }

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

      const normalized = normalizeCatalogItem(parsed.data)

      warnings.push(...collectModelWarnings(`topic-details/${file.name} (${parsed.data.id})`, parsed.data, normalized))

      if (parsed.data.id !== fileId) {
        filenameMismatches.push(`${file.name}: id "${parsed.data.id}" != filename "${fileId}"`)
      }

      const isCatalogBackedDetail = validIds.has(parsed.data.id)

      if (!isCatalogBackedDetail) {
        orphanDetailIds.push(parsed.data.id)
      }

      seenIds.push(parsed.data.id)

      if (isCatalogBackedDetail) {
        const catalogItem = catalogById.get(parsed.data.id)
        const metadataFields = [
          "title",
          "level",
          "section",
          "topicType",
          "group",
          "summary",
          "relatedTopicIds",
          "lessonRefs",
          "firstIntroducedIn",
          "revisitedIn",
          "difficultyStage",
          "aliases",
          "keywords",
        ]

        for (const field of metadataFields) {
          if (JSON.stringify(normalized[field]) !== JSON.stringify(catalogItem[field])) {
            metadataMismatches.push(
              `${file.name}: ${parsed.data.id} field "${field}" does not match topic-catalog.json`,
            )
          }
        }

        for (const reference of parsed.data.prerequisiteTopicIds ?? []) {
          checkReference(file.name, parsed.data.id, "prerequisiteTopicIds", reference)
        }
        for (const [index, comparison] of (parsed.data.comparisons ?? []).entries()) {
          checkReference(file.name, parsed.data.id, `comparisons[${index}].topicId`, comparison.topicId)
        }
      } else {
        warnings.push(`topic-details/${file.name}: orphan detail file not referenced by current catalog`)
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
    orphanDetailIds,
    filenameMismatches,
    fileIssues,
    metadataMismatches,
    referenceIssues,
    warnings,
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
    printMessages("Duplicate topic ids in topic-catalog.json:", catalog.duplicateIds)
  }

  if (catalog.referenceIssues.length > 0) {
    hasFailures = true
    printMessages("Invalid references in topic-catalog.json:", catalog.referenceIssues)
  }

  if (!catalog.valid) {
    console.log("\nValidation status: ❌ failed")
    process.exitCode = 1
    return
  }

  const details = await validateTopicDetails(catalog.items)

  if (details.fileIssues.length > 0) {
    hasFailures = true
    for (const fileIssue of details.fileIssues) {
      printIssues(`topic-details/${fileIssue.file} schema issues`, fileIssue.issues)
    }
  }

  if (details.duplicateIds.length > 0) {
    hasFailures = true
    printMessages("Duplicate topic ids in topic-details:", details.duplicateIds)
  }

  if (details.filenameMismatches.length > 0) {
    hasFailures = true
    printMessages("Filename/id mismatches in topic-details:", details.filenameMismatches)
  }

  if (details.metadataMismatches.length > 0) {
    hasFailures = true
    printMessages("Catalog/detail metadata mismatches:", details.metadataMismatches)
  }

  if (details.referenceIssues.length > 0) {
    hasFailures = true
    printMessages("Invalid references in topic-details:", details.referenceIssues)
  }

  const warnings = [
    ...catalog.warnings,
    ...details.warnings,
    ...details.orphanDetailIds.map((id) => `topic-details/${id}.json: detail file is not present in the active catalog`),
  ]
  printMessages("Warnings:", warnings)

  if (hasFailures) {
    console.log("\nValidation status: ❌ failed")
    process.exitCode = 1
    return
  }

  console.log("\nValidation status: ✅ passed")
  console.log(`Catalog entries: ${catalog.items.length}`)
  console.log(`Detail entries: ${details.count}`)
  console.log(`Warnings: ${warnings.length}`)
}

main().catch((error) => {
  console.error(`\nUnexpected failure: ${error.message}`)
  process.exit(1)
})
