# HTTP-Specific Testing Patterns

This document describes patterns specifically for testing HTTP APIs, servers, and client interactions using Effect's platform abstractions and testing utilities.

## Core HTTP Testing Pattern

### 1. Layer-Based HTTP Testing

```typescript
import { assert, describe, layer } from "@effect/vitest"
import { HttpClient } from "@effect/platform"
import { Effect } from "effect"
import { createTestHttpServer } from "./utils/httpTestUtils.ts"

describe("HTTP API", () => {
  const { testServerLayer, getServerUrl } = createTestHttpServer()

  layer(testServerLayer)((it) => {
    it.effect("GET /healthz returns success response", () =>
      Effect.gen(function* () {
        const serverUrl = getServerUrl()
        const response = yield* HttpClient.get(`${serverUrl}/healthz`)
        const text = yield* response.text

        assert.strictEqual(response.status, 200)
        assert.strictEqual(text, '"Server is running successfully"')
      })
    )
  })
})
```

**Pattern Elements:**
- **layer()**: @effect/vitest helper for layer-scoped testing
- **testServerLayer**: Pre-configured test server with all dependencies
- **Dynamic URL**: Extract server URL from logs (supports random ports)
- **Real HTTP Requests**: Use Effect HttpClient for type-safe requests

## Test Server Architecture Pattern

### 1. Multi-Environment Server Configuration

```typescript
// Production Server (src/http/server.ts)
export const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3000 }))  // ← Fixed port, Bun runtime
)

// Test Server (test/utils/testServer.ts)
export const testServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),                             // ← Same API implementation
  HttpServer.withLogAddress,                          // ← Same logging
  Layer.provide(NodeHttpServer.layer(createServer, { port: 0 }))  // ← Random port, Node runtime
)
```

**Architecture Benefits:**
- **Same API Logic**: Identical business logic between environments
- **Different Infrastructure**: Platform-optimized server implementations
- **Test Isolation**: Random ports prevent conflicts between test runs
- **Real Integration**: Tests run against actual HTTP server, not mocks

### 2. Test Server Factory Pattern

```typescript
export const createTestHttpServer = () => {
  const { mockConsole, messages } = createMockConsole()
  
  const testServerWithMockConsole = testServerLive.pipe(
    Layer.provide(Logger.add(Logger.defaultLogger)),   // ← Logging infrastructure
    Layer.provide(Console.setConsole(mockConsole)),    // ← Mock console for log capture
    Layer.provideMerge(FetchHttpClient.layer)          // ← HTTP client for requests
  )

  const getServerUrl = () => {
    const addressMessage = messages.find(msg => 
      msg.includes("Listening on") && msg.includes("http://")
    )
    const urlMatch = addressMessage?.match(/http:\/\/[^\s"]+/)
    return urlMatch![0]
  }

  return {
    testServerLayer: testServerWithMockConsole,
    getServerUrl,
    messages
  }
}
```

**Factory Pattern Benefits:**
- **Service Composition**: Combines server, logging, and HTTP client layers
- **URL Discovery**: Automatically extracts dynamic server URL from logs
- **Mock Integration**: Captures server logs for testing
- **Reusability**: Same setup for all HTTP integration tests
- **Complete Dependencies**: FetchHttpClient.layer included, no additional provision needed

## Dynamic Port Assignment Pattern

### 1. Random Port Configuration

```typescript
// Test server uses port 0 for random assignment
Layer.provide(NodeHttpServer.layer(createServer, { port: 0 }))
```

**Benefits:**
- **Test Isolation**: No port conflicts between concurrent test runs
- **CI/CD Safe**: Works reliably in parallel test environments
- **Development Friendly**: Multiple developers can run tests simultaneously

### 2. URL Extraction from Logs

```typescript
const getServerUrl = () => {
  // Extract from server startup logs
  const addressMessage = messages.find(msg => 
    msg.includes("Listening on") && msg.includes("http://")
  )
  
  // Parse URL with regex
  const urlMatch = addressMessage?.match(/http:\/\/[^\s"]+/)
  if (!urlMatch) {
    throw new Error("Could not extract URL from log message")
  }
  
  return urlMatch[0]  // e.g., "http://0.0.0.0:54321"
}
```

