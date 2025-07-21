import { BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"

import { serverLive } from "./http/server.ts"

if (import.meta.main) {
  Layer.launch(serverLive).pipe(BunRuntime.runMain)
}
