# Knowledgebase → Docs → MCP: Implementation Plan

This plan bootstraps a single source of truth (the knowledgebase) that powers:

1. AI-assisted development (features, bugfixes, tests)
2. AI-synthesized human-facing documentation (Diátaxis) assembled from the entire KB (many-to-many, not 1:1)
3. An MCP server so users and agents can query and reason over the KB

## Checklist of requirements

- Create and maintain a knowledgebase (KB) for AI to implement features, fixes, and tests.
- Derive human-facing documentation from the KB using the [Diátaxis][diataxis] framework via an AI synthesis pass (not a mechanical copy).
- Use [Astro][astro] for the docs site; allow interactive [React][react] “islands” (see [Astro Islands Architecture][astro-islands]).
- Provide versioned docs per package using branch-based semver ranges (no copies), e.g., `/react-impulse/1.x.x` or `/react-impulse/1.1.x`; latest remains the default route.
- Integrate with [Changesets][changesets] and existing release flows.
- Expose the KB via [MCP][mcp] so users can connect their AI agents to it.
- Define and automate a KB-first workflow (see “KB-first end-to-end workflow”).
- Continuously deploy the docs site on any docs/KB source change (not only on version bumps).

Status: this document specifies how each item will be implemented, with concrete, staged deliverables.

## Scope adjustment (2025-08-25)

We will focus only on the react-impulse package for the initial implementation:

- Phases 1–3 (KB, generator + docs site, versioned docs) apply to react-impulse only.
- react-impulse-form is deferred and will be tackled after react-impulse reaches Phase 3 DoD; its work will be scheduled as follow-up sub-phases (e.g., “Phase 2b/3b — react-impulse-form”).
- KB entries should target `packages: [react-impulse]` for scope/DoD; entries for `react-impulse-form` are optional and won’t block.
- Docs generation and deployment will initially produce only `/react-impulse/**` routes; `/react-impulse-form/**` routes will be added later.
- The initial MCP server may expose only react-impulse entries; react-impulse-form support will follow.

## TL;DR architecture

- KB is the source of truth: curated, structured Markdown with strict frontmatter.
- AI agents read KB → implement code/tests → update KB if needed.
- An AI synthesis workflow transforms the full KB corpus → planned doc set (plan file) → curated [Diátaxis][diataxis] docs (Markdown/[MDX][mdx]) → [Astro][astro] site. A lightweight helper script (optional) may assist orchestration later, but initial Phase 2 relies on explicit prompts and manual review.
- [GitHub Actions][gha] validate KB, generate docs previews, and publish on release.
- An MCP server exposes KB search/get/tasks to AI clients.

## Agent quickstart (for Copilot/VS Code)

This is the minimal flow the agent will follow (evolutionary, multi-step) once Phase 1 scaffolding exists:

1. Create or update a KB entry under `knowledgebase/entries/**` using a template.
2. Run KB lint to validate frontmatter and required sections.
3. Implement code and tests to satisfy the requirements documented in the KB entry.
4. When docs need updating, run the AI Doc Synthesis Prompt (defined in Phase 2) to:
   - Read ALL KB entries.
   - Produce / update a docs PLAN (YAML) describing intended pages (slug, title, diataxis, sources[], purpose, sections[]).
   - On approval, generate / refresh the actual MD/MDX pages under `docs/src/content/docs/**` (never editing KB content directly).
5. Review diff. If wording is off or data missing, refine the KB (NOT the docs) and repeat the synthesis pass.
6. Open a PR referencing the impacted KB entry IDs; CI validates KB + builds docs.

Tip for prompts: “Implement according to KB entry `<entry-id>`; ensure tests cover all `acceptance-criteria` and listed edge cases; do not change public API without updating `api-changes` and `migration`.”

## Notes on MCP (what it enables here)

In brief, [Model Context Protocol (MCP)][mcp] lets tools expose resources and actions to AI clients. A small MCP server will:

- Serves KB entries as searchable resources (features, bugfixes, concepts, ADRs).
- Exposes “implementation briefs” as actionable tasks the agent can pick up.
- Returns structured JSON + raw Markdown so agents can render, reason, and execute.

