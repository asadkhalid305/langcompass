import { NextResponse } from "next/server"

import { loadTopicDetailById } from "@/lib/data/topic-detail"
import type { TopicId } from "@/lib/types/topic"

export async function GET(_request: Request, context: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await context.params
  const detail = await loadTopicDetailById(topicId as TopicId)

  return NextResponse.json({ detail })
}
