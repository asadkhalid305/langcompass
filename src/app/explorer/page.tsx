import { Suspense } from "react"

import { LangCompassShell } from "@/components/explorer/langcompass-shell"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailIdSet } from "@/lib/data/topic-detail"

function ExplorerShellFallback() {
  return <div className="min-h-[60vh] rounded-none border border-border bg-white" aria-hidden="true" />
}

export default async function ExplorerPage() {
  const [topics, detailTopicIdSet] = await Promise.all([
    loadTopicCatalog(),
    loadTopicDetailIdSet(),
  ])

  return (
    <Suspense fallback={<ExplorerShellFallback />}>
      <LangCompassShell mode="explorer" topics={topics} detailTopicIds={Array.from(detailTopicIdSet)} />
    </Suspense>
  )
}
