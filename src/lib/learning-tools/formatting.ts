export type GeneratedTextBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }

export type GeneratedInlineToken =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "term"; text: string }

const unorderedItem = /^\s*[-*•]\s+(.+)$/
const orderedItem = /^\s*\d+[.)]\s+(.+)$/
const heading = /^\s*(#{1,3})\s+(.+)$/
const tableDividerCell = /^:?-{3,}:?$/

const tableCells = (line: string): string[] =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim())

const isTableDivider = (line: string): boolean => {
  const cells = tableCells(line)
  return cells.length > 0 && cells.every((cell) => tableDividerCell.test(cell))
}

export function parseGeneratedText(value: string): GeneratedTextBlock[] {
  const lines = value.replaceAll("\r\n", "\n").split("\n")
  const blocks: GeneratedTextBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const headingMatch = line.match(heading)
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length === 1 ? 2 : 3, text: headingMatch[2].trim() })
      index += 1
      continue
    }

    const unorderedMatch = line.match(unorderedItem)
    if (unorderedMatch) {
      const items: string[] = []
      while (index < lines.length) {
        const match = lines[index].match(unorderedItem)
        if (!match) break
        items.push(match[1].trim())
        index += 1
      }
      blocks.push({ type: "unordered-list", items })
      continue
    }

    const orderedMatch = line.match(orderedItem)
    if (orderedMatch) {
      const items: string[] = []
      while (index < lines.length) {
        const match = lines[index].match(orderedItem)
        if (!match) break
        items.push(match[1].trim())
        index += 1
      }
      blocks.push({ type: "ordered-list", items })
      continue
    }

    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line)
      const rows: string[][] = []
      index += 2
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(tableCells(lines[index]))
        index += 1
      }
      blocks.push({ type: "table", headers, rows })
      continue
    }

    const paragraphLines = [line.trim()]
    index += 1
    while (
      index < lines.length
      && lines[index].trim()
      && !heading.test(lines[index])
      && !unorderedItem.test(lines[index])
      && !orderedItem.test(lines[index])
      && !(lines[index].includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1]))
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") })
  }

  return blocks
}

const inlinePattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`|“[^”\n]+”|‘[^’\n]+’|"[^"\n]+"|'[^'\n]+')/g

export function tokenizeGeneratedInlineText(value: string): GeneratedInlineToken[] {
  const tokens: GeneratedInlineToken[] = []
  let cursor = 0

  for (const match of value.matchAll(inlinePattern)) {
    const start = match.index ?? 0
    if (start > cursor) tokens.push({ type: "text", text: value.slice(cursor, start) })
    const matched = match[0]
    if (matched.startsWith("**")) {
      tokens.push({ type: "strong", text: matched.slice(2, -2) })
    } else {
      tokens.push({ type: "term", text: matched.slice(1, -1) })
    }
    cursor = start + matched.length
  }

  if (cursor < value.length) tokens.push({ type: "text", text: value.slice(cursor) })
  return tokens.length > 0 ? tokens : [{ type: "text", text: value }]
}
