import { defineProject } from "vitest/config"
import type { ProjectConfig } from "vitest/node"

export default defineProject({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  } satisfies ProjectConfig,
})
