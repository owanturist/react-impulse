# Knowledgebase → Docs → MCP: Implementation Plan

This plan bootstraps a single source of truth (the knowledgebase) that powers:

1. AI-assisted development (features, bugfixes, tests)
2. AI-synthesized human-facing documentation (Diátaxis) assembled from the entire KB (many-to-many, not 1:1)
3. An MCP server so users and agents can query and reason over the KB

## Checklist of requirements

- Create and maintain a knowledgebase (KB) for AI to implement features, fixes, and tests.
- Derive human-facing documentation from the KB using the [Diátaxis][diataxis] framework via an AI synthesis pass (not a mechanical copy).
- Use [Fumadocs][fumadocs] for the docs site; allow interactive [React][react] components.
- Provide versioned docs per package using branch-based semver ranges (no copies), e.g., `/react-signal/1.x.x` or `/react-signal/1.1.x`; latest remains the default route.
- Integrate with [Changesets][changesets] and existing release flows.
- Expose the KB via [MCP][mcp] so users can connect their AI agents to it.
- Define and automate a KB-first workflow (see “KB-first end-to-end workflow”).
- Continuously deploy the docs site on any docs/KB source change (not only on version bumps).

Status: this document specifies how each item will be implemented, with concrete, staged deliverables.

## Scope adjustment (2025-08-25)

We will focus only on the react-signal package for the initial implementation:

- Phases 1–3 (KB, generator + docs site, versioned docs) apply to react-signal only.
- react-signal-form is deferred and will be tackled after react-signal reaches Phase 3 DoD; its work will be scheduled as follow-up sub-phases (e.g., “Phase 2b/3b — react-signal-form”).
- KB entries should target `packages: [react-signal]` for scope/DoD; entries for `react-signal-form` are optional and won’t block.
- Docs generation and deployment will initially produce only `/react-signal/**` routes; `/react-signal-form/**` routes will be added later.
- The initial MCP server may expose only react-signal entries; react-signal-form support will follow.

## Reference material

Operational guidelines, architecture details, and workflows now live in [`knowledgebase/README.md`](./README.md). Refer there for:

- Core principles and KB schema
- KB-first workflow and AI doc synthesis pipeline
- Versioned docs strategy and MCP integration
- Guardrails, conventions, CI/CD notes, and collaboration model

## Concrete deliverables and phases

Phase 0 — Bootstrap

- [x] knowledgebase/ folder with PLAN.md and README.md
- [x] Agree on KB schema fields and authoring pattern (tracked below)

Phase 1 — KB structure (react-signal only)

- [x] Document concept entry skeleton in README
- [x] Seed the knowledgebase with concept documentation

Definition of Done (Phase 1):

- `knowledgebase/README.md` documents the authoring scaffold.
- `knowledgebase/` contains at least two concept entries for react-signal alongside PLAN and README.
- Note: Schema and validation will be added in Phase 2.6 after the full documentation workflow is established.

Phase 2 — AI doc synthesis + Fumadocs site (react-signal only)

- [x] Scaffold `docs/` with Diátaxis folder structure: `content/{explanation,how-to,tutorials,reference}`
- [x] Add `docs/AI-SYNTHESIS-GUIDE.md` (prompts, required structure, section checklists for all Diátaxis types including reference).
- [x] Add initial AI PLAN prompt & store first accepted PLAN as `docs/PLAN.yml` (including reference pages).
- [x] Run first synthesis: produce at least 2 explanation pages from existing KB concepts.
- [x] Add minimal frontmatter (title, description) to synthesized pages; all metadata stays in PLAN.yml.
- [x] Fumadocs site builds displaying generated pages.

Definition of Done (Phase 2):

- `docs/PLAN.yml` exists describing the current published doc set (explanation, how-to, tutorial, and reference types).
- At least two synthesized explanation pages with minimal frontmatter (title, description).
- All structural metadata (sources, diataxis, purpose, sections) is stored in PLAN.yml, not in page frontmatter.
- The `sections` field defines required H2 headings for each page, enabling flexible structure.
- `AI-SYNTHESIS-GUIDE.md` defines the canonical prompt & transformation rules for all documentation types.
- Fumadocs site builds locally without 404 for synthesized slugs.

Phase 2.5 — API reference documentation (react-signal only)

- [ ] Generate reference pages from KB entries
- [ ] Integrate API reference pages into Fumadocs site navigation
- [ ] Migrate existing JSDoc comments to KB API contract sections and remove JSDoc from code

Definition of Done (Phase 2.5):

