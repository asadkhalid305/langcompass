"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ExplorerView } from "@/components/explorer/shell/explorer-view"
import { LevelNavigation } from "@/components/explorer/shell/level-navigation"
import { OverviewView } from "@/components/explorer/shell/overview-view"
import { ShellHeader } from "@/components/explorer/shell/shell-header"
import { LEVEL_PROFILES } from "@/components/explorer/shell/constants"
import { TopicPreviewDrawer } from "@/components/explorer/shell/topic-preview-drawer"
import { useDesktopViewport } from "@/components/explorer/shell/use-desktop-viewport"
import { useTopicDetailPreview } from "@/components/explorer/shell/use-topic-detail-preview"
import type { GroupSummary, LevelCounts } from "@/components/explorer/shell/types"
import { ALLOWED_LEVELS, ALL_LEVEL } from "@/lib/constants/topic"
import { buildExplorerHref, buildOverviewHref, buildTopicDetailHref, parseExplorerQueryState, parseOverviewQueryState } from "@/lib/explorer/navigation"
import { createTopicSearchEngine } from "@/lib/explorer/search"
import { getAllLevelTopicCounts, getGroupedTopicSectionsForLevel } from "@/lib/explorer/selectors"
import type { ExplorerTopicSection } from "@/lib/explorer/types"
import type { TopicCatalogItem, TopicId, TopicLevel, TopicLevelOrAll } from "@/lib/types/topic"
import { cn } from "@/lib/utils/cn"

interface LangCompassShellProps {
  mode: "overview" | "explorer"
  topics: TopicCatalogItem[]
  detailTopicIds: TopicId[]
}

const sortTopicsByTitle = (topics: TopicCatalogItem[]): TopicCatalogItem[] => [...topics].sort((a, b) => a.title.localeCompare(b.title))

const topicAppearsInLevel = (topic: TopicCatalogItem, level: TopicLevelOrAll): boolean =>
  level === ALL_LEVEL || topic.firstIntroducedIn === level || topic.revisitedIn.includes(level)

const getGroupedTopicSectionsForAllLevels = (topics: TopicCatalogItem[]): ExplorerTopicSection[] => {
  const grouped = new Map<string, TopicCatalogItem[]>()

  for (const topic of topics) {
    const existing = grouped.get(topic.group) ?? []
    existing.push(topic)
    grouped.set(topic.group, existing)
  }

  return [...grouped.entries()]
    .sort(([leftGroup], [rightGroup]) => leftGroup.localeCompare(rightGroup))
    .map(([group, groupTopics]) => {
      const sortedTopics = sortTopicsByTitle(groupTopics)

      return {
        group,
        introducedTopics: sortedTopics,
        revisitedTopics: [],
        topics: sortedTopics,
      }
    })
}

