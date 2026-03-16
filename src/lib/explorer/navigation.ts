import { ALLOWED_LEVELS } from "../constants/topic"
import type { TopicId, TopicLevel } from "../types/topic"

export type ShellView = "overview" | "explorer"

export type QueryValue = string | string[] | undefined | null

export interface ExplorerQueryInput {
  view?: QueryValue
  level?: QueryValue
  group?: QueryValue
  topic?: QueryValue
}

export interface ExplorerQueryState {
  view: ShellView
  level?: TopicLevel
  group?: string
  topicId?: TopicId
}

interface ExplorerHrefOptions {
  level?: TopicLevel | null
  group?: string | null
  topicId?: TopicId | null
}

interface TopicHrefContext {
  level?: TopicLevel | null
  group?: string | null
}

const levelSet = new Set<TopicLevel>(ALLOWED_LEVELS)

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

export const parseExplorerQueryState = (query: ExplorerQueryInput): ExplorerQueryState => {
  const view = asSingleString(query.view) === "explorer" ? "explorer" : "overview"
  const level = parseTopicLevel(query.level)
  const group = asSingleString(query.group)
  const topicId = asSingleString(query.topic)

  return {
    view,
    level,
    group,
    topicId,
  }
}

export const buildExplorerHref = ({ level, group, topicId }: ExplorerHrefOptions): string => {
  const params = new URLSearchParams()
  params.set("view", "explorer")

  if (level) params.set("level", level)
  if (group) params.set("group", group)
  if (topicId) params.set("topic", topicId)

  const query = params.toString()
  return query.length > 0 ? `/?${query}` : "/"
}

export const buildTopicDetailHref = (topicId: TopicId, context: TopicHrefContext = {}): string => {
  const params = new URLSearchParams()

  if (context.level) params.set("level", context.level)
  if (context.group) params.set("group", context.group)

  const query = params.toString()
  const base = `/topic/${encodeURIComponent(topicId)}`
  return query.length > 0 ? `${base}?${query}` : base
}
