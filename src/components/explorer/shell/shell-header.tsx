import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ALLOWED_LEVELS } from "@/lib/constants/topic"
import type { TopicLevel } from "@/lib/types/topic"

interface ShellHeaderProps {
  isExplorerMode: boolean
  selectedLevel: TopicLevel
  searchInput: string
  onGoOverview: () => void
  onLevelSelect: (level: TopicLevel) => void
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
      <div className="flex items-center justify-between py-3 md:py-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onGoOverview}
            className="text-xl font-display font-bold tracking-tight hover:opacity-70 transition-opacity shrink-0"
            aria-label="Go to overview"
            title="Home"
          >
            LangCompass
          </button>
          {isExplorerMode ? (
            <>
              <span className="text-muted-foreground/50 font-light text-lg select-none" aria-hidden="true">
                /
              </span>
              <span className="text-sm text-muted-foreground truncate">{selectedLevel} Explorer</span>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            className="h-9 rounded-none border border-border bg-background px-2 text-sm md:hidden"
            value={selectedLevel}
            onChange={(event) => onLevelSelect(event.target.value as TopicLevel)}
            aria-label="Select level"
          >
            {ALLOWED_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <div className="relative w-44 sm:w-56 md:w-72 lg:w-[22rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search topics…"
              className="h-9 rounded-none border border-border bg-background pl-9 pr-9 text-sm shadow-none focus-visible:border-foreground focus-visible:ring-0"
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
    </header>
  )
}
