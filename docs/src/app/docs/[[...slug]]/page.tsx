import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MDXComponents } from "@/components/mdx-components"
import { source } from "@/source"

interface PageProps {
  params: Promise<{ slug?: Array<string> }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params

  const page = source.getPage(slug)
  if (!page) {
    return notFound()
  }

  const MarkdownX = page.data.body

  return (
    <DocsPage
      tableOfContent={{
        // Animate the TOC with nice floating indication
        style: "clerk",
      }}
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MarkdownX components={MDXComponents} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const page = source.getPage(slug)

  if (!page) {
    return notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      types: {
        "text/markdown": `${page.url}.md`,
      },
    },
  }
}
