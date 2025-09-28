# GitHub Copilot Context

This project uses a knowledgebase-driven development approach. When working with this codebase:

## Key Context Files

- `knowledgebase/PLAN.md` - Complete implementation plan and phases
- `knowledgebase/README.md` - How to use the knowledgebase
- `knowledgebase/entries/**/*.md` - Feature, bugfix, and concept entries

## Development Workflow

1. All changes start with a knowledgebase entry
2. Implement code based on KB acceptance-criteria
3. Generate documentation from KB entries
4. Never edit generated docs directly

## AI Agent Guidelines

- Always reference KB entry IDs in commits
- Follow acceptance-criteria exactly
- Create comprehensive tests per test-plan
- Use @workspace for full project context
- Reference `knowledgebase/entries/[type]/[id].md` when implementing

## Package Management

- **Use pnpm consistently** - This is a pnpm workspace project
- **Install from root** - Use `pnpm add -D package` or `pnpm add package` from project root
- **Workspace commands** - Use `pnpm --filter package-name command` for package-specific operations
- **No npm/yarn** - Only use pnpm to maintain lockfile consistency

## Project Structure

- `packages/react-impulse/` - Core reactive state library
- `packages/react-impulse-form/` - Form validation library
- `packages/tools/` - Utility functions
- `knowledgebase/` - Single source of truth for features/bugs/concepts

## Entry Types

- **feature** - New functionality with acceptance-criteria and test-plan
- **bugfix** - Bug fixes with root cause analysis and regression tests
- **concept** - Architectural decisions and design patterns
- **decision** - ADRs (Architecture Decision Records)
- **test-spec** - Detailed test specifications
- **doc-snippet** - Documentation fragments

## Natural Language Understanding

When you mention implementing features, fixing bugs, or creating documentation, I should:

- Look for relevant knowledgebase entries first
- Follow the acceptance-criteria if they exist
- Create comprehensive tests covering the test-plan
- Reference entry IDs in commits
- Ask about creating a KB entry if none exists

When GitHub Copilot suggests code, it should consider this knowledgebase-first approach and the structured entry format defined in PLAN.md.
