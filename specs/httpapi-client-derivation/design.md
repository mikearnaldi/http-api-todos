# HttpApi Client Derivation - Technical Design

## Overview

This design implements HttpApi client derivation using the built-in `HttpApiClient.make()` functionality from @effect/platform. The solution leverages Effect's automatic client generation to create type-safe HTTP clients directly from existing API specifications.

## Architecture Decisions

### AD1: Direct HttpApiClient Usage
**Decision**: Use `HttpApiClient.make()` directly without custom wrapper functions
**Rationale**: 
- Effect Platform provides complete client derivation functionality
- Custom wrappers would add unnecessary complexity
- Direct usage maintains full type safety and API consistency
- Follows Effect ecosystem best practices

### AD2: Optional Convenience Module
**Decision**: Provide optional convenience module in `src/http/client.ts` for common patterns
**Rationale**:
- Centralizes todosApi import and baseUrl configuration examples
- Provides documentation and usage examples for developers
- Does not mandate usage - direct HttpApiClient.make() calls remain valid
- Facilitates testing with consistent patterns

### AD3: Test Integration Strategy  
**Decision**: Add client-based test alongside existing HttpClient test
**Rationale**:
- Demonstrates both low-level HttpClient and high-level HttpApiClient approaches
- Validates client-server consistency with identical test assertions
- Preserves existing test coverage while adding client validation
- Shows practical usage patterns for other developers

## Component Design

### Client Creation Module (`src/http/client.ts`)

```typescript
import { HttpApiClient } from "@effect/platform"
import { Effect } from "effect"

import { todosApi } from "./api.ts"

/**
 * Create a type-safe HTTP client for the TodosApi
 * 
 * @param baseUrl - Base URL for API requests (e.g., "http://localhost:3000")
 * @returns Effect that yields the derived client
 * 
 * Usage:
 * ```typescript
 * const program = Effect.gen(function* () {
 *   const client = yield* createTodosApiClient("http://localhost:3000")
 *   const health = yield* client.Health.status()
 *   return health
 * }).pipe(Effect.provide(FetchHttpClient.layer))
 * ```
 */
export const createTodosApiClient = (baseUrl: string) =>
  HttpApiClient.make(todosApi, { baseUrl })

// Re-export todosApi for convenience
export { todosApi }
```

**Design Rationale**:
- Provides convenience function while preserving direct HttpApiClient.make() usage
- Includes comprehensive JSDoc documentation with usage examples
- Re-exports todosApi to avoid multiple imports in client code
- Maintains full type safety from Effect Platform

### Test Implementation (`test/http.test.ts`)

```typescript
// New test case to be added
it.effect("GET /healthz via derived client returns success response", () =>
  Effect.gen(function*() {
    const serverUrl = getServerUrl()
    const client = yield* HttpApiClient.make(todosApi, { baseUrl: serverUrl })
    const result = yield* client.Health.status()

    // Validate response content and type safety
    assert.strictEqual(result, "Server is running successfully")
    // Note: Type system ensures result is string, matching Schema.String from statusEndpoint
  }).pipe(
    Effect.provide(FetchHttpClient.layer)
  ))
```

**Design Rationale**:
- Uses same test infrastructure (testServerLayer, getServerUrl) as existing test
- Demonstrates direct HttpApiClient.make() usage in realistic scenario
- Validates client-server consistency with identical expected response
- Leverages Effect.provide pattern for dependency injection
- Asserts type safety - result is automatically typed as string

## API Surface Analysis

### Current API Structure
Based on `src/http/api.ts`:
```typescript
statusEndpoint = HttpApiEndpoint.get("status", "/healthz").addSuccess(Schema.String)
healthGroup = HttpApiGroup.make("Health").add(statusEndpoint)  
todosApi = HttpApi.make("TodosApi").add(healthGroup)
```

### Derived Client Structure
HttpApiClient.make() generates:
```typescript
client.Health.status(): Effect<string, HttpError, HttpClient>
```

**Mapping Logic**:
- Group name "Health" → client.Health
- Endpoint name "status" → client.Health.status()  
- Success schema Schema.String → return type string
- HTTP dependencies → requires HttpClient in context

## Error Handling Strategy

### HTTP Error Types
- Network failures: HttpError from @effect/platform
- HTTP status errors: Automatically handled by HttpApiClient
- Type validation: Schema validation on responses

### Error Propagation
```typescript
const program = Effect.gen(function* () {
  const client = yield* HttpApiClient.make(todosApi, { baseUrl })
  const result = yield* client.Health.status() // Can fail with HttpError
  return result
}).pipe(
  Effect.provide(FetchHttpClient.layer),
  Effect.catchAll((error) => {
    // Handle HttpError, network issues, etc.
    return Effect.fail(`Health check failed: ${error}`)
  })
)
```

## Integration Points

### Existing Components
- **todosApi**: Source specification for client derivation
- **FetchHttpClient.layer**: HTTP transport layer requirement
- **Test infrastructure**: testServerLayer, getServerUrl utilities
- **Effect patterns**: Effect.gen, Effect.provide, @effect/vitest

### Dependencies Required
- `HttpApiClient` from @effect/platform (already available)
- `FetchHttpClient` from @effect/platform (already used in tests)
- No additional dependencies needed

## Implementation Strategy

### Phase 1: Create Client Module ✅ COMPLETED
1. ✅ Created `src/http/client.ts` with convenience function
2. ✅ Added comprehensive JSDoc documentation and usage examples
3. ✅ Exported convenience function only (removed unnecessary todosApi re-export)

### Phase 2: Add Test Case ✅ COMPLETED
1. ✅ Imported HttpApiClient in existing test file
2. ✅ Added new test case using existing testServerLayer infrastructure
3. ✅ Demonstrated direct HttpApiClient.make() usage (no additional Effect.provide needed)
4. ✅ Validated response content and type safety with string assertion

### Phase 3: Validation ✅ COMPLETED
1. ✅ Ran lint:fix and typecheck - all quality checks pass
2. ✅ Executed tests - both existing and new tests pass
3. ✅ Updated patterns/http-specific-testing.md with HttpApiClient patterns
4. ✅ Verified testServerLayer already provides FetchHttpClient.layer

## Quality Assurance

### Type Safety Validation
- Client method calls are fully typed by Effect Platform
- Response types match endpoint success schemas automatically
- Compile-time prevention of invalid API calls

### Testing Strategy
- Integration test with real server (testServerLayer)
- Validation of client-server response consistency
- Demonstration of practical usage patterns
- Error handling verification

### Code Quality
- Follow existing project ESLint and TypeScript configuration
- Maintain Effect ecosystem patterns and conventions
- Provide clear documentation and examples
- Ensure backward compatibility with existing code

## Future Considerations

### Extensibility
- Pattern established for additional API endpoints
- Client automatically includes new endpoints as API grows
- Type safety maintained as API specification evolves

### Performance
- HttpApiClient.make() creates client instance per call
- Consider caching client instances for production usage
- FetchHttpClient.layer reuses HTTP connections efficiently

### Testing Evolution
- Additional client tests can follow same pattern
- Client-based testing may replace some low-level HttpClient tests
- End-to-end testing scenarios can leverage typed client interface