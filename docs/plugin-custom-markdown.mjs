import { MarkdownPageEvent } from "typedoc-plugin-markdown"

/**
 * @link https://github.com/typedoc2md/typedoc-plugin-markdown-examples/blob/8c4cb931c896e7d51a3b46b2aa0731dadd049a39/examples/frontmatter/custom-frontmatter.mjs
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} event */
    (event) => {
      event.frontmatter = {
        // e.g add a title
        title: event.model.getFriendlyFullName(),
        // spread the existing frontmatter
        ...event.frontmatter,
      }
    },
  )

  app.renderer.on(MarkdownPageEvent.END, (event) => {
    /**
     * Rewrite internal .md links to work with Astro routing
     * 1. Remove .md extension
     * 2. Lowercase the path for Astro's file-based routing
     * 3. Add trailing slash if the link is to a directory (i.e. does not have an anchor)
     * 4. Add extra '../' if the path starts with '../' to account for the deeper nesting of the reference files
     *
     * Matches [text](path.md) or [text](path.md#anchor) but not external links
     */
    event.contents = event.contents.replace(
      /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\.md(#[^)]+)?\)/g,
      (_, text, path, anchor) => {
        const lowerCasePath = path.toLowerCase()

        return `[${text}](${lowerCasePath.startsWith("../") ? `../${lowerCasePath}` : lowerCasePath}/${anchor || ""})`
      },
    )
  })
}
