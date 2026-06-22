import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { LangCompassLogo } from "@/components/branding/langcompass-logo"
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb"
import { Button } from "@/components/ui/button"
import { humanizeSectionLabel } from "@/lib/explorer/labels"
import type { TopicLevelOrAll, TopicSection } from "@/lib/types/topic"

interface TopicDetailBreadcrumbContentProps {
  level: TopicLevelOrAll
  section: TopicSection
  topicTitle: string
  explorerHref: string
}

export function TopicDetailBreadcrumbContent({ level, section, topicTitle, explorerHref }: TopicDetailBreadcrumbContentProps) {
  return (
    <header className="rounded-none border border-border bg-white/90 px-4 py-4 shadow-[4px_4px_0_#111827] backdrop-blur md:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href="/" className="inline-flex text-left transition-opacity hover:opacity-80" aria-label="Go to overview">
            <LangCompassLogo compact />
          </Link>
          <AppBreadcrumb
            className="mt-3"
            items={[
              { label: `${level} Explorer`, href: explorerHref },
              { label: humanizeSectionLabel(section) },
              { label: topicTitle },
            ]}
          />
        </div>

        <div className="flex shrink-0 justify-start lg:justify-end">
          <Button asChild variant="outline" className="h-10 rounded-none border-foreground/40 bg-[#FFFDF8]">
            <Link href={explorerHref}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to explorer
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
