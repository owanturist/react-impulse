---
"react-impulse": patch
"react-impulse-form": patch
---

Refactor internal source code structure to improve consistency and maintainability:
- Move implementation details to `_internal` directories to clearly separate public API from internal logic.
- Update `biome.jsonc` to enforce public API boundaries:
  - Prevent package entry points (`index.ts`) from directly importing from `_internal`.
  - Enable `noUnusedImports` rule with autofix.
- Remove `dependencies.ts` pattern and allow direct imports of dependencies.
