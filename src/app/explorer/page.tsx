import { LangCompassShell } from "@/components/explorer/langcompass-shell"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailIdSet } from "@/lib/data/topic-detail"
import { parseExplorerQueryState } from "@/lib/explorer/navigation"

type ExplorerPageSearchParams = Record<string, string | string[] | undefined>

interface ExplorerPageProps {
  searchParams?: Promise<ExplorerPageSearchParams>
}

export default async function ExplorerPage({ searchParams }: ExplorerPageProps = {}) {
  const [topics, detailTopicIdSet, resolvedSearchParams] = await Promise.all([
    loadTopicCatalog(),
    loadTopicDetailIdSet(),
    searchParams ?? Promise.resolve({}),
  ])

  const queryState = parseExplorerQueryState(resolvedSearchParams)
  const hasInitialTopic = Boolean(queryState.topicId && topics.some((topic) => topic.id === queryState.topicId))

  return (
    <LangCompassShell
      mode="explorer"
      topics={topics}
      detailTopicIds={Array.from(detailTopicIdSet)}
      initialRouteState={{
        selectedLevel: queryState.level,
        focusedGroup: queryState.group ?? null,
        searchQuery: queryState.query,
        selectedTopicId: hasInitialTopic ? queryState.topicId : null,
      }}
    />
  )
}
