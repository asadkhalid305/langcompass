import { LangCompassShell } from "@/components/explorer/langcompass-shell"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailIdSet } from "@/lib/data/topic-detail"

export default async function HomePage() {
  const [topics, detailTopicIdSet] = await Promise.all([loadTopicCatalog(), loadTopicDetailIdSet()])

  return <LangCompassShell topics={topics} detailTopicIds={Array.from(detailTopicIdSet)} />
}