Users connect their MCP-capable clients to this server and get first-class, up-to-date guidance on using and extending these libraries.

## Content model (KB schema)

Each KB entry is a Markdown file with YAML frontmatter. KB entries are referenced by their filename (without `.md` extension). For example, `impulse-concept.md` is referenced as `impulse-concept` in `relates-to` arrays and PLAN.yml `sources`.

### Frontmatter Fields

```yaml
---
title: Human-Readable Title
type: concept
packages:
  - react-impulse
  - react-impulse-form
relates-to:
  - other-concept-filename
  - another-concept-filename
---
```

**Field Descriptions:**

- `title` (string, required): Human-readable title for the concept
- `type` (string, required): Always "concept"
- `packages` (array, required): List of packages this concept applies to (use YAML list syntax with `-`)
- `relates-to` (array, optional): Filenames of related KB entries without `.md` extension (use YAML list syntax with `-`)

Body content regions (headings) to standardize:

- Context and goals (required)
- Design and rationale (required)
- API contract (optional: high-level purpose, key inputs/outputs, constraints only; detailed signatures, parameter descriptions, and examples belong in TSDoc)
- Implementation notes (optional: edge cases, perf, concurrency)
- Test scenarios (optional: happy path + edge cases)
- Documentation notes (optional: callouts, diagrams, interactive ideas)

The first two sections are required for all concept entries. Additional sections are recommended where applicable but not mandatory. These will be linted with a Zod schema ([Zod][zod]) and simple textual checks in CI (starting Phase 2.6). Frontmatter keys use kebab-case.

**Important**: The "API contract" section in KB entries should provide only high-level conceptual information (what the API does, its purpose, key constraints). Detailed API documentation (full type signatures, parameter descriptions, return types, comprehensive examples) belongs in TSDoc comments in the source code and will be rendered in the API reference section of the documentation site.

## Folder structure

In this repo:

- knowledgebase/
  - PLAN.md (this file)
  - README.md (how to contribute, quickstart)
  - entries/
    - \*.md
  - templates/
    - concept.md

Generator and tooling:

- packages/knowledgebase-tools/ (future package) — parsers, schema checks, optional AI orchestration helpers (NO mechanical 1:1 copier)
- packages/knowledgebase-mcp/ (new package) — MCP server exposing KB
- docs/ (Astro site; uses AI-synthesized Diátaxis content; initial scope: react-impulse only)

## KB-first end-to-end workflow

1. Ideate a new feature, bugfix, or docs adjustment.
2. Update the knowledgebase (KB) first: add or revise an entry with context, design rationale, and (for features/bugfixes) test scenarios. Commit.
3. Ask the AI agent to implement based on the KB: update code and add/adjust tests. Commit.
4. Review the changes. If the implementation diverges from the intended design, refine the KB (not the code) to clarify requirements. Commit.
5. Iterate steps 3–4 until the implementation satisfies the requirements documented in the KB entry.
6. Ask the AI agent to generate/update documentation from the KB (Markdown/MDX or templates). Commit.
7. Review docs. If they don’t reflect the idea well, refine the KB documentation notes while keeping code/tests unchanged; ensure KB stays compatible with the current implementation. Commit.
8. Iterate steps 6–7 until the docs match the intended outcome. Commit.
9. Ask the AI agent to compose a Changeset for the updated packages.
10. Review and adjust the Changeset if necessary. Commit.
11. Push the branch, open a PR, and request review. Use CI previews to validate docs and tests. If feedback requires changes, refine the KB and repeat steps 2–10.
12. Merge the PR once it passes review and all CI checks.
13. Release and docs:

- Changesets opens a release PR; on merge, versions are bumped and packages are published to npm.
- Documentation for released versions is served from maintenance branches; “latest” remains the default. See Versioned docs and CI/CD sections.
- Docs also deploy continuously on merges that touch docs/ or regenerate from KB, independent of releases.

## AI doc synthesis pipeline (Diátaxis)

Goal: convert dense, atomic KB knowledge into approachable, audience-oriented docs without a brittle 1:1 mapping.

