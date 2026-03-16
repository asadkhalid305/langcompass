import { ArrowRight } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { humanizeGroupLabel } from "@/lib/explorer/labels"
import { cn } from "@/lib/utils/cn"

import { CATEGORY_ORDER } from "./constants"
import type { GroupSummary, LevelCounts, LevelProfile } from "./types"
import type { TopicLevelOrAll } from "@/lib/types/topic"
import { ALL_LEVEL } from "@/lib/constants/topic"

interface OverviewViewProps {
  selectedLevel: TopicLevelOrAll
  levelProfile: LevelProfile
  selectedLevelCounts: LevelCounts[TopicLevelOrAll]
  groupSummaries: GroupSummary[]
  onExploreLevel: () => void
  onExploreGroup: (group: string) => void
}

const getCategoryLabel = (category: string): string => {
  switch (category.toLowerCase()) {
    case "basics":
      return "Basics"
    case "vocabulary":
      return "Vocabulary"
    case "grammar":
      return "Grammar"
    case "communication":
      return "Communication"
    default:
      return category.charAt(0).toUpperCase() + category.slice(1)
  }
}

export function OverviewView({
  selectedLevel,
  levelProfile,
  selectedLevelCounts,
  groupSummaries,
  onExploreLevel,
  onExploreGroup,
}: OverviewViewProps) {
  const groupedByCategory = useMemo(() => {
    const grouped = new Map<string, GroupSummary[]>()
    for (const summary of groupSummaries) {
      const existing = grouped.get(summary.category) ?? []
      existing.push(summary)
      grouped.set(summary.category, existing)
    }

    const ordered = new Map<string, GroupSummary[]>()
    for (const category of CATEGORY_ORDER) {
      if (grouped.has(category)) {
        ordered.set(category, grouped.get(category) ?? [])
      }
    }

    for (const [category, groups] of grouped) {
      if (!ordered.has(category)) {
        ordered.set(category, groups)
      }
    }

    return ordered
  }, [groupSummaries])

  return (
    <div className="space-y-8 p-4 md:p-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Curriculum overview</p>
        <h2 className="mt-4 text-pretty text-3xl font-display font-bold md:text-5xl">
          {selectedLevel === ALL_LEVEL ? levelProfile.title : `Level ${selectedLevel}: ${levelProfile.title}`}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{levelProfile.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-foreground rounded-full" />
            {selectedLevelCounts.totalCount} topics
          </span>
          {selectedLevelCounts.introducedCount > 0 ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              {selectedLevelCounts.introducedCount} newly introduced
            </span>
          ) : null}
          {selectedLevelCounts.revisitedCount > 0 ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-border rounded-full" />
              {selectedLevelCounts.revisitedCount} revisited from earlier levels
            </span>
          ) : null}
        </div>
        <Button
          onClick={onExploreLevel}
          className="mt-8 rounded-none border-foreground shadow-[4px_4px_0_#111827] hover:shadow-[2px_2px_0_#111827] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          size="lg"
        >
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
                  category === "basics"
                    ? "bg-syntax-main"
                    : category === "vocabulary"
                      ? "bg-vocab-main"
                      : category === "grammar"
                        ? "bg-grammar-main"
                        : category === "communication"
                          ? "bg-comm-main"
                          : "bg-foreground",
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
