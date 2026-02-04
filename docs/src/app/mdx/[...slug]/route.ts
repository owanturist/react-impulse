import { notFound } from "next/navigation"

import { source } from "@/source"
import { getLLMText } from "@/tools/get-llm-text"

export const revalidate = false

const DOCS_PREFIX = "docs"

interface RouteProps {
  params: Promise<{ slug: Array<string> }>
}

export async function GET(_req: Request, { params }: RouteProps) {
  const { slug } = await params
  const [first, ...rest] = slug
  if (first !== DOCS_PREFIX) {
    return notFound()
  }

  const page = source.getPage(rest)
  if (!page) {
    return notFound()
  }

  return new Response(await getLLMText(page), {
    headers: { "Content-Type": "text/markdown" },
  })
}

export function generateStaticParams() {
  return source.generateParams().map((params) => ({
    slug: [DOCS_PREFIX, ...params.slug],
  }))
}
