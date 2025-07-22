import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Console, Context, Effect, Layer, Logger } from "effect"
import { createServer } from "node:http"
import * as portfinder from "portfinder"

import { todosApi } from "http-api-todos/http/api.ts"
import { healthLive } from "http-api-todos/http/handlers/health.ts"

import { createMockConsole } from "./mockConsole.ts"

/**
 * Find an available port starting from the given port
 *
 * Uses Effect.promise with fail-fast behavior - any portfinder errors
 * will crash the test execution as intended, since port unavailability
 * indicates system-level issues that should be investigated.
 *
 * @param startPort - The port number to start searching from (default: 3000)
 * @returns Effect that resolves to an available port number
 *
 * @example
 * ```typescript
 * const portEffect = findAvailablePort(3000)
 * const port = yield* portEffect // Will be >= 3000
 * ```
 */
const findAvailablePort = (startPort: number = 3000): Effect.Effect<number> =>
  Effect.promise(() => portfinder.getPortPromise({ port: startPort }))

/**
 * Test server service for accessing the dynamically assigned port and captured messages
 *
 * This unified Context.Tag service provides access to both the port number assigned
 * to the test server and the messages captured from the mock console.
 */
export class TestServer extends Context.Tag("TestServer")<
  TestServer,
  {
    readonly port: number
    readonly messages: Array<string>
    readonly getServerUrl: () => string
  }
>() {
  /**
   * Create a TestServer service layer with the given port and messages
   */
  static layer = (port: number, messages: Array<string>) =>
    Layer.succeed(TestServer, {
      port,
      messages,
      getServerUrl: () => `http://localhost:${port}`
    })

  /**
   * Get the test server URL
   *
   * @returns Effect that resolves to the test server URL
   *
   * @example
   * ```typescript
   * it.effect("test with server", () =>
   *   Effect.gen(function*() {
   *     const serverUrl = yield* TestServer.url
   *     const response = yield* HttpClient.get(`${serverUrl}/healthz`)
   *     // ... test assertions
   *   }))
   * ```
   */
  static url: Effect.Effect<string, never, TestServer> = Effect.gen(function*() {
    const testServer = yield* TestServer
    return testServer.getServerUrl()
  })

  /**
   * Get the captured console messages
   *
   * @returns Effect that resolves to the captured messages array
   *
   * @example
   * ```typescript
   * it.effect("test with messages", () =>
   *   Effect.gen(function*() {
   *     const messages = yield* TestServer.messages
   *     assert.isTrue(messages.some(msg => msg.includes("expected log")))
   *   }))
   * ```
   */
  static messages: Effect.Effect<Array<string>, never, TestServer> = Effect.gen(function*() {
    const testServer = yield* TestServer
    return testServer.messages
  })
}

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
