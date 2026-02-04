import type { InferPageType } from "fumadocs-core/source"

import type { source } from "@/source"

export async function getLLMText(page: InferPageType<typeof source>): Promise<string> {
  const processed = await page.data.getText("processed")

  const frontmatter = [
    "---",
    `title: ${page.data.title}`,
    page.data.description ? `description: ${page.data.description}` : null,
    `url: ${page.url}`,
    page.data.lastModified ? `lastModified: ${page.data.lastModified.toISOString()}` : null,
    "---",
  ]
    .filter((line) => line != null)
    .join("\n")

  return `${frontmatter}

# ${page.data.title} (${page.url})

${processed}`
}
