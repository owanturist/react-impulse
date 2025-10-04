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
3. Implement code and tests to satisfy acceptance-criteria + test-plan.
4. When docs need updating, run the AI Doc Synthesis Prompt (defined in Phase 2) to:
   - Read ALL KB entries.
   - Produce / update a docs PLAN (JSON) describing intended pages (slug, title, diataxis, kb-sources[], purpose).
   - On approval, generate / refresh the actual MD/MDX pages under `docs/content/**` (never editing KB content directly).
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

Each KB entry is a Markdown file with YAML frontmatter enforcing:

- `id`: unique slug
- `title`: human-friendly title
- `type`: feature | bugfix | concept | decision | test-spec | doc-snippet
- `packages`: `[react-impulse, react-impulse-form]` (one or both)
- `status`: proposed | accepted | implemented | deprecated
- `versions`: optional semver range or array (e.g., `">=1.3.0"` or `["2.0.0"]`)
- `owner`: GitHub handle
- `last-reviewed`: `YYYY-MM-DD`
- `tags`: `[strings]`
- `relates-to`: `[entry-id, …]` links to related entries; required for `type`: `test-spec` (min 1)
- `diataxis`: reference | how-to | tutorial | explanation (primary landing doc target)
- `acceptance-criteria`: list
- `api-changes`: summary of public API deltas (if any)
- `migration`: guidance (if API changes)
- `test-plan`: brief + links to test-spec entries
- `references`: links to PRs, issues, external resources

Body content regions (headings) to standardize:

- Context and goals
- Design and rationale
- API contract (inputs/outputs, error modes, examples)
- Implementation notes (edge cases, perf, concurrency)
- Test scenarios (happy path + edge cases)
- Documentation notes (callouts, diagrams, interactive ideas)

These will be linted with a Zod schema ([Zod][zod]) and simple textual checks in CI. Frontmatter keys use kebab-case. For `type`: `test-spec`, `relates-to` must include at least one existing entry `id`.

## Folder structure

In this repo:

- knowledgebase/
  - PLAN.md (this file)
  - README.md (how to contribute, quickstart)
  - schema/ (Zod schema and lint rules)
  - entries/
    - features/…
    - bugfixes/…
    - concepts/…
    - decisions/ (ADRs)
    - test-specs/…
    - doc-snippets/…
  - templates/
    - feature.md
    - bugfix.md
    - decision.md
    - test-spec.md
    - doc-snippet.md
    - implementation-brief.md

Generator and tooling:

- packages/knowledgebase-tools/ (future package) — parsers, schema checks, optional AI orchestration helpers (NO mechanical 1:1 copier)
- packages/knowledgebase-mcp/ (new package) — MCP server exposing KB
- docs/ (Astro site; uses AI-synthesized Diátaxis content; initial scope: react-impulse only)

## KB-first end-to-end workflow

