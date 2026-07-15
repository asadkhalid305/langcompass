import { Fragment } from "react"

import { parseGeneratedText, tokenizeGeneratedInlineText } from "@/lib/learning-tools"

interface GeneratedLearningTextProps {
  value: string
}

function InlineText({ value }: { value: string }) {
  return tokenizeGeneratedInlineText(value).map((token, index) => {
    if (token.type === "strong") return <strong key={index} className="font-semibold">{token.text}</strong>
    if (token.type === "term") {
      return <span key={index} className="border border-orange-200 bg-orange-50 px-1 py-0.5 font-medium text-[#111827]">{token.text}</span>
    }
    return <Fragment key={index}>{token.text}</Fragment>
  })
}

export function GeneratedLearningText({ value }: GeneratedLearningTextProps) {
  const blocks = parseGeneratedText(value)

  return (
    <div className="mt-4 space-y-3 break-words text-sm leading-relaxed text-foreground">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2
            ? <h3 key={index} className="font-display text-base font-semibold"><InlineText value={block.text} /></h3>
            : <h4 key={index} className="font-semibold"><InlineText value={block.text} /></h4>
        }
        if (block.type === "unordered-list") {
          return <ul key={index} className="list-disc space-y-1.5 pl-5">{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineText value={item} /></li>)}</ul>
        }
        if (block.type === "ordered-list") {
          return <ol key={index} className="list-decimal space-y-1.5 pl-5">{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineText value={item} /></li>)}</ol>
        }
        if (block.type === "table") {
          return (
            <div key={index} className="overflow-x-auto border border-border">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead className="bg-muted/40">
                  <tr>{block.headers.map((cell, cellIndex) => <th key={cellIndex} scope="col" className="border-b border-r border-border px-3 py-2 font-semibold last:border-r-0"><InlineText value={cell} /></th>)}</tr>
                </thead>
                <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-border last:border-b-0">{block.headers.map((_, cellIndex) => <td key={cellIndex} className="border-r border-border px-3 py-2 align-top last:border-r-0"><InlineText value={row[cellIndex] ?? ""} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          )
        }
        return <p key={index}><InlineText value={block.text} /></p>
      })}
    </div>
  )
}
