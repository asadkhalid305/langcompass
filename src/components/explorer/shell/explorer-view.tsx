import { humanizeGroupLabel, humanizeSectionLabel, isSectionFallbackGroup } from "@/lib/explorer/labels"
import type { ExplorerLevelSection } from "@/lib/explorer/types"
import type { TopicId, TopicLevelOrAll } from "@/lib/types/topic"
import { ALL_LEVEL } from "@/lib/constants/topic"

import { TopicNode } from "./topic-node"
import type { LevelCounts, SearchResultGroup } from "./types"

interface ExplorerViewProps {
  selectedLevel: TopicLevelOrAll
  selectedLevelCounts: LevelCounts[TopicLevelOrAll]
  hasActiveSearch: boolean
  totalSearchMatches: number
  searchResultsByLevel: SearchResultGroup[]
  sections: ExplorerLevelSection[]
  focusedGroup: string | null
  onClearFocusedGroup: () => void
  selectedTopicId: TopicId | null
  onOpenTopic: (topicId: TopicId) => void
}

export function ExplorerView({
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
}: ExplorerViewProps) {
  return (
    <div className="space-y-10 pr-0 md:pr-4">
      <section className="bg-white border text-center border-border px-8 py-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Learning flow</p>
        {!hasActiveSearch ? (
          <>
            <h2 className="mt-1 text-pretty text-xl font-semibold">
              {selectedLevel === ALL_LEVEL ? "All levels explorer" : `Level ${selectedLevel} explorer`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedLevelCounts.introducedCount > 0 ? `${selectedLevelCounts.introducedCount} new` : null}
              {selectedLevelCounts.introducedCount > 0 && selectedLevelCounts.revisitedCount > 0 ? " and " : null}
              {selectedLevelCounts.revisitedCount > 0 ? `${selectedLevelCounts.revisitedCount} revisited` : null}
              {selectedLevel === ALL_LEVEL ? " topics across all levels." : " topics in this level."}
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
          {sections.map((sectionGroup) => {
            const hasIntroduced = sectionGroup.introducedTopics.length > 0
            const hasRevisited = sectionGroup.revisitedTopics.length > 0

            if (!hasIntroduced && !hasRevisited) return null

            return (
              <section key={sectionGroup.section} className="space-y-8 [content-visibility:auto]">
                <header className="mb-2 flex items-baseline gap-4 border-b border-border/70 pb-3">
                  <h3 className="text-2xl font-display font-bold">{humanizeSectionLabel(sectionGroup.section)}</h3>
                  <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    {sectionGroup.topics.length} topics
                  </p>
                </header>

                <div className="space-y-10">
                  {sectionGroup.groups.map((group) => {
                    const groupHasIntroduced = group.introducedTopics.length > 0
                    const groupHasRevisited = group.revisitedTopics.length > 0
                    const showGroupHeading = !(sectionGroup.groups.length === 1 && isSectionFallbackGroup(group.group, sectionGroup.section))

                    if (!groupHasIntroduced && !groupHasRevisited) return null

                    return (
                      <section key={`${sectionGroup.section}:${group.group}`} className="space-y-8">
                        {showGroupHeading ? (
                          <header className="mb-6 flex items-baseline gap-4">
                            <h4 className="text-2xl font-display font-bold">{humanizeGroupLabel(group.group)}</h4>
                            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                              {group.topics.length} topics
                            </p>
                          </header>
                        ) : null}

                        <div className="space-y-8">
                          {groupHasIntroduced ? (
                            <div>
                              <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                {selectedLevel === ALL_LEVEL ? "Topics" : `New in ${selectedLevel}`}
                              </p>
                              <div className="flex flex-wrap gap-3 md:gap-4">
                                {group.introducedTopics.map((topic) => (
                                  <TopicNode
                                    key={topic.id}
                                    topic={topic}
                                    isSelected={topic.id === selectedTopicId}
                                    onOpenTopic={onOpenTopic}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {groupHasRevisited ? (
                            <div>
                              <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                Revisited from earlier levels
                              </p>
                              <div className="flex flex-wrap gap-3 md:gap-4">
                                {group.revisitedTopics.map((topic) => (
                                  <TopicNode
                                    key={topic.id}
                                    topic={topic}
                                    isSelected={topic.id === selectedTopicId}
                                    showEarlierIndicator
                                    onOpenTopic={onOpenTopic}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </section>
                    )
                  })}
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
                  <p className="text-xs text-muted-foreground">{entry.totalCount} matches</p>
                </header>
                <div className="space-y-5">
                  {entry.sections.map((section) => (
                    <section key={`${entry.level}:${section.section}`} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                          {humanizeSectionLabel(section.section)}
                        </h4>
                        <p className="text-xs text-muted-foreground">{section.topics.length} matches</p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 md:gap-3">
                        {section.topics.map((topic) => (
                          <TopicNode
                            key={topic.id}
                            topic={topic}
                            isSelected={topic.id === selectedTopicId}
                            onOpenTopic={onOpenTopic}
                          />
                        ))}
                      </div>
                    </section>
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
}
