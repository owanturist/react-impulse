import {
  type RehypeCodeOptions,
  rehypeCode,
  rehypeCodeDefaultOptions,
} from "fumadocs-core/mdx-plugins"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
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
  dir: "content/docs",
})

export default defineConfig({
  plugins: [lastModified()],
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
      // important: Shiki doesn't support lazy loading languages for codeblocks in Twoslash popups
      // make sure to define them first (e.g. the common ones)
      langs: ["js", "jsx", "ts", "tsx"],
    },
  },
})
