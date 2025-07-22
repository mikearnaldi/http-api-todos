# Portfinder Testing Enhancement - Technical Design

## Overview

This design implements reliable test server port assignment using the `portfinder` package integrated with Effect's `Layer.unwrapEffect` pattern. The solution replaces the fragile port 0 strategy with deterministic port finding while maintaining full backward compatibility with existing test infrastructure.

## Architecture Decisions

### AD1: Effect.promise Integration Pattern
**Decision**: Use `Effect.promise` to wrap `portfinder.getPortPromise()` calls
**Rationale**: 
- Fail-fast approach - port finding errors should crash tests immediately
- No need for complex error handling since port unavailability indicates system issues
- Maintains Effect system integration without unnecessary error recovery
- Simpler than `Effect.tryPromise` since we want failures to propagate

### AD2: Layer.unwrapEffect for Dynamic Configuration
**Decision**: Use `Layer.unwrapEffect` pattern for test server port configuration
**Rationale**:
- Allows layers to be constructed based on dynamically found ports
- Follows established Effect pattern from recent configurable-server-port feature
- Enables port resolution during layer initialization phase
- Maintains type safety and Effect composability

### AD3: Centralized Port Finding Service
**Decision**: Create dedicated port finding service module in test utilities
**Rationale**:
- Provides reusable port finding logic across test infrastructure
- Encapsulates portfinder integration and Effect wrapping
- Enables consistent port finding behavior across all test servers
- Facilitates testing and maintenance of port finding logic

### AD4: Preserve Test Interface Compatibility
**Decision**: Maintain existing test server interfaces while changing internal implementation
**Rationale**:
- Zero impact on existing test files and assertion patterns
- Backward compatibility ensures smooth migration
- Reduces risk of breaking existing test functionality
- Allows gradual adoption and validation of new approach

## Component Design

### Port Finding Service (`test/utils/portFinder.ts`)

```typescript
import { Effect } from "effect"
import * as portfinder from "portfinder"

/**
 * Find an available port starting from the given port
 *
 * Uses Effect.promise with fail-fast behavior - any portfinder errors
 * will crash the test execution as intended, since port unavailability
 * indicates system-level issues that should be investigated.
 */
export const findAvailablePort = (startPort: number = 3000): Effect.Effect<number> =>
  Effect.promise(() => portfinder.getPortPromise({ port: startPort }))
```

**Design Rationale**:
- Simple function instead of class with static methods (avoids ESLint issues)
- Effect.promise wrapper for direct portfinder integration
- Single port finding only - multiple ports not needed
- Clear documentation of fail-fast behavior

### Unified Test Server Service (`test/utils/testServer.ts`)

```typescript
import { Context, Effect, Layer } from "effect"

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
   */
  static url: Effect.Effect<string, never, TestServer> = Effect.gen(function*() {
    const testServer = yield* TestServer
    return testServer.getServerUrl()
  })

  /**
   * Get the captured console messages
   */
  static messages: Effect.Effect<Array<string>, never, TestServer> = Effect.gen(function*() {
    const testServer = yield* TestServer
    return testServer.messages
  })
}

/**
 * Test server layer with dynamic port assignment using portfinder
 */
export const testServerLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const port = yield* findAvailablePort()

    const serverLayer = HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(NodeHttpServer.layer(createServer, { port }))
    )

    const testServerLayer = TestServer.layer(port, [])

    return Layer.provideMerge(serverLayer, testServerLayer)
  })
)
```

**Design Rationale**:
- Unified Context.Tag service for both port and messages access
- Static properties instead of methods for cleaner API (`TestServer.url`, `TestServer.messages`)
- Layer.unwrapEffect pattern for dynamic port configuration
- Context-based service eliminates need for fragile log parsing
- Single service provides all test infrastructure needs

### HTTP Test Utilities Update (`test/utils/httpTestUtils.ts`)

```typescript
import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Console, Effect, Layer, Logger } from "effect"
import { createServer } from "node:http"

import { createMockConsole } from "./mockConsole.ts"
import { findAvailablePort } from "./portFinder.ts"
import { TestServer } from "./testServer.ts"

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
```

**Design Rationale**:
- Single layer provides complete test infrastructure
- Integrates portfinder with mock console and HTTP client
- Uses Layer.unwrapEffect for dynamic configuration
- Provides unified TestServer service with both port and messages
- Eliminates all fragile log parsing logic

## Error Handling Strategy

### Fail-Fast Port Finding

```typescript
// Port finding errors crash tests immediately
const portEffect = Effect.promise(() => portfinder.getPortPromise({ port: 3000 }))

// No error handling - let failures propagate
const serverLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* portEffect  // ← Any error here crashes the test
    return HttpApiBuilder.serve().pipe(
      Layer.provide(api),
      Layer.provide(NodeHttpServer.layer(createServer, { port }))
    )
  })
)
```

**Error Scenarios**:
- **No Available Ports**: System-level issue requiring investigation
- **Permission Errors**: OS-level networking problems
- **Network Stack Issues**: Environment configuration problems

