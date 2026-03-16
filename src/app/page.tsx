import { LangCompassShell } from "@/components/explorer/langcompass-shell"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailIdSet } from "@/lib/data/topic-detail"
import { parseExplorerQueryState } from "@/lib/explorer/navigation"

type HomePageSearchParams = Record<string, string | string[] | undefined>

interface HomePageProps {
  searchParams?: Promise<HomePageSearchParams>
}

export default async function HomePage({ searchParams }: HomePageProps = {}) {
  const [topics, detailTopicIdSet, resolvedSearchParams] = await Promise.all([
    loadTopicCatalog(),
    loadTopicDetailIdSet(),
    searchParams ?? Promise.resolve({}),
  ])

  const queryState = parseExplorerQueryState(resolvedSearchParams)
  const hasInitialTopic = Boolean(queryState.topicId && topics.some((topic) => topic.id === queryState.topicId))
  const activeView = queryState.view === "explorer" || hasInitialTopic ? "explorer" : "overview"

  return (
    <LangCompassShell
      topics={topics}
      detailTopicIds={Array.from(detailTopicIdSet)}
      initialState={{
        activeView,
        selectedLevel: queryState.level,
        focusedGroup: activeView === "explorer" ? (queryState.group ?? null) : null,
        selectedTopicId: hasInitialTopic ? queryState.topicId : null,
        detailSheetOpen: false,
      }}
    />
  )
}
