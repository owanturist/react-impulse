import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setup-tests.ts",
    coverage: {
      reporter: ["text", "json"],
    },
  },
})
