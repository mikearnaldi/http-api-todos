import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { program } from "http-api-todos/index"
import { createMockConsole } from "./utils/mockConsole"

describe("Index", () => {
  it.effect("should run the main program and log expected messages", () =>
    Effect.gen(function*() {
      const { messages, mockConsole } = createMockConsole()

      yield* program.pipe(
        Effect.withConsole(mockConsole)
      )

      assert.strictEqual(messages.length, 2)
      assert.strictEqual(messages[0], "Hello from Effect + Bun + TypeScript!")
      assert.strictEqual(messages[1], "Hello, World!")
    }))
})
