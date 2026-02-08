import { notFound } from "next/navigation"

import { source } from "@/source"
import { getLLMText } from "@/tools/get-llm-text"

export const revalidate = false

interface RouteProps {
  params: Promise<{ path: Array<string> }>
}

export async function GET(_req: Request, { params }: RouteProps) {
  const { path } = await params
  const joined = path.join("/")

  if (!joined.endsWith(".md")) {
    return notFound()
  }

  // "docs/api/signal.md" → strip "docs/" prefix and ".md" suffix → ["api", "signal"]
  // "docs.md" → strip "docs" prefix and ".md" suffix → []
  const slug = joined
    .replace(/(^docs|\.md$)/g, "")
    .split("/")
    .filter(Boolean)

  const page = source.getPage(slug)

  if (!page) {
    return notFound()
  }

  return new Response(await getLLMText(page), {
    headers: { "Content-Type": "text/markdown" },
  })
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    // page.url is "/docs/signal" → path becomes ["docs", "signal.md"]
    // page.url is "/docs" (index) → path becomes ["docs.md"]
    path: `${page.url.slice(1)}.md`.split("/"),
  }))
}