1. Ideate a new feature, bugfix, or docs adjustment.
2. Update the knowledgebase (KB) first: add or revise an entry with context, acceptance-criteria, and test-plan. Commit.
3. Ask the AI agent to implement based on the KB: update code and add/adjust tests. Commit.
4. Review the changes. If the implementation diverges from the intended design, refine the KB (not the code) to clarify requirements. Commit.
5. Iterate steps 3–4 until the implementation satisfies the KB acceptance-criteria and test-plan.
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
- Each generated doc page records provenance (all contributing `kb-sources`) + `last-synced` date.
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
       "kbSources": ["impulse-concept", "scope-concept"],
       "purpose": "High-level mental model & motivations",
       "keySections": ["Overview", "Mental model", "Key concepts", "See also"],
     },
   ]
   ```
   Note: PLAN does NOT include "reference" type pages - those are handled by the API documentation generation workflow.
2. REVIEW: Human approves / edits the PLAN (add / remove / rename pages) — stored as `docs/PLAN.json`.
3. GENERATE: AI produces / updates MDX files for each PLAN item inside structured directories:
   - `docs/content/explanation/**`
   - `docs/content/how-to/**`
   - `docs/content/tutorials/**`
     (NOT `docs/content/reference/**` - that's populated by TypeDoc/similar tools)
4. VALIDATE: Automated checks (future): ensure every page lists real `kb-sources`; required section checklist per Diátaxis type; broken link scan.
5. MERGE: Commit docs + updated PLAN. Re-run synthesis only when KB changes materially.

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

- Never change public API without updating api-changes + migration in KB.
- Tests must cover acceptance-criteria and edge cases listed in KB.

## CI/CD

PR validation:

- Lint KB frontmatter against schema (type, packages, status, etc.)
- Check for mandatory body sections based on type
- Use Zod error formatting (e.g., `z.prettifyError`) for readable diagnostics in CI logs
- If `docs/PLAN.json` changed: validate JSON schema (pages have unique slugs, valid diataxis, non-empty kb-sources)
- Validate each changed doc page frontmatter (required fields, kb-sources exist, last-synced present)
- Link scan (internal anchors + relative imports) over changed docs
- Build [Astro][astro] site (preview) and upload artifact / deploy preview

Release:

- After [Changesets][changesets] releases packages, a job can validate that maintenance branches reflect the intended version ranges (optional guardrails).
- [Astro][astro] build → deploy to owanturist.me; default branch updates `latest` routes.

Docs deployment (per-branch, independent of package releases):

- On merge to the default branch, if changes touch any of:
  - docs/\*\* (PLAN.json, site sources, themes, MDX, components)
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

Phase 1 — KB structure and validation (react-impulse only)

- [x] Add schema/ with Zod frontmatter schema
- [x] Add templates/ (feature, bugfix, decision, test-spec, doc-snippet, implementation-brief)
- [x] CI job: schema lint + minimal content checks

Definition of Done (Phase 1):

- `knowledgebase/schema/frontmatter-schema.mjs` exists and validates required fields and types (Zod). The KB linter imports and uses it.
- `knowledgebase/templates/*` provides authoring scaffolds (feature, bugfix, decision, test-spec, doc-snippet, implementation-brief).
- `knowledgebase/entries/*` contains at least two seed entries for react-impulse with valid frontmatter and required sections (react-impulse-form entries may be added later but are not required for DoD).
- A repository script is available to run lint locally (e.g., `pnpm kb:lint`).

Phase 2 — AI doc synthesis + Astro site (react-impulse only)

- [ ] Scaffold `docs/` with Diátaxis folder structure (empty initially): `content/{explanation,how-to,tutorials}`
- [ ] Add `docs/AI-SYNTHESIS-GUIDE.md` (prompts, required structure, section checklists for explanation/how-to/tutorial).
- [ ] Add initial AI PLAN prompt & store first accepted PLAN as `docs/PLAN.json` (excluding reference pages).
- [ ] Run first synthesis: produce at least 2 explanation pages from existing KB concepts.
- [ ] Add provenance frontmatter (`kb-sources`, `last-synced`) to synthesized pages.
- [ ] Astro site (Starlight or minimal) builds displaying generated pages.
- [ ] CI: lint KB + build docs (fail on missing `kb-sources` or malformed frontmatter for AI-synthesized pages).

Definition of Done (Phase 2):

- `docs/PLAN.json` exists describing the current published doc set (explanation, how-to, tutorial types only).
- At least two synthesized explanation pages (multi-source where appropriate) with correct frontmatter fields.
- `AI-SYNTHESIS-GUIDE.md` defines the canonical prompt & transformation rules for non-reference documentation.
- Astro site builds locally and in CI without 404 for synthesized slugs.
- Provenance badge (kb-sources + last-synced) visible on each AI-synthesized page (can be placeholder markup initially).

Phase 2.5 — API reference documentation (react-impulse only)

- [ ] Add comprehensive JSDoc/TSDoc comments to all public APIs in `packages/react-impulse/src`
- [ ] Set up TypeDoc (or similar tool) to generate API reference markdown
- [ ] Configure output to `docs/content/reference/**`
- [ ] Add npm script (e.g., `pnpm docs:api`) to regenerate API docs from source
- [ ] CI: regenerate API docs on source code changes and validate output
- [ ] Integrate API reference pages into Astro site navigation

Definition of Done (Phase 2.5):

- All public APIs in `packages/react-impulse/src` have complete JSDoc/TSDoc documentation (params, returns, examples).
- TypeDoc (or similar) configured and generates markdown to `docs/content/reference/**`.
- `pnpm docs:api` script successfully regenerates API documentation.
- CI runs API doc generation and fails if output is malformed.
- API reference pages visible and navigable in the Astro site.
- API docs reflect current source code (no manual editing required).

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

- Every user-visible change must have a KB entry (feature/bugfix/decision) with acceptance-criteria and test-plan.
- No API change without api-changes + migration.
- AI-synthesized docs (explanation, how-to, tutorial) are generated from the KB but can be manually refined for better examples, ordering, and prose. When manually editing docs, use the validation checklist (see AI-SYNTHESIS-GUIDE.md) to determine if the source KB entries need updating.
- API reference docs are generated from TypeScript source code (JSDoc/TSDoc) and should not be manually edited.
- Every AI-synthesized doc page must reference at least one `kb-sources` id; aggregated pages list all contributing IDs.
- If a doc needs conceptual content absent in KB, add/extend a KB entry first (AI should emit a TODO noting the gap).
- MCP stays in sync by reading the KB at runtime (or on build, if caching is used).

## Collaboration model (curator + AI)

- Curator: curates & evolves KB entries (dense + complete).
- AI: implements code/tests (feature & bugfix) AND performs doc synthesis (PLAN + generation passes).
- Reviewers: evaluate synthesized docs for clarity; request KB improvements (never “doc only” rewrites) when substance is wrong or missing.
- Drift control: `docs/PLAN.json` + page frontmatter `last-synced` used to spot stale pages after KB edits.
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
