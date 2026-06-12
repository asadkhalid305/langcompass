import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

import { resolveDetailSectionPresentation } from "../src/components/topic-detail/topic-detail-page-helpers"
import { TopicCatalogSchema, TopicDetailSchema } from "../src/lib/schemas/topic"

const repoRoot = process.cwd()
const catalogPath = path.join(repoRoot, "data", "topic-catalog.json")
const detailsDir = path.join(repoRoot, "data", "topic-details")
const pilotTopicIds = [
  "a1_1_m5_food_restaurant",
  "accusative_case",
  "a1_1_m5_ordering_restaurant",
] as const

const readJson = async (filePath: string): Promise<unknown> =>
  JSON.parse(await readFile(filePath, "utf8")) as unknown

test("A1.1 M5 is a complete rich-content pilot module", async () => {
  const catalog = TopicCatalogSchema.parse(await readJson(catalogPath))
  const pilotTopics = catalog.filter(
    (topic) =>
      topic.level === "A1.1" &&
      topic.lessonRefs?.some(
        (reference) => reference.curriculum === "Momente" && reference.module === "M5",
      ),
  )

  assert.deepEqual(
    pilotTopics.map((topic) => topic.id),
    [...pilotTopicIds],
  )
  assert.deepEqual(
    new Set(pilotTopics.map((topic) => topic.topicType)),
    new Set(["theme", "grammar", "communication"]),
  )

  for (const topicId of pilotTopicIds) {
    const detail = TopicDetailSchema.parse(
      await readJson(path.join(detailsDir, `${topicId}.json`)),
    )

    assert.equal(detail.ui?.status, "ready", `${topicId} should be editorially ready`)
    assert.ok((detail.mentalModel?.length ?? 0) >= 2, `${topicId} should establish a clear starting model`)
    assert.ok(detail.ruleBlocks.length >= 2, `${topicId} should contain substantial building blocks`)
    assert.ok((detail.examples?.length ?? 0) >= 3, `${topicId} should contain practical examples`)
  }
})

test("detail presentation language follows the lesson type", () => {
  const theme = resolveDetailSectionPresentation("theme")
  const grammar = resolveDetailSectionPresentation("grammar")
  const communication = resolveDetailSectionPresentation("communication")

  assert.equal(theme.coreRules.title, "Essential Vocabulary")
  assert.equal(theme.articlesAndForms.title, "Vocabulary & Categories")
  assert.equal(grammar.coreRules.title, "Core Rules")
  assert.equal(grammar.articlesAndForms.title, "Articles & Forms")
  assert.equal(communication.coreRules.title, "Conversation Toolkit")
  assert.equal(communication.examples.title, "Model Exchanges")
})
