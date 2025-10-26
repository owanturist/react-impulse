import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins"
import { type RehypeCodeOptions, rehypeCode } from "fumadocs-core/mdx-plugins"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import { transformerTwoslash } from "fumadocs-twoslash"
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs"

const rehypeCodeOptions = {
  themes: {
    light: "github-light",
    dark: "github-dark",
  },
  // https://fumadocs.dev/docs/headless/mdx/rehype-code#inline-code
  inline: "tailing-curly-colon",
} satisfies RehypeCodeOptions

export const docs = defineDocs({
  dir: "content",
})

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    rehypePlugins: [[rehypeCode, rehypeCodeOptions]],
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          typesCache: createFileSystemTypesCache(),
        }),
      ],
    },
  },
})
