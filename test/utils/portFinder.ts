import { Effect } from "effect"
import * as portfinder from "portfinder"

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
export const findAvailablePort = (startPort: number = 3000): Effect.Effect<number> =>
  Effect.promise(() => portfinder.getPortPromise({ port: startPort }))
