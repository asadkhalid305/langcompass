import { access, readdir } from "node:fs/promises"
import { constants } from "node:fs"
import { join } from "node:path"
import { TopicDetailArraySchema, TopicDetailSchema } from "../schemas/topic"
import type { TopicDetail, TopicId } from "../types"
import { readValidatedJson } from "./validation"

export const TOPIC_DETAILS_DIR = join(process.cwd(), "data", "topic-details")

const detailPath = (topicId: TopicId) => join(TOPIC_DETAILS_DIR, `${topicId}.json`)
const isJsonFile = (filename: string): boolean => filename.toLowerCase().endsWith(".json")
const getTopicIdFromFilename = (filename: string): TopicId => filename.replace(/\.json$/i, "")

export const loadTopicDetailById = async (topicId: TopicId): Promise<TopicDetail | null> => {
  const path = detailPath(topicId)

  try {
    await access(path, constants.F_OK)
  } catch {
    return null
  }

  return readValidatedJson(path, TopicDetailSchema, `topic detail: ${topicId}`)
}

export const listTopicDetailIds = async (): Promise<TopicId[]> => {
  const dirEntries = await readdir(TOPIC_DETAILS_DIR, {
    withFileTypes: true,
  })

  return dirEntries
    .filter((entry) => entry.isFile() && isJsonFile(entry.name))
    .map((entry) => getTopicIdFromFilename(entry.name))
    .sort((a, b) => a.localeCompare(b))
}

export const loadTopicDetailIdSet = async (): Promise<Set<TopicId>> => new Set(await listTopicDetailIds())

export const loadAllTopicDetails = async (): Promise<TopicDetail[]> => {
  const detailPaths = (await listTopicDetailIds()).map((topicId) => detailPath(topicId))
  const parsed = await Promise.all(detailPaths.map((path) => readValidatedJson(path, TopicDetailSchema, path)))
  return TopicDetailArraySchema.parse(parsed)
}
