import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

import { TopicCatalogItemSchema, TopicCatalogSchema, TopicDetailSchema } from "../src/lib/schemas/topic"

const repoRoot = process.cwd()
const catalogPath = path.join(repoRoot, "data", "topic-catalog.json")
const detailsDir = path.join(repoRoot, "data", "topic-details")
const expectedSections = ["themes", "grammar", "communication"] as const
const expectedModules = ["M1", "M2", "M3", "M4", "M5"] as const
const expectedLevels = ["A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2", "B2.1", "B2.2"] as const

const readJson = async (filePath: string): Promise<unknown> =>
  JSON.parse(await readFile(filePath, "utf8")) as unknown

const loadCatalog = async () => TopicCatalogSchema.parse(await readJson(catalogPath))

test("catalog modules contain one topic in every section", async () => {
  const topics = await loadCatalog()
  const ids = new Set(topics.map((topic) => topic.id))

  assert.equal(topics.length, 120)
  assert.equal(ids.size, topics.length)
  assert.deepEqual(new Set(topics.map((topic) => topic.level)), new Set(expectedLevels))

  for (const level of expectedLevels) {
    const levelTopics = topics.filter((topic) => topic.level === level)

    for (const moduleId of expectedModules) {
      const moduleTopics = levelTopics.filter((topic) => topic.lessonRefs?.some((reference) => reference.module === moduleId))
      assert.equal(moduleTopics.length, 3, `${level} ${moduleId} should contain three topics`)
      assert.deepEqual(
        new Set(moduleTopics.map((topic) => topic.section)),
        new Set(expectedSections),
        `${level} ${moduleId} should contain one topic in every section`,
      )
    }
  }
})

test("all catalog and detail topic references resolve", async () => {
  const topics = await loadCatalog()
  const ids = new Set(topics.map((topic) => topic.id))

  for (const topic of topics) {
    for (const relatedTopicId of topic.relatedTopicIds) {
      assert.ok(ids.has(relatedTopicId), `${topic.id} references missing topic ${relatedTopicId}`)
    }
  }

  const detailFiles = (await readdir(detailsDir)).filter((filename) => filename.endsWith(".json"))
  for (const filename of detailFiles) {
    const detail = TopicDetailSchema.parse(await readJson(path.join(detailsDir, filename)))

    for (const relatedTopicId of detail.relatedTopicIds) {
      assert.ok(ids.has(relatedTopicId), `${detail.id} references missing topic ${relatedTopicId}`)
    }
    for (const prerequisiteTopicId of detail.prerequisiteTopicIds ?? []) {
      assert.ok(ids.has(prerequisiteTopicId), `${detail.id} references missing prerequisite ${prerequisiteTopicId}`)
    }
    for (const comparison of detail.comparisons ?? []) {
      assert.ok(ids.has(comparison.topicId), `${detail.id} compares against missing topic ${comparison.topicId}`)
    }
  }
})

test("catalog input without a group remains section-first", () => {
  const topic = TopicCatalogItemSchema.parse({
    id: "test_topic",
    title: "Test Topic",
    level: "A1.1",
    section: "grammar",
    topicType: "grammar",
    summary: "A test topic.",
  })

  assert.equal(topic.group, undefined)
  assert.equal(topic.section, "grammar")
})
