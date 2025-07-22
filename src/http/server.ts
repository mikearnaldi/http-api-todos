import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"

import { serverPortConfig } from "../config/server.ts"
import { todosApi } from "./api.ts"
import { healthLive } from "./handlers/health.ts"

const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)
)

export const serverLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const port = yield* serverPortConfig
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port }))
    )
  })
)
