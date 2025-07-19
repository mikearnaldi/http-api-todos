import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { greet, program } from "http-api-todos/index"
import { createMockConsole } from "./utils/mockConsole"

describe("Index", () => {
  describe("greet", () => {
    it.effect("should log greeting message", () =>
      Effect.gen(function*() {
        const { messages, mockConsole } = createMockConsole()

        yield* greet("Test").pipe(
          Effect.withConsole(mockConsole)
        )

        assert.strictEqual(messages.length, 1)
        assert.strictEqual(messages[0], "Hello, Test!")
      }))
  })

  describe("program", () => {
    it.effect("should run the main program successfully", () =>
      Effect.gen(function*() {
        const { messages, mockConsole } = createMockConsole()

        const result = yield* program.pipe(
          Effect.withConsole(mockConsole)
        )

        // Program should complete successfully
        assert.strictEqual(result, undefined)

        // Should log both messages
        assert.strictEqual(messages.length, 2)
        assert.strictEqual(messages[0], "Hello from Effect + Bun + TypeScript!")
        assert.strictEqual(messages[1], "Hello, World!")
      }))

    it.effect("should be composable with other effects", () =>
      Effect.gen(function*() {
        const { messages, mockConsole } = createMockConsole()
        let executed = false

        const testProgram = Effect.gen(function*() {
          yield* program
          yield* Effect.sync(() => {
            executed = true
          })
        })

        yield* testProgram.pipe(
          Effect.withConsole(mockConsole)
        )

        assert.isTrue(executed)
        assert.strictEqual(messages.length, 2)
      }))
  })
})
