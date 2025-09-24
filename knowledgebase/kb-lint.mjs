#!/usr/bin/env node
/* eslint no-console: 0 */
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

import { globby } from "globby"
import matter from "gray-matter"
import { z } from "zod"

import { frontmatterSchema } from "./schema/frontmatter-schema.mjs"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")

const HEADER_CONTEXT_AND_GOALS = "## Context and goals"
const HEADER_DESIGN_AND_RATIONALE = "## Design and rationale"
const HEADER_API_CONTRACT = "## API contract"
const HEADER_IMPLEMENTATION_NOTES = "## Implementation notes"
const HEADER_TEST_SCENARIOS = "## Test scenarios"
const HEADER_DOCUMENTATION_NOTES = "## Documentation notes"
const HEADER_OPTIONS_CONSIDERED = "## Options considered"
const HEADER_DECISION = "## Decision"
const HEADER_CONSEQUENCES = "## Consequences"
const HEADER_SNIPPET = "## Snippet"
const HEADER_EDGE_CASES = "## Edge cases"
const HEADER_SCOPE_AND_TASKS = "## Scope and tasks"

const REQUIRED_HEADINGS_BY_TYPE = {
  bugfix: [
    HEADER_CONTEXT_AND_GOALS,
    HEADER_DESIGN_AND_RATIONALE,
    HEADER_API_CONTRACT,
    HEADER_IMPLEMENTATION_NOTES,
    HEADER_TEST_SCENARIOS,
    HEADER_DOCUMENTATION_NOTES,
  ],

  concept: [HEADER_CONTEXT_AND_GOALS, HEADER_DESIGN_AND_RATIONALE],

  decision: [
    HEADER_CONTEXT_AND_GOALS,
    HEADER_OPTIONS_CONSIDERED,
    HEADER_DECISION,
    HEADER_CONSEQUENCES,
  ],

  "doc-snippet": [HEADER_SNIPPET],

  feature: [
    HEADER_CONTEXT_AND_GOALS,
    HEADER_DESIGN_AND_RATIONALE,
    HEADER_API_CONTRACT,
    HEADER_IMPLEMENTATION_NOTES,
    HEADER_TEST_SCENARIOS,
    HEADER_DOCUMENTATION_NOTES,
  ],

  "test-spec": [HEADER_TEST_SCENARIOS, HEADER_EDGE_CASES],

  "implementation-brief": [
    HEADER_CONTEXT_AND_GOALS,
    HEADER_SCOPE_AND_TASKS,
    HEADER_TEST_SCENARIOS,
    HEADER_DOCUMENTATION_NOTES,
  ],
}

function getMissingHeadings(type, body) {
  // For concepts and decisions, allow a subset; for others, require full set
  const trimmed = body.replace(/\r/g, "")

  return REQUIRED_HEADINGS_BY_TYPE[type].filter(
    (header) =>
      !trimmed.includes(`\n${header}\n`) &&
      !trimmed.startsWith(`${header}\n`) &&
      !trimmed.includes(`\n${header}\r\n`),
  )
}

async function main() {
  const kbGlob = "knowledgebase/entries/**/*.md"
  const files = await globby(kbGlob, { cwd: repoRoot })
  const errors = []

  for (const file of files) {
    const abs = path.join(repoRoot, file)
    const raw = fs.readFileSync(abs, "utf8")
    const { data: frontmatter, content } = matter(raw)

    const parsed = frontmatterSchema.safeParse(frontmatter)

    if (parsed.success) {
      const missingHeadings = getMissingHeadings(parsed.data.type, content)

      if (missingHeadings.length > 0) {
        errors.push({
          file,
          type: "content",
          details: `Missing required headings:\n${missingHeadings.join("\n")}`,
        })
      }
    } else {
      errors.push({
        file,
        type: "frontmatter",
        details: z.prettifyError(parsed.error),
      })
    }
  }

  if (errors.length) {
    console.error("\nKnowledgebase Lint failed with the following issues:\n")

    for (const { file, type, details } of errors) {
      console.error(`- ${file} [${type}]`)
      console.error(details)
    }

    process.exit(1)
  }

  console.log(`\nKnowledgebase Lint passed: ${files.length} files checked.`)
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
