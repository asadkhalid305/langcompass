import { ALLOWED_LEVELS } from "../constants"
import type { TopicLevel } from "../types"
import type { ExplorerFilters, ExplorerState, ExplorerStatePatch } from "./types"

export const createDefaultExplorerFilters = (): ExplorerFilters => ({
  levels: [],
  categories: [],
  groups: [],
  difficultyStages: [],
  hasDetailFile: "any",
})

export const createDefaultExplorerState = (selectedLevel: TopicLevel = ALLOWED_LEVELS[0]): ExplorerState => ({
  selectedLevel,
  searchQuery: "",
  activeFilters: createDefaultExplorerFilters(),
  selectedTopicId: null,
})

export const clearExplorerFilters = (state: ExplorerState): ExplorerState => ({
  ...state,
  activeFilters: createDefaultExplorerFilters(),
})

export const updateExplorerState = (state: ExplorerState, patch: ExplorerStatePatch): ExplorerState => {
  const { activeFilters, ...restPatch } = patch

  if (!activeFilters) {
    return { ...state, ...restPatch }
  }

  return {
    ...state,
    ...restPatch,
    activeFilters: {
      ...state.activeFilters,
      ...activeFilters,
    },
  }
}
