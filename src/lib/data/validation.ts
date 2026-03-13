import { readFile } from "node:fs/promises"
import { z, type ZodError } from "zod"

export class DataValidationError extends Error {
  public readonly issues: z.ZodIssue[]

  constructor(message: string, issues: z.ZodIssue[] = []) {
    super(message)
    this.name = "DataValidationError"
    this.issues = issues
  }
}

export const readJson = async (path: string): Promise<unknown> => {
  try {
    const raw = await readFile(path, "utf8")
    return JSON.parse(raw)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new DataValidationError(`Invalid JSON in ${path}: ${error.message}`)
    }
    throw error
  }
}

export const formatSchemaIssues = (errors: z.ZodIssue[]): string[] =>
  errors.map((error) => {
    const path = error.path.length > 0 ? error.path.join(".") : "root"
    return `${path}: ${error.message}`
  })

export const readValidatedJson = async <T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  context: string,
): Promise<T> => {
  const parsed = schema.safeParse(await readJson(path))

  if (!parsed.success) {
    const details = formatSchemaIssues((parsed.error as ZodError).issues)
    throw new DataValidationError(
      `${context} failed schema validation\n${details.map((entry) => `  • ${entry}`).join("\n")}`,
      parsed.error.issues,
    )
  }

  return parsed.data
}
