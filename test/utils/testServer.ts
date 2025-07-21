import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"

import { todosApi } from "../../src/http/api.ts"
import { healthLive } from "../../src/http/handlers/health.ts"

const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)
)

export const testServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 0 }))
)
