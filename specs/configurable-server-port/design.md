# Configurable Server Port - Technical Design

## Overview

This design implements configurable HTTP server port functionality using Effect's Config API and Layer.unwrap pattern. The solution transforms the existing hard-coded port configuration into a dynamic, environment-variable-driven system while maintaining full backward compatibility and type safety.

## Architecture Decisions

### AD1: Effect Config API Integration
**Decision**: Use `Config.port("PORT")` with `Config.withDefault(3000)` for port configuration
**Rationale**: 
- Effect's Config.port provides built-in validation for TCP port range [1-65535]
- Config.withDefault ensures graceful fallback behavior
- Integrates naturally with Effect's error handling system
- Maintains type safety throughout the configuration chain

### AD2: Layer.unwrap Pattern for Configuration
**Decision**: Use `Layer.unwrap()` to create configuration-dependent server layers
**Rationale**:
- Allows layers to be constructed based on Effect-computed values
- Enables configuration to be resolved during layer initialization
- Maintains Effect's composability and error propagation
- Follows established Effect patterns for configuration-dependent layers

### AD3: Leave Test Infrastructure Unchanged
**Decision**: Do not modify any test files or test server configurations
**Rationale**:
- Test infrastructure is working correctly and should not be touched
- Production port configuration is independent of test port assignment
- Avoids unnecessary complexity and potential test breakage
- Maintains clear separation between production and test concerns

### AD4: Centralized Configuration Module
**Decision**: Create separate configuration module for reusable port configuration
**Rationale**:
- Promotes code reuse between production and test servers
- Centralizes configuration logic for easier maintenance
- Provides consistent error handling across environments
- Facilitates testing of configuration logic in isolation

## Component Design

### Configuration Module (`src/config/server.ts`)

```typescript
import { Config } from "effect"

/**
 * Server port configuration from environment variables
 * 
 * Reads PORT environment variable with validation:
 * - Valid range: 1-65535 (enforced by Config.port)
 * - Default value: 3000
 * - Error handling: ConfigError for invalid values
 */
export const serverPortConfig = Config.port("PORT").pipe(
  Config.withDefault(3000)
)
```

**Design Rationale**:
- Uses Effect's Config.port for automatic validation
- Provides sensible default without additional configuration
- Exports reusable configuration for both production and test servers
- Includes comprehensive JSDoc documentation

### Production Server Integration (`src/http/server.ts`)

```typescript
import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"

import { todosApi } from "./api.ts"
import { healthLive } from "./handlers/health.ts"
import { serverPortConfig } from "../config/server.ts"

const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)
)

export const serverLive = Layer.unwrap(
  Effect.gen(function* () {
    const port = yield* serverPortConfig
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port }))
    )
  })
)
```

**Design Rationale**:
- Uses Layer.unwrap to create configuration-dependent layer
- Resolves port configuration during layer initialization
- Maintains existing API layer composition
- Preserves HttpServer.withLogAddress for startup logging
- Integrates seamlessly with existing BunHttpServer.layer

### Test Infrastructure (No Changes Required)

The existing test infrastructure in `test/utils/testServer.ts` and related files will remain completely unchanged. The test servers will continue to use their current port assignment strategy (port 0 for dynamic assignment) and are independent of the production server port configuration.

## Configuration Flow

### Startup Configuration Sequence

1. **Environment Reading**: Config.port("PORT") reads PORT environment variable
2. **Validation**: Built-in port range validation [1-65535]
3. **Default Application**: Config.withDefault(3000) applies if PORT not set
4. **Layer Construction**: Layer.unwrap resolves configuration and creates server layer
5. **Server Initialization**: HttpServer layer starts with resolved port
6. **Logging**: HttpServer.withLogAddress logs the actual listening address

### Error Handling Strategy

```typescript
// Configuration errors propagate through Effect system
type ConfigurationErrors = 
  | ConfigError.InvalidData    // Invalid port format (non-numeric)
  | ConfigError.InvalidData    // Port out of range (handled by Config.port)

// Error propagation through Layer.unwrap
const serverLive = Layer.unwrap(
  Effect.gen(function* () {
    const port = yield* serverPortConfig  // ← Errors propagate here
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port }))
    )
  })
)
```

**Error Handling Benefits**:
- Fail-fast behavior during server initialization
- Clear error messages from Effect's Config system
- Proper error propagation through Effect chain
- No silent failures or runtime surprises

## Integration Points

### Current Architecture Compatibility

**Preserved Components**:
- `apiLive` layer composition remains unchanged
- `HttpApiBuilder.serve()` pattern maintained
- `HttpServer.withLogAddress` functionality preserved
- Handler implementations unaffected

**Modified Components**:
- `serverLive` now uses Layer.unwrap pattern
- New configuration module added

**Unchanged Components**:
- All test infrastructure and test files
- Test server configurations remain as-is

### Environment Variable Integration

**Production Environment**:
```bash
# Configure port via environment
PORT=8080 npm start

# Use default port
npm start  # Uses port 3000
```

**Test Environment**:
```bash
# Tests remain unchanged and unaffected by PORT configuration
npm test  # Test infrastructure uses existing port assignment (port 0)
```


## Implementation Strategy

### Phase 1: Configuration Foundation
1. Create `src/config/server.ts` with port configuration
2. Add comprehensive JSDoc documentation
3. Implement basic configuration validation

### Phase 2: Production Server Integration
1. Update `src/http/server.ts` to use Layer.unwrap pattern
2. Integrate serverPortConfig into existing server layer
3. Maintain existing layer composition and functionality

### Phase 3: Quality Validation
1. Validate production server integration
2. Ensure existing tests continue to pass unchanged
3. Test environment variable handling edge cases manually
4. Verify error handling and fail-fast behavior

## Quality Assurance

### Type Safety Validation
- Config.port provides compile-time type safety (number)
- Layer.unwrap maintains Effect type constraints
- All configuration errors are typed through ConfigError union
- No runtime type assertions or `any` usage

### Performance Considerations
- Configuration resolved once during layer initialization
- No runtime configuration overhead after startup
- Layer.unwrap creates layers efficiently during composition
- No performance impact on request handling

### Error Handling Robustness
- Built-in validation through Config.port
- Clear error messages for invalid port values
- Proper error propagation through Effect system
- Fail-fast behavior prevents runtime issues

## Future Considerations

### Extensibility
- Pattern established for additional server configuration options
- Configuration module can be extended for host, SSL settings, etc.
- Layer.unwrap pattern supports multiple configuration dependencies
- Production server ready for additional configuration scenarios

### Monitoring and Observability
- HttpServer.withLogAddress provides startup logging
- Configuration values logged during server startup
- Error messages provide actionable feedback
- Integration with existing Effect observability patterns

### Deployment Considerations
- Standard PORT environment variable convention
- Compatible with container orchestration platforms
- Supports both fixed and dynamic port assignment strategies
- Clear documentation for operations teams