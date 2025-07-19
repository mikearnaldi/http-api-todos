import { BunRuntime } from "@effect/platform-bun"
import { Console, Effect } from "effect"

export const greet = (name: string) => Console.log(`Hello, ${name}!`)

export const program = Effect.gen(function*() {
  yield* Console.log("Hello from Effect + Bun + TypeScript!")
  yield* greet("World")
})

if (import.meta.main) {
  BunRuntime.runMain(program)
}
