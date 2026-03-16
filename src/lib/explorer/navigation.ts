import { ALLOWED_LEVELS, ALL_LEVEL } from "../constants/topic"
import type { TopicId, TopicLevel, TopicLevelOrAll } from "../types/topic"

export type QueryValue = string | string[] | undefined | null

export interface RouteQueryInput {
  view?: QueryValue
  level?: QueryValue
  group?: QueryValue
  topic?: QueryValue
  q?: QueryValue
}

export interface ExplorerQueryState {
  level?: TopicLevelOrAll
  group?: string
  query?: string
  topicId?: TopicId
}

export interface OverviewQueryState {
  level?: TopicLevelOrAll
}

interface ExplorerHrefOptions {
  level?: TopicLevelOrAll | null
  group?: string | null
  query?: string | null
  topicId?: TopicId | null
}

interface TopicHrefContext {
  level?: TopicLevelOrAll | null
  group?: string | null
}

interface OverviewHrefOptions {
  level?: TopicLevelOrAll | null
}

const levelSet = new Set<TopicLevel>(ALLOWED_LEVELS)
const levelOrAllSet = new Set<TopicLevelOrAll>([ALL_LEVEL, ...ALLOWED_LEVELS])

const asSingleString = (value: QueryValue): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return undefined

  const normalized = raw.trim()
  return normalized.length > 0 ? normalized : undefined
}

export const parseTopicLevel = (value: QueryValue): TopicLevel | undefined => {
  const candidate = asSingleString(value)
  if (!candidate || !levelSet.has(candidate as TopicLevel)) return undefined
  return candidate as TopicLevel
}

export const parseTopicLevelOrAll = (value: QueryValue): TopicLevelOrAll | undefined => {
  const candidate = asSingleString(value)
  if (!candidate || !levelOrAllSet.has(candidate as TopicLevelOrAll)) return undefined
  return candidate as TopicLevelOrAll
}

export const parseOverviewQueryState = (query: RouteQueryInput): OverviewQueryState => {
  const level = parseTopicLevelOrAll(query.level) ?? ALL_LEVEL
  return { level }
}

export const parseExplorerQueryState = (query: RouteQueryInput): ExplorerQueryState => {
  const level = parseTopicLevelOrAll(query.level) ?? ALL_LEVEL
  const group = asSingleString(query.group)
  const topicId = asSingleString(query.topic)
  const requestedQuery = asSingleString(query.q)

  return { level, group, topicId, query: requestedQuery }
}

export const hasLegacyExplorerSignal = (query: RouteQueryInput): boolean => {
  const view = asSingleString(query.view)
  if (view === "explorer") return true
  if (asSingleString(query.topic)) return true
  if (asSingleString(query.group)) return true
  if (asSingleString(query.q)) return true
  return false
}

export const buildOverviewHref = ({ level }: OverviewHrefOptions = {}): string => {
  const params = new URLSearchParams()
  if (level && level !== ALL_LEVEL) params.set("level", level)

  const query = params.toString()
  return query.length > 0 ? `/?${query}` : "/"
}

export const buildExplorerHref = ({ level, group, query: searchQuery, topicId }: ExplorerHrefOptions): string => {
  const params = new URLSearchParams()

  if (level && level !== ALL_LEVEL) params.set("level", level)
  if (group) params.set("group", group)
  if (searchQuery) params.set("q", searchQuery)
  if (topicId) params.set("topic", topicId)

  const encodedParams = params.toString()
  return encodedParams.length > 0 ? `/explorer?${encodedParams}` : "/explorer"
}

export const buildTopicDetailHref = (topicId: TopicId, context: TopicHrefContext = {}): string => {
  const params = new URLSearchParams()

  if (context.level) params.set("level", context.level)
  if (context.group) params.set("group", context.group)

  const query = params.toString()
  const base = `/topic/${encodeURIComponent(topicId)}`
  return query.length > 0 ? `${base}?${query}` : base
}
