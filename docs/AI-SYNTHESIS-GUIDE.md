# AI Documentation Synthesis Guide

This guide defines the canonical process for transforming the react-impulse knowledgebase into human-friendly Diátaxis documentation.

## Core Principles

1. **Many-to-many mapping**: One KB entry can generate multiple doc pages; one doc page can synthesize multiple KB entries.
2. **No verbatim copying**: Always rephrase, compress, and reorganize for the target audience.
3. **Generation tracking**: Every doc page must include `generated` metadata in frontmatter with sources and sync date.
4. **KB is authoritative**: Never edit docs directly - always update KB first, then re-synthesize.

## Two-Step Synthesis Process

### Step 1: Planning Phase

**Prompt Template:**

```
Read the entire knowledgebase at `knowledgebase/entries/**/*.md` and analyze all entries.

Create a comprehensive documentation plan as JSON that maps KB knowledge to Diátaxis categories:
- explanation: High-level concepts, mental models, "why" questions
- reference: Precise API documentation, "what" questions
- how-to: Goal-oriented guides, "how" questions
- tutorial: Learning-oriented walkthroughs, step-by-step

For each proposed page, specify:
- slug: URL-friendly identifier
- title: Human-readable title
- diataxis: explanation|reference|how-to|tutorial
- kbSources: Array of KB entry IDs that contribute content
- purpose: One-sentence description of page goal
- keySections: Array of expected section headings

Output only valid JSON array. Prioritize explanation and reference pages first.
```

**Expected Output:** `docs/PLAN.json`

### Step 2: Generation Phase

**Prompt Template:**

````
Using the approved PLAN.json and the full knowledgebase, generate documentation pages.

For each page in the plan:
1. Read all referenced kbSources entries
2. Synthesize content following the Diátaxis type requirements
3. Include required frontmatter with provenance
4. Write in clear, audience-appropriate language
5. Add cross-references to related pages where helpful

Generate page: [SPECIFIC_SLUG_FROM_PLAN]

Required frontmatter:
```yaml
---
title: [from plan]
description: [descriptive summary]
generated:
  from: [array of KB entry IDs]
  type: [diataxis type]
  date: [current date YYYY-MM-DD]
  status: published
---
````

Content requirements by Diátaxis type:

- explanation: Overview, Mental model, Key concepts, Trade-offs, See also
- reference: Overview, API surface (grouped), Guarantees, Edge cases, See also
- how-to: Goal, Prerequisites, Steps (ordered), Validation, Pitfalls, Next steps
- tutorial: Introduction, Prerequisites, Step-by-step (numbered), Checkpoint(s), Wrap-up, Further reading

Write complete MDX content for the page.

````

## Validation Rules

### PLAN.json Schema
```typescript
type DocumentPlan = {
  slug: string;           // unique, URL-safe
  title: string;          // human-readable
  diataxis: 'explanation' | 'reference' | 'how-to' | 'tutorial';
  kbSources: string[];    // must reference existing KB entry IDs
  purpose: string;        // one-sentence goal
  keySections: string[];  // expected headings
}[]
````

### Page Frontmatter Requirements

- `title`: Must match PLAN entry
- `description`: Clear summary of page content
- `generated.from`: Must be non-empty array of existing KB entry IDs
- `generated.type`: Must be valid Diátaxis type (explanation|reference|how-to|tutorial)
- `generated.date`: Must be current date in YYYY-MM-DD format
- `generated.status`: Must be "draft" or "published"

### Content Requirements

- Each page must follow section requirements for its Diátaxis type
- No verbatim copying from KB entries
- Cross-references should use relative links: `[text](../category/page-slug)`
- Code examples should be practical and runnable
- Interactive elements noted with `<!-- TODO: Interactive example -->` comments

## Quality Standards

### Writing Style

- Clear, concise language appropriate for developers
- Active voice preferred
- Consistent terminology (maintain a glossary if needed)
- Examples should be realistic, not contrived

### Information Architecture

- Logical flow within each page
- Clear section hierarchies (H2, H3 max depth)
- Helpful cross-references between related concepts
- No orphaned pages (every page accessible via navigation)

### Maintenance

- Re-run synthesis when KB entries are substantially updated
- Update `last-synced` dates to track freshness
- Use PLAN.json to audit coverage of KB content
- Flag missing KB content as TODOs rather than inventing information

## Common Anti-Patterns to Avoid

❌ **Don't**: Copy KB markdown directly into doc pages
✅ **Do**: Rephrase and reorganize for the target audience

❌ **Don't**: Create docs without listing KB sources  
✅ **Do**: Always track generation metadata in frontmatter

❌ **Don't**: Edit generated docs directly for content fixes
✅ **Do**: Update the relevant KB entries and re-synthesize

❌ **Don't**: Create single-purpose pages for every KB entry
✅ **Do**: Combine related concepts into cohesive explanations

❌ **Don't**: Use internal jargon without explanation
✅ **Do**: Define terms clearly for external developers

## Example Synthesis

**KB Entry**: `impulse-concept.md` (technical, internal)
→ **Generated Pages**:

- `explanation/impulse-overview.md` (high-level, "why impulse?")
- `reference/impulse-api.md` (precise API details)
- `how-to/create-impulse.md` (practical usage)

Each page includes `generated.from: ["impulse-concept"]` but presents information differently for its intended use case.
