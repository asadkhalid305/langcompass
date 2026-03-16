import { X } from "lucide-react"

import { TopicPreviewPanel } from "@/components/topic/topic-preview-panel"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { TopicCatalogItem, TopicDetail, TopicId } from "@/lib/types/topic"

interface TopicPreviewDrawerProps {
  isExplorerMode: boolean
  isDesktopViewport: boolean
  selectedTopicId: TopicId | null
  selectedTopic: TopicCatalogItem | null
  selectedTopicDetail: TopicDetail | null | undefined
  selectedTopicHasDetailFile: boolean
  selectedTopicLoadError: string | undefined
  loadingTopicId: TopicId | null
  selectedTopicFullLessonHref: string | null
  previewRelatedTopics: TopicCatalogItem[]
  onOpenTopic: (topicId: TopicId) => void
  onClose: () => void
}

export function TopicPreviewDrawer({
  isExplorerMode,
  isDesktopViewport,
  selectedTopicId,
  selectedTopic,
  selectedTopicDetail,
  selectedTopicHasDetailFile,
  selectedTopicLoadError,
  loadingTopicId,
  selectedTopicFullLessonHref,
  previewRelatedTopics,
  onOpenTopic,
  onClose,
}: TopicPreviewDrawerProps) {
  if (!isExplorerMode) {
    return null
  }

  return (
    <>
      {selectedTopicId ? (
        <aside className="hidden lg:flex lg:flex-col lg:h-[calc(100dvh-9rem)] lg:overflow-hidden lg:bg-white lg:shadow-[0_0_40px_rgba(0,0,0,0.05)] lg:border-l lg:border-border lg:sticky lg:top-4">
          <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-border shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Topic preview</p>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <TopicPreviewPanel
            topic={selectedTopic}
            detail={selectedTopicDetail}
            hasDetailFile={selectedTopicHasDetailFile}
            isLoading={loadingTopicId === selectedTopic?.id}
            loadError={selectedTopicLoadError}
            fullLessonHref={selectedTopicFullLessonHref}
            relatedTopics={previewRelatedTopics}
            onOpenTopic={onOpenTopic}
            className="flex-1 min-h-0"
          />
        </aside>
      ) : null}

      <Sheet
        open={!isDesktopViewport && Boolean(selectedTopicId)}
        onOpenChange={(open) => {
          if (!open) {
            onClose()
          }
        }}
      >
        <SheetContent side="bottom" className="h-[80dvh] p-0 lg:hidden">
          <SheetHeader className="border-b border-border/80 pb-4">
            <SheetTitle>Topic preview</SheetTitle>
            <SheetDescription>
              {selectedTopic ? selectedTopic.title : "Select a topic from the explorer to open a preview."}
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100%-5.1rem)] min-h-0">
            <TopicPreviewPanel
              topic={selectedTopic}
              detail={selectedTopicDetail}
              hasDetailFile={selectedTopicHasDetailFile}
              isLoading={loadingTopicId === selectedTopic?.id}
              loadError={selectedTopicLoadError}
              fullLessonHref={selectedTopicFullLessonHref}
              relatedTopics={previewRelatedTopics}
              onOpenTopic={onOpenTopic}
              className="h-full min-h-0"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
