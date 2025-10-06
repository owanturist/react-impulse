import { createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import type { PageTree } from "fumadocs-core/server"
import { createClientLoader } from "fumadocs-mdx/runtime/vite"

import { MDXComponents } from "~/components/mdx-components"
import { docs } from "~/loaders/docs"
import { DocsLayout, DocsPage } from "~/pages/docs"
import { source } from "~/source"

export const Route = createFileRoute("/docs/$")({
  component: Component,
  loader: async ({ params }) => {
    const data = await loader({
      data: params._splat?.split("/") ?? [],
    })

    await clientLoader.preload(data.path)

    return data
  },
})

const loader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: Array<string>) => slugs)
  .handler(({ data: slugs }) => {
    const page = docs.getPage(slugs)

    if (!page) {
      throw notFound()
    }

    return {
      tree: docs.pageTree as object,
      path: page.path,
    }
  })

const clientLoader = createClientLoader(source.doc, {
  id: "docs",
  component: ({ toc, frontmatter, lastModified, default: MDX }) => (
    <DocsPage
      toc={toc}
      title={frontmatter.title}
      description={frontmatter.description}
      lastModified={lastModified}
    >
      <MDX components={MDXComponents} />
    </DocsPage>
  ),
})

function Component() {
  const { path, tree } = Route.useLoaderData()
  const Content = clientLoader.getComponent(path)

  return (
    <DocsLayout tree={tree as PageTree.Folder}>
      <Content />
    </DocsLayout>
  )
}
