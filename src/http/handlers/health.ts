import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"

import { todosApi } from "../api.ts"

export const healthLive = HttpApiBuilder.group(
  todosApi,
  "Health",
  (handlers) =>
    handlers.handle(
      "status",
      () => Effect.succeed("Server is running successfully")
    )
)
