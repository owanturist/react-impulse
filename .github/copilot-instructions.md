# GitHub Copilot Context

This project uses a knowledgebase-driven (KB) development approach.

## Project Structure

- [`docs/`](../docs/) - Documentation site source files
- [`docs/knowledgebase/`](../docs/knowledgebase/) - Single source of truth for features/bugs/concepts
- [`packages/signal-core/`](../packages/signal-core/) - Core reactive state library
- [`packages/signal-react/`](../packages/signal-react/) - React bindings for reactive state
- [`packages/signal-form/`](../packages/signal-form/) - Form validation library
- [`packages/tools/`](../packages/tools/) - Utility functions shared across packages but not published

## Key Context Files

- [`knowledgebase/PLAN.md`](../docs/knowledgebase/PLAN.md) - Complete implementation plan and phases
- [`knowledgebase/README.md`](../docs/knowledgebase/README.md) - How to use the knowledgebase
- [`knowledgebase/*.md`](../docs/knowledgebase/) - Concept entries documenting architectural decisions and design patterns

## Development Workflow

1. Document architectural concepts in the knowledgebase
2. Implement code based on KB concepts
3. Generate documentation from KB entries

## AI Agent Guidelines

- Always reference KB entry IDs in commits when implementing concepts
- Use `@workspace` for full project context
- Reference `knowledgebase/<concept-id>.md` when implementing

## Package Management

- **Use pnpm consistently** - This is a pnpm workspace project
- **Install from root** - Use `pnpm add -D package` or `pnpm add package` from project root
- **Workspace commands** - Use `pnpm --filter package-name command` for package-specific operations
- **No npm/yarn** - Only use pnpm to maintain lockfile consistency

## YAML Formatting

**Always use YAML list syntax for arrays** - whenever working with YAML files in this project:

```yaml
# ✅ Correct - YAML list syntax
packages:
  - react-signal
  - react-signal-form
relates-to:
  - concept-1
  - concept-2

# ❌ Avoid - JSON bracket syntax
packages: [react-signal, react-signal-form]
relates-to: [concept-1, concept-2]
```

This applies to:

- KB entry frontmatter in [`knowledgebase/*.md`](../docs/knowledgebase/)
- Documentation in [`docs/PLAN.yml`](../docs/PLAN.yml)
- Any other YAML configuration files

## Natural Language Understanding

When you mention implementing features or creating documentation, I should:

- Look for relevant knowledgebase concept entries first
- Reference concept entry IDs in commits
- Ask about creating a KB concept entry if none exists for new architectural patterns

When GitHub Copilot suggests code, it should consider this knowledgebase-first approach and the structured entry format defined in PLAN.md.
