import { access, readdir } from "node:fs/promises"
import { constants } from "node:fs"
import { join } from "node:path"
import { TopicDetailArraySchema, TopicDetailSchema } from "../schemas/topic"
import type { TopicDetail, TopicId } from "../../types"
import { readValidatedJson } from "./validation"

export const TOPIC_DETAILS_DIR = join(process.cwd(), "data", "topic-details")

const detailPath = (topicId: TopicId) => join(TOPIC_DETAILS_DIR, `${topicId}.json`)

export const loadTopicDetailById = async (topicId: TopicId): Promise<TopicDetail | null> => {
  const path = detailPath(topicId)

  try {
    await access(path, constants.F_OK)
  } catch {
    return null
  }

  return readValidatedJson(path, TopicDetailSchema, `topic detail: ${topicId}`)
}

export const loadAllTopicDetails = async (): Promise<TopicDetail[]> => {
  const dirEntries = await readdir(TOPIC_DETAILS_DIR, {
    withFileTypes: true,
  })
  const detailPaths = dirEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => detailPath(entry.name.replace(/\.json$/i, "")))
    .sort()

  const parsed = await Promise.all(detailPaths.map((path) => readValidatedJson(path, TopicDetailSchema, path)))
  return TopicDetailArraySchema.parse(parsed)
}
