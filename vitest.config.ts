import * as path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  esbuild: {
    target: "es2020"
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"]
  },
  test: {
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    alias: {
      "@": path.join(__dirname, "src"),
      "http-api-todos": path.join(__dirname, "src")
    }
  }
})
