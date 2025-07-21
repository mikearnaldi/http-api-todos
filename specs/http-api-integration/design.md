# HTTP API Integration - Design

## Architecture Overview

This design implements a simple HTTP API using Effect's platform abstractions with Bun-specific runtime integration. The architecture follows Effect's composable patterns with proper separation of concerns through the Layer system.

### High-Level Architecture

```
Application Entry Point (src/index.ts)
├── HTTP API Layer (HttpApiBuilder.serve())
│   ├── TodosApi Definition (HttpApi)
│   │   └── Health Group (HttpApiGroup)
│   │       └── Status Endpoint (HttpApiEndpoint)
│   └── Health Group Implementation (HttpApiBuilder.group)
│       └── Status Handler (Effect.succeed)
└── Bun HTTP Server Layer (BunHttpServer.layer)
    └── Server Configuration (port: 3000)
```

## API Design

### API Structure Definition

```typescript
// API Hierarchy:
TodosApi
└── Health
    └── status (GET /healthz)
```

**API Definition:**
```typescript
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

// Define the health check endpoint
const statusEndpoint = HttpApiEndpoint
  .get("status", "/healthz")
  .addSuccess(Schema.String)

// Define the Health API group
const healthGroup = HttpApiGroup
  .make("Health")
  .add(statusEndpoint)

// Define the complete API
const todosApi = HttpApi
  .make("TodosApi")
  .add(healthGroup)
```

### Endpoint Specifications

#### Status Endpoint
- **Method**: GET
- **Path**: `/healthz`
- **Name**: `status`
- **Request**: No parameters, headers, or body required
- **Response**: 
  - **Status**: 200 OK
  - **Content-Type**: application/json
  - **Body**: `"Server is running successfully"`
- **Error Handling**: No specific error responses (uses Effect defaults)

## Implementation Design

### Module Structure

```
src/
├── index.ts                 # Application entry point
├── http/
│   ├── api.ts              # API definitions (HttpApi, groups, endpoints)
│   ├── handlers/
│   │   └── health.ts       # Health group handler implementations
│   └── server.ts           # Server configuration and layers
└── ...existing files
```

### Core Components

#### 1. API Definition (`src/http/api.ts`)

```typescript
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

// Health check endpoint definition
export const statusEndpoint = HttpApiEndpoint
  .get("status", "/healthz")
  .addSuccess(Schema.String)

// Health API group definition  
export const healthGroup = HttpApiGroup
  .make("Health")
  .add(statusEndpoint)

// Main API definition
export const todosApi = HttpApi
  .make("TodosApi")
  .add(healthGroup)
```

#### 2. Health Handler Implementation (`src/http/handlers/health.ts`)

```typescript
import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { todosApi } from "../api.ts"

// Implementation of the Health group
export const healthLive = HttpApiBuilder.group(
  todosApi,
  "Health", 
  (handlers) =>
    handlers.handle(
      "status",
      () => Effect.succeed("Server is running successfully")
    )
)
```

#### 3. Server Configuration (`src/http/server.ts`)

```typescript
import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Layer } from "effect"
import { todosApi } from "./api.ts"
import { healthLive } from "./handlers/health.ts"

// Complete API implementation
const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)
)

// HTTP server layer with automatic address logging and Bun-specific implementation
export const serverLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 3000 }))
)
```

#### 4. Application Entry Point (`src/index.ts`)

```typescript
import { BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"
import { serverLive } from "./http/server.ts"

// Simple main entry point using Layer.launch
if (import.meta.main) {
  Layer.launch(serverLive).pipe(BunRuntime.runMain)
}
```

## Layer Architecture

### Dependency Graph

```
BunRuntime
└── ServerLive
    ├── HttpApiBuilder.serve()
    ├── ApiLive
    │   └── HealthLive
    └── BunHttpServer.layer({ port: 3000 })
```

### Layer Composition Strategy

