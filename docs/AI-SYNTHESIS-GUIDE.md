# AI Documentation Synthesis Guide

This guide defines the canonical process for transforming the react-impulse knowledgebase into human-friendly Diátaxis documentation, and how to maintain consistency between KB and docs.

**Scope**: This guide covers **explanation**, **how-to**, and **tutorial** documentation. **Reference** documentation is generated directly from source code via automated tools (TypeDoc, TSDoc, etc.) and is not part of the AI synthesis process.

## Core Principles

1. **Many-to-many mapping**: One KB entry can generate multiple doc pages; one doc page can synthesize multiple KB entries.
2. **No verbatim copying**: Always rephrase, compress, and reorganize for the target audience.
3. **PLAN.yml is the metadata source**: All structural metadata (sources, diataxis type, purpose, sections) is maintained in PLAN.yml, not in page frontmatter.
   **Page structure:**
   - The `sections` array in PLAN.yml defines the **required H2 headings** for each page
   - AI must generate content for each section in the specified order
   - Manual edits can add subsections (H3, H4, etc.) but H2 structure must match PLAN.yml
   - This approach allows each page to have its own unique structure, not bound by Diátaxis type conventions
4. **KB is authoritative for concepts**: Knowledgebase entries are the technical source of truth for core concepts, API contracts, design rationale, and architecture.
5. **Docs can be manually refined**: Generated documentation can be manually edited for better code examples, content ordering, prose polish, and user experience.
6. **Bidirectional validation**: When manually editing docs, verify if the source KB entries need updating to stay synchronized.
7. **Reference docs are code-generated**: API reference documentation is generated directly from in-code documentation (JSDoc/TSDoc) using automated tools, ensuring accuracy and staying in sync with implementation.

## Two-Step Synthesis Process

### Step 1: Planning Phase

**Prompt Template:**

```
Read the entire knowledgebase at `knowledgebase/entries/**/*.md` and analyze all entries.

Create a comprehensive documentation plan as YAML that maps KB knowledge to Diátaxis categories:
- explanation: High-level concepts, mental models, "why" questions
- how-to: Goal-oriented guides, "how" questions
- tutorial: Learning-oriented walkthroughs, step-by-step

Note: Do NOT include "reference" type pages - API reference documentation is generated directly from source code.

For each proposed page, specify:
- diataxis: explanation|how-to|tutorial
- slug: URL-friendly identifier
- title: Human-readable title
- sources: Array of KB entry IDs that contribute content
- purpose: One-sentence description of page goal
- sections: Array of required H2 section headings that define the page structure

Output valid YAML. Prioritize explanation pages first. Add comments to organize sections.
```

**Expected Output:** `docs/PLAN.yml`

### Step 2: Generation Phase

**Prompt Template:**

```md
Using the approved PLAN.yml and the full knowledgebase, generate documentation pages.

For each page in PLAN.yml:

1. Read all referenced sources entries
2. Synthesize content appropriate to the Diátaxis category
3. Include minimal frontmatter (title and description only)
4. Write in clear, audience-appropriate language
5. Format all code examples with max 80-character line length
6. Add cross-references to related pages where helpful

Generate page: [SPECIFIC_SLUG_FROM_PLAN]
```

Required frontmatter (minimal):

```yml
---
title: [from plan]
description: [descriptive summary]
---
```

For each page, generate content with H2 sections matching the `sections` array from PLAN.yml exactly.

Common section patterns by Diátaxis type (not enforced, but useful as starting templates):

- explanation: Overview, Mental model, Key concepts, Trade-offs, See also
- how-to: Goal, Prerequisites, Steps (ordered), Validation, Pitfalls, Next steps
- tutorial: Introduction, Prerequisites, Step-by-step (numbered), Checkpoint(s), Wrap-up, Further reading

Write complete MDX content for the page.

Note: Generated content provides a solid foundation but can be manually refined afterward for better examples, flow, and user experience.

## Manual Refinement Workflow

After initial generation, documentation can be manually edited to improve quality. However, maintain bidirectional consistency between KB and docs.

### What Can Be Freely Edited in Docs

**Safe to change without KB updates:**

- Code example implementations and scenarios
- Content ordering and section flow
- Prose polish, tone, and readability improvements
- Additional clarifying details for user understanding
- Cross-references and navigation structure
- Formatting and presentation choices

### When to Update Knowledgebase

**Requires KB update when:**

- Core concept definitions change
- API contracts or guarantees are modified
- Design rationale or architectural decisions evolve
- Technical specifications need correction
- Principles or trade-offs are revised

### Validation Checklist

When manually editing generated documentation, ask:

1. **Concept drift check**: Does this change how we define or explain a core concept?
   - ✅ If yes → Update the source KB entry first
   - ❌ If no → Docs-only change is fine

2. **API contract check**: Does this change method signatures, guarantees, or behavior?
   - ✅ If yes → Update the source KB entry first
   - ❌ If no → Docs-only change is fine

3. **Technical accuracy check**: Does this contradict what's documented in the KB?
   - ✅ If yes → Decide which is correct and update accordingly
   - ❌ If no → Docs-only change is fine

4. **Example improvement**: Is this just a better way to demonstrate existing concepts?
   - ❌ No KB update needed
   - Consider if example reveals need for KB clarification

5. **Section structure check**: Are you adding, removing, or reordering H2 sections?
   - ✅ If yes → Update the `sections` array in PLAN.yml to match
   - ❌ If only adding subsections (H3, H4) → No PLAN.yml update needed

### Workflow Example

