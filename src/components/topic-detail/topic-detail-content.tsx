import type { TopicDetail } from "@/lib/types/topic"

import { hasRows } from "./topic-detail-page-helpers"

interface TopicDetailContentProps {
  detail: TopicDetail | null
  topicId: string
}

interface DetailSectionProps {
  title: string
  children: React.ReactNode
}

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="rounded-none border border-border bg-white px-5 py-6 md:px-7 [content-visibility:auto]">
      <h2 className="text-xl font-display font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function TopicDetailContent({ detail, topicId }: TopicDetailContentProps) {
  return (
    <article className="space-y-6">
      {detail?.whyItMatters ? (
        <DetailSection title="Why It Matters">
          <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">{detail.whyItMatters}</p>
        </DetailSection>
      ) : null}

      {hasRows(detail?.ruleBlocks) ? (
        <DetailSection title="Rule Blocks">
          <div className="mt-4 space-y-4">
            {detail.ruleBlocks.map((ruleBlock) => (
              <article key={ruleBlock.id} className="border-l-2 border-foreground/60 bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground md:text-base">{ruleBlock.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{ruleBlock.content}</p>
              </article>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {hasRows(detail?.tables) ? (
        <DetailSection title="Tables">
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
        </DetailSection>
      ) : null}

      {hasRows(detail?.examples) ? (
        <DetailSection title="Examples">
          <div className="mt-4 grid gap-3">
            {detail.examples.map((example) => (
              <article key={example.id} className="border border-border bg-muted/20 p-4">
                <p className="text-base font-semibold text-foreground">{example.de}</p>
                {example.en ? <p className="mt-1 text-sm text-muted-foreground">{example.en}</p> : null}
                {example.note ? (
                  <p className="mt-3 border-t border-border pt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">{example.note}</p>
                ) : null}
              </article>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {hasRows(detail?.patterns) ? (
        <DetailSection title="Patterns">
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
            {detail.patterns.map((pattern) => (
              <li key={pattern} className="border-l-2 border-border/80 pl-3">
                {pattern}
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {hasRows(detail?.tips) ? (
        <DetailSection title="Tips">
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground">
            {detail.tips.map((tip) => (
              <li key={tip} className="border-l-2 border-border/80 pl-3">
                {tip}
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {hasRows(detail?.memoryHooks) ? (
        <DetailSection title="Memory Hooks">
          <div className="mt-4 grid gap-3">
            {detail.memoryHooks.map((hook) => (
              <article key={hook.id} className="border border-border bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground md:text-base">{hook.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{hook.content}</p>
              </article>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {hasRows(detail?.commonMistakes) ? (
        <DetailSection title="Common Mistakes">
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
        </DetailSection>
      ) : null}

      {hasRows(detail?.miniQuiz) ? (
        <DetailSection title="Mini Quiz">
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
        </DetailSection>
      ) : null}

      {!detail ? (
        <section className="rounded-none border border-dashed border-border bg-white px-5 py-6 text-sm text-muted-foreground md:px-7">
          No detail JSON is available for this topic yet. Once a file is added under `data/topic-details/{topicId}.json`,
          long-form lesson sections will appear here automatically.
        </section>
      ) : null}
    </article>
  )
}
