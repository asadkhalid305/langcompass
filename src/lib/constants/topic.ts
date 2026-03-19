export const ALLOWED_LEVELS = [
  "A1.1",
  "A1.2",
  "A2.1",
  "A2.2",
  "B1.1",
  "B1.2",
  "B2.1",
  "B2.2",
] as const

export const ALL_LEVEL = "All" as const
export const ALLOWED_LEVEL_OPTIONS = [ALL_LEVEL, ...ALLOWED_LEVELS] as const

export const ALLOWED_DIFFICULTY_STAGES = ["intro", "core", "expanded", "combined", "advanced"] as const

export const ALLOWED_TOPIC_SECTIONS = ["themes", "grammar", "communication"] as const
export const ALLOWED_TOPIC_TYPES = ["theme", "grammar", "communication"] as const
export const TOPIC_SECTION_ORDER = ["themes", "grammar", "communication"] as const

export const LEGACY_CATEGORY_TO_SECTION = {
  basics: "themes",
  vocabulary: "themes",
  communication: "communication",
  grammar: "grammar",
} as const

export const TOPIC_TYPE_BY_SECTION = {
  themes: "theme",
  grammar: "grammar",
  communication: "communication",
} as const
