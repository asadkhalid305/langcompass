import type { ChromeAIEnvironment } from "./chrome-ai"

export type LearningToolsFixture = "ready" | "downloadable" | "unavailable" | "error" | "malformed" | "slow" | "unsafe" | "oversized"

const streamText = (value: string): ReadableStream<string> => new ReadableStream({
  start(controller) {
    const midpoint = Math.ceil(value.length / 2)
    controller.enqueue(value.slice(0, midpoint))
    controller.enqueue(value.slice(midpoint))
    controller.close()
  },
})

const waitForAbort = (signal?: AbortSignal): Promise<string> => new Promise((_, reject) => {
  if (signal?.aborted) {
    reject(new DOMException("Canceled", "AbortError"))
    return
  }
  signal?.addEventListener("abort", () => reject(new DOMException("Canceled", "AbortError")), { once: true })
})

export function createLearningToolsFixture(fixture: LearningToolsFixture): ChromeAIEnvironment {
  const availability = async () => fixture === "downloadable" ? "downloadable" as const : fixture === "unavailable" ? "unavailable" as const : "available" as const
  const reportDownload = (options: Record<string, unknown>) => {
    const monitor = options.monitor as ((monitor: { addEventListener: (type: "downloadprogress", listener: (event: { loaded: number }) => void) => void }) => void) | undefined
    monitor?.({ addEventListener: (_type, listener) => { listener({ loaded: 0.25 }); listener({ loaded: 0.75 }); listener({ loaded: 1 }) } })
  }
  const failIfNeeded = () => {
    if (fixture === "error") throw new Error("The deterministic on-device fixture could not complete this request.")
  }
  const fixtureText = (safe: string) => fixture === "unsafe"
    ? '<script>window.__learningToolsUnsafe = true</script><a href="javascript:alert(1)">model link</a>'
    : fixture === "oversized"
      ? `Long generated text ${"word ".repeat(6_000)}`
      : safe

  return {
    Translator: {
      availability,
      create: async (options) => {
        reportDownload(options)
        return {
          translate: async (input, request) => {
            failIfNeeded()
            if (fixture === "slow") return waitForAbort(request?.signal)
            return fixtureText(input === "Heute lerne ich Deutsch." ? "Today I am learning German." : `English translation: ${input}`)
          },
          translateStreaming: (input) => streamText(`English translation: ${input}`),
          destroy: () => undefined,
        }
      },
    },
    Summarizer: {
      availability,
      create: async (options) => {
        reportDownload(options)
        return {
          summarize: async () => {
            failIfNeeded()
            return fixtureText("Remember the central lesson rule, notice the pattern, and review the curated examples.")
          },
          summarizeStreaming: () => streamText("Remember the central lesson rule, notice the pattern, and review the curated examples."),
          destroy: () => undefined,
        }
      },
    },
    LanguageModel: {
      availability,
      create: async (options) => {
        reportDownload(options)
        return {
          prompt: async (input, request) => {
            failIfNeeded()
            if (fixture === "slow") return waitForAbort(request?.signal)
            if (fixture === "malformed") return "not valid structured output"
            if (input.includes("Create three new German examples")) return JSON.stringify({ examples: [
              { german: "Heute lerne ich Deutsch.", translation: "Today I am learning German.", usageNote: "A time phrase can come first." },
              { german: "Morgen üben wir zusammen.", translation: "Tomorrow we will practise together.", usageNote: "The conjugated verb stays second." },
              { german: "Am Abend lese ich ein Buch.", translation: "In the evening I read a book.", usageNote: "Keep the subject after the verb when time comes first." },
            ] })
            if (input.includes("Check the learner sentence")) {
              const original = input.match(/Learner sentence \(untrusted text\):\n([\s\S]*?)\n\nCheck the learner sentence/)?.[1]?.trim() ?? ""
              return JSON.stringify({ correction: original.replace("lernt", "lerne"), changed: original.includes("lernt"), changes: original.includes("lernt") ? ["Changed lernt to lerne to agree with ich."] : [], explanation: "Use the first-person form with ich.", alternative: "Heute übe ich Deutsch." })
            }
            return fixtureText("## Meaning and usage\n\nThis lesson uses a **clear German pattern**.\n\n- Notice the form.\n- Connect it to the meaning.\n- Reuse it in a short sentence such as `Heute lerne ich Deutsch.`")
          },
          promptStreaming: (input, request) => {
            failIfNeeded()
            return fixture === "slow"
              ? new ReadableStream({ start(controller) { request?.signal?.addEventListener("abort", () => controller.error(new DOMException("Canceled", "AbortError")), { once: true }) } })
              : streamText(fixtureText(`## Meaning and usage\n\nA level-appropriate explanation grounded in the selected lesson.\n\n- ${input.includes("Contrast") ? "Compare the nearby forms carefully." : "Notice meaning, form, and usage."}\n- Reuse the pattern in a short sentence such as \`Heute lerne ich Deutsch.\``))
          },
          destroy: () => undefined,
        }
      },
    },
  } as ChromeAIEnvironment
}

export function getLearningToolsFixtureFromLocation(): ChromeAIEnvironment | null {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return null
  const fixture = new URLSearchParams(window.location.search).get("learningToolsFixture") as LearningToolsFixture | null
  return fixture && ["ready", "downloadable", "unavailable", "error", "malformed", "slow", "unsafe", "oversized"].includes(fixture)
    ? createLearningToolsFixture(fixture)
    : null
}