export function LangCompassShell({ mode, topics, detailTopicIds }: LangCompassShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isExplorerMode = mode === "explorer"
  const explorerRouteState = useMemo(
    () =>
      parseExplorerQueryState({
        level: searchParams.get("level"),
        group: searchParams.get("group"),
        topic: searchParams.get("topic"),
        q: searchParams.get("q"),
      }),
    [searchParams],
  )
  const overviewRouteState = useMemo(
    () =>
      parseOverviewQueryState({
        level: searchParams.get("level"),
      }),
    [searchParams],
  )

  const selectedLevel = (isExplorerMode ? explorerRouteState.level : overviewRouteState.level) ?? ALL_LEVEL
  const focusedGroup = isExplorerMode ? (explorerRouteState.group ?? null) : null

  const routeSelectedTopicId = isExplorerMode ? explorerRouteState.topicId : undefined
  const selectedTopicId = routeSelectedTopicId && topics.some((topic) => topic.id === routeSelectedTopicId) ? routeSelectedTopicId : null

  const resolvedRouteQuery = isExplorerMode ? (explorerRouteState.query ?? "") : ""

  const [searchInput, setSearchInput] = useState(resolvedRouteQuery)
  const deferredSearchInput = useDeferredValue(searchInput)
  const isDesktopViewport = useDesktopViewport()

  useEffect(() => {
    setSearchInput(resolvedRouteQuery)
  }, [resolvedRouteQuery])

  const updateRoute = useCallback(
    (href: string, method: "push" | "replace") => {
      const currentQuery = searchParams.toString()
      const currentHref = currentQuery.length > 0 ? `${pathname}?${currentQuery}` : pathname

      if (href === currentHref) return

      if (method === "replace") {
        router.replace(href, { scroll: false })
        return
      }

      router.push(href, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const updateExplorerRoute = useCallback(
    (
      next: {
        level?: TopicLevelOrAll | null
        group?: string | null
        query?: string | null
        topicId?: TopicId | null
      },
      method: "push" | "replace" = "push",
    ) => {
      updateRoute(
        buildExplorerHref({
          level: next.level ?? selectedLevel,
          group: next.group === undefined ? focusedGroup : next.group,
          query: next.query === undefined ? searchInput.trim() || null : next.query,
          topicId: next.topicId === undefined ? selectedTopicId : next.topicId,
        }),
        method,
      )
    },
    [focusedGroup, searchInput, selectedLevel, selectedTopicId, updateRoute],
  )

  const normalizedQuery = deferredSearchInput.trim()
  const hasActiveSearch = isExplorerMode && normalizedQuery.length > 0
  const detailTopicIdSet = useMemo(() => new Set(detailTopicIds), [detailTopicIds])
  const topicsById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics])

  const baseLevelCounts = useMemo(() => getAllLevelTopicCounts(topics), [topics])
  const levelCounts = useMemo<LevelCounts>(
    () => ({
      [ALL_LEVEL]: {
        totalCount: topics.length,
        introducedCount: topics.length,
        revisitedCount: 0,
      },
      ...baseLevelCounts,
    }),
    [baseLevelCounts, topics.length],
  )
  const levelSections = useMemo(
    () => (selectedLevel === ALL_LEVEL ? getGroupedTopicSectionsForAllLevels(topics) : getGroupedTopicSectionsForLevel(topics, selectedLevel)),
    [selectedLevel, topics],
  )

  const firstTopicByLevel = useMemo(() => {
    const mapping = new Map<TopicLevelOrAll, TopicId | null>()

    const allSections = getGroupedTopicSectionsForAllLevels(topics)
    const firstTopicIdAcrossAll = allSections.find((section) => section.topics.length > 0)?.topics[0]?.id ?? null
    mapping.set(ALL_LEVEL, firstTopicIdAcrossAll)

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

  const { selectedTopicDetail, selectedTopicLoadError, loadingTopicId } = useTopicDetailPreview({
    selectedTopic,
    detailTopicIdSet,
  })

  const selectedTopicHasDetailFile = Boolean(selectedTopic && detailTopicIdSet.has(selectedTopic.id))
  const selectedTopicFullLessonHref = selectedTopic
    ? buildTopicDetailHref(selectedTopic.id, {
        level: selectedLevel,
        group: focusedGroup ?? selectedTopic.group,
      })
    : null

  const previewRelatedTopics = useMemo(() => {
    const relatedTopicIds = selectedTopicDetail?.relatedTopicIds ?? []
    if (relatedTopicIds.length === 0) return []

    return relatedTopicIds
      .map((relatedTopicId) => topicsById.get(relatedTopicId))
      .filter((relatedTopic): relatedTopic is TopicCatalogItem => Boolean(relatedTopic))
  }, [selectedTopicDetail, topicsById])

  useEffect(() => {
    if (!isExplorerMode) return

    const routeQuery = explorerRouteState.query ?? ""
    const nextQuery = searchInput.trim()
    if (nextQuery === routeQuery) return

    const timer = window.setTimeout(() => {
      updateExplorerRoute(
        {
          level: selectedLevel,
          group: focusedGroup,
          query: nextQuery || null,
          topicId: selectedTopicId,
        },
        "replace",
      )
    }, 220)

    return () => {
      window.clearTimeout(timer)
    }
  }, [explorerRouteState.query, focusedGroup, isExplorerMode, searchInput, selectedLevel, selectedTopicId, updateExplorerRoute])

  const handleLevelSelect = (level: TopicLevelOrAll): void => {
    if (!isExplorerMode) {
      updateRoute(buildOverviewHref({ level }), "push")
      return
    }

    let nextTopicId: TopicId | null = selectedTopicId
    if (nextTopicId) {
      const currentTopic = topicsById.get(nextTopicId)
      if (!currentTopic || !topicAppearsInLevel(currentTopic, level)) {
        nextTopicId = firstTopicByLevel.get(level) ?? null
      }
    }

    updateExplorerRoute({
      level,
      group: null,
      query: searchInput.trim() || null,
      topicId: nextTopicId,
    })
  }

  const handleSearchChange = (value: string): void => {
    setSearchInput(value)
    if (!isExplorerMode && value.trim().length > 0) {
      updateRoute(
        buildExplorerHref({
          level: selectedLevel,
          query: value.trim(),
        }),
        "push",
      )
    }
  }

  const openTopic = (topicId: TopicId): void => {
    if (!isExplorerMode) {
      updateRoute(
        buildExplorerHref({
          level: selectedLevel,
          query: searchInput.trim() || null,
          topicId,
        }),
        "push",
      )
      return
    }

    updateExplorerRoute({
      level: selectedLevel,
      group: focusedGroup,
      query: searchInput.trim() || null,
      topicId,
    })
  }

  const openExplorerWithGroup = (group: string): void => {
    updateRoute(
      buildExplorerHref({
        level: selectedLevel,
        group,
      }),
      "push",
    )
  }

  const openExplorerLevel = (): void => {
    updateRoute(
      buildExplorerHref({
        level: selectedLevel,
      }),
      "push",
    )
  }

  const closeTopicPreview = useCallback(
    (method: "push" | "replace" = "replace") => {
      if (!isExplorerMode) return
      updateExplorerRoute(
        {
          level: selectedLevel,
          group: focusedGroup,
          query: searchInput.trim() || null,
          topicId: null,
        },
        method,
      )
    },
    [focusedGroup, isExplorerMode, searchInput, selectedLevel, updateExplorerRoute],
  )

  return (
    <div className="min-h-0">
      <div className="mx-auto max-w-[1500px] px-3 md:px-5">
        <ShellHeader
          isExplorerMode={isExplorerMode}
          selectedLevel={selectedLevel}
          searchInput={searchInput}
          onGoOverview={() => updateRoute(buildOverviewHref({ level: selectedLevel }), "push")}
          onLevelSelect={handleLevelSelect}
          onSearchChange={handleSearchChange}
          onClearSearch={() => setSearchInput("")}
        />

        <div
          className={cn(
            "grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]",
            isExplorerMode && selectedTopicId ? "lg:grid-cols-[13rem_minmax(0,1fr)_22rem]" : "",
          )}
        >
          <aside className="hidden md:flex md:h-[calc(100dvh-8rem)] md:flex-col md:pr-6 md:sticky md:top-4">
            <div className="mb-6 px-1 pb-4 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Levels</p>
            </div>
            <LevelNavigation selectedLevel={selectedLevel} levelCounts={levelCounts} onLevelSelect={handleLevelSelect} />
          </aside>

          <main className="min-h-0 bg-transparent">
            {!isExplorerMode ? (
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
                onClearFocusedGroup={() => {
                  updateExplorerRoute({
                    level: selectedLevel,
                    group: null,
                    query: searchInput.trim() || null,
                    topicId: selectedTopicId,
                  })
                }}
                selectedTopicId={selectedTopicId}
                onOpenTopic={openTopic}
              />
            )}
          </main>

          <TopicPreviewDrawer
            isExplorerMode={isExplorerMode}
            isDesktopViewport={isDesktopViewport}
            selectedTopicId={selectedTopicId}
            selectedTopic={selectedTopic}
            selectedTopicDetail={selectedTopicDetail}
            selectedTopicHasDetailFile={selectedTopicHasDetailFile}
            selectedTopicLoadError={selectedTopicLoadError}
            loadingTopicId={loadingTopicId}
            selectedTopicFullLessonHref={selectedTopicFullLessonHref}
            previewRelatedTopics={previewRelatedTopics}
            onOpenTopic={openTopic}
            onClose={() => closeTopicPreview("replace")}
          />
        </div>
      </div>
    </div>
  )
}