1. **Bottom Layer**: `BunHttpServer.layer` - Provides the actual HTTP server
2. **API Layer**: `HttpApiBuilder.api(todosApi)` - Connects API definition to implementations  
3. **Handler Layers**: `healthLive` - Implements specific endpoint groups
4. **Server Layer**: `HttpApiBuilder.serve()` - Orchestrates the complete server
5. **Runtime Layer**: `BunRuntime` - Provides the execution environment

## Error Handling Strategy

### Default Error Handling
- Use Effect's built-in error handling patterns
- Let `@effect/platform` handle HTTP-specific errors (400, 500, etc.)
- No custom error types needed for this simple implementation

### Error Flow
```
Handler Error → Effect Error → HttpApiBuilder → HTTP Response
```

### Logging Strategy
```typescript
// Startup logging
yield* Effect.log("Starting HTTP API server...")
yield* Effect.log("Server running at http://localhost:3000")

// Error logging  
Effect.tapErrorCause(Effect.logError)
```

## Configuration Design

### Server Configuration
```typescript
// Default configuration
const defaultConfig = {
  port: 3000,
  hostname: "localhost"
}

// Environment-based configuration (future enhancement)
const config = {
  port: Number(process.env.PORT) || 3000,
  hostname: process.env.HOST || "localhost"
}
```

### BunHttpServer Options
```typescript
BunHttpServer.layer({
  port: 3000,
  // Additional Bun-specific options can be added here
  // hostname: "localhost",
  // development: true,
})
```

## Type Safety Design

### Schema Definitions
```typescript
// Response schema for the status endpoint
const StatusResponse = Schema.String

// Future: Request/Response schemas for other endpoints
const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  createdAt: Schema.DateTimeUtc
})
```

### Type Extraction
```typescript
// Extract types from schemas for use in handlers
type StatusResponse = typeof StatusResponse.Type
// Result: string

// Future type extractions
type User = typeof UserSchema.Type
```

## Development Integration

### Hot Reload Support
- The `pnpm dev` command uses `bun --watch src/index.ts`
- Bun will automatically restart the server on file changes
- Effect's Layer system enables clean shutdowns and restarts

### Development vs Production
```typescript
// Development mode detection
const isDevelopment = process.env.NODE_ENV !== "production"

// Conditional logging or configuration
const logLevel = isDevelopment ? "Debug" : "Info"
```

## Testing Strategy

### Testing Environment Considerations
Since Vitest doesn't yet work with Bun, all tests will run in Node.js environment using `@effect/platform-node` packages. This requires separate server layers for testing.

### Test Server Configuration
```typescript
// test/utils/testServer.ts
import { HttpApiBuilder, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"
import { todosApi } from "../../src/http/api.ts"
import { healthLive } from "../../src/http/handlers/health.ts"

// API implementation layer
const apiLive = HttpApiBuilder.api(todosApi).pipe(
  Layer.provide(healthLive)
)

// Test server using Node.js HTTP server for Vitest compatibility
export const testServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(apiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 0 })) // Random port
)
```

### Test Utilities
```typescript
// test/utils/httpTestUtils.ts
import { FetchHttpClient } from "@effect/platform"
import { Console, Layer, Logger } from "effect"
import { createMockConsole } from "./mockConsole.ts"
import { testServerLive } from "./testServer.ts"

export const createTestHttpServer = () => {
  const { mockConsole, messages } = createMockConsole()
  
  const testServerWithMockConsole = testServerLive.pipe(
    Layer.provide(Logger.add(Logger.defaultLogger)),
    Layer.provide(Console.setConsole(mockConsole)),
    Layer.provideMerge(FetchHttpClient.layer)
  )

  const getServerUrl = () => {
    const addressMessage = messages.find(msg => 
      msg.includes("Listening on") && msg.includes("http://")
    )
    if (!addressMessage) {
      throw new Error("Server address not found in logs")
    }

    const urlMatch = addressMessage.match(/http:\/\/[^\s"]+/)
    if (!urlMatch) {
      throw new Error("Could not extract URL from log message")
    }
    
    return urlMatch[0]
  }

  return {
    testServerLayer: testServerWithMockConsole,
    getServerUrl,
    messages
  }
}
```