**Scope**: This synthesis process covers **explanation**, **how-to**, and **tutorial** documentation only. **Reference** (API) documentation is generated directly from TypeScript source code documentation (JSDoc/TSDoc) using automated tools.

Core principles:

- Many-to-many mapping: one KB entry can power multiple docs (e.g., explanation + how-to); one doc can aggregate multiple KB entries.
- KB remains the ONLY canonical source of truth for conceptual content; docs are disposable derivatives regenerated on demand.
- No verbatim bulk copying; the AI must compress, rephrase, categorize.
- PLAN.yml contains all structural metadata (sources, diataxis, purpose, sections); doc pages contain only title, description, and content.
- The `sections` array in PLAN.yml defines the required H2 headings for each page, allowing flexible structure per page rather than enforcing conventions per Diátaxis type.
- Divergence resolution always flows: Desired change → Update KB → Re-synthesize docs.
- API reference docs are generated from in-code documentation (JSDoc/TSDoc), not from KB entries.

Stages (manual AI-driven for Phase 2):

1. PLAN step (synthesis planning): AI reads entire `knowledgebase/entries/**` corpus and emits a JSON PLAN listing proposed pages:
   ```jsonc
   [
     {
       "slug": "impulse-overview",
       "title": "Impulse Overview",
       "diataxis": "explanation",
       "sources": ["impulse-concept", "scope-concept"],
       "purpose": "High-level mental model & motivations",
       "sections": ["Overview", "Mental model", "Key concepts", "See also"],
     },
   ]
   ```
   Note: PLAN does NOT include "reference" type pages - those are handled by the API documentation generation workflow.
