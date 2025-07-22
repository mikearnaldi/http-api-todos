# Configurable Server Port - Implementation Plan

## Implementation Overview

This plan implements configurable server port functionality using Effect's Config API and Layer.unwrap pattern. The implementation is focused solely on the production server (`serverLive`) and does not require any changes to test infrastructure.

## Task Breakdown

### Task 1: Create Configuration Module
**File**: `src/config/server.ts`
**Estimated Time**: 10 minutes
**Priority**: High

**Subtasks**:
- [ ] Create `src/config` directory
- [ ] Create `src/config/server.ts` file
- [ ] Import Effect's Config API
- [ ] Implement `serverPortConfig` using `Config.port("PORT")`
- [ ] Apply `Config.withDefault(3000)` for fallback value
- [ ] Add comprehensive JSDoc documentation
- [ ] Export configuration for reuse

**Code Structure**:
```typescript
// File: src/config/server.ts
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

**Acceptance Criteria**:
- Configuration uses Effect's Config.port for validation
- Default value of 3000 is applied when PORT is not set
- JSDoc documentation explains usage and behavior
- Module exports serverPortConfig for reuse

### Task 2: Update Production Server
**File**: `src/http/server.ts`
**Estimated Time**: 15 minutes
**Priority**: High

**Subtasks**:
- [ ] Import Effect core modules (Effect, Layer)
- [ ] Import serverPortConfig from new config module
- [ ] Refactor serverLive to use Layer.unwrap pattern
- [ ] Integrate port configuration into BunHttpServer.layer
- [ ] Maintain existing apiLive and HttpServer.withLogAddress
- [ ] Validate server composition and exports

**Code Structure**:
```typescript
// Updated src/http/server.ts
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

**Acceptance Criteria**:
- serverLive uses Layer.unwrap pattern
- Port configuration is resolved from environment variables
- Existing layer composition is preserved
- BunHttpServer.layer receives dynamic port value

### Task 3: Code Quality Validation
**Estimated Time**: 10 minutes
**Priority**: High

**Subtasks**:
- [ ] Run `pnpm lint:fix` to fix any linting issues
- [ ] Run `pnpm typecheck` to validate TypeScript compilation
- [ ] Run `pnpm test` to ensure all existing tests pass
- [ ] Verify no breaking changes to existing functionality
- [ ] Test manual server startup with and without PORT environment variable

**Quality Gates**:
- All ESLint rules pass
- TypeScript compilation successful with no errors
- All existing tests pass (no test modifications needed)
- Manual validation of environment variable behavior

## Implementation Strategy

### Phase 1: Configuration Foundation (Task 1)
1. **Setup**: Create config directory structure
2. **Implementation**: Add port configuration using Effect's Config API
3. **Documentation**: Add comprehensive JSDoc with usage examples
4. **Validation**: Ensure proper typing and export structure

### Phase 2: Production Server Integration (Task 2)
1. **Refactoring**: Transform serverLive to use Layer.unwrap pattern
2. **Integration**: Connect port configuration to BunHttpServer layer
3. **Preservation**: Maintain existing layer composition and functionality
4. **Testing**: Verify server can start with configuration

### Phase 3: Quality Assurance (Task 3)
1. **Linting**: Fix any code style issues
2. **Type Checking**: Resolve any TypeScript errors
3. **Existing Tests**: Verify all tests continue to pass
4. **Manual Testing**: Test environment variable scenarios

## Environment Variable Testing Scenarios

### Manual Testing Requirements

**Scenario 1: Default Port Behavior**
```bash
# Test without PORT environment variable
npm start
# Should log: "Listening on http://0.0.0.0:3000"
```

**Scenario 2: Custom Port Configuration**
```bash
# Test with PORT environment variable
PORT=8080 npm start
# Should log: "Listening on http://0.0.0.0:8080"
```

**Scenario 3: Invalid Port Handling**
```bash
# Test with invalid PORT value
PORT=invalid npm start
# Should fail with clear ConfigError message
```

**Scenario 4: Out of Range Port**
```bash
# Test with out-of-range PORT value
PORT=70000 npm start
# Should fail with port range validation error
```

## Risk Assessment

### Low Risk Items
- **Configuration Module**: Simple wrapper around Effect's Config API
- **Layer Integration**: Standard Effect pattern using Layer.unwrap
- **No Test Changes**: Existing test infrastructure remains untouched

### Potential Issues
- **Import Paths**: Ensure correct relative imports for new config module
- **Effect Version**: Verify Config.port API availability in current Effect version
- **Layer Composition**: Ensure Layer.unwrap maintains proper typing

### Mitigation Strategies
- **Incremental Development**: Implement and test each component separately
- **Type Checking**: Use TypeScript to catch integration issues early
- **Manual Validation**: Test environment variable scenarios manually

## Validation Criteria

### Functional Validation
- [ ] Server starts with default port 3000 when PORT not set
- [ ] Server starts with configured port when PORT is set
- [ ] Invalid PORT values result in clear error messages
- [ ] Server logging displays correct port in startup message

### Technical Validation
- [ ] Code passes all linting rules (pnpm lint:fix)
- [ ] Code compiles without TypeScript errors (pnpm typecheck)
- [ ] All existing tests pass without modification (pnpm test)
- [ ] No breaking changes to existing functionality

### Integration Validation
- [ ] Layer.unwrap correctly resolves port configuration
- [ ] BunHttpServer.layer receives dynamic port value
- [ ] HttpServer.withLogAddress logs correct listening address
- [ ] Effect error handling works for configuration failures

## Progress Tracking

### Completion Status
- [x] Phase 1: Specifications (instructions.md)
- [x] Phase 2: Requirements Analysis (requirements.md)
- [x] Phase 3: Technical Design (design.md)
- [x] Phase 4: Implementation Planning (plan.md)
- [x] Phase 5: Implementation Execution

### Implementation Progress
- [x] Task 1: Configuration Module (src/config/server.ts)
- [x] Task 2: Production Server Integration (src/http/server.ts)
- [x] Task 3: Quality Validation

### Success Metrics
- Configuration module created with proper Effect integration
- Production server uses configurable port via Layer.unwrap
- All code quality checks pass (lint, typecheck, test)
- Manual environment variable testing validates behavior
- No regression in existing functionality
- Zero test file modifications required

## File Modification Summary

**New Files**:
- `src/config/server.ts` - Port configuration module

**Modified Files**:
- `src/http/server.ts` - Updated to use Layer.unwrap with port configuration

**Unchanged Files**:
- All test files and test utilities
- All handler implementations
- All API definitions
- All other infrastructure files

## Next Steps

Upon approval to proceed to Phase 5:
1. Execute Task 1: Create configuration module with Effect Config API
2. Execute Task 2: Integrate port configuration into production server
3. Execute Task 3: Validate code quality and functionality
4. Report completion with environment variable testing results