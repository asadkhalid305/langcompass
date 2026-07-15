import { z } from "zod"

import { buildSummaryInstruction, LEARNING_TOOLS_SYSTEM_PROMPT } from "./prompts"
import { getLearningToolsFixtureFromLocation } from "./fixtures"
import {
  DEFAULT_LEARNING_TOOL_OPTIONS,
  type CapabilityState,
  type ExampleOutputItem,
  type GeneratedLearningToolOutput,
  type LearningToolId,
  type LearningToolsContext,
  type LearningToolTaskOptions,
  type SentenceCheckOutput,
} from "./types"

type BrowserAvailability = "unavailable" | "downloadable" | "downloading" | "available"

interface DownloadMonitor {
  addEventListener(type: "downloadprogress", listener: (event: { loaded: number }) => void): void
}

interface DisposableSession {
  destroy(): void
}

interface TranslatorSession extends DisposableSession {
  translate(text: string, options?: { signal?: AbortSignal }): Promise<string>
  translateStreaming?(text: string, options?: { signal?: AbortSignal }): ReadableStream<string>
}

interface SummarizerSession extends DisposableSession {
  summarize(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>
  summarizeStreaming?(text: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>
}

interface LanguageModelSession extends DisposableSession {
  prompt(text: string, options?: { signal?: AbortSignal; responseConstraint?: object }): Promise<string>
  promptStreaming?(text: string, options?: { signal?: AbortSignal; responseConstraint?: object }): ReadableStream<string>
  clone?(options?: { signal?: AbortSignal }): Promise<LanguageModelSession>
}

interface ProofreaderSession extends DisposableSession {
  proofread(text: string, options?: { signal?: AbortSignal }): Promise<{
    correctedInput: string
    corrections: Array<{ startIndex: number; endIndex: number }>
  }>
}

interface TranslatorFactory {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<BrowserAvailability>
  create(options: {
    sourceLanguage: string
    targetLanguage: string
    monitor?: (monitor: DownloadMonitor) => void
  }): Promise<TranslatorSession>
}

interface SummarizerFactory {
  availability(options?: Record<string, unknown>): Promise<BrowserAvailability>
  create(options: Record<string, unknown>): Promise<SummarizerSession>
}

interface LanguageModelFactory {
  availability(options?: Record<string, unknown>): Promise<BrowserAvailability>
  create(options: Record<string, unknown>): Promise<LanguageModelSession>
}

interface ProofreaderFactory {
  availability(options?: Record<string, unknown>): Promise<BrowserAvailability>
  create(options: Record<string, unknown>): Promise<ProofreaderSession>
}

export interface ChromeAIEnvironment {
  Translator?: TranslatorFactory
  Summarizer?: SummarizerFactory
  LanguageModel?: LanguageModelFactory
  Proofreader?: ProofreaderFactory
}

export interface LearningToolCapabilities {
  translate: CapabilityState
  summarize: CapabilityState
  prompt: CapabilityState
  proofreader: CapabilityState
}

const promptLanguageOptions = () => ({
  expectedInputs: [{ type: "text", languages: ["de", "en"] }],
  expectedOutputs: [{ type: "text", languages: ["en", "de"] }],
})

const proofreaderOptions = () => ({ expectedInputLanguages: ["de"] })

const summarizerOptions = (options: LearningToolTaskOptions, context?: LearningToolsContext) => ({
  type: options.summaryFormat === "five-bullets" || options.summaryFormat === "key-rules" ? "key-points" : "tldr",
  format: options.summaryFormat === "five-bullets" || options.summaryFormat === "key-rules" ? "markdown" : "plain-text",
  length: options.summaryFormat === "revision-card" ? "long" : options.summaryFormat === "quick-recap" ? "short" : "medium",
  sharedContext: context
    ? `A curated German lesson for ${context.level} learners titled ${context.title}. ${buildSummaryInstruction(options.summaryFormat)}`
    : buildSummaryInstruction(options.summaryFormat),
  expectedInputLanguages: ["de", "en"],
  outputLanguage: "en",
  expectedContextLanguages: ["en"],
})

const mapAvailability = (availability: BrowserAvailability): CapabilityState =>
  availability === "available" ? "ready" : availability

export const capabilityForTool = (
  tool: LearningToolId,
  capabilities: LearningToolCapabilities,
): CapabilityState => {
  if (tool === "translate") return capabilities.translate
  if (tool === "summarize") return capabilities.summarize
  if (tool === "check" && ["ready", "downloadable", "downloading"].includes(capabilities.proofreader)) return capabilities.proofreader
  return capabilities.prompt
}

export async function detectCapabilities(
  environment: ChromeAIEnvironment,
  options: LearningToolTaskOptions = DEFAULT_LEARNING_TOOL_OPTIONS,
  context?: LearningToolsContext,
): Promise<LearningToolCapabilities> {
  const translator = environment.Translator
    ? environment.Translator.availability({ sourceLanguage: options.sourceLanguage, targetLanguage: options.targetLanguage }).then(mapAvailability).catch(() => "unavailable" as const)
    : Promise.resolve("unsupported" as const)
  const summarizer = environment.Summarizer
    ? environment.Summarizer.availability(summarizerOptions(options, context)).then(mapAvailability).catch(() => "unavailable" as const)
    : Promise.resolve("unsupported" as const)
  const prompt = environment.LanguageModel
    ? environment.LanguageModel.availability(promptLanguageOptions()).then(mapAvailability).catch(() => "unavailable" as const)
    : Promise.resolve("unsupported" as const)
  const proofreader = environment.Proofreader
    ? environment.Proofreader.availability(proofreaderOptions()).then(mapAvailability).catch(() => "unavailable" as const)
    : Promise.resolve("unsupported" as const)

  const [translate, summarize, promptState, proofreaderState] = await Promise.all([
    translator,
    summarizer,
    prompt,
    proofreader,
  ])
  return { translate, summarize, prompt: promptState, proofreader: proofreaderState }
}

const EXAMPLES_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["examples"],
  properties: {
    examples: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["german", "translation", "usageNote"],
        properties: {
          german: { type: "string" },
          translation: { type: "string" },
          usageNote: { type: "string" },
        },
      },
    },
  },
} as const