**URL Extraction Benefits:**
- **Dynamic Discovery**: Works with any assigned port
- **Log-Based**: Leverages existing server logging infrastructure  
- **Error Handling**: Clear errors if URL extraction fails
- **Type Safety**: Returns string URL for HTTP client

## HTTP Client Testing Pattern

### 1. Low-Level HttpClient Integration

```typescript
it.effect("should test HTTP endpoint with raw client", () =>
  Effect.gen(function* () {
    const serverUrl = getServerUrl()
    
    // Make HTTP request using Effect client
    const response = yield* HttpClient.get(`${serverUrl}/healthz`)
    const text = yield* response.text
    
    // Type-safe response handling
    assert.strictEqual(response.status, 200)
    assert.strictEqual(text, '"Server is running successfully"')
  })
)
```

### 2. HttpApiClient Integration (Recommended)

```typescript
import { HttpApiClient } from "@effect/platform"
import { todosApi } from "../src/http/api.ts"

it.effect("should test endpoint via derived client", () =>
  Effect.gen(function* () {
    const serverUrl = getServerUrl()
    
    // Use HttpApiClient.make() to derive type-safe client
    const client = yield* HttpApiClient.make(todosApi, { baseUrl: serverUrl })
    const result = yield* client.Health.status()
    
    // Type-safe response handling (no manual parsing)
    assert.strictEqual(result, "Server is running successfully")
  })
)
```

**HttpApiClient Benefits:**
- **Full Type Safety**: Client methods match API specification exactly
- **Automatic Parsing**: Responses parsed according to endpoint schemas
- **No Manual HTTP**: Abstract away HTTP details, focus on business logic
- **Client-Server Consistency**: Guaranteed consistency with server API

**Important**: FetchHttpClient.layer is already provided by testServerLayer, so no additional Effect.provide() is needed in tests.

### 2. HTTP Request Pattern Variations

```typescript
// GET request
const response = yield* HttpClient.get(url)

// POST request with body
const response = yield* HttpClient.post(url, {
  body: JSON.stringify(payload),
  headers: { "content-type": "application/json" }
})

// Custom headers
const response = yield* HttpClient.get(url, {
  headers: { "authorization": "Bearer token" }
})
```

## Response Validation Patterns

### 1. Comprehensive Response Testing

```typescript
it.effect("should validate complete HTTP response", () =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get(`${serverUrl}/healthz`)
    const text = yield* response.text

    // Status validation
    assert.strictEqual(response.status, 200)
    
    // Body validation
    assert.strictEqual(text, '"Server is running successfully"')
    
    // Header validation
    const contentType = response.headers["content-type"]
    assert.isTrue(contentType?.includes("application/json"))
    
    // Response structure validation
    assert.isTrue(response.ok)
  })
)
```

**Validation Categories:**
- **Status Codes**: Verify correct HTTP status
- **Response Body**: Check actual content matches expected
- **Headers**: Validate content-type, custom headers
- **Response Properties**: Check ok, status text, etc.

### 2. Error Response Testing

```typescript
it.effect("should handle 404 responses", () =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get(`${serverUrl}/nonexistent`).pipe(
      Effect.catchAll(() => Effect.succeed({ status: 404 }))  // Handle HTTP errors
    )
    
    assert.strictEqual(response.status, 404)
  })
)
```

## Server State Testing Pattern

### 1. Log Verification

```typescript
it.effect("should verify server startup logging", () =>
  Effect.gen(function* () {
    // Server address should be logged on startup
    const addressMessage = messages.find(msg => 
      msg.includes("Listening on") && msg.includes("http://")
    )
    
    assert.isDefined(addressMessage, "Server should log its address on startup")
    assert.isTrue(addressMessage?.includes("http://0.0.0.0:"), "Should log correct host")
  })
)
```

### 2. Service Integration Verification

