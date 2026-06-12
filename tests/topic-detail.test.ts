import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

import { resolveDetailSectionPresentation } from "../src/components/topic-detail/topic-detail-page-helpers"
import { TopicCatalogSchema, TopicDetailSchema } from "../src/lib/schemas/topic"

const repoRoot = process.cwd()
const catalogPath = path.join(repoRoot, "data", "topic-catalog.json")
const detailsDir = path.join(repoRoot, "data", "topic-details")
const completedModules = [
  {
    level: "A1.1",
    module: "M1",
    topicIds: [
      "a1_1_m1_identity",
      "a1_1_m1_present_basic",
      "a1_1_m1_question_words",
    ],
  },
  {
    level: "A1.1",
    module: "M5",
    topicIds: [
      "a1_1_m5_food_restaurant",
      "accusative_case",
      "a1_1_m5_ordering_restaurant",
    ],
  },
] as const

const readJson = async (filePath: string): Promise<unknown> =>
  JSON.parse(await readFile(filePath, "utf8")) as unknown

test("completed modules contain ready theme, grammar, and communication lessons", async () => {
  const catalog = TopicCatalogSchema.parse(await readJson(catalogPath))

  for (const completedModule of completedModules) {
    const moduleTopics = catalog.filter(
      (topic) =>
        topic.level === completedModule.level &&
        topic.lessonRefs?.some(
          (reference) =>
            reference.curriculum === "Momente" &&
            reference.module === completedModule.module,
        ),
    )

    assert.deepEqual(
      moduleTopics.map((topic) => topic.id),
      [...completedModule.topicIds],
      `${completedModule.level} ${completedModule.module} should contain the expected topics`,
    )
    assert.deepEqual(
      new Set(moduleTopics.map((topic) => topic.topicType)),
      new Set(["theme", "grammar", "communication"]),
    )

    for (const topicId of completedModule.topicIds) {
      const detail = TopicDetailSchema.parse(
        await readJson(path.join(detailsDir, `${topicId}.json`)),
      )

      assert.equal(detail.ui?.status, "ready", `${topicId} should be editorially ready`)
      assert.ok((detail.mentalModel?.length ?? 0) >= 2, `${topicId} should establish a clear starting model`)
      assert.ok(detail.ruleBlocks.length >= 2, `${topicId} should contain substantial building blocks`)
      assert.ok((detail.examples?.length ?? 0) >= 3, `${topicId} should contain practical examples`)
    }
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
