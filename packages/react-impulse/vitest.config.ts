import { defineProject } from "vitest/config"
import React from "react"

// eslint-disable-next-line no-console
console.log(`Running tests against React@${React.version}`)

export default defineProject({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environment: "happy-dom",
    setupFiles: "./setup-tests.ts",
    coverage: {
      exclude: ["**/*.js", "**/*.d.ts", "setup-tests.ts", "src/messages.ts"],
      reporter: ["text", "json"],
    },
  },
})
