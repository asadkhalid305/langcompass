"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, BookOpenText, Search, X } from "lucide-react"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ALLOWED_LEVELS } from "@/lib/constants/topic"
import {
  formatIntroducedInLabel,
  formatRevisitedInLabel,
  humanizeCategoryLabel,
  humanizeDifficultyStageLabel,
  humanizeGroupLabel,
} from "@/lib/explorer/labels"
import { createTopicSearchEngine } from "@/lib/explorer/search"
import { getAllLevelTopicCounts, getGroupedTopicSectionsForLevel } from "@/lib/explorer/selectors"
import type { ExplorerTopicSection } from "@/lib/explorer/types"
import type { TopicCatalogItem, TopicDetail, TopicId, TopicLevel } from "@/lib/types/topic"
import { cn } from "@/lib/utils/cn"

interface LangCompassShellProps {
  topics: TopicCatalogItem[]
  detailTopicIds: TopicId[]
}

type ShellView = "overview" | "explorer"

interface TopicDetailResponse {
  detail: TopicDetail | null
}

interface LevelProfile {
  title: string
  description: string
}

interface GroupSummary {
  group: string
  category: string
  totalCount: number
  introducedCount: number
  revisitedCount: number
}

interface LevelNavigationProps {
  selectedLevel: TopicLevel
  levelCounts: ReturnType<typeof getAllLevelTopicCounts>
  onLevelSelect: (level: TopicLevel) => void
}


interface OverviewViewProps {
  selectedLevel: TopicLevel
  levelProfile: LevelProfile
  selectedLevelCounts: ReturnType<typeof getAllLevelTopicCounts>[TopicLevel]
  groupSummaries: GroupSummary[]
  onExploreLevel: () => void
  onExploreGroup: (group: string) => void
}

interface TopicNodeProps {
  topic: TopicCatalogItem
  isSelected: boolean
  showEarlierIndicator?: boolean
  onOpenTopic: (topicId: TopicId) => void
}

interface ExplorerViewProps {
  selectedLevel: TopicLevel
  selectedLevelCounts: ReturnType<typeof getAllLevelTopicCounts>[TopicLevel]
  hasActiveSearch: boolean
  totalSearchMatches: number
  searchResultsByLevel: Array<{ level: TopicLevel; topics: TopicCatalogItem[] }>
  sections: ExplorerTopicSection[]
  focusedGroup: string | null
  onClearFocusedGroup: () => void
  selectedTopicId: TopicId | null
  onOpenTopic: (topicId: TopicId) => void
}

interface TopicDetailPanelProps {
  topic: TopicCatalogItem | null
  detail: TopicDetail | null | undefined
  hasDetailFile: boolean
  isLoading: boolean
  loadError: string | undefined
}

const LEVEL_PROFILES: Record<TopicLevel, LevelProfile> = {
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

const formatDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(parsed)
}

const topicAppearsInLevel = (topic: TopicCatalogItem, level: TopicLevel): boolean =>
  topic.firstIntroducedIn === level || topic.revisitedIn.includes(level)



