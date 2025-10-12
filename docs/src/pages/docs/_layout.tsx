import type { PageTree } from "fumadocs-core/server"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { type ReactNode, useMemo } from "react"

import { COMMON_LAYOUT_PROPS } from "../_common-layout-props"

export interface LayoutProps {
  tree: PageTree.Folder
  children: ReactNode
}

export function Layout({ tree, ...props }: LayoutProps) {
  const transformedTree = useMemo(() => transformPageTree(tree), [tree])

  return (
    <DocsLayout tree={transformedTree} {...props} {...COMMON_LAYOUT_PROPS} />
  )
}

function transformPageTree(tree: PageTree.Folder): PageTree.Folder {
  function transform<T extends PageTree.Item | PageTree.Separator>(item: T) {
    if (typeof item.icon !== "string") {
      return item
    }

    return {
      ...item,
      icon: <span dangerouslySetInnerHTML={{ __html: item.icon }} />,
    }
  }

  return {
    ...tree,
    index: tree.index ? transform(tree.index) : undefined,
    children: tree.children.map((item) => {
      if (item.type === "folder") {
        return transformPageTree(item)
      }

      return transform(item)
    }),
  }
}
