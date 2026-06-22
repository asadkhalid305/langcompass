import { Badge } from "@/components/ui/badge"
import {
  humanizeDifficultyStageLabel,
  humanizeGroupLabel,
  isSectionFallbackGroup,
  humanizeSectionLabel,
} from "@/lib/explorer/labels"
import type { TopicCatalogItem } from "@/lib/types/topic"

interface TopicMetaTagsProps {
  topic: Pick<TopicCatalogItem, "level" | "section" | "group" | "difficultyStage">
  hasDetailFile?: boolean
  className?: string
  tone?: "light" | "dark"
}

export function TopicMetaTags({ topic, hasDetailFile, className, tone = "light" }: TopicMetaTagsProps) {
  const badgeClassName =
    tone === "dark"
      ? "rounded-none border-white/20 bg-white/5 text-[11px] uppercase tracking-[0.08em] text-white"
      : "rounded-none border-border/80 bg-white/70 text-[11px] uppercase tracking-[0.08em]"

  return (
    <div className={className}>
      <Badge variant="outline" className={badgeClassName}>
        Level {topic.level}
      </Badge>
      <Badge variant="outline" className={badgeClassName}>
        {humanizeSectionLabel(topic.section)}
      </Badge>
      {topic.group && !isSectionFallbackGroup(topic.group, topic.section) ? (
        <Badge variant="outline" className={badgeClassName}>
          {humanizeGroupLabel(topic.group)}
        </Badge>
      ) : null}
      <Badge variant="outline" className={badgeClassName}>
        {humanizeDifficultyStageLabel(topic.difficultyStage)}
      </Badge>
      {typeof hasDetailFile === "boolean" ? (
        <Badge
          variant="outline"
          className={badgeClassName}
        >
          {hasDetailFile ? "Detail file" : "Metadata only"}
        </Badge>
      ) : null}
    </div>
  )
}