const LevelNavigation = ({ selectedLevel, levelCounts, onLevelSelect }: LevelNavigationProps) => (
  <nav className="space-y-1" aria-label="Curriculum levels">
    {ALLOWED_LEVELS.map((level) => {
      const counts = levelCounts[level]
      const isActive = level === selectedLevel

      return (
        <button
          type="button"
          key={level}
          onClick={() => onLevelSelect(level)}
          className={cn(
            "group flex w-full items-center justify-between py-2 text-left transition-all",
            isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <div className="flex items-center gap-3">
            <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-foreground" : "bg-transparent group-hover:bg-muted-foreground")} aria-hidden="true" />
            <span className={cn("text-base tracking-tight", isActive ? "font-display text-xl" : "font-sans font-medium")}>{level}</span>
          </div>
          <span className="text-xs font-medium tracking-wider">{counts.totalCount}</span>
        </button>
      )
    })}
  </nav>
)

const CATEGORY_ORDER = ["basics", "vocabulary", "grammar", "communication"]

const getCategoryLabel = (category: string): string => {
  switch (category.toLowerCase()) {
    case "basics": return "Basics"
    case "vocabulary": return "Vocabulary"
    case "grammar": return "Grammar"
    case "communication": return "Communication"
    default: return category.charAt(0).toUpperCase() + category.slice(1)
  }
}

const OverviewView = ({
  selectedLevel,
  levelProfile,
  selectedLevelCounts,
  groupSummaries,
  onExploreLevel,
  onExploreGroup,
}: OverviewViewProps) => {
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, GroupSummary[]>()
    for (const summary of groupSummaries) {
      const key = summary.category
      const existing = map.get(key) ?? []
      existing.push(summary)
      map.set(key, existing)
    }
    // Sort categories by defined order
    const sorted = new Map<string, GroupSummary[]>()
    for (const cat of CATEGORY_ORDER) {
      if (map.has(cat)) sorted.set(cat, map.get(cat)!)
    }
    // Append any unknown categories that aren't in CATEGORY_ORDER
    for (const [cat, groups] of map) {
      if (!sorted.has(cat)) sorted.set(cat, groups)
    }
    return sorted
  }, [groupSummaries])

  return (
    <div className="space-y-8 p-4 md:p-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Curriculum overview</p>
        <h2 className="mt-4 text-pretty text-3xl font-display font-bold md:text-5xl">Level {selectedLevel}: {levelProfile.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{levelProfile.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-medium text-foreground">
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-foreground rounded-full" />{selectedLevelCounts.totalCount} topics</span>
          {selectedLevelCounts.introducedCount > 0 && (
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-muted-foreground rounded-full" />{selectedLevelCounts.introducedCount} newly introduced</span>
          )}
          {selectedLevelCounts.revisitedCount > 0 && (
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-border rounded-full" />{selectedLevelCounts.revisitedCount} revisited from earlier levels</span>
          )}
        </div>
        <Button onClick={onExploreLevel} className="mt-8 rounded-none border-foreground shadow-[4px_4px_0_#111827] hover:shadow-[2px_2px_0_#111827] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" size="lg">
          Open topic explorer
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </section>

      <div className="space-y-10">
        {Array.from(groupedByCategory.entries()).map(([category, groups]) => (
          <section key={category}>
            <div className="flex items-center gap-3 mb-5">
              <span
                className={cn(
                  "inline-block w-2.5 h-2.5 rounded-full",
                  category === "basics" ? "bg-syntax-main" :
                  category === "vocabulary" ? "bg-vocab-main" :
                  category === "grammar" ? "bg-grammar-main" :
                  category === "communication" ? "bg-comm-main" : "bg-foreground"
                )}
                aria-hidden="true"
              />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{getCategoryLabel(category)}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((groupSummary) => (
                <button
                  key={groupSummary.group}
                  type="button"
                  onClick={() => onExploreGroup(groupSummary.group)}
                  className={cn(
                    "group flex flex-col gap-1.5 p-5 bg-white border border-border text-left transition-all duration-200",
                    "hover:shadow-[4px_4px_0px_#111827] hover:-translate-x-[2px] hover:-translate-y-[2px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  )}
                >
                  <h3 className="text-sm font-bold font-sans group-hover:underline underline-offset-2">{humanizeGroupLabel(groupSummary.group)}</h3>
                  <p className="text-xs tracking-wider text-muted-foreground uppercase font-medium">
                    {groupSummary.introducedCount > 0 ? `${groupSummary.introducedCount} new` : null}
                    {groupSummary.introducedCount > 0 && groupSummary.revisitedCount > 0 ? " · " : null}
                    {groupSummary.revisitedCount > 0 ? `${groupSummary.revisitedCount} revisited` : null}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

const PathConnector = () => (
  <div className="flex items-center justify-center w-6 md:w-8 shrink-0" aria-hidden>
    <div className="w-full h-[2px] bg-border" />
  </div>
)

const getCategoryColorClasses = (category: string) => {
  switch (category.toLowerCase()) {
    case "grammar":
      return "border-l-grammar-main bg-grammar-bg"
    case "vocabulary":
      return "border-l-vocab-main bg-vocab-bg"
    case "communication":
      return "border-l-comm-main bg-comm-bg"
    case "basics":
    case "syntax":
    default:
      return "border-l-syntax-main bg-syntax-bg"
  }
}

const TopicNode = ({ topic, isSelected, showEarlierIndicator = false, onOpenTopic }: TopicNodeProps) => (
  <button
    type="button"
    onClick={() => onOpenTopic(topic.id)}
    className={cn(
      "min-w-[14rem] flex flex-col justify-start text-left p-4 transition-all duration-200 ring-1 ring-border rounded-none border-l-4",
      getCategoryColorClasses(topic.category),
      "shadow-[2px_2px_0px_#111827] hover:shadow-[4px_4px_0px_#111827] hover:-translate-y-0.5 hover:-translate-x-0.5",
      isSelected ? "ring-2 ring-foreground shadow-[4px_4px_0px_#111827] -translate-y-0.5 -translate-x-0.5" : "",
    )}
  >
    <p className="text-base font-bold leading-snug font-sans text-foreground">{topic.title}</p>
    <div className="mt-3 flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
      <span>{humanizeCategoryLabel(topic.category)}</span>
      <span className="w-1 h-1 bg-border rounded-full" />
      <span>{humanizeDifficultyStageLabel(topic.difficultyStage)}</span>
    </div>
    {showEarlierIndicator ? (
      <p className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden="true" />
        Revisited
      </p>
    ) : null}
  </button>
)

const ExplorerView = ({
  selectedLevel,
  selectedLevelCounts,
  hasActiveSearch,
  totalSearchMatches,
  searchResultsByLevel,
  sections,
  focusedGroup,
  onClearFocusedGroup,
  selectedTopicId,
  onOpenTopic,
}: ExplorerViewProps) => (
  <div className="space-y-10 pr-0 md:pr-4">
    <section className="bg-white border text-center border-border px-8 py-8 shadow-sm">
      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Learning flow</p>
      {!hasActiveSearch ? (
        <>
          <h2 className="mt-1 text-pretty text-xl font-semibold">Level {selectedLevel} explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedLevelCounts.introducedCount > 0 ? `${selectedLevelCounts.introducedCount} new` : null}
            {selectedLevelCounts.introducedCount > 0 && selectedLevelCounts.revisitedCount > 0 ? " and " : null}
            {selectedLevelCounts.revisitedCount > 0 ? `${selectedLevelCounts.revisitedCount} revisited` : null}
            {" topics in this level."}
          </p>
          {focusedGroup ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs ring-1 ring-border">
              <span>Focused group: {humanizeGroupLabel(focusedGroup)}</span>
              <button type="button" onClick={onClearFocusedGroup} className="text-muted-foreground hover:text-foreground">
                Clear
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <h2 className="mt-1 text-pretty text-xl font-semibold">Global search</h2>
          <p className="mt-1 text-sm text-muted-foreground">{totalSearchMatches} matching topics across all levels.</p>
        </>
      )}
    </section>

    {!hasActiveSearch ? (
      <div className="space-y-16">
        {sections.map((section) => {
          const hasIntroduced = section.introducedTopics.length > 0
          const hasRevisited = section.revisitedTopics.length > 0

          if (!hasIntroduced && !hasRevisited) return null

          return (
            <section key={section.group} className="[content-visibility:auto]">
              <header className="mb-6 flex items-baseline gap-4">
                <h3 className="text-2xl font-display font-bold">{humanizeGroupLabel(section.group)}</h3>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{section.topics.length} topics</p>
              </header>

              <div className="space-y-8">
                {hasIntroduced ? (
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">New in {selectedLevel}</p>
                    <div className="flex items-center overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
                      {section.introducedTopics.map((topic, index) => (
                        <div key={topic.id} className="flex items-center shrink-0">
                          <TopicNode
                            topic={topic}
                            isSelected={topic.id === selectedTopicId}
                            onOpenTopic={onOpenTopic}
                          />
                          {index < section.introducedTopics.length - 1 && <PathConnector />}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {hasRevisited ? (
                  <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Revisited from earlier levels</p>
                    <div className="flex items-center overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
                      {section.revisitedTopics.map((topic, index) => (
                        <div key={topic.id} className="flex items-center shrink-0">
                          <TopicNode
                            topic={topic}
                            isSelected={topic.id === selectedTopicId}
                            showEarlierIndicator
                            onOpenTopic={onOpenTopic}
                          />
                          {index < section.revisitedTopics.length - 1 && <PathConnector />}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>
    ) : (
      <div className="space-y-8">
        {searchResultsByLevel.length > 0 ? (
          searchResultsByLevel.map((entry) => (
            <section key={entry.level} className="space-y-3 [content-visibility:auto]">
              <header className="flex items-end justify-between gap-3 border-b border-border/80 pb-2">
                <h3 className="text-sm font-semibold">Level {entry.level}</h3>
                <p className="text-xs text-muted-foreground">{entry.topics.length} matches</p>
              </header>
              <div className="flex flex-wrap gap-2.5 md:gap-3">
                {entry.topics.map((topic) => (
                  <TopicNode
                    key={topic.id}
                    topic={topic}
                    isSelected={topic.id === selectedTopicId}
                    onOpenTopic={onOpenTopic}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="rounded-lg bg-muted/35 px-4 py-6 text-center">
            <p className="text-sm font-medium">No matching topics</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a broader query.</p>
          </section>
        )}
      </div>
    )}
  </div>
)

const TopicDetailPanel = ({ topic, detail, hasDetailFile, isLoading, loadError }: TopicDetailPanelProps) => {
  if (!topic) {
    return (
      <div className="flex h-full min-h-[20rem] flex-col items-center justify-center px-6 text-center">
        <BookOpenText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium">Select a topic node</p>
        <p className="mt-1 text-sm text-muted-foreground">The learning sheet opens here with curriculum placement and detail content.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] border-l border-border">
      <header className="px-8 py-10 md:py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learning sheet</p>
        <h2 className="mt-4 text-pretty text-4xl font-display font-bold leading-tight md:text-5xl">{topic.title}</h2>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <span className={cn("px-2 py-1 bg-background ring-1 ring-border", getCategoryColorClasses(topic.category).split(" ")[0])}>
            {humanizeCategoryLabel(topic.category)}
          </span>
          <span className="text-muted-foreground">{humanizeDifficultyStageLabel(topic.difficultyStage)}</span>
          <span className={cn(hasDetailFile ? "text-foreground" : "text-muted-foreground")}>{hasDetailFile ? "Detail available" : "Catalog metadata only"}</span>
        </div>
      </header>

      <div className="flex-1 space-y-12 overflow-y-auto px-8 pb-12 text-base leading-relaxed" aria-live="polite">
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Curriculum placement</p>
          <p className="mt-3 text-foreground font-medium">{formatIntroducedInLabel(topic.firstIntroducedIn)}</p>
          <p className="mt-1 text-muted-foreground">{formatRevisitedInLabel(topic.revisitedIn)}</p>
        </section>

        {!hasDetailFile ? (
          <section className="pt-4 border-t border-border">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Detail file not added yet</p>
            <p className="mt-3 text-muted-foreground max-w-prose">
              This topic is ready for exploration from catalog metadata. Add `data/topic-details/{topic.id}.json` for full lesson content.
            </p>
          </section>
        ) : null}

        {hasDetailFile && isLoading ? (
          <section className="pt-4 border-t border-border">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading detail content…</p>
            <p className="mt-3 text-muted-foreground max-w-prose">Fetching summary and supporting sections.</p>
          </section>
        ) : null}

        {hasDetailFile && loadError ? (
          <section className="pt-4 border-t border-border">
            <p className="text-sm font-bold uppercase tracking-widest text-red-500">Could not load detail content</p>
            <p className="mt-3 text-muted-foreground max-w-prose">{loadError}</p>
          </section>
        ) : null}

        {hasDetailFile && detail ? (
          <>
            <section className="pt-4 border-t border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Summary</p>
              <p className="mt-4 leading-relaxed text-foreground max-w-prose text-lg">{detail.summary}</p>
            </section>

            {detail.whyItMatters ? (
              <section className="pt-4 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Why it matters</p>
                <p className="mt-4 leading-relaxed text-foreground max-w-prose">{detail.whyItMatters}</p>
              </section>
            ) : null}

            <section className="pt-4 border-t border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detail snapshot</p>
              <p className="mt-4 font-medium text-foreground">{detail.ruleBlocks.length} rule blocks</p>
              <p className="mt-1 text-muted-foreground max-w-prose">{detail.examples?.length ?? 0} examples · {detail.tables?.length ?? 0} tables</p>
              <p className="mt-4 text-sm text-muted-foreground">Updated {formatDate(detail.updatedAt)}</p>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function LangCompassShell({ topics, detailTopicIds }: LangCompassShellProps) {
  const [activeView, setActiveView] = useState<ShellView>("overview")
  const [selectedLevel, setSelectedLevel] = useState<TopicLevel>(ALLOWED_LEVELS[0])
  const [focusedGroup, setFocusedGroup] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const deferredSearchInput = useDeferredValue(searchInput)
  const [selectedTopicId, setSelectedTopicId] = useState<TopicId | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  const [detailByTopicId, setDetailByTopicId] = useState<Partial<Record<TopicId, TopicDetail | null>>>({})
  const [detailLoadErrors, setDetailLoadErrors] = useState<Partial<Record<TopicId, string>>>({})
  const [loadingTopicId, setLoadingTopicId] = useState<TopicId | null>(null)

  const normalizedQuery = deferredSearchInput.trim()
  const hasActiveSearch = normalizedQuery.length > 0
  const detailTopicIdSet = useMemo(() => new Set(detailTopicIds), [detailTopicIds])
  const topicsById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics])

  const levelCounts = useMemo(() => getAllLevelTopicCounts(topics), [topics])
  const levelSections = useMemo(() => getGroupedTopicSectionsForLevel(topics, selectedLevel), [selectedLevel, topics])

  const firstTopicByLevel = useMemo(() => {
    const mapping = new Map<TopicLevel, TopicId | null>()

    for (const level of ALLOWED_LEVELS) {
      const sections = getGroupedTopicSectionsForLevel(topics, level)
      const firstTopicId = sections.find((section) => section.topics.length > 0)?.topics[0]?.id ?? null
      mapping.set(level, firstTopicId)
    }

    return mapping
  }, [topics])

  const levelProfile = LEVEL_PROFILES[selectedLevel]
  const selectedLevelCounts = levelCounts[selectedLevel]

  const groupSummaries = useMemo<GroupSummary[]>(
    () =>
      levelSections
        .filter((section) => section.topics.length > 0)
        .map((section) => {
          // Determine dominant category by most-frequent category among this group's topics
          const categoryCounts: Record<string, number> = {}
          for (const topic of section.topics) {
            categoryCounts[topic.category] = (categoryCounts[topic.category] ?? 0) + 1
          }
          const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "basics"

          return {
            group: section.group,
            category: dominantCategory,
            totalCount: section.topics.length,
            introducedCount: section.introducedTopics.length,
            revisitedCount: section.revisitedTopics.length,
          }
        }),
    [levelSections],
  )

  const searchEngine = useMemo(
    () =>
      createTopicSearchEngine(topics, {
        threshold: 0.3,
        minMatchCharLength: 2,
        exactMatchBoost: true,
      }),
    [topics],
  )

  const globalSearchResults = useMemo(() => {
    if (!hasActiveSearch) return []
    return searchEngine.search(normalizedQuery, { limit: 140 }).map((result) => result.topic)
  }, [hasActiveSearch, normalizedQuery, searchEngine])

  const searchResultsByLevel = useMemo(() => {
    const grouped = new Map<TopicLevel, TopicCatalogItem[]>()

    for (const level of ALLOWED_LEVELS) {
      grouped.set(level, [])
    }

    for (const topic of globalSearchResults) {
      grouped.get(topic.level)?.push(topic)
    }

    return ALLOWED_LEVELS.map((level) => ({ level, topics: grouped.get(level) ?? [] })).filter((entry) => entry.topics.length > 0)
  }, [globalSearchResults])

  const explorerSections = useMemo(() => {
    const withTopics = levelSections.filter((section) => section.topics.length > 0)

    if (hasActiveSearch || !focusedGroup) {
      return withTopics
    }

    return withTopics.filter((section) => section.group === focusedGroup)
  }, [focusedGroup, hasActiveSearch, levelSections])

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null
    return topicsById.get(selectedTopicId) ?? null
  }, [selectedTopicId, topicsById])

  const selectedTopicHasDetailFile = Boolean(selectedTopic && detailTopicIdSet.has(selectedTopic.id))
  const selectedTopicDetail = selectedTopic ? detailByTopicId[selectedTopic.id] : undefined
  const selectedTopicLoadError = selectedTopic ? detailLoadErrors[selectedTopic.id] : undefined

  useEffect(() => {
    if (!selectedTopic || !detailTopicIdSet.has(selectedTopic.id)) return
    if (selectedTopicDetail !== undefined) return

    const controller = new AbortController()

    const fetchDetail = async (): Promise<void> => {
      setLoadingTopicId(selectedTopic.id)

      try {
        const response = await fetch(`/api/topic-details/${encodeURIComponent(selectedTopic.id)}`, {
          signal: controller.signal,
          cache: "force-cache",
        })

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`)
        }

        const payload = (await response.json()) as TopicDetailResponse
        setDetailByTopicId((current) => ({
          ...current,
          [selectedTopic.id]: payload.detail,
        }))
      } catch (error) {
        if (controller.signal.aborted) return

        const message = error instanceof Error ? error.message : "Unknown error"
        setDetailLoadErrors((current) => ({
          ...current,
          [selectedTopic.id]: message,
        }))
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTopicId((current) => (current === selectedTopic.id ? null : current))
        }
      }
    }

    void fetchDetail()

    return () => {
      controller.abort()
    }
  }, [detailTopicIdSet, selectedTopic, selectedTopicDetail])

  const handleLevelSelect = (level: TopicLevel): void => {
    setSelectedLevel(level)
    setFocusedGroup(null)

    setSelectedTopicId((currentTopicId) => {
      if (!currentTopicId) return firstTopicByLevel.get(level) ?? null

      const currentTopic = topicsById.get(currentTopicId)
      if (currentTopic && topicAppearsInLevel(currentTopic, level)) return currentTopicId

      return firstTopicByLevel.get(level) ?? currentTopicId
    })
  }

  const handleSearchChange = (value: string): void => {
    setSearchInput(value)

    if (value.trim().length > 0 && activeView !== "explorer") {
      setActiveView("explorer")
    }
  }

  const openTopic = (topicId: TopicId): void => {
    setSelectedTopicId(topicId)
    setActiveView("explorer")
    setDetailSheetOpen(true)
  }

  const openExplorerWithGroup = (group: string): void => {
    setFocusedGroup(group)
    setSearchInput("")
    setActiveView("explorer")
  }

  const openExplorerLevel = (): void => {
    setFocusedGroup(null)
    setSearchInput("")
    setActiveView("explorer")
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1500px] px-3 py-4 md:px-5 md:py-6">
        <header className="mb-6 px-4 md:px-0">
          <div className="flex items-center justify-between py-5">
            {/* Left: Logo (always home) + optional breadcrumb trail */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setActiveView("overview")}
                className="text-xl font-display font-bold tracking-tight hover:opacity-70 transition-opacity shrink-0"
                aria-label="Go to overview"
                title="Home"
              >
                LangCompass
              </button>
              {activeView === "explorer" && (
                <>
                  <span className="text-muted-foreground/50 font-light text-lg select-none" aria-hidden="true">/</span>
                  <span className="text-sm text-muted-foreground truncate">
                    {selectedLevel} Explorer
                  </span>
                </>
              )}
            </div>

            {/* Right: mobile level select + search */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile level selector */}
              <select
                className="h-9 rounded-none border border-border bg-background px-2 text-sm md:hidden"
                value={selectedLevel}
                onChange={(event) => handleLevelSelect(event.target.value as TopicLevel)}
                aria-label="Select level"
              >
                {ALLOWED_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              {/* Compact search — always visible on the right */}
              <div className="relative w-40 sm:w-56 md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={searchInput}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search topics…"
                  className="pl-9 h-9 text-sm rounded-none border border-border bg-background shadow-none focus-visible:ring-0 focus-visible:border-foreground"
                  aria-label="Search topics"
                  name="topicSearch"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </header>

        <div
          className={cn(
            "grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]",
            activeView === "explorer" && selectedTopicId ? "lg:grid-cols-[13rem_minmax(0,1fr)_22rem]" : "",
          )}
        >
          <aside className="hidden md:flex md:h-[calc(100dvh-12rem)] md:flex-col md:pr-6 md:sticky md:top-6">
            <div className="mb-6 px-1 pb-4 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Levels</p>
            </div>
            <LevelNavigation selectedLevel={selectedLevel} levelCounts={levelCounts} onLevelSelect={handleLevelSelect} />
          </aside>

          <main className="min-h-[72dvh] bg-transparent">
            {activeView === "overview" ? (
              <OverviewView
                selectedLevel={selectedLevel}
                levelProfile={levelProfile}
                selectedLevelCounts={selectedLevelCounts}
                groupSummaries={groupSummaries}
                onExploreLevel={openExplorerLevel}
                onExploreGroup={openExplorerWithGroup}
              />
            ) : (
              <ExplorerView
                selectedLevel={selectedLevel}
                selectedLevelCounts={selectedLevelCounts}
                hasActiveSearch={hasActiveSearch}
                totalSearchMatches={globalSearchResults.length}
                searchResultsByLevel={searchResultsByLevel}
                sections={explorerSections}
                focusedGroup={focusedGroup}
                onClearFocusedGroup={() => setFocusedGroup(null)}
                selectedTopicId={selectedTopicId}
                onOpenTopic={openTopic}
              />
            )}
          </main>

          {activeView === "explorer" && selectedTopicId ? (
            <aside className="hidden lg:flex lg:flex-col lg:h-[calc(100dvh-6rem)] lg:overflow-hidden lg:bg-white lg:shadow-[0_0_40px_rgba(0,0,0,0.05)] lg:border-l lg:border-border lg:sticky lg:top-6">
              <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-border shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Topic detail</p>
                <button
                  type="button"
                  onClick={() => setSelectedTopicId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <TopicDetailPanel
                topic={selectedTopic}
                detail={selectedTopicDetail}
                hasDetailFile={selectedTopicHasDetailFile}
                isLoading={loadingTopicId === selectedTopic?.id}
                loadError={selectedTopicLoadError}
              />
            </aside>
          ) : null}
        </div>
      </div>

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="bottom" className="h-[80dvh] p-0 lg:hidden">
          <SheetHeader className="border-b border-border/80 pb-4">
            <SheetTitle>Topic details</SheetTitle>
            <SheetDescription>
              {selectedTopic ? selectedTopic.title : "Select a topic from the explorer to open details."}
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100%-5.1rem)] overflow-y-auto">
            <TopicDetailPanel
              topic={selectedTopic}
              detail={selectedTopicDetail}
              hasDetailFile={selectedTopicHasDetailFile}
              isLoading={loadingTopicId === selectedTopic?.id}
              loadError={selectedTopicLoadError}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
