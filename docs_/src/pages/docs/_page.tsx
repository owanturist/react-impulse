import type { TableOfContents } from "fumadocs-core/server"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page"
import type { ReactNode } from "react"

export interface PageProps {
  toc: TableOfContents
  title: string
  description: undefined | string
  lastModified: undefined | Date
  children: ReactNode
}

export function Page({
  toc,
  title,
  description,
  lastModified,
  children,
}: PageProps) {
  return (
    <DocsPage
      toc={toc}
      tableOfContent={{
        // Animate the TOC with nice floating indication
        style: "clerk",
      }}
      lastUpdate={
        lastModified && isFinite(lastModified.getTime())
          ? lastModified
          : undefined
      }
    >
      <DocsTitle>{title}</DocsTitle>
      <DocsDescription>{description}</DocsDescription>
      <DocsBody>{children}</DocsBody>
    </DocsPage>
  )
}
