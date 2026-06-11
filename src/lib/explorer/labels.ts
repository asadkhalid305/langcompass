import { ALLOWED_LEVELS } from "../constants"
import type { TopicCatalogItem, TopicDifficultyStage, TopicLevel, TopicSection, TopicType } from "../types"

const toTitleCase = (value: string): string =>
  value
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")

const humanizeValue = (value: string): string => toTitleCase(value.replace(/[_-]+/g, " ").trim())

const levelOrder = new Map<TopicLevel, number>(ALLOWED_LEVELS.map((level, index) => [level, index]))

const sortLevels = (levels: TopicLevel[]): TopicLevel[] =>
  [...levels].sort(
    (a, b) => (levelOrder.get(a) ?? Number.MAX_SAFE_INTEGER) - (levelOrder.get(b) ?? Number.MAX_SAFE_INTEGER),
  )

export const formatIntroducedInLabel = (level: TopicLevel): string => `Introduced in ${level}`

export const formatRevisitedInLabel = (levels: TopicLevel[]): string => {
  if (levels.length === 0) return "Not revisited yet"
  return `Revisited in ${sortLevels(levels).join(", ")}`
}

export const formatTopicProgressLabels = (topic: Pick<TopicCatalogItem, "firstIntroducedIn" | "revisitedIn">) => ({
  introduced: formatIntroducedInLabel(topic.firstIntroducedIn),
  revisited: formatRevisitedInLabel(topic.revisitedIn),
})

export const humanizeSectionLabel = (section: TopicSection): string => humanizeValue(section)
export const humanizeGroupLabel = (group: string): string => humanizeValue(group)
export const humanizeDifficultyStageLabel = (stage: TopicDifficultyStage): string => humanizeValue(stage)
export const humanizeTopicTypeLabel = (topicType: TopicType): string => humanizeValue(topicType)
export const isSectionFallbackGroup = (group: string | undefined, section: TopicSection): boolean => group === section
