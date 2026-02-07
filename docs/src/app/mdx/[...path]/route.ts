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

  if (!joined.endsWith(".mdx")) {
    return notFound()
  }

  // "docs/api/signal.mdx" → strip "docs/" prefix and ".mdx" suffix → ["api", "signal"]
  // "docs.mdx" → strip "docs" prefix and ".mdx" suffix → []
  const slug = joined
    .replace(/(^docs|\.mdx$)/g, "")
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
    // page.url is "/docs/signal" → path becomes ["docs", "signal.mdx"]
    // page.url is "/docs" (index) → path becomes ["docs.mdx"]
    path: `${page.url.slice(1)}.mdx`.split("/"),
  }))
}
