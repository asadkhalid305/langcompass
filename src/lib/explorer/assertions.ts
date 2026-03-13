import type { TopicCatalogItem, TopicId } from "../types"
import { applyTopicFilters } from "./filters"
import { createTopicSearchEngine } from "./search"
import { createDefaultExplorerFilters } from "./state"

interface ExplorerDevAssertionOptions {
  detailTopicIds?: ReadonlySet<TopicId>
}

const assertCondition = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`[explorer assertion] ${message}`)
  }
}

export const runExplorerDevAssertions = (
  topics: TopicCatalogItem[],
  options: ExplorerDevAssertionOptions = {},
): void => {
  if (process.env.NODE_ENV === "production") return
  if (topics.length === 0) return

  const searchEngine = createTopicSearchEngine(topics)

  for (const query of ["mich", "mir", "weil", "accusative", "akkusativ"]) {
    const hits = searchEngine.search(query, { limit: 5 })
    assertCondition(hits.length > 0, `expected search results for "${query}"`)
  }

  const grammarOnly = applyTopicFilters(
    topics,
    {
      ...createDefaultExplorerFilters(),
      categories: ["grammar"],
    },
    options.detailTopicIds,
  )
  assertCondition(grammarOnly.every((topic) => topic.category === "grammar"), "category filter should keep only grammar topics")

  const introOnly = applyTopicFilters(
    topics,
    {
      ...createDefaultExplorerFilters(),
      difficultyStages: ["intro"],
    },
    options.detailTopicIds,
  )
  assertCondition(introOnly.every((topic) => topic.difficultyStage === "intro"), "difficultyStage filter should keep only intro topics")

  if (options.detailTopicIds && options.detailTopicIds.size > 0) {
    const withDetail = applyTopicFilters(
      topics,
      {
        ...createDefaultExplorerFilters(),
        hasDetailFile: "with_detail",
      },
      options.detailTopicIds,
    )
    assertCondition(
      withDetail.every((topic) => options.detailTopicIds?.has(topic.id)),
      "hasDetailFile=with_detail should only return topics with detail files",
    )
  }
}
