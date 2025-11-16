# Knowledgebase → Docs → MCP: Implementation Plan

This plan bootstraps a single source of truth (the knowledgebase) that powers:

1. AI-assisted development (features, bugfixes, tests)
2. AI-synthesized human-facing documentation (Diátaxis) assembled from the entire KB (many-to-many, not 1:1)
3. An MCP server so users and agents can query and reason over the KB

## Checklist of requirements

- Create and maintain a knowledgebase (KB) for AI to implement features, fixes, and tests.
- Derive human-facing documentation from the KB using the [Diátaxis][diataxis] framework via an AI synthesis pass (not a mechanical copy).
- Use [Fumadocs][fumadocs] for the docs site; allow interactive [React][react] components.
- Provide versioned docs per package using branch-based semver ranges (no copies), e.g., `/signal/1.x.x` or `/signal/1.1.x`; latest remains the default route.
- Integrate with [Changesets][changesets] and existing release flows.
- Expose the KB via [MCP][mcp] so users can connect their AI agents to it.
- Define and automate a KB-first workflow (see “KB-first end-to-end workflow”).
- Continuously deploy the docs site on any docs/KB source change (not only on version bumps).

Status: this document specifies how each item will be implemented, with concrete, staged deliverables.

## Scope adjustment (2025-08-25)

We will focus only on the [@owanturist/signal][package-signal] package for the initial implementation:

- Phases 1–3 (KB, generator + docs site, versioned docs) apply to [@owanturist/signal][package-signal] only.
- [@owanturist/signal-form][package-signal-form] is deferred and will be tackled after [@owanturist/signal][package-signal] reaches Phase 3 DoD; its work will be scheduled as follow-up sub-phases.
- KB entries should target [@owanturist/signal][package-signal] for scope/DoD; entries for [@owanturist/signal-form][package-signal-form] are optional and won’t block.
- Docs generation and deployment will initially produce only `/signal/**` routes; `/signal-form/**` routes will be added later.
- The initial MCP server may expose only [@owanturist/signal][package-signal] entries; [@owanturist/signal-form][package-signal-form] support will follow.

## Reference material

Operational guidelines, architecture details, and workflows now live in [`docs/knowledgebase/README.md`](./README.md). Refer there for:

- Core principles and KB schema
- KB-first workflow and AI doc synthesis pipeline
- Versioned docs strategy and MCP integration
- Guardrails, conventions, CI/CD notes, and collaboration model

## Concrete deliverables and phases

Phase 0 — Bootstrap

- [x] knowledgebase/ folder with PLAN.md and README.md
- [x] Agree on KB schema fields and authoring pattern (tracked below)

Phase 1 — KB structure ([@owanturist/signal][package-signal] only)

- [x] Document concept entry skeleton in README
- [x] Seed the knowledgebase with concept documentation

Definition of Done (Phase 1):

- `docs/knowledgebase/README.md` documents the authoring scaffold.
- `docs/knowledgebase/` contains at least two concept entries for [@owanturist/signal][package-signal] alongside PLAN and README.
- Note: Schema and validation will be added in Phase 2.6 after the full documentation workflow is established.

Phase 2 — AI doc synthesis + Fumadocs site ([@owanturist/signal][package-signal] only)

- [x] Scaffold `docs/` with Diátaxis folder structure: `content/{explanation,how-to,tutorials,reference}`
- [x] Add [`docs/README.md`](../../docs/README.md) (prompts, required structure, section checklists for all Diátaxis types including reference).
- [x] Add initial AI PLAN prompt & store first accepted PLAN as [`docs/PLAN.yml`](../PLAN.yml) (including reference pages).
- [x] Run first synthesis: produce at least 2 explanation pages from existing KB concepts.
- [x] Add minimal frontmatter (title, description) to synthesized pages; all metadata stays in [`docs/PLAN.yml`](../PLAN.yml).
- [x] Fumadocs site builds displaying generated pages.

Definition of Done (Phase 2):

- [`docs/PLAN.yml`](../PLAN.yml) exists describing the current published doc set (explanation, how-to, tutorial, and reference types).
- At least two synthesized explanation pages with minimal frontmatter (title, description).
- All structural metadata (sources, diataxis, purpose, sections) is stored in [`docs/PLAN.yml`](../PLAN.yml), not in page frontmatter.
- The `sections` field defines required H2 headings for each page, enabling flexible structure.
- [`docs/README.md`](../../docs/README.md) defines the canonical prompt & transformation rules for all documentation types.
- Fumadocs site builds locally without 404 for synthesized slugs.

Phase 2.5 — API reference documentation ([@owanturist/signal](../../packages/signal) only)

- [ ] Generate reference pages from KB entries
- [ ] Integrate API reference pages into Fumadocs site navigation
- [ ] Migrate existing JSDoc comments to KB API contract sections and remove JSDoc from code

