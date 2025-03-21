---
---

Update environment:

- Bump node version `20.10 -> 22.14`.
- Bump `packageManager` `pnpm@8.6.3 -> pnpm@10.6.5`
- Define `build` and `typecheck` scripts per package. It allows removing the `postinstall` script because pnpm runs the build scripts in the correct order.