2. REVIEW: Human approves / edits the PLAN (add / remove / rename pages) — stored as `docs/PLAN.yml`.
3. GENERATE: AI produces / updates MDX files for each PLAN item inside structured directories:
   - `docs/src/content/docs/explanation/**`
   - `docs/src/content/docs/how-to/**`
   - `docs/src/content/docs/tutorials/**`
     (NOT `docs/src/content/docs/reference/**` - that's populated by TypeDoc/similar tools)

   Each page contains minimal frontmatter (title, description) and content. All structural metadata stays in PLAN.yml.

4. VALIDATE: Automated checks (future): ensure PLAN.yml entries reference real KB sources; validate page slugs match PLAN; required section checklist per Diátaxis type; broken link scan.
5. MERGE: Commit docs + updated PLAN.yml. Re-run synthesis only when KB changes materially.

Versioned docs (branch-based, no snapshots):

- Documentation versions are represented by protected branches that correspond to maintenance ranges (e.g., `1.x.x` ⇒ `>=1.0.0 <2.0.0`; `1.1.x` ⇒ `>=1.1.0 <1.2.0`).
- Each branch builds the docs site once and deploys routes for all packages present in the branch based on the version in each package’s package.json:
  - `/react-impulse/1.x.x` or `/react-impulse/1.1.x`
  - `/react-impulse-form/2.x.x` or `/react-impulse-form/2.0.x`
- The default branch deploys the latest routes:
  - `/react-impulse` (latest)
  - `/react-impulse-form` (latest)
- No copy/paste or freezing of content into per-version directories; the branch is the version. A change merged into a maintenance branch updates the corresponding versioned docs route(s).

## AI agent guardrails

- Never change public API without documenting the change rationale and migration path in the KB entry.
- Tests must cover acceptance criteria and edge cases documented in the KB entry's body sections.

## CI/CD

PR validation:

- **KB linting** (enforced starting in Phase 2.6): Lint KB frontmatter against schema (type, packages, status, etc.)
- **KB linting** (enforced starting in Phase 2.6): Check for mandatory body sections based on type
- **PLAN.yml validation** (enforced starting in Phase 2.6): Validate PLAN.yml structure and cross-references
- **Docs validation** (enforced starting in Phase 2.6): Ensure PLAN.yml ↔ docs content consistency
- Use Zod error formatting (e.g., `z.prettifyError`) for readable diagnostics in CI logs
- If `docs/PLAN.yml` changed: validate JSON schema (pages have unique slugs, valid diataxis, non-empty sources)
- Validate that each PLAN.yml slug has a corresponding doc file
- **Section validation**: For each doc page, verify H2 headings match the `sections` array in PLAN.yml exactly (order and names)
- Link scan (internal anchors + relative imports) over changed docs
- Build [Astro][astro] site (preview) and upload artifact / deploy preview

Release:

- After [Changesets][changesets] releases packages, a job can validate that maintenance branches reflect the intended version ranges (optional guardrails).
- [Astro][astro] build → deploy to owanturist.me; default branch updates `latest` routes.

Docs deployment (per-branch, independent of package releases):

- On merge to the default branch, if changes touch any of:
  - docs/\*\* (PLAN.yml, site sources, themes, MDX, components)
  - knowledgebase/\*\* (KB entries that may require re-synthesis)
  - packages/knowledgebase-tools/\*\* (synthesis helper logic)
  - packages/knowledgebase-mcp/docs/\*\* (if MCP usage docs are hosted within the site)
- Then: (a) optionally re-run AI synthesis if KB changed and PLAN/pages are stale, (b) validate PLAN/pages, (c) build with [Astro][astro] → deploy `latest` routes.
- This redeploys the latest docs without creating a new package version.

- On merge to a maintenance branch (e.g., `1.x.x` or `1.1.x`):
  - Determine each package’s semver from packages/\*/package.json.
  - Compute the branch label (e.g., `1.x.x` or `1.1.x`) and verify versions fall within the branch’s declared range; fail CI if not.
  - Validate PLAN/pages (same rules as default branch).
  - Build with [Astro][astro] and deploy under branch-based routes per package:
    - `/react-impulse/1.x.x` or `/react-impulse/1.1.x`
    - `/react-impulse-form/2.x.x` or `/react-impulse-form/2.0.x`
  - Keep the header “version switcher” compatible across branches by reading a shared versions manifest (see below).

Versions manifest for switcher:

- Publish a small JSON manifest alongside each deployment (e.g., /versions.json) listing known branches and labels for all packages.
- Optionally, maintain a central manifest in the deployment branch (e.g., `gh-pages`) that is updated by each branch’s deployment job to aggregate all versions.

## MCP server (packages/knowledgebase-mcp)

- kb.entry (by id)
- kb.search (by type, packages, tags, status, text)
- kb.tasks (list of implementation-briefs)
- tools:
  - kb.get(id)
  - kb.search(query)
  - kb.brief.pick(id) → returns a structured brief the agent can execute

Implementation:

- [Node.js][node] + [TypeScript][typescript]; read-only FS access to knowledgebase/entries
- Parse frontmatter; expose JSON + Markdown body
- Provide small, stable JSON contracts the agent can rely on
- Publish as a package for easy local install or dockerized use

Client setup:

- Document how to add this MCP server to common AI tools (desktop clients, editors). Provide sample config snippets in docs.

## Concrete deliverables and phases

Phase 0 — Bootstrap

- [x] knowledgebase/ folder with PLAN.md and README.md
- [x] Agree on KB schema fields and templates (tracked below)

Phase 1 — KB structure (react-impulse only)

- [x] Add templates/ (concept only)
- [x] Seed entries with concept documentation

Definition of Done (Phase 1):

- `knowledgebase/templates/concept.md` provides authoring scaffold.
- `knowledgebase/entries/` contains at least two seed concept entries for react-impulse.
- Note: Schema and validation will be added in Phase 2.6 after the full documentation workflow is established.

Phase 2 — AI doc synthesis + Astro site (react-impulse only)

- [x] Scaffold `docs/` with Diátaxis folder structure (empty initially): `src/content/docs/{explanation,how-to,tutorials}`
- [x] Add `docs/AI-SYNTHESIS-GUIDE.md` (prompts, required structure, section checklists for explanation/how-to/tutorial).
- [x] Add initial AI PLAN prompt & store first accepted PLAN as `docs/PLAN.yml` (excluding reference pages).
- [x] Run first synthesis: produce at least 2 explanation pages from existing KB concepts.
- [x] Add minimal frontmatter (title, description) to synthesized pages; all metadata stays in PLAN.yml.
- [x] Astro site (Starlight or minimal) builds displaying generated pages.

Definition of Done (Phase 2):

- `docs/PLAN.yml` exists describing the current published doc set (explanation, how-to, tutorial types only).
- At least two synthesized explanation pages with minimal frontmatter (title, description).
- All structural metadata (sources, diataxis, purpose, sections) is stored in PLAN.yml, not in page frontmatter.
- The `sections` field defines required H2 headings for each page, enabling flexible structure.
- `AI-SYNTHESIS-GUIDE.md` defines the canonical prompt & transformation rules for non-reference documentation.
- Astro site builds locally without 404 for synthesized slugs.

Phase 2.5 — API reference documentation (react-impulse only)

- [x] Add comprehensive JSDoc/TSDoc comments to all public APIs in `packages/react-impulse/src`
- [x] Set up TypeDoc (or similar tool) to generate API reference markdown
- [x] Configure output to `docs/src/content/docs/reference/**`
- [x] Add npm script (e.g., `pnpm docs:api`) to regenerate API docs from source
- [x] CI: regenerate API docs on source code changes and validate output
- [x] Integrate API reference pages into Astro site navigation

Definition of Done (Phase 2.5):

- All public APIs in `packages/react-impulse/src` have complete JSDoc/TSDoc documentation (params, returns, examples).
- TypeDoc (or similar) configured and generates markdown to `docs/src/content/docs/reference/**`.
- `pnpm docs:api` script successfully regenerates API documentation.
- CI runs API doc generation and fails if output is malformed.
- API reference pages visible and navigable in the Astro site.
- API docs reflect current source code (no manual editing required).

Phase 2.6 — Documentation validation and linting

- [ ] **Add KB schema validation** (Zod frontmatter schema in `knowledgebase/schema/`)
- [ ] **Add KB lint script** (`kb-lint.mjs`) to validate KB entries against schema and required sections
- [ ] **Add PLAN.yml schema validation** (validate structure: slug, title, diataxis, sources, purpose, sections)
- [ ] **Add PLAN.yml ↔ docs content validator** (ensure PLAN.yml slugs match actual doc files in `docs/src/content/docs/`)
- [ ] **Add orphan docs detector** (ensure every doc file in `docs/src/content/docs/` is referenced in PLAN.yml)
- [ ] **Add KB source validator** (ensure PLAN.yml sources reference existing KB entry IDs)
- [ ] **Simplify API contract sections in KB entries** (reduce to high-level definitions; detailed signatures/examples move to TSDoc in source code)
- [ ] **Enable all validation in CI** with clear error messages
- [ ] Add npm scripts: `pnpm kb:lint`, `pnpm docs:validate`

Definition of Done (Phase 2.6):

- `knowledgebase/schema/frontmatter-schema.mjs` validates KB entry frontmatter (type, packages, status, owner, etc.).
- `knowledgebase/kb-lint.mjs` validates KB entries have required sections (Context and goals, Design and rationale).
- `docs/schema/plan-schema.mjs` validates PLAN.yml structure (array of entries with required fields).
- `docs/validate-plan.mjs` performs cross-checks:
  1. Every PLAN.yml slug has a corresponding file in `docs/src/content/docs/{diataxis}/{slug}.md`
  2. Every file in `docs/src/content/docs/{explanation,how-to,tutorials}/**/*.md` is referenced in PLAN.yml
  3. Every source filename (without .md) in PLAN.yml exists in `knowledgebase/entries/`
- API contract sections in KB entries are simplified to high-level overviews (purpose, key inputs/outputs, constraints), not detailed signatures or exhaustive examples.
- Detailed API documentation (full signatures, parameter descriptions, return types, code examples) lives in TSDoc comments in source code.
- CI runs `pnpm kb:lint` and `pnpm docs:validate` and fails on any validation error.
- All validation errors use Zod's pretty error formatting for readability.

Phase 3 — Versioned docs (branch-based) + release integration (react-impulse first)

- [ ] Establish protected maintenance branches for react-impulse (e.g., `1.x.x`, `1.1.x`) per stream policy
- [ ] CI: deploy default branch to `/react-impulse` latest route
- [ ] CI: deploy maintenance branches to branch-based routes (e.g., `/react-impulse/1.x.x` or `/react-impulse/1.1.x`)
- [ ] CI: validate branch range vs react-impulse package.json version (guardrail)
- [ ] CI: continuously deploy docs on merges affecting docs/**, knowledgebase/**, or generator sources

Definition of Done (Phase 3):

- Protected maintenance branches established for react-impulse per stream policy.
- Default branch deploys `/react-impulse` latest; maintenance branches deploy under `/react-impulse/<branch-label>`.
- CI guardrails validate branch version ranges against the react-impulse package.json version.

Phase 4 — MCP server (react-impulse first)

- [ ] Create packages/knowledgebase-mcp with search/get/tools endpoints (initially serving react-impulse entries)
- [ ] Docs for configuring clients
- [ ] Optional: small web UI to browse KB (could be part of docs site)

Definition of Done (Phase 4):

- `packages/knowledgebase-mcp` exposes kb.get, kb.search, kb.brief.pick per the JSON contracts (at minimum for react-impulse entries).
- Read-only FS access to `knowledgebase/entries` with frontmatter parsing.
- Minimal client configuration examples included in docs.

Phase 5 — Routines and prompts

- [ ] Add authoring guide (knowledgebase/README.md) and prompts for AI agents
- [ ] Add PR checklist: “KB updated?”, “Docs generated?”, “Changeset created?”

Definition of Done (Phase 5):

- Authoring guide with standard prompts and anti-patterns.
- CONTRIBUTING/PR template enforces KB-first workflow and changeset presence.

## Conventions and success criteria

- Every user-visible change must have a KB entry (feature/bugfix/decision). For features and bugfixes, document acceptance criteria and test scenarios in the appropriate body sections.
- No API change without documenting the change rationale and migration path in the KB entry.
- Docs live in `docs/src/content/docs/<diataxis>/<slug>.md` and contain minimal frontmatter (title, description).
- PLAN.yml contains all structural metadata (sources, diataxis, purpose, sections); doc pages contain only title, description, and content.
- The `sections` array defines the required H2 headings for each page in order. This allows each page to have its own structure rather than following rigid Diátaxis type conventions.
- AI-synthesized docs (explanation, how-to, tutorial) are generated from the KB but can be manually refined for better examples, ordering, and prose. When manually editing docs, use the validation checklist (see AI-SYNTHESIS-GUIDE.md) to determine if the source KB entries need updating.
- API reference docs are generated from TypeScript source code (JSDoc/TSDoc) and should not be manually edited.
- If a doc needs conceptual content absent in KB, add/extend a KB entry first (AI should emit a TODO noting the gap).
- MCP stays in sync by reading the KB at runtime (or on build, if caching is used).

## Collaboration model (curator + AI)

- Curator: curates & evolves KB entries (dense + complete).
- AI: implements code/tests (feature & bugfix) AND performs doc synthesis (PLAN + generation passes).
- Reviewers: evaluate synthesized docs for clarity; request KB improvements (never “doc only” rewrites) when substance is wrong or missing.
- Drift control: `docs/PLAN.yml` + page frontmatter `last-synced` used to spot stale pages after KB edits.
- CI: (future) optional drift detector comparing KB `last-reviewed` dates vs doc `last-synced` to suggest regeneration.

[diataxis]: https://diataxis.fr/
[astro]: https://astro.build/
[starlight]: https://starlight.astro.build/
[astro-islands]: https://docs.astro.build/en/concepts/islands/
[changesets]: https://github.com/changesets/changesets
[mcp]: https://modelcontextprotocol.io/
[mdx]: https://mdxjs.com/
[gha]: https://docs.github.com/en/actions
[node]: https://nodejs.org/
[typescript]: https://www.typescriptlang.org/
[zod]: https://zod.dev/
[react]: https://react.dev/
