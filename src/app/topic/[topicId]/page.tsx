import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { TopicDetailBreadcrumb } from "@/components/topic/topic-detail-breadcrumb"
import { TopicMetaTags } from "@/components/topic/topic-meta-tags"
import { loadTopicCatalog } from "@/lib/data/topic-catalog"
import { loadTopicDetailById } from "@/lib/data/topic-detail"
import { buildExplorerHref, buildTopicDetailHref } from "@/lib/explorer/navigation"
import { formatIntroducedInLabel, formatRevisitedInLabel, humanizeGroupLabel } from "@/lib/explorer/labels"
import type { TopicCatalogItem, TopicId } from "@/lib/types/topic"

interface TopicDetailPageProps {
  params: Promise<{ topicId: string }>
}

interface TopicLinkItem {
  id: TopicId
  title: string
  href: string | null
}

const formatDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(parsed)
}

const fallbackTitleFromId = (id: string): string =>
  id
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const resolveTopicLinks = (topicIds: TopicId[] | undefined, topicsById: Map<TopicId, TopicCatalogItem>): TopicLinkItem[] =>
  (topicIds ?? []).map((topicId) => {
    const foundTopic = topicsById.get(topicId)
    if (!foundTopic) {
      return {
        id: topicId,
        title: fallbackTitleFromId(topicId),
        href: null,
      }
    }

    return {
      id: topicId,
      title: foundTopic.title,
      href: buildTopicDetailHref(foundTopic.id, {
        level: foundTopic.level,
        group: foundTopic.group,
      }),
    }
  })

const hasRows = (value: unknown[] | undefined): value is unknown[] => Array.isArray(value) && value.length > 0

