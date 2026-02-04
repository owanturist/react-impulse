import { source } from "@/source"

export const revalidate = false

export function GET() {
  const pages = source.getPages()

  const lines = [
    "# @owanturist/signal Documentation",
    "",
    "> Signal-based reactive state management for React",
    "",
    "## Docs",
    "",
    ...pages.map((page) => {
      const llmPath = `/mdx${page.url}`
      const description = page.data.description ? `: ${page.data.description}` : ""

      return `- [${page.data.title}](${llmPath})${description}`
    }),
    "",
    "## Full documentation",
    "",
    "- [llms-full.txt](/llms-full.txt)",
  ]

  return new Response(lines.join("\n"))
}
