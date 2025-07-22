# HttpApi Client Derivation - Requirements

## Functional Requirements

### F1: Client Derivation
- **F1.1**: System SHALL use `HttpApiClient.make(todosApi, { baseUrl })` to derive HTTP client
- **F1.2**: Derived client SHALL automatically expose all endpoints from HttpApi specification
- **F1.3**: Client SHALL mirror API structure: `client.Health.status()` for the health endpoint
- **F1.4**: Client SHALL accept configurable baseUrl in HttpApiClient.make() options

### F2: Type Safety
- **F2.1**: All client method calls SHALL be fully typed with TypeScript
- **F2.2**: Request parameters SHALL match exact types defined in HttpApi endpoints
- **F2.3**: Response types SHALL match exact success schemas from HttpApi endpoints
- **F2.4**: Compile-time type checking SHALL prevent invalid API calls

### F3: Integration
- **F3.1**: Client SHALL require `FetchHttpClient.layer` to be provided via Effect.provide()
- **F3.2**: Client SHALL work within Effect ecosystem patterns (Effect.gen, pipe, etc.)
- **F3.3**: Client creation SHALL be reusable with different baseUrl configurations
- **F3.4**: Client SHALL integrate seamlessly with existing Effect dependency injection

### F4: Testing Support
- **F4.1**: Client SHALL be usable in test environments with localhost URLs
- **F4.2**: At least one test SHALL demonstrate client usage for health endpoint
- **F4.3**: Test SHALL verify both request execution and response handling
- **F4.4**: Client SHALL work with existing test infrastructure (@effect/vitest)

## Non-Functional Requirements

### NF1: Performance
- **NF1.1**: Client generation SHALL have minimal runtime overhead
- **NF1.2**: Type checking SHALL not significantly impact build times
- **NF1.3**: Client SHALL reuse HTTP connections when possible

### NF2: Maintainability
- **NF2.1**: Client code SHALL follow existing project patterns and conventions
- **NF2.2**: Implementation SHALL use standard @effect/platform APIs
- **NF2.3**: Code SHALL pass all linting and type checking rules
- **NF2.4**: Client SHALL automatically stay in sync with API specification changes

### NF3: Reliability
- **NF3.1**: Client SHALL handle HTTP errors according to Effect error patterns
- **NF3.2**: Client SHALL provide meaningful error messages for failed requests
- **NF3.3**: Type safety SHALL prevent runtime type errors in client usage

## Technical Constraints

### TC1: Dependencies
- **TC1.1**: MUST use @effect/platform HttpApiClient.make() for client derivation
- **TC1.2**: MUST require FetchHttpClient.layer to be provided via Effect.provide()
- **TC1.3**: MUST NOT introduce additional HTTP client dependencies beyond Effect platform
- **TC1.4**: MUST be compatible with Bun runtime and existing toolchain

### TC2: Compatibility
- **TC2.1**: MUST NOT modify existing HttpApi specification
- **TC2.2**: MUST NOT break existing server implementation
- **TC2.3**: MUST work with current TypeScript/ESLint configuration
- **TC2.4**: MUST follow Effect TypeScript patterns from project guidelines

### TC3: Structure
- **TC3.1**: Client usage helper SHOULD be placed in `src/` directory (optional convenience wrapper)
- **TC3.2**: Direct HttpApiClient.make() usage is acceptable without wrapper
- **TC3.3**: Tests MUST be added to existing `http.test.ts` file demonstrating client usage
- **TC3.4**: Implementation MUST follow spec-driven development workflow

## Interface Requirements

### IR1: Client Creation
```typescript
// Use HttpApiClient.make() directly (no custom wrapper needed)
const client = HttpApiClient.make(todosApi, { baseUrl: "http://localhost:3000" })
```

### IR2: Derived Client Structure
```typescript
// Client automatically mirrors API structure (no manual interface needed)
// Based on: healthGroup = HttpApiGroup.make("Health").add(statusEndpoint)
// Where: statusEndpoint = HttpApiEndpoint.get("status", "/healthz")
// Provides: client.Health.status() returning Effect<string, HttpError, HttpClient>
```

### IR3: Usage Pattern
```typescript
// Required usage pattern in tests/application code
const program = Effect.gen(function* () {
  const client = yield* HttpApiClient.make(todosApi, { baseUrl: "http://localhost:3000" })
  const result = yield* client.Health.status()  // Note: () call required
  return result
}).pipe(Effect.provide(FetchHttpClient.layer))
```

## Acceptance Criteria Traceability

- **F1**: Maps to "HttpApi client can be derived from existing API specification"
- **F2**: Maps to "Client provides full TypeScript type safety"
- **F3**: Maps to "Client is implemented in src/ directory for reuse"
- **F4**: Maps to "At least one test demonstrates client usage"
- **NF2**: Maps to "Implementation follows Effect patterns"
- **TC2**: Maps to "Must work with existing HttpApi specification without modifications"