function StaticTopicBreadcrumb({
  topicId,
  topicTitle,
  level,
  group,
}: {
  topicId: TopicId
  topicTitle: string
  level: TopicCatalogItem["level"]
  group: string
}) {
  const explorerHref = buildExplorerHref({
    level,
    group,
    topicId,
  })

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href={explorerHref} className="transition-colors hover:text-foreground">
          {level} Explorer
        </Link>
        <span>/</span>
        <span>{humanizeGroupLabel(group)}</span>
        <span>/</span>
        <span className="text-foreground">{topicTitle}</span>
      </nav>
      <div className="mt-4 flex justify-end">
        <Link
          href={explorerHref}
          className="rounded-none border border-foreground/40 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back to explorer
        </Link>
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const topics = await loadTopicCatalog()
  return topics.map((topic) => ({ topicId: topic.id }))
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const [{ topicId }, topics] = await Promise.all([params, loadTopicCatalog()])

  const topicsById = new Map(topics.map((topic) => [topic.id, topic]))
  const topic = topicsById.get(topicId as TopicId)

  if (!topic) {
    notFound()
  }

  const detail = await loadTopicDetailById(topic.id)
  const prerequisiteTopics = resolveTopicLinks(detail?.prerequisiteTopicIds, topicsById)
  const relatedTopics = resolveTopicLinks(detail?.relatedTopicIds, topicsById)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
        <Suspense
          fallback={
            <StaticTopicBreadcrumb topicId={topic.id} topicTitle={topic.title} level={topic.level} group={topic.group} />
          }
        >
          <TopicDetailBreadcrumb topicId={topic.id} topicTitle={topic.title} defaultLevel={topic.level} defaultGroup={topic.group} />
        </Suspense>

        <header className="mt-6 rounded-none border border-border bg-white px-5 py-7 shadow-[5px_5px_0_#111827] md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Full lesson page</p>
          <h1 className="mt-4 max-w-4xl text-pretty text-3xl font-display font-bold leading-tight md:text-5xl">{topic.title}</h1>
          <TopicMetaTags topic={topic} hasDetailFile={Boolean(detail)} className="mt-5 flex flex-wrap gap-2" />
          {detail?.summary ? (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-foreground md:text-lg">{detail.summary}</p>
          ) : (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
              This topic currently has curriculum metadata, and the full lesson content is being prepared.
            </p>
          )}
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="space-y-6">
            {detail?.whyItMatters ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Why It Matters</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">{detail.whyItMatters}</p>
              </section>
            ) : null}

            {hasRows(detail?.ruleBlocks) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Rule Blocks</h2>
                <div className="mt-4 space-y-4">
                  {detail.ruleBlocks.map((ruleBlock) => (
                    <article key={ruleBlock.id} className="border-l-2 border-foreground/60 bg-muted/30 px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground md:text-base">{ruleBlock.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{ruleBlock.content}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {hasRows(detail?.tables) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Tables</h2>
                <div className="mt-4 space-y-6">
                  {detail.tables.map((table) => (
                    <div key={table.id} className="space-y-3 overflow-hidden border border-border">
                      <p className="border-b border-border bg-muted/40 px-4 py-2 text-sm font-semibold">{table.title}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-muted/35">
                              {table.columns.map((column) => (
                                <th key={column} className="border-b border-border px-4 py-2 text-left font-semibold text-foreground">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, rowIndex) => (
                              <tr key={`${table.id}-${rowIndex}`} className="odd:bg-white even:bg-muted/15">
                                {row.map((cell, cellIndex) => (
                                  <td key={`${table.id}-${rowIndex}-${cellIndex}`} className="border-t border-border px-4 py-2 text-foreground">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {hasRows(detail?.examples) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Examples</h2>
                <div className="mt-4 grid gap-3">
                  {detail.examples.map((example) => (
                    <article key={example.id} className="border border-border bg-muted/20 p-4">
                      <p className="text-base font-semibold text-foreground">{example.de}</p>
                      {example.en ? <p className="mt-1 text-sm text-muted-foreground">{example.en}</p> : null}
                      {example.note ? <p className="mt-3 border-t border-border pt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">{example.note}</p> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {hasRows(detail?.patterns) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Patterns</h2>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
                  {detail.patterns.map((pattern) => (
                    <li key={pattern} className="border-l-2 border-border/80 pl-3">
                      {pattern}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasRows(detail?.tips) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Tips</h2>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
                  {detail.tips.map((tip) => (
                    <li key={tip} className="border-l-2 border-border/80 pl-3">
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasRows(detail?.memoryHooks) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Memory Hooks</h2>
                <div className="mt-4 grid gap-3">
                  {detail.memoryHooks.map((hook) => (
                    <article key={hook.id} className="border border-border bg-muted/20 p-4">
                      <h3 className="text-sm font-semibold text-foreground md:text-base">{hook.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{hook.content}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {hasRows(detail?.commonMistakes) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Common Mistakes</h2>
                <div className="mt-4 grid gap-3">
                  {detail.commonMistakes.map((mistake) => (
                    <article key={mistake.id} className="grid gap-3 border border-border bg-muted/20 p-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-red-700">Wrong</p>
                        <p className="text-sm text-foreground">{mistake.wrong}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">Correct</p>
                        <p className="text-sm text-foreground">{mistake.correct}</p>
                        <p className="text-xs text-muted-foreground">{mistake.reason}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {hasRows(detail?.miniQuiz) ? (
              <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
                <h2 className="text-xl font-display font-semibold">Mini Quiz</h2>
                <div className="mt-4 space-y-3">
                  {detail.miniQuiz.map((item, index) => (
                    <article key={item.id} className="border border-border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Question {index + 1}</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{item.question}</p>
                      {hasRows(item.options) ? (
                        <ul className="mt-3 space-y-1 text-sm text-foreground">
                          {item.options.map((option) => (
                            <li key={option} className="border-l-2 border-border pl-3">
                              {option}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <p className="mt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">Answer: {item.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {!detail ? (
              <section className="rounded-none border border-dashed border-border bg-white px-5 py-6 text-sm text-muted-foreground md:px-7">
                No detail JSON is available for this topic yet. Once a file is added under `data/topic-details/{topic.id}.json`,
                long-form lesson sections will appear here automatically.
              </section>
            ) : null}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <section className="rounded-none border border-border bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Curriculum placement</p>
              <p className="mt-3 text-sm font-medium text-foreground">{formatIntroducedInLabel(topic.firstIntroducedIn)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatRevisitedInLabel(topic.revisitedIn)}</p>
            </section>

            {prerequisiteTopics.length > 0 ? (
              <section className="rounded-none border border-border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Prerequisites</p>
                <div className="mt-3 space-y-2">
                  {prerequisiteTopics.map((prerequisiteTopic) =>
                    prerequisiteTopic.href ? (
                      <Link
                        key={prerequisiteTopic.id}
                        href={prerequisiteTopic.href}
                        className="block border border-border bg-muted/20 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        {prerequisiteTopic.title}
                      </Link>
                    ) : (
                      <p key={prerequisiteTopic.id} className="border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                        {prerequisiteTopic.title}
                      </p>
                    ),
                  )}
                </div>
              </section>
            ) : null}

            {relatedTopics.length > 0 ? (
              <section className="rounded-none border border-border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Related topics</p>
                <div className="mt-3 space-y-2">
                  {relatedTopics.map((relatedTopic) =>
                    relatedTopic.href ? (
                      <Link
                        key={relatedTopic.id}
                        href={relatedTopic.href}
                        className="block border border-border bg-muted/20 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        {relatedTopic.title}
                      </Link>
                    ) : (
                      <p key={relatedTopic.id} className="border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                        {relatedTopic.title}
                      </p>
                    ),
                  )}
                </div>
              </section>
            ) : null}

            {hasRows(detail?.searchHints) ? (
              <section className="rounded-none border border-border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Search hints</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.searchHints.map((hint) => (
                    <span key={hint} className="border border-border bg-muted/20 px-2 py-1 text-xs text-foreground">
                      {hint}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {detail?.sourceStyle ? (
              <section className="rounded-none border border-border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Source metadata</p>
                <p className="mt-3 text-sm text-foreground">Origin: {detail.sourceStyle.origin}</p>
                <p className="mt-1 text-sm text-foreground">Confidence: {detail.sourceStyle.confidence}</p>
                {detail.sourceStyle.notes ? <p className="mt-2 text-xs text-muted-foreground">{detail.sourceStyle.notes}</p> : null}
              </section>
            ) : null}

            {detail?.updatedAt ? (
              <section className="rounded-none border border-border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Last updated</p>
                <p className="mt-2 text-sm text-foreground">{formatDate(detail.updatedAt)}</p>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  )
}
