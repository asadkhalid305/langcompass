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
    module: "M2",
    topicIds: [
      "a1_1_m2_shopping_objects",
      "a1_1_m2_articles",
      "a1_1_m2_asking_prices",
    ],
  },
  {
    level: "A1.1",
    module: "M3",
    topicIds: [
      "a1_1_m3_office_technology",
      "a1_1_m3_negation_kein",
      "a1_1_m3_asking_for_repetition",
    ],
  },
  {
    level: "A1.1",
    module: "M4",
    topicIds: [
      "a1_1_m4_hobbies_time",
      "a1_1_m4_modal_koennen",
      "a1_1_m4_arranging_meetings",
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
  {
    level: "A1.2",
    module: "M1",
    topicIds: [
      "a1_2_m1_city_orientation",
      "a1_2_m1_temporal_prepositions",
      "a1_2_m1_offering_help",
    ],
  },
  {
    level: "A1.2",
    module: "M2",
    topicIds: [
      "a1_2_m2_plans_wishes",
      "a1_2_m2_werden_wollen",
      "a1_2_m2_making_appointments",
    ],
  },
  {
    level: "A1.2",
    module: "M3",
    topicIds: [
      "a1_2_m3_health_household",
      "personal_pronouns_accusative",
      "a1_2_m3_requests_instructions",
    ],
  },
  {
    level: "A1.2",
    module: "M4",
    topicIds: [
      "a1_2_m4_people_clothes_weather",
      "a1_2_m4_comparison",
      "a1_2_m4_describing_people",
    ],
  },
  {
    level: "A1.2",
    module: "M5",
    topicIds: [
      "a1_2_m5_celebrations_rules",
      "a1_2_m5_imperative",
      "a1_2_m5_congratulating",
    ],
  },
  {
    level: "A2.1",
    module: "M1",
    topicIds: [
      "a2_1_m1_workday_events",
      "a2_1_m1_deshalb",
      "a2_1_m1_reacting_to_suggestions",
    ],
  },
  {level:"A2.1",module:"M2",topicIds:["a2_1_m2_sport_habits","a2_1_m2_konjunktiv_ii_advice","a2_1_m2_giving_advice"]},
  {level:"A2.1",module:"M3",topicIds:["a2_1_m3_food_breaks","a2_1_m3_dass_wenn","a2_1_m3_ordering_paying"]},
  {level:"A2.1",module:"M4",topicIds:["a2_1_m4_city_mobility","a2_1_m4_wechselpraepositionen","a2_1_m4_describing_routes"]},
  {level:"A2.1",module:"M5",topicIds:["a2_1_m5_travel_holidays","a2_1_m5_wishes_haette_waere","a2_1_m5_expressing_preferences"]},
  {
    level: "B1.1",
    module: "M1",
    topicIds: [
      "b1_1_m1_politics_society",
      "b1_1_m1_infinitive_zu",
      "b1_1_m1_stating_opinion",
    ],
  },
  {
    level: "B1.1",
    module: "M2",
    topicIds: [
      "b1_1_m2_study_abroad",
      "b1_1_m2_genitive_prepositions",
      "b1_1_m2_semi_formal_email",
    ],
  },
  {
    level: "B1.1",
    module: "M3",
    topicIds: [
      "b1_1_m3_work_satisfaction",
      "b1_1_m3_temporal_connectors",
      "b1_1_m3_describing_statistics",
    ],
  },
  {
    level: "B1.1",
    module: "M4",
    topicIds: [
      "b1_1_m4_products_functions",
      "b1_1_m4_relative_clauses_dative",
      "b1_1_m4_describing_functions",
    ],
  },
  {
    level: "B1.1",
    module: "M5",
    topicIds: [
      "b1_1_m5_food_preparation",
      "b1_1_m5_sodass",
      "b1_1_m5_recommending_dishes",
    ],
  },
  {
    level: "B1.2",
    module: "M1",
    topicIds: [
      "b1_2_m1_animals",
      "b1_2_m1_two_part_connectors",
      "b1_2_m1_describing_animals",
    ],
  },
  {
    level: "B1.2",
    module: "M2",
    topicIds: [
      "b1_2_m2_job_applications",
      "b1_2_m2_relative_was_wo",
      "b1_2_m2_talking_about_skills",
    ],
  },
  {
    level: "B1.2",
    module: "M3",
    topicIds: [
      "b1_2_m3_love_finance",
      "b1_2_m3_plusquamperfekt",
      "b1_2_m3_relativizing_statements",
    ],
  },
  {
    level: "B1.2",
    module: "M4",
    topicIds: [
      "b1_2_m4_art_health_training",
      "b1_2_m4_passive_extended",
      "b1_2_m4_presenting_art",
    ],
  },
  {
    level: "B1.2",
    module: "M5",
    topicIds: [
      "b1_2_m5_fake_news_school_politics",
      "b1_2_m5_advanced_connectors",
      "b1_2_m5_consensus",
    ],
  },
  {
    level: "B2.1",
    module: "M1",
    topicIds: [
      "b2_1_m1_future_work",
      "b2_1_m1_nominalization",
      "b2_1_m1_moderating_discussions",
    ],
  },
  {
    level: "B2.1", module: "M2",
    topicIds: ["b2_1_m2_science_ai", "b2_1_m2_participial_attributes", "b2_1_m2_explaining_systems"],
  },
  {level:"B2.1",module:"M3",topicIds:["b2_1_m3_diversity_cohesion","b2_1_m3_concessive_connectors","b2_1_m3_mediating_conflict"]},
  {level:"B2.1",module:"M4",topicIds:["b2_1_m4_climate_consumption","b2_1_m4_passive_alternatives","b2_1_m4_evaluating_measures"]},
  {level:"B2.1",module:"M5",topicIds:["b2_1_m5_culture_media","b2_1_m5_reported_speech","b2_1_m5_reviewing_culture"]},
  {level:"B2.2",module:"M1",topicIds:["b2_2_m1_economy_globalization","b2_2_m1_function_verb_structures","b2_2_m1_negotiating_conditions"]},
  {level:"B2.2",module:"M2",topicIds:["b2_2_m2_law_privacy","b2_2_m2_subjective_modals","b2_2_m2_formal_complaints"]},
  {level:"B2.2",module:"M3",topicIds:["b2_2_m3_health_resilience","b2_2_m3_causal_consecutive","b2_2_m3_advice_boundaries"]},
  {level:"B2.2",module:"M4",topicIds:["b2_2_m4_history_memory","b2_2_m4_expanded_attributes","b2_2_m4_comparing_sources"]},
  {level:"B2.2",module:"M5",topicIds:["b2_2_m5_research_ethics","b2_2_m5_complex_conditionals","b2_2_m5_synthesizing_debate"]},
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
            reference.curriculum === (completedModule.level.startsWith("B2") ? "LangCompass" : "Momente") &&
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
