import { assert, describe, layer } from "@effect/vitest"
import { HttpClient } from "@effect/platform"
import { Effect } from "effect"

import { createTestHttpServer } from "./utils/httpTestUtils.ts"

describe("HTTP API", () => {
  const { testServerLayer, getServerUrl } = createTestHttpServer()

  layer(testServerLayer)((it) => {
    it.effect("GET /healthz returns success response with correct headers", () =>
      Effect.gen(function* () {
        const serverUrl = getServerUrl()
        const response = yield* HttpClient.get(`${serverUrl}/healthz`)
        const text = yield* response.text

        assert.strictEqual(response.status, 200)
        assert.strictEqual(text, '"Server is running successfully"')
        assert.isTrue(response.headers["content-type"]?.includes("application/json"))
      })
    )
  })
})