import Fuse, { type IFuseOptions } from "fuse.js"
import type { TopicCatalogItem } from "../types"
import { normalizeSearchText } from "../utils"
import type {
  TopicSearchBoostField,
  TopicSearchConfig,
  TopicSearchResult,
  TopicSearchRunOptions,
} from "./types"

interface TopicSearchDocument {
  topic: TopicCatalogItem
  title: string
  aliases: string[]
  keywords: string[]
  level: string
  category: string
  group: string
}

interface ExactMatchBoost {
  amount: number
  field: TopicSearchBoostField
}

const DEFAULT_THRESHOLD = 0.34
const DEFAULT_MIN_MATCH_CHAR_LENGTH = 2

const toSearchDocument = (topic: TopicCatalogItem): TopicSearchDocument => ({
  topic,
  title: normalizeSearchText(topic.title),
  aliases: topic.aliases.map((alias) => normalizeSearchText(alias)),
  keywords: topic.keywords.map((keyword) => normalizeSearchText(keyword)),
  level: normalizeSearchText(topic.level),
  category: normalizeSearchText(topic.category),
  group: normalizeSearchText(topic.group),
})

const buildFuseOptions = (config: TopicSearchConfig): IFuseOptions<TopicSearchDocument> => ({
  includeScore: true,
  shouldSort: true,
  ignoreLocation: true,
  findAllMatches: true,
  threshold: config.threshold ?? DEFAULT_THRESHOLD,
  minMatchCharLength: config.minMatchCharLength ?? DEFAULT_MIN_MATCH_CHAR_LENGTH,
  keys: [
    { name: "title", weight: 0.42 },
    { name: "aliases", weight: 0.24 },
    { name: "keywords", weight: 0.2 },
    { name: "group", weight: 0.06 },
    { name: "category", weight: 0.05 },
    { name: "level", weight: 0.03 },
  ],
})

const rankValueBoost = (value: string, query: string, exact: number, prefix: number, contains: number): number => {
  if (!value || !query) return 0
  if (value === query) return exact
  if (value.startsWith(query)) return prefix
  if (value.includes(query)) return contains
  return 0
}

const computeExactMatchBoost = (document: TopicSearchDocument, query: string): ExactMatchBoost => {
  const titleBoost = rankValueBoost(document.title, query, 0.35, 0.2, 0.1)
  const aliasBoost = Math.max(
    0,
    ...document.aliases.map((alias) => rankValueBoost(alias, query, 0.32, 0.18, 0.09)),
  )

  if (titleBoost === 0 && aliasBoost === 0) {
    return { amount: 0, field: null }
  }

  if (titleBoost >= aliasBoost) {
    return { amount: titleBoost, field: "title" }
  }

  return { amount: aliasBoost, field: "alias" }
}

const sortResults = (results: TopicSearchResult[]): TopicSearchResult[] =>
  [...results].sort((a, b) => {
    const scoreDelta = a.score - b.score
    if (scoreDelta !== 0) return scoreDelta
    return a.topic.title.localeCompare(b.topic.title)
  })

const applyLimit = <T>(values: T[], limit?: number): T[] => {
  if (typeof limit !== "number" || limit <= 0) return values
  return values.slice(0, limit)
}

const buildResultsForEmptyQuery = (topics: TopicCatalogItem[], limit?: number): TopicSearchResult[] => {
  const ranked = [...topics]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(
      (topic) =>
        ({
          topic,
          score: 1,
          rawScore: 1,
          isExactBoosted: false,
          boostedField: null,
        }) satisfies TopicSearchResult,
    )

  return applyLimit(ranked, limit)
}

export interface TopicSearchEngine {
  search: (query: string, runOptions?: TopicSearchRunOptions) => TopicSearchResult[]
}

export const createTopicSearchEngine = (
  topics: TopicCatalogItem[],
  config: TopicSearchConfig = {},
): TopicSearchEngine => {
  const documents = topics.map(toSearchDocument)
  const fuse = new Fuse(documents, buildFuseOptions(config))

  return {
    search: (query: string, runOptions: TopicSearchRunOptions = {}): TopicSearchResult[] => {
      const normalizedQuery = normalizeSearchText(query)
      const limit = runOptions.limit ?? config.limit
      const exactMatchBoost = runOptions.exactMatchBoost ?? config.exactMatchBoost ?? true

      if (!normalizedQuery) {
        return buildResultsForEmptyQuery(topics, limit)
      }

      const results = fuse.search(normalizedQuery).map((result) => {
        const rawScore = typeof result.score === "number" ? result.score : 1
        const boost = exactMatchBoost
          ? computeExactMatchBoost(result.item, normalizedQuery)
          : { amount: 0, field: null as TopicSearchBoostField }

        return {
          topic: result.item.topic,
          rawScore,
          score: Math.max(0, rawScore - boost.amount),
          isExactBoosted: boost.amount > 0,
          boostedField: boost.field,
        } satisfies TopicSearchResult
      })

      return applyLimit(sortResults(results), limit)
    },
  }
}

export const searchTopics = (
  topics: TopicCatalogItem[],
  query: string,
  config: TopicSearchConfig = {},
): TopicSearchResult[] => {
  const searchEngine = createTopicSearchEngine(topics, config)
  return searchEngine.search(query, {
    limit: config.limit,
    exactMatchBoost: config.exactMatchBoost,
  })
}
