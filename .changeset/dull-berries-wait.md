---
"react-impulse": patch
---

🐛 bugfix: build the source code before publishing. It runs `pnpm run publish` instead of `pnpm publish` so it runs the custom script, that builds the package first and then uses `changesets publish`.