Definition of Done (Phase 2.5):

- KB entries include comprehensive API contract sections with type signatures, parameter descriptions, return types, and examples.
- Reference pages in [`docs/content/reference/`](../content/reference) are generated from KB entries.
- API reference pages visible and navigable in the Fumadocs site.
- Reference docs can be manually refined like other doc types but follow KB-driven workflow.
- JSDoc comments have been migrated to KB and removed from the codebase; KB entries are the authoritative source for API documentation.

Phase 2.6 — Documentation validation and linting

- [ ] **Add KB schema validation** (Zod frontmatter schema in `docs/knowledgebase/schema/`)
- [ ] **Add KB lint script** (`kb-lint.mjs`) to validate KB entries against schema and required sections
- [ ] **Add PLAN.yml schema validation** (validate structure: slug, title, diataxis, sources, purpose, sections)
- [ ] **Add PLAN.yml ↔ docs content validator** (ensure PLAN.yml slugs match actual doc files in [`docs/content/`](../content))
- [ ] **Add orphan docs detector** (ensure every doc file in [`docs/content/`](../content) is referenced in PLAN.yml)
- [ ] **Add KB source validator** (ensure PLAN.yml sources reference existing KB entry IDs)
- [ ] **Ensure API contract sections in KB entries** are comprehensive with type signatures, parameters, examples
- [ ] **Enable all validation in CI** with clear error messages
- [ ] Add npm scripts: `pnpm kb:lint`, `pnpm docs:validate`

Definition of Done (Phase 2.6):

- `docs/knowledgebase/schema/frontmatter-schema.mjs` validates KB entry frontmatter (type, packages, status, owner, etc.).
- `docs/knowledgebase/kb-lint.mjs` validates KB entries have required sections (Context and goals, Design and rationale).
- `docs/schema/plan-schema.mjs` validates PLAN.yml structure (array of entries with required fields).
- `docs/validate-plan.mjs` performs cross-checks:
  1. Every PLAN.yml slug has a corresponding file in `docs/content/{diataxis}/{slug}.md`
  2. Every file in `docs/content/{explanation,how-to,tutorials,reference}/**/*.md` is referenced in PLAN.yml
  3. Every source filename (without .md) in PLAN.yml exists as a Markdown file within [`docs/knowledgebase/`](../knowledgebase) (excluding PLAN and README)
- API contract sections in KB entries include comprehensive details (type signatures, parameters, return types, examples) for generating reference documentation.
- Reference documentation is generated from KB entries.
- CI runs `pnpm kb:lint` and `pnpm docs:validate` and fails on any validation error.
- All validation errors use Zod's pretty error formatting for readability.

Phase 3 — Versioned docs (branch-based) + release integration ([@owanturist/signal](../../packages/signal) first)

- [ ] Establish protected maintenance branches for [@owanturist/signal](../../packages/signal) (e.g., `signal-1.x.x`, `signal-1.1.x`) per stream policy
- [ ] CI: deploy default branch to `/signal` latest route
- [ ] CI: deploy maintenance branches to branch-based routes (e.g., `/signal/1.x.x` or `/signal/1.1.x`)
- [ ] CI: validate branch range vs [@owanturist/signal package.json](../../packages/signal/package.json) version (guardrail)
- [ ] CI: continuously deploy docs on merges affecting [`docs/**`](..)

Definition of Done (Phase 3):

- Protected maintenance branches established for [@owanturist/signal](../../packages/signal) per stream policy.
- Default branch deploys `/signal` latest; maintenance branches deploy under `/signal/<branch-label>`.
- CI guardrails validate branch version ranges against the [@owanturist/signal package.json](../../packages/signal/package.json) version.

Phase 4 — MCP server ([@owanturist/signal](../../packages/signal) first)

- [ ] Create packages/knowledgebase-mcp with search/get/tools endpoints (initially serving [@owanturist/signal](../../packages/signal) entries)
- [ ] Docs for configuring clients
- [ ] Optional: small web UI to browse KB (could be part of docs site)

Definition of Done (Phase 4):

- `packages/knowledgebase-mcp` exposes kb.get, kb.search, kb.brief.pick per the JSON contracts (at minimum for [@owanturist/signal](../../packages/signal) entries).
- Read-only FS access to [`docs/knowledgebase/*.md`](../knowledgebase) with frontmatter parsing (excluding PLAN/README as needed).
- Minimal client configuration examples included in docs.

[diataxis]: https://diataxis.fr/
[fumadocs]: https://fumadocs.dev/
[changesets]: https://github.com/changesets/changesets
[mcp]: https://modelcontextprotocol.io/
[react]: https://react.dev/
[package-signal]: ../../packages/signal
[package-signal-form]: ../../packages/signal-form
