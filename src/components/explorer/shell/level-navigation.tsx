import { ALLOWED_LEVEL_OPTIONS } from "@/lib/constants/topic"
import type { TopicLevelOrAll } from "@/lib/types/topic"
import { cn } from "@/lib/utils/cn"

import type { LevelCounts } from "./types"

interface LevelNavigationProps {
  selectedLevel: TopicLevelOrAll
  levelCounts: LevelCounts
  onLevelSelect: (level: TopicLevelOrAll) => void
}

export function LevelNavigation({ selectedLevel, levelCounts, onLevelSelect }: LevelNavigationProps) {
  return (
    <nav className="space-y-1" aria-label="Curriculum levels">
      {ALLOWED_LEVEL_OPTIONS.map((level) => {
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
              <span
                className={cn("h-2 w-2 rounded-full", isActive ? "bg-foreground" : "bg-transparent group-hover:bg-muted-foreground")}
                aria-hidden="true"
              />
              <span className={cn("text-base tracking-tight", isActive ? "font-display text-xl" : "font-sans font-medium")}>{level}</span>
            </div>
            <span className="text-xs font-medium tracking-wider">{counts.totalCount}</span>
          </button>
        )
      })}
    </nav>
  )
}
