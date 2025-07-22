import { HttpApiClient } from "@effect/platform"

import { todosApi } from "./api.ts"

/**
 * Create a type-safe HTTP client for the TodosApi
 *
 * @param baseUrl - Base URL for API requests (e.g., "http://localhost:3000")
 * @returns Effect that yields the derived client
 *
 * @example
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const client = yield* createTodosApiClient("http://localhost:3000")
 *   const health = yield* client.Health.status()
 *   return health
 * }).pipe(Effect.provide(FetchHttpClient.layer))
 * ```
 */
export const createTodosApiClient = (baseUrl: string) => HttpApiClient.make(todosApi, { baseUrl })