```
Scenario: Improving code examples in impulse-overview.md

1. Original generated example uses simple counter
2. You want to show a more realistic cart example
3. Validation:
   - Concept drift? No - still explaining fine-grained reactivity
   - API contract? No - same methods, just different scenario
   - Technical accuracy? No contradiction
   - Example improvement? Yes

4. Decision: Update docs directly, no KB change needed
```

```
Scenario: Reordering "Key Concepts" section

1. Original order: Compare-Based → Explicit Scope → Immutable → Nestable
2. You want better learning flow: Explicit Scope → Compare-Based → Immutable → Nestable
3. Validation:
   - Concept drift? No - same concepts, better ordering
   - This ordering may benefit KB documentation too

4. Decision:
   - Update docs for better UX
   - Consider updating KB Principles section for consistency
```

```
Scenario: Clarifying what "compare semantics" means

1. User feedback says "compare semantics" is confusing
2. You add detailed explanation of Object.is() behavior
3. Validation:
   - Concept drift? Potentially - this is core technical detail
   - Technical accuracy? Need to verify against implementation

4. Decision:
   - First check KB entry for existing details
   - If KB is incomplete, update KB first
   - Then update docs with user-friendly explanation
```

## Validation Rules

### PLAN.yml Schema

Each documentation page entry in PLAN.yml follows this structure:

```yaml
# Example entry
- diataxis: explanation # Type: explanation | how-to | tutorial (reference excluded)
  slug: page-slug # Unique, URL-safe identifier
  title: Page Title # Human-readable title
  sources: # KB entry IDs that contribute content
    - kb-entry-id-1
    - kb-entry-id-2
  purpose: One-sentence description of page goal
  sections: # Required H2 headings in order
    - Section One
    - Section Two
```

Note: PLAN.yml is the single source of truth for all documentation metadata. Doc pages themselves contain only title, description, and content.

Minimal frontmatter for AI-synthesized pages:

- `title`: Must match PLAN.yml entry
- `description`: Clear summary of page content

All other metadata (sources, diataxis type, purpose, sections) is stored in PLAN.yml.

### Content Requirements

- Each page must have H2 sections matching the `sections` array in PLAN.yml exactly, in the specified order
- Subsections (H3, H4, etc.) can be added as needed for content organization
- No verbatim copying from KB entries
- Cross-references should use relative links: `[text](../category/page-slug)`
- Code examples should be practical, runnable, and use valid TypeScript/JavaScript syntax
- **Code formatting**: All code lines must be ≤80 characters for optimal Starlight UI display
- **No syntax placeholders**: Avoid `{...}`, `// ...`, or other invalid syntax that prevents Prettier formatting
- Interactive elements noted with `<!-- TODO: Interactive example -->` comments

## Quality Standards

### Writing Style

- Clear, concise language appropriate for developers
- Active voice preferred
- Consistent terminology (maintain a glossary if needed)
- Examples should be realistic, not contrived

### Code Formatting Standards

- **Line length**: Maximum 80 characters per line in code blocks
- **Valid syntax**: All code examples must use valid TypeScript/JavaScript syntax for proper Prettier formatting
- **No placeholders**: Avoid `{...}`, `// ...`, or other invalid syntax - use realistic complete examples
- **Breaking long lines**: Use appropriate line breaks for method chaining, function parameters
- **Readability first**: Prioritize clarity over brevity when breaking lines
- **Consistent style**: Apply formatting consistently across all code examples

**Good example:**

```ts
const fullName = Impulse(
  (scope) => `${firstName.getValue(scope)} ${lastName.getValue(scope)}`,
)
```

**Avoid:**

```ts
// prettier-ignore
const fullName = Impulse((scope) => `${firstName.getValue(scope)} ${lastName.getValue(scope)}`)
```

### Information Architecture

- Logical flow within each page
- Clear section hierarchies (H2, H3 max depth)
- Helpful cross-references between related concepts
- No orphaned pages (every page accessible via navigation)

### Maintenance

- Re-run synthesis when KB entries are substantially updated
- Check PLAN.yml to identify which pages are affected by KB changes (via sources mapping)
- Use PLAN.yml to audit coverage of KB content
- Flag missing KB content as TODOs rather than inventing information
- PLAN.yml serves as the single source of truth for documentation structure and metadata

## Common Anti-Patterns to Avoid

❌ **Don't**: Copy KB markdown directly into doc pages
✅ **Do**: Rephrase and reorganize for the target audience

❌ **Don't**: Create docs without listing KB sources
✅ **Do**: Always track KB sources in PLAN.yml (not in page frontmatter)

❌ **Don't**: Make conceptual changes to docs without checking if KB needs updates
✅ **Do**: Use the validation checklist to determine if KB should be updated first

❌ **Don't**: Create single-purpose pages for every KB entry
✅ **Do**: Combine related concepts into cohesive explanations

❌ **Don't**: Use internal jargon without explanation
✅ **Do**: Define terms clearly for external developers

❌ **Don't**: Let docs and KB drift apart over time
✅ **Do**: Periodically review docs against KB to ensure technical accuracy

## Example Synthesis

**KB Entry**: `impulse-concept.md` (technical, internal)
→ **Generated Pages**:

- `explanation/impulse-overview.md` (high-level, "why impulse?")
- `how-to/create-impulse.md` (practical usage)

### Example Synthesis from impulse-concept.md

The `impulse-concept.md` KB entry generates:

- **explanation/impulse-overview.md**: "What is an impulse?" - concept introduction, mental models, design philosophy
- **how-to/create-impulse.md**: "How do I create and use an impulse?" - practical guide with common patterns
- **tutorial/first-impulse.md**: "Build your first reactive component" - step-by-step walkthrough

Each page is listed in `PLAN.yml` with `sources: ["impulse-concept"]` but presents information differently for its intended use case. The page files themselves contain only title, description, and content.
