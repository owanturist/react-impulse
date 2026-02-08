import { DocsLayout } from "fumadocs-ui/layouts/docs"
import type { PropsWithChildren } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { source } from "@/source"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "@owanturist/signal",
      }}
      themeSwitch={{
        mode: "light-dark-system",
        component: <ThemeToggle className="ms-auto p-0" />,
      }}
    >
      {children}
    </DocsLayout>
  )
}
