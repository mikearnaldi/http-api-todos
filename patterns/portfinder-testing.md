# Portfinder Testing Patterns

This document outlines the testing patterns implemented for reliable HTTP server port assignment using the `portfinder` package integrated with Effect.

## Pattern Overview

The portfinder testing pattern replaces fragile port 0 assignment with deterministic port finding, providing a unified Context.Tag service for accessing both server ports and captured console messages.

## Core Components

### 1. Port Finding Service

```typescript
// test/utils/portFinder.ts
import { Effect } from "effect"
import * as portfinder from "portfinder"

/**
 * Find an available port starting from the given port
 */
export const findAvailablePort = (startPort: number = 3000): Effect.Effect<number> =>
  Effect.promise(() => portfinder.getPortPromise({ port: startPort }))
```

**Key Characteristics:**
- **Simple Function**: Single-purpose function, not a class
- **Effect.promise**: Direct integration with fail-fast behavior
- **Default Start Port**: Uses 3000 as sensible default
- **No Error Handling**: Lets port unavailability crash tests (system issue indicator)

### 2. Unified TestServer Service

```typescript
// test/utils/testServer.ts
export class TestServer extends Context.Tag("TestServer")<
  TestServer,
  {
    readonly port: number
    readonly messages: Array<string>
    readonly getServerUrl: () => string
  }
>() {
  static layer = (port: number, messages: Array<string>) =>
    Layer.succeed(TestServer, {
      port,
      messages,
      getServerUrl: () => `http://localhost:${port}`
    })

  static url: Effect.Effect<string, never, TestServer> = Effect.gen(function*() {
    const testServer = yield* TestServer
    return testServer.getServerUrl()
  })

  static messages: Effect.Effect<Array<string>, never, TestServer> = Effect.gen(function*() {
    const testServer = yield* TestServer
    return testServer.messages
  })
}
```

**Design Benefits:**
- **Unified Service**: Single Context.Tag for both port and messages
- **Static Properties**: `url` and `messages` are properties, not functions
- **Clean API**: `yield* TestServer.url` instead of complex access patterns
- **Type Safety**: Full Effect type safety throughout

### 3. Layer-based Test Server

```typescript
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

**Layer Composition Benefits:**
- **Dynamic Configuration**: Layer.unwrapEffect resolves port before layer creation
- **Service Integration**: Provides TestServer service alongside HTTP server
- **Effect Patterns**: Follows established Effect layer composition patterns

### 4. Complete Test Infrastructure Layer

```typescript
// test/utils/httpTestUtils.ts
export const testHttpServerLayer = Layer.unwrapEffect(
  Effect.gen(function*() {
    const { messages, mockConsole } = createMockConsole()
    const port = yield* findAvailablePort()

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

**Complete Infrastructure Benefits:**
- **All-in-One**: HTTP server + port finding + console capture + HTTP client
- **Message Integration**: Links mock console messages with TestServer service
- **Layer.unwrapEffect**: Dynamic configuration of all components
- **Single Import**: Tests only need to import `testHttpServerLayer`

## Usage Patterns

### Basic HTTP Testing

```typescript
import { assert, describe, layer } from "@effect/vitest"
import { Effect } from "effect"
import { HttpClient } from "@effect/platform"

import { testHttpServerLayer } from "./utils/httpTestUtils.ts"
import { TestServer } from "./utils/testServer.ts"

describe("HTTP API", () => {
  layer(testHttpServerLayer)((it) => {
    it.effect("GET /healthz returns success response", () =>
      Effect.gen(function*() {
        const serverUrl = yield* TestServer.url
        const response = yield* HttpClient.get(`${serverUrl}/healthz`)
        
        assert.strictEqual(response.status, 200)
      }))
  })
})
```

### Testing with Message Capture

```typescript
it.effect("server logs startup message", () =>
  Effect.gen(function*() {
    const messages = yield* TestServer.messages
    const hasStartupMessage = messages.some(msg => 
      msg.includes("Listening on") && msg.includes("http://")
    )
    
    assert.isTrue(hasStartupMessage)
  }))
```

### Combined Port and Message Testing

```typescript
it.effect("comprehensive server test", () =>
  Effect.gen(function*() {
    // Access server URL
    const serverUrl = yield* TestServer.url
    const response = yield* HttpClient.get(`${serverUrl}/healthz`)
    
    // Check captured messages
    const messages = yield* TestServer.messages
    const hasStartupLog = messages.some(msg => msg.includes("Listening on"))
    
    // Or access everything at once
    const testServer = yield* TestServer
    assert.isNumber(testServer.port)
    assert.isArray(testServer.messages)
    
    assert.strictEqual(response.status, 200)
    assert.isTrue(hasStartupLog)
  }))
```

## Pattern Advantages

### Reliability Improvements
- **Eliminates Port Conflicts**: No more race conditions from port 0 assignment
- **Deterministic**: Always finds genuinely available ports
- **Consistent**: Same behavior across development and CI environments
- **Fast-Fail**: Port issues surface immediately with clear errors

### Developer Experience
- **Clean API**: `TestServer.url` and `TestServer.messages` are intuitive
- **Single Import**: All test infrastructure from one layer
- **Type Safe**: Full Effect type checking prevents runtime errors
- **No Log Parsing**: Direct access to ports eliminates fragile text extraction

### Effect Integration
- **Layer Patterns**: Follows established Effect layer composition
- **Context Services**: Uses Context.Tag for proper dependency injection
- **Effect Composition**: All operations compose naturally with Effect.gen
- **Error Propagation**: Failures flow through Effect error system

## Migration Benefits

### Before (Port 0 + Log Parsing)
```typescript
// Fragile and error-prone
const { testServerLayer, getServerUrl } = createTestHttpServer()
const serverUrl = getServerUrl() // Parses logs, can fail
```

### After (Portfinder + Context)
```typescript
// Reliable and type-safe
layer(testHttpServerLayer)((it) => {
  it.effect("test", () => 
    Effect.gen(function*() {
      const serverUrl = yield* TestServer.url // Always works
    }))
})
```

## Best Practices

### Layer Usage
- Import `testHttpServerLayer` for complete test infrastructure
- Use `layer()` wrapper for @effect/vitest integration
- Avoid creating multiple test server instances per test suite

### Service Access
- Use `TestServer.url` for HTTP client requests
- Use `TestServer.messages` for console output verification
- Access `TestServer` directly for multiple properties

### Error Handling
- Let portfinder errors crash tests (indicates system issues)
- Don't implement retry logic for port finding
- Trust the fail-fast approach for debugging

## Implementation Files

- **`test/utils/portFinder.ts`**: Simple port finding function
- **`test/utils/testServer.ts`**: TestServer Context.Tag and basic server layer
- **`test/utils/httpTestUtils.ts`**: Complete test infrastructure layer
- **`test/http.test.ts`**: Usage examples and patterns

This pattern provides a robust, type-safe foundation for HTTP testing with Effect, eliminating the fragility of previous approaches while maintaining clean, intuitive APIs.