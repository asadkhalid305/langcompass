import {
  DEFAULT_LEARNING_TOOL_OPTIONS,
  LEARNING_TOOL_IDS,
  type LearningToolId,
  type LearningToolResult,
  type LearningToolsWorkspaceState,
  type SentenceCheckOutput,
} from "./types"

export const LEARNING_TOOLS_HISTORY_KEY = "langcompass.learning-tools.history.v1"
export const LEARNING_TOOLS_WORKSPACE_KEY = "langcompass.learning-tools.workspace.v1"
export const RECENT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000
export const MAX_RECENT_RESULTS = 20
export const LEARNING_TOOLS_DB_NAME = "langcompass-learning-tools"
export const LEARNING_TOOLS_DB_VERSION = 1

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const normalizeResult = (value: unknown): LearningToolResult | null => {
  if (!value || typeof value !== "object") return null
  const result = value as Partial<LearningToolResult>
  const valid = Boolean(
      typeof result.id === "string" &&
      typeof result.topicId === "string" &&
      typeof result.tool === "string" &&
      LEARNING_TOOL_IDS.includes(result.tool as LearningToolResult["tool"]) &&
      typeof result.output === "string" &&
      typeof result.createdAt === "string" &&
      Number.isFinite(Date.parse(result.createdAt)) &&
      typeof result.saved === "boolean" &&
      result.source &&
      typeof result.source.label === "string" &&
      typeof result.source.text === "string",
  )
  if (!valid) return null
  const sentenceCheck = result.structured?.sentenceCheck as Partial<SentenceCheckOutput> | undefined
  const structured = sentenceCheck
    ? {
        ...result.structured,
        sentenceCheck: {
          ...sentenceCheck,
          changes: Array.isArray(sentenceCheck.changes)
            ? sentenceCheck.changes.filter((change): change is string => typeof change === "string" && change.length > 0)
            : [],
        } as SentenceCheckOutput,
      }
    : result.structured
  return {
    ...(result as LearningToolResult),
    lessonTitle: result.lessonTitle ?? result.topicId ?? "Lesson",
    options: result.options ?? DEFAULT_LEARNING_TOOL_OPTIONS,
    generatedBy: result.generatedBy ?? (result.tool === "translate" ? "translator" : result.tool === "summarize" ? "summarizer" : "prompt"),
    ...(structured ? { structured } : {}),
    schemaVersion: 3,
  }
}

export function pruneResults(results: LearningToolResult[], now = Date.now()): LearningToolResult[] {
  const saved = results.filter((result) => result.saved)
  const recent = results
    .filter((result) => !result.saved && now - Date.parse(result.createdAt) <= RECENT_RETENTION_MS)
    .slice(0, MAX_RECENT_RESULTS)

  return [...saved, ...recent].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function removeHistoryResults(
  results: LearningToolResult[],
  view: "recent" | "saved",
  tool: LearningToolId | "all",
): LearningToolResult[] {
  return results.filter((result) => {
    const matchesView = view === "saved" ? result.saved : !result.saved
    const matchesTool = tool === "all" || result.tool === tool
    return !(matchesView && matchesTool)
  })
}

export function readResults(storage: StorageLike, now = Date.now()): LearningToolResult[] {
  try {
    const parsed = JSON.parse(storage.getItem(LEARNING_TOOLS_HISTORY_KEY) ?? "[]") as unknown
    return pruneResults(Array.isArray(parsed) ? parsed.map(normalizeResult).filter((result): result is LearningToolResult => result !== null) : [], now)
  } catch {
    return []
  }
}

export function writeResults(storage: StorageLike, results: LearningToolResult[], now = Date.now()): LearningToolResult[] {
  const pruned = pruneResults(results, now)
  try {
    storage.setItem(LEARNING_TOOLS_HISTORY_KEY, JSON.stringify(pruned))
  } catch {
    // Results remain available in memory when browser storage is blocked or full.
  }
  return pruned
}

export function clearResults(storage: StorageLike): void {
  try {
    storage.removeItem(LEARNING_TOOLS_HISTORY_KEY)
  } catch {
    // Clearing the in-memory result list still keeps the workspace usable.
  }
}

export function readWorkspace(storage: StorageLike): LearningToolsWorkspaceState | null {
  try {
    const parsed = JSON.parse(storage.getItem(LEARNING_TOOLS_WORKSPACE_KEY) ?? "null") as Partial<LearningToolsWorkspaceState> | null
    if (
      !parsed ||
      typeof parsed.topicId !== "string" ||
      typeof parsed.tool !== "string" ||
      !LEARNING_TOOL_IDS.includes(parsed.tool as LearningToolsWorkspaceState["tool"]) ||
      typeof parsed.learnerText !== "string" ||
      !parsed.source ||
      typeof parsed.source.label !== "string" ||
      typeof parsed.source.text !== "string"
    ) {
      return null
    }
    return { ...parsed, options: parsed.options ?? DEFAULT_LEARNING_TOOL_OPTIONS } as LearningToolsWorkspaceState
  } catch {
    return null
  }
}

const RESULTS_STORE = "results"
const SETTINGS_STORE = "settings"

const requestResult = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("Browser storage request failed."))
  })

