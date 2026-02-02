---
name: verify-skills
description: Verify all skills in .claude/skills/ are documented in CLAUDE.md. Use when adding new skills, auditing skill documentation, or before committing skill changes. Triggers on: verify skills, check skills, audit skills, missing skills.
---

# Verify Skills Documentation

Ensure all skills in `.claude/skills/` are properly linked in `CLAUDE.md`.

## Verification Steps

1. List all skill directories:
   ```bash
   ls .claude/skills/
   ```

2. For each skill directory, check if it's linked in CLAUDE.md:
   ```bash
   grep -c "skills/<skill-name>" CLAUDE.md
   ```

3. Report findings:
   - **Documented**: Skills with links in CLAUDE.md
   - **Missing**: Skills without links (need to be added)

## Adding Missing Skills

For each missing skill:

1. Read its SKILL.md to get the description:
   ```bash
   head -10 .claude/skills/<skill-name>/SKILL.md
   ```

2. Add to the appropriate table in CLAUDE.md "Available Skills" section:
   - **Development Skills**: Testing, code quality, TypeScript, React
   - **Utility Skills**: Skill management, documentation generation
   - **Marketing Skills**: Copywriting, product marketing

3. Use this format:
   ```markdown
   | [skill-name](.claude/skills/skill-name/SKILL.md) | Brief description |
   ```

## Expected Output

```
Skills Verification Report
==========================
Total skills: X
Documented: Y
Missing: Z

Missing skills:
- skill-name-1
- skill-name-2
```
