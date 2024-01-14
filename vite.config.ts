import { defineConfig } from "vitest/config"

export default defineConfig({
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
