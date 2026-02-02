---
name: install-skill
description: Install a skill from GitHub and organize it in .claude/skills (removes symlinks, moves files properly)
---

# Install Skill

Installs a skill from GitHub using `npx skills add` and organizes it properly in `.claude/skills/`.

## Arguments

Pass the skill source as argument: `owner/repo@skill`

## Steps

1. Run the installation:

```bash
npx skills add $ARGUMENTS --agent claude-code -y
```

2. Remove symlinks and move skills to proper location:

```bash
find .claude/skills -maxdepth 1 -type l -delete
mv .agents/skills/* .claude/skills/ && rm -rf .agents
```
