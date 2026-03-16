import type { LevelProfile } from "./types"
import type { TopicLevel } from "@/lib/types/topic"

export const LEVEL_PROFILES: Record<TopicLevel, LevelProfile> = {
  "A1.1": {
    title: "Starter foundations",
    description: "First contact with German sounds, core vocabulary, and basic sentence building blocks.",
  },
  "A1.2": {
    title: "Everyday basics",
    description: "Expands daily communication with practical grammar and early case usage.",
  },
  "A2.1": {
    title: "Functional independence",
    description: "Connects familiar themes into longer messages and introduces broader structures.",
  },
  "A2.2": {
    title: "Confident routine language",
    description: "Strengthens fluency in common contexts with more variation and control.",
  },
  "B1.1": {
    title: "Intermediate transition",
    description: "Moves from survival language toward connected explanations and opinions.",
  },
  "B1.2": {
    title: "Practical intermediate depth",
    description: "Reinforces grammar combinations and nuanced communication patterns.",
  },
  "B2.1": {
    title: "Advanced precision",
    description: "Builds precision, contrast, and stronger command of complex forms.",
  },
  "B2.2": {
    title: "Upper-intermediate mastery",
    description: "Consolidates broad topic control and prepares for advanced-level learning.",
  },
}

export const CATEGORY_ORDER = ["basics", "vocabulary", "grammar", "communication"]
