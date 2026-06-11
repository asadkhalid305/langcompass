import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

import {
  buildExplorerHref,
  buildTopicDetailHref,
  hasLegacyExplorerSignal,
  parseExplorerQueryState,
} from "../src/lib/explorer/navigation"
import { createTopicSearchEngine } from "../src/lib/explorer/search"
import { getLevelSections, getLevelTopicCounts } from "../src/lib/explorer/selectors"
import { TopicCatalogSchema } from "../src/lib/schemas/topic"

const loadCatalog = async () => {
  const raw = await readFile(path.join(process.cwd(), "data", "topic-catalog.json"), "utf8")
  return TopicCatalogSchema.parse(JSON.parse(raw) as unknown)
}

test("section-first navigation omits obsolete group state", () => {
  assert.deepEqual(
    parseExplorerQueryState({
      level: "A1.1",
      group: "grammar",
      q: "accusative",
      topic: "accusative_case",
    }),
    {
      level: "A1.1",
      query: "accusative",
      topicId: "accusative_case",
    },
  )

  assert.equal(
    buildExplorerHref({
      level: "A1.1",
      query: "accusative",
      topicId: "accusative_case",
    }),
    "/explorer?level=A1.1&q=accusative&topic=accusative_case",
  )
  assert.equal(buildTopicDetailHref("accusative_case", { level: "A1.1" }), "/topic/accusative_case?level=A1.1")
  assert.equal(hasLegacyExplorerSignal({ group: "grammar" }), true)
})

test("level selectors expose five topics per section", async () => {
  const topics = await loadCatalog()
  const sections = getLevelSections(topics, "B1.2")
  const counts = getLevelTopicCounts(topics, "B1.2")

  assert.deepEqual(
    sections.map((section) => [section.section, section.topics.length]),
    [
      ["themes", 5],
      ["grammar", 5],
      ["communication", 5],
    ],
  )
  assert.equal(counts.totalCount, 15)
  assert.deepEqual(counts.bySection, {
    themes: 5,
    grammar: 5,
    communication: 5,
  })
})

test("search finds representative Momente catalog content", async () => {
  const topics = await loadCatalog()
  const search = createTopicSearchEngine(topics)

  assert.equal(search.search("accusative")[0]?.topic.id, "accusative_case")
  assert.ok(search.search("fake news").some((result) => result.topic.id === "b1_2_m5_fake_news_school_politics"))
  assert.ok(search.search("appointments").some((result) => result.topic.level === "A1.2"))
})