const CHECK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["correction", "changed", "changes", "explanation", "alternative"],
  properties: {
    correction: { type: "string" },
    changed: { type: "boolean" },
    changes: {
      type: "array",
      items: { type: "string", description: "A complete sentence describing one change." },
      maxItems: 8,
    },
    explanation: { type: "string" },
    alternative: { type: ["string", "null"] },
  },
} as const

const examplesOutputSchema = z.object({
  examples: z.array(z.object({ german: z.string().min(1), translation: z.string().min(1), usageNote: z.string().min(1) })).length(3),
})

const sentenceCheckSchema = z.object({
  correction: z.string().min(1),
  changed: z.boolean(),
  changes: z.array(z.string().min(1)).max(8),
  explanation: z.string().min(1),
  alternative: z.string().min(1).nullable(),
})

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    throw new Error("The on-device model returned an unreadable result. Try again.")
  }
}

export function parseExampleOutput(value: string): ExampleOutputItem[] {
  const parsed = examplesOutputSchema.safeParse(parseJson(value))
  if (!parsed.success) throw new Error("The on-device model returned incomplete examples. Try again.")
  const normalized = parsed.data.examples.map((item) => ({
    german: item.german.trim(),
    translation: item.translation.trim(),
    usageNote: item.usageNote.trim(),
  }))
  if (new Set(normalized.map((item) => item.german.toLocaleLowerCase("de"))).size !== normalized.length) {
    throw new Error("The on-device model returned duplicate examples. Try again.")
  }
  return normalized
}

