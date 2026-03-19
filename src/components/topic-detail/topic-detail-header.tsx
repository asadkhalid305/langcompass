import { TopicMetaTags } from "@/components/topic/topic-meta-tags"
import type { TopicCatalogItem, TopicDetail } from "@/lib/types/topic"

interface TopicDetailHeaderProps {
  topic: TopicCatalogItem
  detail: TopicDetail | null
}

export function TopicDetailHeader({ topic, detail }: TopicDetailHeaderProps) {
  return (
    <header className="mt-6 rounded-none border border-border bg-white px-5 py-7 shadow-[5px_5px_0_#111827] md:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Full lesson page</p>
      <h1 className="mt-4 max-w-4xl text-pretty text-3xl font-display font-bold leading-tight md:text-5xl">{topic.title}</h1>
      <TopicMetaTags topic={topic} hasDetailFile={Boolean(detail)} className="mt-5 flex flex-wrap gap-2" />
      {detail?.summary || topic.summary ? (
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-foreground md:text-lg">{detail?.summary ?? topic.summary}</p>
      ) : (
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
          This topic currently has curriculum metadata, and the full lesson content is being prepared.
        </p>
      )}
    </header>
  )
}
