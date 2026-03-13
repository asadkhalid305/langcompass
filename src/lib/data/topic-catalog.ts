import { join } from "node:path"
import { TopicCatalogSchema } from "../schemas/topic"
import type { TopicCatalogItem } from "../../types"
import { readValidatedJson } from "./validation"

export const TOPIC_CATALOG_PATH = join(process.cwd(), "data", "topic-catalog.json")

export const loadTopicCatalog = async (): Promise<TopicCatalogItem[]> => {
  return readValidatedJson(TOPIC_CATALOG_PATH, TopicCatalogSchema, "topic-catalog.json")
}