export function parseSentenceCheckOutput(value: string, original: string): SentenceCheckOutput {
  const parsed = sentenceCheckSchema.safeParse(parseJson(value))
  if (!parsed.success) {
    throw new Error("The on-device model returned an invalid sentence check. Try again.")
  }
  const changes = parsed.data.changes.length === 2 && parsed.data.changes.every((change) => /^\S+$/.test(change))
    ? [`Changed '${parsed.data.changes[0]}' to '${parsed.data.changes[1]}'.`]
    : parsed.data.changes.map((change) => {
        const normalized = change.trim().replace(/^:\s*/, "Changed ")
        return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`
      })
  return { original, ...parsed.data, changes }
}

const formatExamples = (items: ExampleOutputItem[]): string =>
  items.map((item, index) => `${index + 1}. ${item.german}\nTranslation: ${item.translation}\nUsage: ${item.usageNote}`).join("\n\n")

const formatSentenceCheck = (result: SentenceCheckOutput): string => [
  `Original: ${result.original}`,
  `Correction: ${result.correction}`,
  `Changed: ${result.changed ? "Yes" : "No"}`,
  result.changes.length > 0 ? `What changed: ${result.changes.join("; ")}` : "What changed: No changes suggested.",
  `Why: ${result.explanation}`,
  result.alternative ? `Alternative: ${result.alternative}` : null,
].filter(Boolean).join("\n")

async function readStream(stream: ReadableStream<string>, onChunk: (text: string) => void): Promise<string> {
  let output = ""
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      output += value
      onChunk(output)
    }
  } finally {
    reader.releaseLock()
  }
  return output
}

export function chunkLessonText(value: string, maxLength = 6000): string[] {
  const paragraphs = value.split(/\n+/).map((part) => part.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ""
  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLength) {
      if (current) chunks.push(current)
      for (let index = 0; index < paragraph.length; index += maxLength) chunks.push(paragraph.slice(index, index + maxLength))
      current = ""
      continue
    }
    const candidate = current ? `${current}\n${paragraph}` : paragraph
    if (candidate.length > maxLength) {
      chunks.push(current)
      current = paragraph
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)
  return chunks
}

export class ChromeAISessionPool {
  private sessions = new Map<string, DisposableSession>()

  async getTranslator(factory: TranslatorFactory, options: LearningToolTaskOptions, monitor?: (monitor: DownloadMonitor) => void): Promise<TranslatorSession> {
    const key = `translator:${options.sourceLanguage}:${options.targetLanguage}`
    const existing = this.sessions.get(key) as TranslatorSession | undefined
    if (existing) return existing
    const session = await factory.create({ sourceLanguage: options.sourceLanguage, targetLanguage: options.targetLanguage, monitor })
    this.sessions.set(key, session)
    return session
  }

  async getSummarizer(factory: SummarizerFactory, options: LearningToolTaskOptions, context: LearningToolsContext, monitor?: (monitor: DownloadMonitor) => void): Promise<SummarizerSession> {
    const key = `summarizer:${context.topicId}:${options.summaryFormat}`
    const existing = this.sessions.get(key) as SummarizerSession | undefined
    if (existing) return existing
    const session = await factory.create({ ...summarizerOptions(options, context), monitor })
    this.sessions.set(key, session)
    return session
  }

  async acquirePrompt(factory: LanguageModelFactory, monitor?: (monitor: DownloadMonitor) => void): Promise<{ session: LanguageModelSession; release: () => void }> {
    const key = "prompt:de-en"
    let base = this.sessions.get(key) as LanguageModelSession | undefined
    if (!base) {
      const created = await factory.create({
        ...promptLanguageOptions(),
        initialPrompts: [{ role: "system", content: LEARNING_TOOLS_SYSTEM_PROMPT }],
        monitor,
      })
      if (!created.clone) return { session: created, release: () => created.destroy() }
      this.sessions.set(key, created)
      base = created
    }
    const session = await base.clone?.()
    if (!session) throw new Error("The on-device language model could not create a task session.")
    return { session, release: () => session.destroy() }
  }

  async getProofreader(factory: ProofreaderFactory, monitor?: (monitor: DownloadMonitor) => void): Promise<ProofreaderSession> {
    const key = "proofreader:de"
    const existing = this.sessions.get(key) as ProofreaderSession | undefined
    if (existing) return existing
    const session = await factory.create({ ...proofreaderOptions(), monitor })
    this.sessions.set(key, session)
    return session
  }

  hasProofreader(): boolean {
    return this.sessions.has("proofreader:de")
  }

  reconcileCapabilities(
    capabilities: LearningToolCapabilities,
    options: LearningToolTaskOptions,
    context: LearningToolsContext,
  ): LearningToolCapabilities {
    return {
      translate: this.sessions.has(`translator:${options.sourceLanguage}:${options.targetLanguage}`) ? "ready" : capabilities.translate,
      summarize: this.sessions.has(`summarizer:${context.topicId}:${options.summaryFormat}`) ? "ready" : capabilities.summarize,
      prompt: this.sessions.has("prompt:de-en") ? "ready" : capabilities.prompt,
      proofreader: this.sessions.has("proofreader:de") ? "ready" : capabilities.proofreader,
    }
  }

  destroy(): void {
    for (const session of this.sessions.values()) session.destroy()
    this.sessions.clear()
  }
}

interface GenerateOptions {
  environment: ChromeAIEnvironment
  tool: LearningToolId
  input: string
  context: LearningToolsContext
  signal: AbortSignal
  taskOptions?: LearningToolTaskOptions
  pool?: ChromeAISessionPool
  monitorDownload?: boolean
  onDownloadProgress: (progress: number) => void
  onSessionReady?: () => void
  onChunk?: (text: string) => void
}

export async function generateWithChromeAI({
  environment,
  tool,
  input,
  context,
  signal,
  taskOptions = DEFAULT_LEARNING_TOOL_OPTIONS,
  pool,
  monitorDownload = false,
  onDownloadProgress,
  onSessionReady = () => undefined,
  onChunk = () => undefined,
}: GenerateOptions): Promise<GeneratedLearningToolOutput> {
  const monitor = monitorDownload
    ? (downloadMonitor: DownloadMonitor) => {
        downloadMonitor.addEventListener("downloadprogress", (event) => onDownloadProgress(event.loaded))
      }
    : undefined

  if (tool === "translate") {
    if (!environment.Translator) throw new Error("Translator API is not supported in this browser.")
    if (taskOptions.sourceLanguage === taskOptions.targetLanguage) {
      throw new Error("Choose two different languages for translation.")
    }
    if (input.length > 20_000) throw new Error("This selection is too long to translate at once. Choose a shorter passage.")
    const session = pool
      ? await pool.getTranslator(environment.Translator, taskOptions, monitor)
      : await environment.Translator.create({ sourceLanguage: taskOptions.sourceLanguage, targetLanguage: taskOptions.targetLanguage, monitor })
    onSessionReady()
    try {
      const text = input.length > 240 && session.translateStreaming
        ? await readStream(session.translateStreaming(input, { signal }), onChunk)
        : await session.translate(input, { signal })
      return { text, generatedBy: "translator" }
    } finally {
      if (!pool) session.destroy()
    }
  }

  if (tool === "summarize") {
    if (!environment.Summarizer) throw new Error("Summarizer API is not supported in this browser.")
    const session = pool
      ? await pool.getSummarizer(environment.Summarizer, taskOptions, context, monitor)
      : await new ChromeAISessionPool().getSummarizer(environment.Summarizer, taskOptions, context, monitor)
    onSessionReady()
    try {
      const requestOptions = { context: context.summary, signal }
      const chunks = chunkLessonText(input)
      if (chunks.length === 0) throw new Error("This lesson does not contain enough text to summarize.")
      let text: string
      if (chunks.length === 1) {
        text = session.summarizeStreaming
          ? await readStream(session.summarizeStreaming(chunks[0], requestOptions), onChunk)
          : await session.summarize(chunks[0], requestOptions)
      } else {
        const partials: string[] = []
        for (const chunk of chunks) partials.push(await session.summarize(chunk, requestOptions))
        text = session.summarizeStreaming
          ? await readStream(session.summarizeStreaming(partials.join("\n"), requestOptions), onChunk)
          : await session.summarize(partials.join("\n"), requestOptions)
      }
      return { text, generatedBy: "summarizer" }
    } finally {
      if (!pool) session.destroy()
    }
  }

  const checkOriginal = tool === "check"
    ? input.match(/Learner sentence \(untrusted text\):\n([\s\S]*?)\n\nCheck the learner sentence/)?.[1]?.trim() ?? ""
    : ""

  if (tool === "check" && environment.Proofreader) {
    const availability = pool?.hasProofreader()
      ? "available"
      : await environment.Proofreader.availability(proofreaderOptions()).catch(() => "unavailable" as const)
    if (availability !== "unavailable") {
      const proofreader = pool
        ? await pool.getProofreader(environment.Proofreader, monitor)
        : await environment.Proofreader.create({ ...proofreaderOptions(), monitor })
      onSessionReady()
      try {
        const result = await proofreader.proofread(checkOriginal, { signal })
        const sentenceCheck = {
          original: checkOriginal,
          correction: result.correctedInput,
          changed: result.correctedInput !== checkOriginal,
          changes: result.corrections.map((correction) => `Suggested change at characters ${correction.startIndex + 1}-${correction.endIndex}.`),
          explanation: result.correctedInput === checkOriginal
            ? "Chrome Proofreader did not identify a spelling, grammar, or punctuation change."
            : "Chrome Proofreader identified one or more spelling, grammar, or punctuation changes.",
          alternative: null,
        }
        return {
          generatedBy: "proofreader",
          text: formatSentenceCheck(sentenceCheck),
          structured: { sentenceCheck },
        }
      } finally {
        if (!pool) proofreader.destroy()
      }
    }
  }

  if (!environment.LanguageModel) throw new Error("Prompt API is not supported in this browser.")
  const lease = pool
    ? await pool.acquirePrompt(environment.LanguageModel, monitor)
    : await environment.LanguageModel.create({
        ...promptLanguageOptions(),
        initialPrompts: [{ role: "system", content: LEARNING_TOOLS_SYSTEM_PROMPT }],
        monitor,
      }).then((session) => ({ session, release: () => session.destroy() }))
  const session = lease.session
  onSessionReady()
  try {
    if (tool === "examples") {
      const raw = await session.prompt(input, { signal, responseConstraint: EXAMPLES_SCHEMA })
      const examples = parseExampleOutput(raw)
      return { text: formatExamples(examples), generatedBy: "prompt", structured: { examples } }
    }
    if (tool === "check") {
      const raw = await session.prompt(input, { signal, responseConstraint: CHECK_SCHEMA })
      const sentenceCheck = parseSentenceCheckOutput(raw, checkOriginal)
      return { text: formatSentenceCheck(sentenceCheck), generatedBy: "prompt", structured: { sentenceCheck } }
    }
    const text = session.promptStreaming
      ? await readStream(session.promptStreaming(input, { signal }), onChunk)
      : await session.prompt(input, { signal })
    return { text, generatedBy: "prompt" }
  } finally {
    lease.release()
  }
}

export function getChromeAIEnvironment(): ChromeAIEnvironment {
  return getLearningToolsFixtureFromLocation() ?? globalThis as ChromeAIEnvironment
}
