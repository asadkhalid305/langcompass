import { useEffect, useState } from "react"

import type { TopicCatalogItem, TopicDetail, TopicId } from "@/lib/types/topic"

import type { TopicDetailResponse } from "./types"

interface UseTopicDetailPreviewParams {
  selectedTopic: TopicCatalogItem | null
  detailTopicIdSet: Set<TopicId>
}

export function useTopicDetailPreview({ selectedTopic, detailTopicIdSet }: UseTopicDetailPreviewParams) {
  const [detailByTopicId, setDetailByTopicId] = useState<Partial<Record<TopicId, TopicDetail | null>>>({})
  const [detailLoadErrors, setDetailLoadErrors] = useState<Partial<Record<TopicId, string>>>({})
  const [loadingTopicId, setLoadingTopicId] = useState<TopicId | null>(null)

  const selectedTopicDetail = selectedTopic ? detailByTopicId[selectedTopic.id] : undefined

  useEffect(() => {
    if (!selectedTopic || !detailTopicIdSet.has(selectedTopic.id)) return
    if (selectedTopicDetail !== undefined) return

    const controller = new AbortController()

    const fetchDetail = async (): Promise<void> => {
      setLoadingTopicId(selectedTopic.id)

      try {
        const response = await fetch(`/api/topic-details/${encodeURIComponent(selectedTopic.id)}`, {
          signal: controller.signal,
          cache: "force-cache",
        })

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`)
        }

        const payload = (await response.json()) as TopicDetailResponse
        setDetailByTopicId((current) => ({
          ...current,
          [selectedTopic.id]: payload.detail,
        }))
      } catch (error) {
        if (controller.signal.aborted) return

        const message = error instanceof Error ? error.message : "Unknown error"
        setDetailLoadErrors((current) => ({
          ...current,
          [selectedTopic.id]: message,
        }))
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTopicId((current) => (current === selectedTopic.id ? null : current))
        }
      }
    }

    void fetchDetail()

    return () => {
      controller.abort()
    }
  }, [detailTopicIdSet, selectedTopic, selectedTopicDetail])

  return {
    selectedTopicDetail,
    selectedTopicLoadError: selectedTopic ? detailLoadErrors[selectedTopic.id] : undefined,
    loadingTopicId,
  }
}
