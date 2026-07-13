import type { TopicCatalogItem, TopicComparison, TopicDetail, TopicTable } from "@/lib/types/topic"

import {
  formatChecklistLabel,
  formatProgressionLevel,
  hasAdvancedSpecialCases,
  hasArticlesAndForms,
  hasComparisonTables,
  hasCoreRules,
  hasPatternsAndUsage,
  hasRows,
  resolveDetailSectionOrder,
  resolveDetailSectionPresentation,
  type DetailSectionId,
} from "./topic-detail-page-helpers"

interface TopicDetailContentProps {
  detail: TopicDetail | null
  topicId: string
  topicsById: Map<string, TopicCatalogItem>
}

interface DetailSectionProps {
  title: string
  eyebrow?: string
  accentClassName?: string
  children: React.ReactNode
}

interface TokenListProps {
  items: string[]
  tone?: "default" | "accent"
}

function DetailSection({ title, eyebrow, accentClassName, children }: DetailSectionProps) {
  return (
    <section className={`min-w-0 rounded-none border border-border bg-white px-5 py-6 md:px-7 ${accentClassName ?? ""} [content-visibility:auto]`}>
      {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}
      <h2 className="mt-2 text-xl font-display font-semibold md:text-2xl">{title}</h2>
      {children}
    </section>
  )
}