**Error Handling Philosophy**:
- Port unavailability indicates serious system problems
- Tests should fail immediately rather than masking underlying issues
- Clear error messages help developers identify environmental problems
- No retry logic avoids masking intermittent system issues

## Integration Points

### Current Test Infrastructure Compatibility

**Preserved Components**:
- Test file structure and organization remains unchanged
- Existing test assertion patterns continue to work
- HTTP client integration maintains current interfaces
- @effect/vitest integration patterns preserved

**Enhanced Components**:
- Test server layer creation now uses dynamic ports
- Port assignment is deterministic and reliable
- URL formation is explicit rather than extracted from logs
- Layer composition maintains Effect type safety

### Package Integration

**Package Management**:
```json
// package.json additions
{
  "devDependencies": {
    "portfinder": "^1.0.32",
    "@types/portfinder": "^1.0.4"
  }
}
```

**Import Strategy**:
```typescript
// ES module import for portfinder
import * as portfinder from "portfinder"

// Effect integration
import { Effect, Layer } from "effect"
```

## Implementation Strategy

### Phase 1: Core Port Finding Service
1. Install portfinder package and types
2. Create `test/utils/portFinder.ts` with Effect integration
3. Implement basic port finding service with fail-fast behavior
4. Add comprehensive JSDoc documentation

### Phase 2: Test Server Layer Enhancement
1. Update `test/utils/testServer.ts` to use portfinder service
2. Implement Layer.unwrapEffect pattern for dynamic port configuration
3. Create utility functions for common test server patterns
4. Ensure backward compatibility with existing interfaces

### Phase 3: Integration Testing and Validation
1. Run existing test suite to verify no regressions
2. Validate port assignment reliability across multiple test runs
3. Test parallel execution scenarios for port conflict elimination
4. Verify error handling behavior with port exhaustion scenarios

### Phase 4: Documentation and Cleanup
1. Update test utility documentation to reflect new port strategy
2. Remove obsolete port extraction logic from existing utilities
3. Add pattern documentation for portfinder integration
4. Update developer documentation for test server usage

## Testing Strategy

### Unit Testing for Port Finding

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

import { PortFinderService } from "../utils/portFinder.ts"

describe("PortFinderService", () => {
  it.effect("should find available port", () =>
    Effect.gen(function* () {
      const port = yield* PortFinderService.findAvailablePort(3000)
      
      assert.isNumber(port)
      assert.isAtLeast(port, 3000)
      assert.isAtMost(port, 65535)
    }))
    
  it.effect("should find multiple unique ports", () =>
    Effect.gen(function* () {
      const ports = yield* PortFinderService.findAvailablePorts(3, 3000)
      
      assert.strictEqual(ports.length, 3)
      
      // Verify all ports are unique
      const uniquePorts = new Set(ports)
      assert.strictEqual(uniquePorts.size, 3)
      
      // Verify all ports are in valid range
      for (const port of ports) {
        assert.isAtLeast(port, 3000)
        assert.isAtMost(port, 65535)
      }
    }))
})
```

### Integration Testing with HTTP Servers

```typescript
import { HttpApiBuilder } from "@effect/platform"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

import { withTestServer } from "../utils/testServer.ts"

describe("HTTP Server Integration", () => {
  it.effect("should start server on available port", () =>
    withTestServer(testApi, (baseUrl) =>
      Effect.gen(function* () {
        // Test that server is actually listening on the assigned port
        const response = yield* HttpClient.get(`${baseUrl}/health`)
        assert.strictEqual(response.status, 200)
      })
    ))
})
```

## Quality Assurance

### Type Safety Validation
- All port configurations maintain TypeScript type safety
- Effect error types properly propagated through layer composition
- No use of `any` types or type assertions in port finding logic
- Layer.unwrapEffect maintains compile-time type checking

### Performance Considerations
- Port finding adds minimal overhead to test startup
- Single port lookup per test server instance
- No unnecessary port scanning or complex algorithms
- Efficient resource usage without port hoarding

### Reliability Improvements
- Eliminates race conditions from port 0 strategy
- Deterministic port assignment reduces test flakiness
- Clear error messages for debugging port-related issues
- Consistent behavior across development and CI environments

## Migration Path

### Backward Compatibility Strategy
1. **Phase 1**: Implement new port finding alongside existing logic
2. **Phase 2**: Switch test server creation to use portfinder internally
3. **Phase 3**: Remove obsolete port extraction logic after validation
4. **Phase 4**: Update documentation to reflect new patterns

### Risk Mitigation
- Gradual rollout with existing tests validating compatibility
- Clear rollback strategy if issues are discovered
- Comprehensive testing of edge cases and error scenarios
- Documentation updates to guide future development

### Success Criteria
- All existing tests pass without modification
- Test execution is more reliable and deterministic
- Port conflicts are eliminated in parallel test scenarios
- Developer experience is improved through better error messages