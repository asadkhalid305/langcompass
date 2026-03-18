import { LangCompassShell } from "@/components/explorer/langcompass-shell"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailIdSet } from "@/lib/data/topic-detail"

export default async function ExplorerPage() {
  const [topics, detailTopicIdSet] = await Promise.all([
    loadTopicCatalog(),
    loadTopicDetailIdSet(),
  ])

  return (
    <LangCompassShell mode="explorer" topics={topics} detailTopicIds={Array.from(detailTopicIdSet)} />
  )
}