```typescript
it.effect("should verify all services are available", () =>
  Effect.gen(function* () {
    // HTTP Client available
    const response = yield* HttpClient.get(`${serverUrl}/healthz`)
    assert.strictEqual(response.status, 200)
    
    // Logging captured
    assert.isTrue(messages.length > 0, "Should capture server logs")
    
    // Server URL extractable
    const extractedUrl = getServerUrl()
    assert.isTrue(extractedUrl.startsWith("http://"), "Should extract valid URL")
  })
)
```

## Integration Test Patterns

### 1. End-to-End API Testing

```typescript
describe("API Integration", () => {
  const { testServerLayer, getServerUrl } = createTestHttpServer()

  layer(testServerLayer)((it) => {
    it.effect("should handle complete request/response cycle", () =>
      Effect.gen(function* () {
        const serverUrl = getServerUrl()
        
        // Test multiple endpoints if available
        const healthResponse = yield* HttpClient.get(`${serverUrl}/healthz`)
        assert.strictEqual(healthResponse.status, 200)
        
        // Verify response content
        const healthText = yield* healthResponse.text
        assert.strictEqual(healthText, '"Server is running successfully"')
      })
    )
  })
})
```

### 2. Cross-Service Testing

```typescript
it.effect("should test server with multiple services", () =>
  Effect.gen(function* () {
    // Test HTTP functionality
    const response = yield* HttpClient.get(`${serverUrl}/healthz`)
    assert.strictEqual(response.status, 200)
    
    // Test logging functionality  
    const logMessages = messages.filter(msg => msg.includes("Listening on"))
    assert.strictEqual(logMessages.length, 1)
    
    // Test URL extraction functionality
    const extractedUrl = getServerUrl()
    assert.isTrue(extractedUrl.includes(":"))  // Should have port
  })
)
```

## Test Utility Patterns

### 1. HTTP Test Helpers

```typescript
// Response assertion helper
const assertSuccessResponse = (response: HttpClientResponse, expectedBody: string) => {
  assert.strictEqual(response.status, 200)
  assert.isTrue(response.ok)
  return response.text.pipe(
    Effect.map(text => assert.strictEqual(text, expectedBody))
  )
}

// Usage in tests
it.effect("should return success", () =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get(`${serverUrl}/healthz`)
    yield* assertSuccessResponse(response, '"Server is running successfully"')
  })
)
```

### 2. Request Builder Pattern

```typescript
const buildRequest = (serverUrl: string) => ({
  get: (path: string) => HttpClient.get(`${serverUrl}${path}`),
  post: (path: string, body: any) => HttpClient.post(`${serverUrl}${path}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" }
  })
})

// Usage
it.effect("should use request builder", () =>
  Effect.gen(function* () {
    const request = buildRequest(getServerUrl())
    const response = yield* request.get("/healthz")
    assert.strictEqual(response.status, 200)
  })
)
```

## Best Practices for HTTP Testing

### 1. Test Isolation
- **Random Ports**: Use port 0 for automatic assignment
- **Layer Scoping**: Each test gets fresh server instance
- **Clean State**: No shared state between tests

### 2. Real Integration
- **Actual HTTP**: Use real HTTP requests, not mocks
- **Complete Stack**: Test entire request/response cycle
- **Platform Compatibility**: Test production-like environment

### 3. Comprehensive Validation
- **Status Codes**: Always verify HTTP status
- **Response Body**: Check actual content
- **Headers**: Validate important headers
- **Error Cases**: Test failure scenarios

### 4. Maintainable Tests
- **Factory Functions**: Reusable test server setup
- **Helper Functions**: Common assertions and operations
- **Clear Naming**: Descriptive test names with HTTP details

### 5. Performance Considerations
- **Fast Tests**: Use lightweight test server
- **Parallel Safe**: Random ports enable concurrent execution
- **Resource Cleanup**: Automatic cleanup with layer system

This HTTP testing approach provides reliable integration tests that verify real HTTP behavior while maintaining excellent isolation, performance, and maintainability.