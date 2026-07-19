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
import { getLevelSections, getLevelSectionsForAllLevels, getLevelTopicCounts, getTopicModuleLabel, getTopicNeighbors } from "../src/lib/explorer/selectors"
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

test("level selectors sort topics by curriculum module order", async () => {
  const topics = await loadCatalog()
  const grammarSection = getLevelSections(topics, "A1.1").find((section) => section.section === "grammar")

  assert.deepEqual(
    grammarSection?.topics.map((topic) => topic.id),
    [
      "a1_1_m1_present_basic",
      "a1_1_m2_articles",
      "a1_1_m3_negation_kein",
      "a1_1_m4_modal_koennen",
      "accusative_case",
    ],
  )
  assert.deepEqual(grammarSection?.topics.map(getTopicModuleLabel), ["M1", "M2", "M3", "M4", "M5"])
})

test("all-level selector keeps level order before module order", async () => {
  const topics = await loadCatalog()
  const themeSection = getLevelSectionsForAllLevels(topics).find((section) => section.section === "themes")

  assert.deepEqual(
    themeSection?.topics.slice(0, 6).map((topic) => topic.id),
    [
      "a1_1_m1_identity",
      "a1_1_m2_shopping_objects",
      "a1_1_m3_office_technology",
      "a1_1_m4_hobbies_time",
      "a1_1_m5_food_restaurant",
      "a1_2_m1_city_orientation",
    ],
  )
})

test("topic neighbors stay inside the selected level and section", async () => {
  const topics = await loadCatalog()
  const first = getTopicNeighbors(topics, "a1_1_m1_present_basic", "A1.1")
  const middle = getTopicNeighbors(topics, "a1_1_m3_negation_kein", "A1.1")
  const last = getTopicNeighbors(topics, "accusative_case", "A1.1")

  assert.equal(first.previous, null)
  assert.equal(first.next?.id, "a1_1_m2_articles")
  assert.equal(middle.previous?.id, "a1_1_m2_articles")
  assert.equal(middle.next?.id, "a1_1_m4_modal_koennen")
  assert.equal(last.previous?.id, "a1_1_m4_modal_koennen")
  assert.equal(last.next, null)
  assert.equal(buildTopicDetailHref(middle.next!.id, { level: "A1.1" }), "/topic/a1_1_m4_modal_koennen?level=A1.1")
})

test("all-level topic neighbors preserve CEFR order within a section", async () => {
  const topics = await loadCatalog()
  const first = getTopicNeighbors(topics, "a1_1_m1_present_basic", "All")
  const boundary = getTopicNeighbors(topics, "accusative_case", "All")
  const last = getTopicNeighbors(topics, "b2_2_m5_complex_conditionals", "All")

  assert.equal(first.previous, null)
  assert.equal(first.next?.id, "a1_1_m2_articles")
  assert.equal(boundary.previous?.id, "a1_1_m4_modal_koennen")
  assert.equal(boundary.next?.id, "a1_2_m1_temporal_prepositions")
  assert.equal(last.previous?.id, "b2_2_m4_expanded_attributes")
  assert.equal(last.next, null)
  assert.equal(buildTopicDetailHref(boundary.next!.id, { level: "All" }), "/topic/a1_2_m1_temporal_prepositions?level=All")
})

test("search finds representative Momente catalog content", async () => {
  const topics = await loadCatalog()
  const search = createTopicSearchEngine(topics)

  assert.equal(search.search("accusative")[0]?.topic.id, "accusative_case")
  assert.ok(search.search("fake news").some((result) => result.topic.id === "b1_2_m5_fake_news_school_politics"))
  assert.ok(search.search("appointments").some((result) => result.topic.level === "A1.2"))
})
