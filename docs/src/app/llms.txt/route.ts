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
    ...pages.map(({ data, url }) => {
      const description = data.description ? `: ${data.description}` : ""

      return `- [${data.title}](${url}.mdx)${description}`
    }),
    "",
    "## Full documentation",
    "",
    "- [llms-full.txt](/llms-full.txt)",
  ]

  return new Response(lines.join("\n"))
}