- KB entries include comprehensive API contract sections with type signatures, parameter descriptions, return types, and examples.
- Reference pages in `docs/content/reference/` are generated from KB entries.
- API reference pages visible and navigable in the Fumadocs site.
- Reference docs can be manually refined like other doc types but follow KB-driven workflow.
- JSDoc comments have been migrated to KB and removed from the codebase; KB entries are the authoritative source for API documentation.

Phase 2.6 — Documentation validation and linting

- [ ] **Add KB schema validation** (Zod frontmatter schema in `knowledgebase/schema/`)
- [ ] **Add KB lint script** (`kb-lint.mjs`) to validate KB entries against schema and required sections
- [ ] **Add PLAN.yml schema validation** (validate structure: slug, title, diataxis, sources, purpose, sections)
- [ ] **Add PLAN.yml ↔ docs content validator** (ensure PLAN.yml slugs match actual doc files in `docs/content/`)
- [ ] **Add orphan docs detector** (ensure every doc file in `docs/content/` is referenced in PLAN.yml)
- [ ] **Add KB source validator** (ensure PLAN.yml sources reference existing KB entry IDs)
- [ ] **Ensure API contract sections in KB entries** are comprehensive with type signatures, parameters, examples
- [ ] **Enable all validation in CI** with clear error messages
- [ ] Add npm scripts: `pnpm kb:lint`, `pnpm docs:validate`

Definition of Done (Phase 2.6):

- `knowledgebase/schema/frontmatter-schema.mjs` validates KB entry frontmatter (type, packages, status, owner, etc.).
- `knowledgebase/kb-lint.mjs` validates KB entries have required sections (Context and goals, Design and rationale).
- `docs/schema/plan-schema.mjs` validates PLAN.yml structure (array of entries with required fields).
- `docs/validate-plan.mjs` performs cross-checks:
  1. Every PLAN.yml slug has a corresponding file in `docs/content/{diataxis}/{slug}.md`
  2. Every file in `docs/content/{explanation,how-to,tutorials,reference}/**/*.md` is referenced in PLAN.yml
  3. Every source filename (without .md) in PLAN.yml exists as a Markdown file within `knowledgebase/` (excluding PLAN and README)
- API contract sections in KB entries include comprehensive details (type signatures, parameters, return types, examples) for generating reference documentation.
- Reference documentation is generated from KB entries.
- CI runs `pnpm kb:lint` and `pnpm docs:validate` and fails on any validation error.
- All validation errors use Zod's pretty error formatting for readability.

Phase 3 — Versioned docs (branch-based) + release integration (react-signal first)

- [ ] Establish protected maintenance branches for react-signal (e.g., `1.x.x`, `1.1.x`) per stream policy
- [ ] CI: deploy default branch to `/react-signal` latest route
- [ ] CI: deploy maintenance branches to branch-based routes (e.g., `/react-signal/1.x.x` or `/react-signal/1.1.x`)
- [ ] CI: validate branch range vs react-signal package.json version (guardrail)
- [ ] CI: continuously deploy docs on merges affecting docs/**, knowledgebase/**, or generator sources

Definition of Done (Phase 3):

- Protected maintenance branches established for react-signal per stream policy.
- Default branch deploys `/react-signal` latest; maintenance branches deploy under `/react-signal/<branch-label>`.
- CI guardrails validate branch version ranges against the react-signal package.json version.

Phase 4 — MCP server (react-signal first)

- [ ] Create packages/knowledgebase-mcp with search/get/tools endpoints (initially serving react-signal entries)
- [ ] Docs for configuring clients
- [ ] Optional: small web UI to browse KB (could be part of docs site)

Definition of Done (Phase 4):

- `packages/knowledgebase-mcp` exposes kb.get, kb.search, kb.brief.pick per the JSON contracts (at minimum for react-signal entries).
- Read-only FS access to `knowledgebase/*.md` with frontmatter parsing (excluding PLAN/README as needed).
- Minimal client configuration examples included in docs.

Phase 5 — Routines and prompts

- [ ] Add authoring guide (knowledgebase/README.md) and prompts for AI agents
- [ ] Add PR checklist: “KB updated?”, “Docs generated?”, “Changeset created?”

Definition of Done (Phase 5):

- Authoring guide with standard prompts and anti-patterns.
- CONTRIBUTING/PR template enforces KB-first workflow and changeset presence.

[diataxis]: https://diataxis.fr/
[fumadocs]: https://fumadocs.dev/
[changesets]: https://github.com/changesets/changesets
[mcp]: https://modelcontextprotocol.io/
[mdx]: https://mdxjs.com/
[gha]: https://docs.github.com/en/actions
[node]: https://nodejs.org/
[typescript]: https://www.typescriptlang.org/
[zod]: https://zod.dev/
[react]: https://react.dev/
