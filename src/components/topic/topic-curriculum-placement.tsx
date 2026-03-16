import { formatIntroducedInLabel, formatRevisitedInLabel } from "@/lib/explorer/labels"
import type { TopicCatalogItem } from "@/lib/types/topic"
import { cn } from "@/lib/utils/cn"

interface TopicCurriculumPlacementProps {
  topic: Pick<TopicCatalogItem, "firstIntroducedIn" | "revisitedIn">
  className?: string
  titleClassName?: string
  introducedClassName?: string
  revisitedClassName?: string
}

export function TopicCurriculumPlacement({
  topic,
  className,
  titleClassName,
  introducedClassName,
  revisitedClassName,
}: TopicCurriculumPlacementProps) {
  return (
    <section className={className}>
      <p className={cn("text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground", titleClassName)}>Curriculum placement</p>
      <p className={cn("mt-3 text-sm font-medium text-foreground", introducedClassName)}>{formatIntroducedInLabel(topic.firstIntroducedIn)}</p>
      <p className={cn("mt-1 text-sm text-muted-foreground", revisitedClassName)}>{formatRevisitedInLabel(topic.revisitedIn)}</p>
    </section>
  )
}
