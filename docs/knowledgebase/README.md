# Knowledgebase

A curated single source of truth that guides AI-assisted development, testing, and documentation generation across the project.

## Core principles

- The knowledgebase (KB) captures architecture, design intent, and API contracts; code and docs follow its lead.
- AI agents and contributors read KB entries first, then implement code, tests, and derived docs.
- Human-facing documentation is synthesized from the KB using the Diátaxis model and lives under [`docs/`](..).
- Every user-visible change updates the KB before touching code, docs, or releases.

## Repository layout

| Path                                                                    | Purpose                                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `knowledgebase/*.md`                                                    | Canonical concept documents (Markdown with YAML frontmatter) alongside `PLAN.md` and this README. |
| [`docs/PLAN.yml`](../PLAN.yml)                                          | Approved documentation structure generated from KB synthesis.                                     |
| [`docs/content/{explanation,how-to,tutorials,reference}/`](../content/) | Diátaxis pages synthesized from KB sources.                                                       |
| [`packages/*`](../../packages/)                                         | Implementations that reference KB guidance.                                                       |

## KB schema

Each entry should follow the structure below and include the following frontmatter:

```ts
interface Frontmatter {
  title: string;              // Human-readable title of the concept
  type: 'concept'             // Only 'concept' for now
  packages: string[];         // Related packages in kebab-case (e.g., ['react-signal'])
  relates-to?: string[];      // IDs of related KB entries (filenames without .md)
}
```

Example frontmatter:

```yaml
---
title: Human-Readable Title
type: concept
packages:
  - react-signal
relates-to:
  - other-concept-id
---
```

Required body sections:

- **Context and goals** – why the idea exists and what it unlocks.
- **Design and rationale** – guiding principles, trade-offs, and mental models.

Optional but recommended sections:

- **API contract** – full type signatures, parameter/return tables, examples.
- **Implementation notes** – edge cases, performance, concurrency.
- **Test scenarios** – happy path plus boundary cases.
- **Documentation notes** – diagrams, interactive ideas, or synthesis hints.

## Authoring entries

1. Create a new Markdown file in this directory.
2. Complete the frontmatter fields using YAML list syntax for arrays.
3. Populate the required body sections and any optional sections that add clarity.
4. Reference other entries by their filename without the `.md` suffix.

## KB-first workflow

1. Ideate a change and document it (or refine an existing entry) in the KB.
2. Run KB linting to validate schema compliance.
3. Implement code and tests guided by the KB entry’s acceptance criteria and edge cases.
4. Update or regenerate docs by running the AI synthesis workflow against the KB.
5. Review diffs; if reality diverges, update the KB first, then re-run synthesis.
6. Compose a Changeset referencing affected KB entry IDs.

## AI doc synthesis pipeline

- **PLAN step** – Read all KB entries and propose a docs structure as JSON; approved output is stored in [`docs/PLAN.yml`](../PLAN.yml).
- **REVIEW** – Curators adjust the [PLAN](../PLAN.yml) before publishing.
- **GENERATE** – AI produces MDX content per PLAN entry under the correct Diátaxis directory with minimal frontmatter (`title`, `description`).
- **VALIDATE** – Automated checks ensure PLAN/pages consistency, required headings, and link integrity.
- **MERGE** – Commit synthesized docs; regenerate whenever KB content changes materially.

## AI Agent quickstart

1. Update or create the relevant KB entry first.
2. Validate the entry with the lint script once available.
3. Implement code/tests referencing the KB entry ID.
4. Regenerate docs via the synthesis workflow.
5. Open a PR referencing impacted KB entry IDs; ensure CI (lint + docs build) passes.

## Guardrails and conventions

- Never change a public API without documenting rationale and migration notes in the KB.
- Acceptance criteria and edge cases in KB entries must be covered by automated tests.
- Reference documentation originates from the KB’s **API contract** sections.
- Generated docs can be manually polished for clarity, but substantive fixes flow back into the KB.
- Use KB entry filenames (without `.md`) for cross-references in [PLAN.yml](../PLAN.yml) and docs.

## CI/CD and validation

- PR validation runs KB schema checks, [PLAN.yml](../PLAN.yml) validation, and cross-references.
- Docs touching `docs/`, `knowledgebase/`, or synthesis tooling trigger a docs build and preview deployment.

## Collaboration model

- **Curators** maintain KB quality, schema compliance, and completeness.
- **AI agents** implement features/tests and synthesize docs using KB guidance.
- **Reviewers** evaluate changes, nudging contributors to improve the KB rather than editing docs directly when gaps appear.
