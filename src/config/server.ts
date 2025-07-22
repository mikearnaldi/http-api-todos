import { Config } from "effect"

/**
 * Server port configuration from environment variables
 *
 * Reads PORT environment variable with validation:
 * - Valid range: 1-65535 (enforced by Config.port)
 * - Default value: 3000
 * - Error handling: ConfigError for invalid values
 *
 * @example
 * ```typescript
 * // Use default port (3000)
 * const port = yield* serverPortConfig
 *
 * // With environment variable: PORT=8080
 * const port = yield* serverPortConfig // Returns 8080
 * ```
 */
export const serverPortConfig = Config.port("PORT").pipe(
  Config.withDefault(3000)
)
