import { humanizeDifficultyStageLabel, humanizeSectionLabel } from "@/lib/explorer/labels"
import { getTopicModuleLabel } from "@/lib/explorer/selectors"
import type { TopicCatalogItem, TopicId } from "@/lib/types/topic"
import { cn } from "@/lib/utils/cn"

interface TopicNodeProps {
  topic: TopicCatalogItem
  isSelected: boolean
  showLevelBadge?: boolean
  showEarlierIndicator?: boolean
  onOpenTopic: (topicId: TopicId) => void
}

const getSectionColorClasses = (section: TopicCatalogItem["section"]) => {
  switch (section) {
    case "grammar":
      return "border-l-grammar-main bg-grammar-bg"
    case "communication":
      return "border-l-comm-main bg-comm-bg"
    case "themes":
    default:
      return "border-l-syntax-main bg-syntax-bg"
  }
}

export function TopicNode({ topic, isSelected, showLevelBadge = false, showEarlierIndicator = false, onOpenTopic }: TopicNodeProps) {
  const moduleLabel = getTopicModuleLabel(topic)

  return (
    <button
      type="button"
      onClick={() => onOpenTopic(topic.id)}
      className={cn(
        "w-full sm:w-[14rem] flex flex-col justify-start text-left p-4 transition-[transform,box-shadow] duration-200 ring-1 ring-border rounded-none border-l-4",
        getSectionColorClasses(topic.section),
        "shadow-[2px_2px_0px_#111827] hover:shadow-[4px_4px_0px_#111827] hover:-translate-y-0.5 hover:-translate-x-0.5",
        isSelected ? "ring-2 ring-foreground shadow-[4px_4px_0px_#111827] -translate-y-0.5 -translate-x-0.5" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-base font-bold leading-snug font-sans text-foreground">{topic.title}</p>
        {showLevelBadge || moduleLabel ? (
          <span className="shrink-0 border border-foreground/20 bg-white px-1.5 py-0.5 text-[10px] font-bold leading-none text-foreground">
            {[showLevelBadge ? topic.level : null, moduleLabel].filter(Boolean).join(" ")}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>{humanizeSectionLabel(topic.section)}</span>
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
}
