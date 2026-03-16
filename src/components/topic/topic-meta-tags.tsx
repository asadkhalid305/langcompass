import { Badge } from "@/components/ui/badge"
import {
  humanizeCategoryLabel,
  humanizeDifficultyStageLabel,
  humanizeGroupLabel,
} from "@/lib/explorer/labels"
import type { TopicCatalogItem } from "@/lib/types/topic"

interface TopicMetaTagsProps {
  topic: Pick<TopicCatalogItem, "level" | "category" | "group" | "difficultyStage">
  hasDetailFile?: boolean
  className?: string
}

export function TopicMetaTags({ topic, hasDetailFile, className }: TopicMetaTagsProps) {
  return (
    <div className={className}>
      <Badge variant="outline" className="rounded-none border-border/80 bg-white/70 text-[11px] uppercase tracking-[0.08em]">
        Level {topic.level}
      </Badge>
      <Badge variant="outline" className="rounded-none border-border/80 bg-white/70 text-[11px] uppercase tracking-[0.08em]">
        {humanizeCategoryLabel(topic.category)}
      </Badge>
      <Badge variant="outline" className="rounded-none border-border/80 bg-white/70 text-[11px] uppercase tracking-[0.08em]">
        {humanizeGroupLabel(topic.group)}
      </Badge>
      <Badge variant="outline" className="rounded-none border-border/80 bg-white/70 text-[11px] uppercase tracking-[0.08em]">
        {humanizeDifficultyStageLabel(topic.difficultyStage)}
      </Badge>
      {typeof hasDetailFile === "boolean" ? (
        <Badge
          variant="outline"
          className="rounded-none border-border/80 bg-white/70 text-[11px] uppercase tracking-[0.08em]"
        >
          {hasDetailFile ? "Detail file" : "Metadata only"}
        </Badge>
      ) : null}
    </div>
  )
}