### Unit Testing Approach
```typescript
// Test the API definition
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("TodosApi", () => {
  it.effect("should define the correct structure", () =>
    Effect.gen(function* () {
      // Test API structure and endpoint definitions
      assert.strictEqual(todosApi.identifier, "TodosApi")
      // Additional structural assertions
    })
  )
})
```

### Handler Testing
```typescript
// Test handler implementations
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("Health Handlers", () => {
  it.effect("should return success message", () =>
    Effect.gen(function* () {
      const result = yield* Effect.succeed("Server is running successfully")
      assert.strictEqual(result, "Server is running successfully")
    })
  )
})
```

### Integration Testing
```typescript
// Test the complete server using Effect HTTP Client
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

## Extension Points

### Future API Endpoints
The current design supports easy extension:

```typescript
// Adding new endpoints to existing groups
const healthGroupExtended = healthGroup
  .add(HttpApiEndpoint.get("ping", "/ping").addSuccess(Schema.String))

// Adding new groups
const todosGroup = HttpApiGroup.make("Todos")
  .add(HttpApiEndpoint.get("list", "/todos").addSuccess(Schema.Array(TodoSchema)))
  .add(HttpApiEndpoint.post("create", "/todos").setPayload(CreateTodoSchema))

// Adding to main API
const extendedApi = todosApi.add(todosGroup)
```

### Configuration Extensions
```typescript
// Environment-based configuration
const serverConfig = Config.all({
  port: Config.integer("PORT").pipe(Config.withDefault(3000)),
  host: Config.string("HOST").pipe(Config.withDefault("localhost"))
})
```

### Middleware Support
```typescript
// Future middleware integration points
const apiWithMiddleware = HttpApiBuilder.serve().pipe(
  // Authentication middleware
  Layer.provide(authMiddleware),
  // Logging middleware  
  Layer.provide(loggingMiddleware),
  Layer.provide(apiLive),
  Layer.provide(BunHttpServer.layer({ port: 3000 }))
)
```

## Performance Considerations

### Bun Runtime Advantages
- Fast startup time compared to Node.js
- Efficient HTTP handling with native Bun server
- Low memory footprint for simple endpoints

### Effect Platform Benefits
- Lazy evaluation reduces unnecessary computations
- Structured concurrency for handling multiple requests
- Automatic resource cleanup through Layer system

### Optimization Opportunities
- Response caching for static content
- Request deduplication for identical requests
- Connection pooling for database access (future)

## Security Design

### Basic Security Headers
```typescript
// Future enhancement: Add security middleware
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",  
  "X-Content-Type-Options": "nosniff"
}
```

### Input Validation
- Schema-based validation through `@effect/platform`
- Automatic request/response validation
- Type-safe parameter handling

## Monitoring and Observability

### Logging Integration
```typescript
// Structured logging with Effect
yield* Effect.log("Request received", { 
  method: "GET", 
  path: "/", 
  timestamp: new Date().toISOString() 
})
```

### Future Metrics
- Request duration tracking
- Error rate monitoring  
- Server health metrics
- Bun-specific performance metrics

## Dependencies and Installation

### Required Dependencies
```json
{
  "dependencies": {
    "@effect/platform": "^0.74.0",        // Need to install
    "@effect/platform-bun": "^0.74.0",    // Already available
    "effect": "^3.16.16"                  // Already available
  },
  "devDependencies": {
    "@effect/platform-node": "^0.74.0"    // Need to install for testing
  }
}
```

### Installation Command
```bash
pnpm add @effect/platform
pnpm add -D @effect/platform-node
```

### Runtime vs Testing Platform
- **Production/Development**: Uses `@effect/platform-bun` with Bun runtime for optimal performance
- **Testing**: Uses `@effect/platform-node` with Node.js runtime for Vitest compatibility

This design provides a solid foundation for HTTP API functionality while maintaining full compatibility with the existing Effect TypeScript patterns and Bun runtime environment.