import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    // https://github.com/vitest-dev/vitest/issues/3967#issuecomment-1680585071
    testTransformMode: {
      ssr: ["**/*"],
    },
    environment: "happy-dom",
    setupFiles: "./setup-tests.ts",
    coverage: {
      reporter: ["text", "json"],
    },
  },
})
