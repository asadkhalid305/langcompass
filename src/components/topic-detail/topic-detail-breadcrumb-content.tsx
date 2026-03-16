import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { Button } from "@/components/ui/button"
import { humanizeGroupLabel } from "@/lib/explorer/labels"
import type { TopicLevelOrAll } from "@/lib/types/topic"

interface TopicDetailBreadcrumbContentProps {
  level: TopicLevelOrAll
  group: string
  topicTitle: string
  explorerHref: string
}

export function TopicDetailBreadcrumbContent({ level, group, topicTitle, explorerHref }: TopicDetailBreadcrumbContentProps) {
  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "LangCompass", href: "/", variant: "brand" },
          { label: `${level} Explorer`, href: explorerHref },
          { label: humanizeGroupLabel(group) },
          { label: topicTitle },
        ]}
      />

      <div className="mt-4 flex justify-end">
        <Button asChild variant="outline" className="rounded-none border-foreground/40 bg-white">
          <Link href={explorerHref}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to explorer
          </Link>
        </Button>
      </div>
    </>
  )
}
