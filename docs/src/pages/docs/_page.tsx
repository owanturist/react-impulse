import type { TableOfContents } from "fumadocs-core/server"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page"
import type { ReactNode } from "react"

import { type Time, getTime } from "~/tools/time"

export interface PageProps {
  toc: TableOfContents
  title: string
  description: undefined | string
  lastModified: undefined | Time
  children: ReactNode
}

export function Page({
  toc,
  title,
  description,
  lastModified,
  children,
}: PageProps) {
  const lastModifiedTime = getTime(lastModified)

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{
        // Animate the TOC with nice floating indication
        style: "clerk",
      }}
      lastUpdate={
        !lastModifiedTime || isNaN(lastModifiedTime)
          ? undefined
          : lastModifiedTime
      }
    >
      <DocsTitle>{title}</DocsTitle>
      <DocsDescription>{description}</DocsDescription>
      <DocsBody>{children}</DocsBody>
    </DocsPage>
  )
}
