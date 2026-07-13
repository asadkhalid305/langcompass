import { ArrowRight } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { humanizeSectionLabel } from "@/lib/explorer/labels"
import { cn } from "@/lib/utils/cn"

import { SECTION_ORDER } from "./constants"
import type { LevelCounts, LevelProfile, SectionSummary } from "./types"
import type { TopicLevelOrAll } from "@/lib/types/topic"
import { ALL_LEVEL } from "@/lib/constants/topic"

interface OverviewViewProps {
  selectedLevel: TopicLevelOrAll
  levelProfile: LevelProfile
  selectedLevelCounts: LevelCounts[TopicLevelOrAll]
  sectionSummaries: SectionSummary[]
  onExploreLevel: () => void
}

export function OverviewView({
  selectedLevel,
  levelProfile,
  selectedLevelCounts,
  sectionSummaries,
  onExploreLevel,
}: OverviewViewProps) {
  const groupedBySection = useMemo(() => {
    const grouped = new Map<string, SectionSummary>()
    for (const summary of sectionSummaries) {
      grouped.set(summary.section, summary)
    }

    const ordered = new Map<string, SectionSummary>()
    for (const section of SECTION_ORDER) {
      if (grouped.has(section)) {
        ordered.set(section, grouped.get(section) as SectionSummary)
      }
    }

    for (const [section, summary] of grouped) {
      if (!ordered.has(section)) {
        ordered.set(section, summary)
      }
    }

    return ordered
  }, [sectionSummaries])

  return (
    <div className="space-y-8 p-4 md:p-6">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="border border-border bg-white px-6 py-7 shadow-[6px_6px_0_#111827] md:px-8 md:py-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Curriculum overview</p>
          <h1 className="mt-4 text-pretty text-3xl font-display font-bold md:text-5xl">
            {selectedLevel === ALL_LEVEL ? levelProfile.title : `Level ${selectedLevel}: ${levelProfile.title}`}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{levelProfile.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-medium text-foreground">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-foreground" />
            {selectedLevelCounts.totalCount} topics
            </span>
            {selectedLevelCounts.introducedCount > 0 ? (
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                {selectedLevelCounts.introducedCount} newly introduced
              </span>
            ) : null}
            {selectedLevelCounts.revisitedCount > 0 ? (
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-border" />
                {selectedLevelCounts.revisitedCount} revisited from earlier levels
              </span>
            ) : null}
          </div>
          <Button
            onClick={onExploreLevel}
            className="mt-8 rounded-none border-foreground shadow-[4px_4px_0_#111827] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#111827] motion-reduce:transition-none"
            size="lg"
          >
            Open topic explorer
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        <aside className="border border-border bg-[#111827] px-6 py-7 text-white shadow-[6px_6px_0_#F97316]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Why LangCompass</p>
          <p className="mt-4 text-2xl font-display font-bold leading-tight">
            A static-first map for seeing how grammar, themes, and communication fit together.
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Structure</p>
              <p className="mt-1 font-medium">Section-first browsing keeps the curriculum legible at every level.</p>
            </div>
            <div className="border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Pacing</p>
              <p className="mt-1 font-medium">See what is new versus what gets revisited before opening a full lesson.</p>
            </div>
          </div>
        </aside>
      </section>

      <div className="space-y-10">
        {Array.from(groupedBySection.entries()).map(([section, summary]) => (
          <section key={section}>
            <div className="flex items-center gap-3 mb-5">
              <span
                className={cn(
                  "inline-block w-2.5 h-2.5 rounded-full",
                  section === "themes"
                    ? "bg-syntax-main"
                    : section === "grammar"
                        ? "bg-grammar-main"
                        : section === "communication"
                          ? "bg-comm-main"
                          : "bg-foreground",
                )}
                aria-hidden="true"
              />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {humanizeSectionLabel(section as SectionSummary["section"])}
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreLevel}
              className={cn(
                "group flex w-full flex-col gap-1.5 bg-white border border-border p-5 text-left transition-[transform,box-shadow] duration-200 motion-reduce:transition-none",
                "hover:shadow-[4px_4px_0px_#111827] hover:-translate-x-[2px] hover:-translate-y-[2px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              )}
            >
              <h2 className="text-sm font-bold font-sans group-hover:underline underline-offset-2">
                {humanizeSectionLabel(summary.section)}
              </h2>
              <p className="text-xs tracking-wider text-muted-foreground uppercase font-medium">
                {summary.totalCount} topics
              </p>
              <p className="text-xs tracking-wider text-muted-foreground uppercase font-medium">
                {summary.introducedCount > 0 ? `${summary.introducedCount} new` : null}
                {summary.introducedCount > 0 && summary.revisitedCount > 0 ? " · " : null}
                {summary.revisitedCount > 0 ? `${summary.revisitedCount} revisited` : null}
              </p>
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}
