import { Suspense } from "react"
import { redirect } from "next/navigation"

import { LangCompassShell } from "@/components/explorer/langcompass-shell"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailIdSet } from "@/lib/data/topic-detail"
import { buildExplorerHref, hasLegacyExplorerSignal, parseExplorerQueryState } from "@/lib/explorer/navigation"

type HomePageSearchParams = Record<string, string | string[] | undefined>

interface HomePageProps {
  searchParams?: Promise<HomePageSearchParams>
}

function OverviewShellFallback() {
  return <div className="min-h-[60vh] rounded-none border border-border bg-white" aria-hidden="true" />
}

export default async function HomePage({ searchParams }: HomePageProps = {}) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}))

  if (hasLegacyExplorerSignal(resolvedSearchParams)) {
    const legacyExplorerState = parseExplorerQueryState(resolvedSearchParams)
    redirect(
      buildExplorerHref({
        level: legacyExplorerState.level,
        query: legacyExplorerState.query,
        topicId: legacyExplorerState.topicId,
      }),
    )
  }

  const [topics, detailTopicIdSet] = await Promise.all([loadTopicCatalog(), loadTopicDetailIdSet()])
  return (
    <Suspense fallback={<OverviewShellFallback />}>
      <LangCompassShell
        mode="overview"
        topics={topics}
        detailTopicIds={Array.from(detailTopicIdSet)}
      />
    </Suspense>
  )
}
