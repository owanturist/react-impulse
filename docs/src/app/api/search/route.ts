import { createFromSource } from "fumadocs-core/search/server"

import { source } from "@/source"

export const revalidate = false

export const { staticGET: GET } = createFromSource(source)
