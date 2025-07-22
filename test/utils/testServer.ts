import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Context, Effect, Layer } from "effect"
import { createServer } from "node:http"

import { todosApi } from "http-api-todos/http/api.ts"
import { healthLive } from "http-api-todos/http/handlers/health.ts"

import { findAvailablePort } from "./portFinder.ts"

const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)
)

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
 * Test server layer with dynamic port assignment using portfinder
 *
 * This replaces the previous fragile port 0 strategy with reliable
 * port finding using the portfinder package integrated through Effect.
 * The port and messages are made available through the TestServer service context.
 */
export const testServerLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const port = yield* findAvailablePort()

    const serverLayer = HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(NodeHttpServer.layer(createServer, { port }))
    )

    // Note: messages array will be populated by httpTestUtils layer
    const testServerLayer = TestServer.layer(port, [])

    return Layer.provideMerge(serverLayer, testServerLayer)
  })
)
