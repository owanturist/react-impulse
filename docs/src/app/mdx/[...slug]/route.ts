import { notFound } from "next/navigation"

import { getLLMText } from "@/lib/get-llm-text"
import { source } from "@/source"

export const revalidate = false

const DOCS_PREFIX = "docs"

interface RouteProps {
  params: Promise<{ slug: Array<string> }>
}

export async function GET(_req: Request, props: RouteProps) {
  const { slug } = await props.params
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