const transactionDone = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error("Browser storage transaction failed."))
    transaction.onabort = () => reject(transaction.error ?? new Error("Browser storage transaction was canceled."))
  })

async function openLearningToolsDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  const request = factory.open(LEARNING_TOOLS_DB_NAME, LEARNING_TOOLS_DB_VERSION)
  request.onupgradeneeded = () => {
    const database = request.result
    if (!database.objectStoreNames.contains(RESULTS_STORE)) {
      const results = database.createObjectStore(RESULTS_STORE, { keyPath: "id" })
      results.createIndex("topicId", "topicId")
      results.createIndex("tool", "tool")
      results.createIndex("saved", "saved")
      results.createIndex("createdAt", "createdAt")
    }
    if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
      database.createObjectStore(SETTINGS_STORE)
    }
  }
  return requestResult(request)
}

export class IndexedDBLearningToolsStore {
  private databasePromise: Promise<IDBDatabase>

  constructor(factory: IDBFactory) {
    this.databasePromise = openLearningToolsDatabase(factory)
  }

  async read(now = Date.now()): Promise<LearningToolResult[]> {
    const database = await this.databasePromise
    const transaction = database.transaction(RESULTS_STORE, "readonly")
    const values = await requestResult(transaction.objectStore(RESULTS_STORE).getAll())
    await transactionDone(transaction)
    return pruneResults(values.map(normalizeResult).filter((result): result is LearningToolResult => result !== null), now)
  }

  async write(results: LearningToolResult[], now = Date.now()): Promise<LearningToolResult[]> {
    const recentEnabled = await this.getRecentEnabled()
    const pruned = pruneResults(recentEnabled ? results : results.filter((result) => result.saved), now)
    const database = await this.databasePromise
    const transaction = database.transaction(RESULTS_STORE, "readwrite")
    const store = transaction.objectStore(RESULTS_STORE)
    store.clear()
    for (const result of pruned) store.put(result)
    await transactionDone(transaction)
    return pruned
  }

  async clearRecent(): Promise<void> {
    await this.write((await this.read()).filter((result) => result.saved))
  }

  async deleteAllSaved(): Promise<void> {
    await this.write((await this.read()).filter((result) => !result.saved))
  }

  async clearAll(): Promise<void> {
    const database = await this.databasePromise
    const transaction = database.transaction(RESULTS_STORE, "readwrite")
    transaction.objectStore(RESULTS_STORE).clear()
    await transactionDone(transaction)
  }

  async getRecentEnabled(): Promise<boolean> {
    const database = await this.databasePromise
    const transaction = database.transaction(SETTINGS_STORE, "readonly")
    const value = await requestResult(transaction.objectStore(SETTINGS_STORE).get("recentEnabled"))
    await transactionDone(transaction)
    return value !== false
  }

  async setRecentEnabled(enabled: boolean): Promise<void> {
    const database = await this.databasePromise
    const transaction = database.transaction(SETTINGS_STORE, "readwrite")
    transaction.objectStore(SETTINGS_STORE).put(enabled, "recentEnabled")
    await transactionDone(transaction)
    if (!enabled) await this.clearRecent()
  }

  close(): void {
    void this.databasePromise.then((database) => database.close()).catch(() => undefined)
  }
}

export function writeWorkspace(storage: StorageLike, state: LearningToolsWorkspaceState): void {
  try {
    storage.setItem(LEARNING_TOOLS_WORKSPACE_KEY, JSON.stringify(state))
  } catch {
    // The current React state remains usable without persistence.
  }
}
