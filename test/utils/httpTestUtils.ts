import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Console, Effect, Layer, Logger } from "effect"
import { createServer } from "node:http"

import { todosApi } from "http-api-todos/http/api.ts"
import { healthLive } from "http-api-todos/http/handlers/health.ts"

import { createMockConsole } from "./mockConsole.ts"
import { findAvailablePort } from "./portFinder.ts"
import { TestServer } from "./testServer.ts"

/**
 * Test HTTP server layer with mock console and message capture
 *
 * This layer provides:
 * - HTTP server with dynamic port assignment
 * - Mock console for capturing log messages
 * - HTTP client integration for making requests
 * - Unified TestServer service for accessing port and messages
 */
export const testHttpServerLayer = Layer.unwrapEffect(
  Effect.gen(function*() {
    const { messages, mockConsole } = createMockConsole()
    const port = yield* findAvailablePort()

    const apiLive = HttpApiBuilder.api(todosApi).pipe(
      Layer.provide(healthLive)
    )

    const serverLayer = HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(NodeHttpServer.layer(createServer, { port })),
      Layer.provide(Logger.add(Logger.defaultLogger)),
      Layer.provide(Console.setConsole(mockConsole)),
      Layer.provideMerge(FetchHttpClient.layer)
    )

    const testServerLayer = TestServer.layer(port, messages)

    return Layer.provideMerge(serverLayer, testServerLayer)
  })
)