function TokenList({ items, tone = "default" }: TokenListProps) {
  const styles =
    tone === "accent"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
      : "border-border bg-muted/20 text-foreground"

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-none border px-3 py-1.5 text-sm ${styles}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function DetailTable({ table }: { table: TopicTable }) {
  return (
    <div className="space-y-3 overflow-hidden border border-border bg-white">
      <p className="border-b border-border bg-muted/35 px-4 py-2 text-sm font-semibold">{table.title}</p>
      <div
        className="max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        role="region"
        aria-label={`${table.title} table`}
        tabIndex={0}
      >
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/20">
              {table.columns.map((column) => (
                <th key={column} className="border-b border-border px-4 py-2 text-left font-semibold text-foreground">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${table.id}-${rowIndex}`} className="odd:bg-white even:bg-muted/10">
                {row.map((cell, cellIndex) => (
                  <td key={`${table.id}-${rowIndex}-${cellIndex}`} className="border-t border-border px-4 py-2 align-top text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const fallbackTitleFromId = (id: string): string =>
  id
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

function ComparisonCard({
  comparison,
  topicsById,
}: {
  comparison: TopicComparison
  topicsById: Map<string, TopicCatalogItem>
}) {
  const relatedTopic = topicsById.get(comparison.topicId)
  const comparisonTitle = relatedTopic?.title ?? fallbackTitleFromId(comparison.topicId)

  return (
    <article className="space-y-4 border border-border bg-muted/10 p-4">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Compared with</p>
        <h3 className="text-lg font-semibold text-foreground">{comparisonTitle}</h3>
        <p className="text-sm leading-relaxed text-foreground">{comparison.summary}</p>
      </div>
      {comparison.table ? (
        <div
          className="max-w-full overflow-x-auto overscroll-x-contain border border-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          role="region"
          aria-label={`${comparisonTitle} comparison table`}
          tabIndex={0}
        >
          <table className="w-full min-w-[24rem] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/20">
                {comparison.table.columns.map((column) => (
                  <th key={column} className="border-b border-border px-4 py-2 text-left font-semibold text-foreground">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.table.rows.map((row, rowIndex) => (
                <tr key={`${comparison.topicId}-${rowIndex}`} className="odd:bg-white even:bg-muted/10">
                  {row.map((cell, cellIndex) => (
                    <td key={`${comparison.topicId}-${rowIndex}-${cellIndex}`} className="border-t border-border px-4 py-2 align-top text-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </article>
  )
}

export function TopicDetailContent({ detail, topicId, topicsById }: TopicDetailContentProps) {
  if (!detail) {
    return (
      <article className="min-w-0 space-y-6">
        <section className="rounded-none border border-dashed border-border bg-white px-5 py-6 text-sm text-muted-foreground md:px-7">
          No detail JSON is available for this topic yet. Once a file is added under `data/topic-details/{topicId}.json`,
          long-form lesson sections will appear here automatically.
        </section>
      </article>
    )
  }

  const sectionOrder = resolveDetailSectionOrder(detail)
  const presentation = resolveDetailSectionPresentation(detail.topicType)
  const renderSection = (sectionId: DetailSectionId): React.ReactNode => {
    switch (sectionId) {
      case "mentalModel":
        if (!hasRows(detail.mentalModel)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.mentalModel.title}
            eyebrow={presentation.mentalModel.eyebrow}
            accentClassName="border-amber-300 bg-[linear-gradient(180deg,rgba(254,243,199,0.72),rgba(255,255,255,1))]"
          >
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {detail.mentalModel.map((item, index) => (
                <article key={`${item.title}-${index}`} className="border border-amber-300/80 bg-white/90 p-4 shadow-[4px_4px_0_rgba(146,64,14,0.12)]">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{item.content}</p>
                </article>
              ))}
            </div>
          </DetailSection>
        )

      case "coreRules":
        if (!hasCoreRules(detail)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.coreRules.title}
            eyebrow={presentation.coreRules.eyebrow}
          >
            {detail.whyItMatters ? (
              <p className="mt-4 rounded-none border border-border bg-muted/15 px-4 py-3 text-sm leading-relaxed text-foreground md:text-base">
                {detail.whyItMatters}
              </p>
            ) : null}
            {hasRows(detail.ruleBlocks) ? (
              <div className="mt-4 grid gap-3">
                {detail.ruleBlocks.map((ruleBlock) => (
                  <article key={ruleBlock.id} className="border-l-2 border-foreground/60 bg-muted/20 px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground md:text-base">{ruleBlock.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{ruleBlock.content}</p>
                  </article>
                ))}
              </div>
            ) : null}
            {hasRows(detail.coverageChecklist) ? (
              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">What this page covers</p>
                <TokenList items={detail.coverageChecklist.map(formatChecklistLabel)} tone="accent" />
              </div>
            ) : null}
          </DetailSection>
        )

      case "articlesAndForms":
        if (!hasArticlesAndForms(detail)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.articlesAndForms.title}
            eyebrow={presentation.articlesAndForms.eyebrow}
          >
            <div className="mt-4 grid gap-6">
              {detail.tables?.map((table) => <DetailTable key={table.id} table={table} />)}
            </div>
          </DetailSection>
        )

      case "patternsAndUsage":
        if (!hasPatternsAndUsage(detail)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.patternsAndUsage.title}
            eyebrow={presentation.patternsAndUsage.eyebrow}
          >
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {hasRows(detail.patterns) ? (
                <article className="border border-border bg-muted/10 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {presentation.patternsAndUsage.patternsLabel}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
                    {detail.patterns.map((pattern) => (
                      <li key={pattern} className="border-l-2 border-border/80 pl-3">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </article>
              ) : null}
              {hasRows(detail.sentenceStructure) ? (
                <article className="border border-border bg-muted/10 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {presentation.patternsAndUsage.sentenceStructureLabel}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
                    {detail.sentenceStructure.map((item) => (
                      <li key={item} className="border-l-2 border-border/80 pl-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ) : null}
            </div>
            {hasRows(detail.verbs) ? (
              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {presentation.patternsAndUsage.verbsLabel}
                </p>
                <TokenList items={detail.verbs} />
              </div>
            ) : null}
            {hasRows(detail.prepositions) ? (
              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {presentation.patternsAndUsage.prepositionsLabel}
                </p>
                <TokenList items={detail.prepositions} />
              </div>
            ) : null}
            {hasRows(detail.twoWayPrepositions) ? (
              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {presentation.patternsAndUsage.twoWayPrepositionsLabel}
                </p>
                <TokenList items={detail.twoWayPrepositions} />
              </div>
            ) : null}
          </DetailSection>
        )

      case "levelProgression":
        if (!hasRows(detail.levelProgression)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.levelProgression.title}
            eyebrow={presentation.levelProgression.eyebrow}
          >
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {detail.levelProgression.map((step, index) => (
                <article key={`${step.level}-${index}`} className="relative border border-border bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{formatProgressionLevel(step.level)}</h3>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Stage {index + 1}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
                    {step.concepts.map((concept) => (
                      <li key={concept} className="border-l-2 border-emerald-600/60 pl-3">
                        {concept}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </DetailSection>
        )

      case "comparisons":
        if (!hasRows(detail.comparisons)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.comparisons.title}
            eyebrow={
              detail.topicType === "grammar" && hasComparisonTables(detail)
                ? "Contrast the cases"
                : presentation.comparisons.eyebrow
            }
          >
            <div className="mt-4 grid gap-4">
              {detail.comparisons.map((comparison, index) => (
                <ComparisonCard key={`${comparison.topicId}-${index}`} comparison={comparison} topicsById={topicsById} />
              ))}
            </div>
          </DetailSection>
        )

      case "examples":
        if (!hasRows(detail.examples)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.examples.title}
            eyebrow={presentation.examples.eyebrow}
          >
            <div className="mt-4 grid gap-3">
              {detail.examples.map((example, index) => (
                <article key={example.id ?? `${example.de}-${index}`} className="border border-border bg-muted/15 p-4">
                  <p className="text-base font-semibold text-foreground">{example.de}</p>
                  {example.en ? <p className="mt-1 text-sm text-muted-foreground">{example.en}</p> : null}
                  {example.note ? (
                    <p className="mt-3 border-t border-border pt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">{example.note}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </DetailSection>
        )

      case "commonMistakes":
        if (!hasRows(detail.commonMistakes)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.commonMistakes.title}
            eyebrow={presentation.commonMistakes.eyebrow}
          >
            <div className="mt-4 grid gap-3">
              {detail.commonMistakes.map((mistake, index) => (
                <article
                  key={mistake.id ?? `${mistake.wrong}-${index}`}
                  className="grid gap-3 border border-border bg-muted/10 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
                >
                  <div className="space-y-2 border border-red-200 bg-red-50/70 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-700">
                      {presentation.commonMistakes.wrongLabel}
                    </p>
                    <p className="text-sm font-medium text-red-950">{mistake.wrong}</p>
                  </div>
                  <div className="space-y-2 border border-emerald-200 bg-emerald-50/80 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                      {presentation.commonMistakes.correctLabel}
                    </p>
                    <p className="text-sm font-medium text-emerald-950">{mistake.correct}</p>
                    <p className="text-sm text-foreground">{mistake.reason}</p>
                  </div>
                </article>
              ))}
            </div>
          </DetailSection>
        )

      case "advancedSpecialCases":
        if (!hasAdvancedSpecialCases(detail)) return null

        return (
          <DetailSection
            key={sectionId}
            title={presentation.advancedSpecialCases.title}
            eyebrow={presentation.advancedSpecialCases.eyebrow}
          >
            <div className="mt-4 space-y-3">
              {hasRows(detail.specialCases) ? (
                <details className="border border-border bg-muted/10 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">
                    {presentation.advancedSpecialCases.detailsLabel}
                  </summary>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
                    {detail.specialCases.map((item) => (
                      <li key={item} className="border-l-2 border-border/80 pl-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {hasRows(detail.tips) ? (
                <details className="border border-border bg-muted/10 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">Tips</summary>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
                    {detail.tips.map((tip) => (
                      <li key={tip} className="border-l-2 border-border/80 pl-3">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {hasRows(detail.memoryHooks) ? (
                <details className="border border-border bg-muted/10 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">Memory hooks</summary>
                  <div className="mt-4 grid gap-3">
                    {detail.memoryHooks.map((hook) => (
                      <article key={hook.id} className="border border-border bg-white p-4">
                        <h3 className="text-sm font-semibold text-foreground md:text-base">{hook.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">{hook.content}</p>
                      </article>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </DetailSection>
        )
    }
  }

  const sections = sectionOrder.map(renderSection).filter(Boolean)

  return <article className="min-w-0 space-y-6">{sections}</article>
}
