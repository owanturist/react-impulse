import { DocsLayout } from "fumadocs-ui/layouts/docs"
import type { PropsWithChildren } from "react"

import { source } from "@/source"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "@owanturist/signal",
      }}
    >
      {children}
    </DocsLayout>
  )
}
