import { Search, X } from "lucide-react"

import { LangCompassLogo } from "@/components/branding/langcompass-logo"
import { Input } from "@/components/ui/input"
import { ALLOWED_LEVEL_OPTIONS, ALL_LEVEL } from "@/lib/constants/topic"
import type { TopicLevelOrAll } from "@/lib/types/topic"

interface ShellHeaderProps {
  isExplorerMode: boolean
  selectedLevel: TopicLevelOrAll
  searchInput: string
  onGoOverview: () => void
  onLevelSelect: (level: TopicLevelOrAll) => void
  onSearchChange: (value: string) => void
  onClearSearch: () => void
}

export function ShellHeader({
  isExplorerMode,
  selectedLevel,
  searchInput,
  onGoOverview,
  onLevelSelect,
  onSearchChange,
  onClearSearch,
}: ShellHeaderProps) {
  return (
    <header className="px-4 md:px-0">
      <div className="mb-4 mt-3 rounded-none border border-border bg-white/90 px-4 py-4 shadow-[4px_4px_0_#111827] backdrop-blur md:mt-4 md:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
          <button
            type="button"
            onClick={onGoOverview}
            className="min-w-0 text-left transition-opacity hover:opacity-80"
            aria-label="Go to overview"
            title="Home"
          >
            <LangCompassLogo showTagline={!isExplorerMode} compact={isExplorerMode} />
          </button>
          {isExplorerMode ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#F97316]" aria-hidden="true" />
              <span className="truncate">
                {selectedLevel === ALL_LEVEL ? "All levels Explorer" : `${selectedLevel} Explorer`}
              </span>
            </div>
          ) : null}
        </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              className="h-10 rounded-none border border-border bg-[#FFFDF8] px-3 text-sm md:hidden"
              value={selectedLevel}
              onChange={(event) => onLevelSelect(event.target.value as TopicLevelOrAll)}
              aria-label="Select level"
            >
              {ALLOWED_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56 md:w-72 lg:w-[24rem]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={searchInput}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search topics, skills, grammar…"
                className="h-10 rounded-none border border-border bg-[#FFFDF8] pl-9 pr-9 text-sm shadow-none focus-visible:border-foreground focus-visible:ring-0"
                aria-label="Search topics"
                name="topicSearch"
                autoComplete="off"
                spellCheck={false}
              />
              {searchInput.trim().length > 0 ? (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
