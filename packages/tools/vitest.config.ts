import tsconfigPaths from "vite-tsconfig-paths"
import { defineProject } from "vitest/config"
import type { ProjectConfig } from "vitest/node"

export default defineProject({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  } satisfies ProjectConfig,
})
