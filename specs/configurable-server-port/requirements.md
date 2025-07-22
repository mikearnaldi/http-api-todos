# Configurable Server Port - Requirements

## Functional Requirements

### F1: Environment Variable Configuration
- **F1.1**: System SHALL read server port from `PORT` environment variable
- **F1.2**: Port value SHALL be parsed and validated using `Config.port()` API
- **F1.3**: System SHALL accept port values in valid range [1-65535] as enforced by Effect's Config.port
- **F1.4**: System SHALL provide clear error messages for invalid port values (non-numeric, out of range)

### F2: Default Port Behavior
- **F2.1**: System SHALL default to port 3000 when `PORT` environment variable is not set
- **F2.2**: Default port SHALL be applied using `Config.withDefault(3000)` pattern
- **F2.3**: System SHALL start successfully with default port without requiring configuration
- **F2.4**: Default port behavior SHALL be consistent across production and test environments

### F3: Server Integration
- **F3.1**: Port configuration SHALL be integrated into existing `serverLive` layer
- **F3.2**: Port configuration SHALL work with BunHttpServer.layer for production
- **F3.3**: Configuration SHALL be applied using `Layer.unwrap()` pattern for Effect compatibility
- **F3.4**: Test infrastructure SHALL remain unchanged and unaffected

### F4: Configuration Validation
- **F4.1**: System SHALL validate port numbers are within valid TCP port range [1-65535]
- **F4.2**: System SHALL reject non-numeric port values with descriptive errors
- **F4.3**: System SHALL handle empty or whitespace-only PORT environment variable as unset
- **F4.4**: Configuration errors SHALL be surfaced through Effect's error handling system

## Non-Functional Requirements

### NF1: Performance
- **NF1.1**: Port configuration SHALL have minimal impact on server startup time
- **NF1.2**: Configuration parsing SHALL occur once during layer initialization
- **NF1.3**: No runtime overhead SHALL be introduced for port resolution after startup

### NF2: Compatibility
- **NF2.1**: Changes SHALL NOT break existing server functionality
- **NF2.2**: Existing tests SHALL continue to pass without modification
- **NF2.3**: Implementation SHALL maintain backward compatibility with hard-coded port usage
- **NF2.4**: Both Bun runtime and Node runtime SHALL support the configuration

### NF3: Maintainability
- **NF3.1**: Implementation SHALL follow existing Effect patterns in the codebase
- **NF3.2**: Code SHALL pass all linting and type checking rules
- **NF3.3**: Configuration SHALL be testable in isolation
- **NF3.4**: Implementation SHALL be documented with JSDoc comments

### NF4: Reliability
- **NF4.1**: Invalid configuration SHALL fail fast during server initialization
- **NF4.2**: Configuration errors SHALL provide actionable error messages
- **NF4.3**: System SHALL gracefully handle missing environment variables
- **NF4.4**: Port conflicts SHALL be handled by the underlying HTTP server layer

## Technical Constraints

### TC1: Effect Framework Requirements
- **TC1.1**: MUST use `Config.port("PORT")` for port configuration
- **TC1.2**: MUST use `Config.withDefault(3000)` for default value
- **TC1.3**: MUST integrate configuration using `Layer.unwrap()` pattern
- **TC1.4**: MUST follow Effect's error handling patterns for configuration errors

### TC2: Architecture Constraints
- **TC2.1**: MUST NOT modify existing API endpoints or handlers
- **TC2.2**: MUST NOT change existing layer composition patterns beyond port configuration
- **TC2.3**: MUST work with existing HttpApiBuilder.serve() pattern
- **TC2.4**: MUST preserve existing HttpServer.withLogAddress functionality

### TC3: Runtime Constraints
- **TC3.1**: MUST be compatible with Bun runtime (production)
- **TC3.2**: MUST be compatible with Node runtime (testing)
- **TC3.3**: MUST NOT introduce additional dependencies beyond Effect platform
- **TC3.4**: MUST work with existing TypeScript configuration

### TC4: Testing Constraints
- **TC4.1**: MUST NOT break existing test infrastructure
- **TC4.2**: MUST NOT modify any test files or test utilities
- **TC4.3**: MUST leave test server implementation unchanged
- **TC4.4**: Test infrastructure SHALL continue working exactly as before

## Interface Requirements

### IR1: Configuration Structure
```typescript
// Port configuration using Effect Config API
const portConfig = Config.port("PORT").pipe(
  Config.withDefault(3000)
)
```

### IR2: Layer Integration Pattern
```typescript
// Layer.unwrap pattern for configuration-dependent layer creation
const serverLive = Layer.unwrap(
  Effect.gen(function* () {
    const port = yield* portConfig
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(BunHttpServer.layer({ port }))
    )
  })
)
```

### IR3: Error Handling
```typescript
// Configuration errors should be Effect-compatible
type ConfigurationError = 
  | ConfigError.InvalidData  // Invalid port format
  | ConfigError.MissingData  // Should not occur due to default
```

## Environment Variable Specification

### EV1: PORT Environment Variable
- **Variable Name**: `PORT`
- **Type**: Numeric string
- **Valid Range**: "1" to "65535"
- **Examples**: 
  - Valid: `PORT=8080`, `PORT=3000`, `PORT=80`
  - Invalid: `PORT=abc`, `PORT=0`, `PORT=70000`
- **Default Behavior**: When unset, system defaults to port 3000

### EV2: Environment Variable Handling
- **Empty String**: Treated as unset (use default)
- **Whitespace**: Trimmed before parsing
- **Leading Zeros**: Accepted and parsed correctly (e.g., "0080" → 80)
- **Case Sensitivity**: Environment variable name is case-sensitive

## Integration Requirements

### I1: Production Server Integration
- **I1.1**: `serverLive` in `src/http/server.ts` SHALL use configurable port
- **I1.2**: BunHttpServer.layer SHALL receive port from configuration
- **I1.3**: Server startup logging SHALL display configured port
- **I1.4**: Production deployment SHALL work with standard PORT environment variable

### I2: Test Infrastructure Preservation
- **I2.1**: Test infrastructure SHALL remain completely unchanged
- **I2.2**: All existing tests SHALL continue to pass without modification
- **I2.3**: Test server configuration SHALL not be affected by production port configuration
- **I2.4**: No test files SHALL be modified as part of this feature

### I3: Development Experience
- **I3.1**: Local development SHALL work without setting PORT environment variable
- **I3.2**: Port conflicts during development SHALL be resolved by setting PORT
- **I3.3**: Clear error messages SHALL guide developers when port configuration fails
- **I3.4**: Documentation SHALL explain environment variable configuration

## Acceptance Criteria Traceability

- **F1**: Maps to "Server port can be configured via PORT environment variable"
- **F2**: Maps to "Server defaults to port 3000 when PORT environment variable is not provided"
- **F3**: Maps to "Port configuration is applied using Layer.unwrap() pattern"
- **F4**: Maps to "Invalid port values result in clear error messages"
- **TC1**: Maps to "Use Config.port() API for validation"
- **I1**: Maps to "Both production and test servers support configurable ports"