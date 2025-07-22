import { HttpApiClient, HttpClient } from "@effect/platform"
import { assert, describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { todosApi } from "../src/http/api.ts"
import { createTestHttpServer } from "./utils/httpTestUtils.ts"

describe("HTTP API", () => {
  const { getServerUrl, testServerLayer } = createTestHttpServer()

  layer(testServerLayer)((it) => {
    it.effect("GET /healthz returns success response with correct headers", () =>
      Effect.gen(function*() {
        const serverUrl = getServerUrl()
        const response = yield* HttpClient.get(`${serverUrl}/healthz`)
        const text = yield* response.text

        assert.strictEqual(response.status, 200)
        assert.strictEqual(text, "\"Server is running successfully\"")
        assert.isTrue(response.headers["content-type"]?.includes("application/json"))
      }))

    it.effect("GET /healthz via derived client returns success response", () =>
      Effect.gen(function*() {
        const serverUrl = getServerUrl()
        const client = yield* HttpApiClient.make(todosApi, { baseUrl: serverUrl })
        const result = yield* client.Health.status()

        assert.strictEqual(result, "Server is running successfully")
      }))
  })
})
