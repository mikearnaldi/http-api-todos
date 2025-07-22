# Portfinder Testing Enhancement Feature

## Feature Overview

Improve HTTP server testing reliability by replacing the current fragile port assignment strategy (port 0 with log parsing) with the `portfinder` npm package to dynamically find available ports. This enhancement will use Effect's promise integration and Layer.unwrapEffect pattern to ensure robust, type-safe port configuration for test servers.

## User Stories

- **As a developer**, I want reliable test server port assignment so that tests don't fail due to port conflicts or fragile log parsing
- **As a CI/CD engineer**, I want consistent test execution so that parallel test runs don't interfere with each other
- **As a maintainer**, I want robust test infrastructure so that port-related test failures are eliminated

## Acceptance Criteria

### Core Functionality
- [ ] Replace current port 0 strategy with `portfinder` package for test servers
- [ ] Wrap `portfinder.getPortPromise()` with `Effect.promise` for Effect integration
- [ ] Use `Layer.unwrapEffect` pattern to configure test server ports dynamically
- [ ] Ensure test servers start on genuinely available ports without conflicts
- [ ] Maintain existing test functionality while improving reliability

### Technical Integration
- [ ] Install and integrate `portfinder` npm package
- [ ] Create Effect-based port finder service using `Effect.promise`
- [ ] Update test server layers to use `Layer.unwrapEffect` with dynamic port configuration
- [ ] Remove fragile port extraction from log messages in test utilities
- [ ] Preserve existing test server interfaces and behaviors

### Quality Standards
- [ ] All existing tests continue to pass without modification
- [ ] New port finding logic is type-safe and error-handled through Effect
- [ ] Test server startup is more reliable and deterministic
- [ ] Code follows project's Effect patterns and linting standards
- [ ] Documentation reflects the new port assignment strategy

### Error Handling
- [ ] Port finding failures should crash tests immediately (fail-fast approach)
- [ ] Use `Effect.promise` to let portfinder errors bubble up as test failures
- [ ] No retry/fallback strategies needed - port unavailability indicates system issues
- [ ] Maintain test isolation and cleanup on any failures

## Technical Requirements

### Package Dependencies
- Add `portfinder` npm package as development dependency
- Use `@types/portfinder` for TypeScript support if available

### Effect Integration Patterns
- Use `Effect.promise` to wrap `portfinder.getPortPromise()` (errors should crash tests)
- Apply `Layer.unwrapEffect` pattern for port-dependent test server layers
- Follow existing Effect error handling conventions
- Maintain type safety throughout the port configuration chain

### Test Infrastructure Updates
- Update `test/utils/testServer.ts` and related test utilities
- Replace port extraction logic with direct port access
- Ensure test server layers can be configured with dynamic ports
- Maintain compatibility with existing test patterns

## Constraints

### Technical Constraints
- Must not break existing test functionality or interfaces
- Must work with both NodeHttpServer (testing) and current test patterns
- Must follow project's Effect TypeScript patterns and conventions
- Must pass all linting, type checking, and existing test suites

### Implementation Constraints
- Should not require changes to production server configuration
- Must maintain clear separation between test and production port strategies
- Should not affect test execution speed significantly
- Must be compatible with parallel test execution environments

### Backward Compatibility
- Existing test files should continue to work without modification
- Test server interfaces should remain stable
- No changes to test assertion patterns or expectations

## Dependencies

### External Dependencies
- `portfinder` npm package for dynamic port finding
- Node.js built-in networking capabilities
- Effect's promise integration (`Effect.promise`)

### Internal Dependencies
- Existing test server infrastructure (`test/utils/testServer.ts`)
- Current Layer-based testing patterns
- HttpApiBuilder and NodeHttpServer testing setup
- Effect TypeScript library and patterns

### Integration Points
- Test server layer construction and configuration
- HTTP client URL formation for test requests
- Test utility functions that interact with server ports

## Out of Scope

### Production Server Changes
- No modifications to production server port configuration
- No changes to the recently implemented configurable port feature
- Production servers continue to use environment variable configuration

### Advanced Port Management
- Port pooling or reservation strategies
- Complex port conflict resolution beyond finding available ports
- Port range restrictions or custom port selection algorithms
- Integration with container orchestration port management

### Test Framework Changes
- No modifications to Vitest or @effect/vitest configuration
- No changes to test runner or execution strategies
- No alterations to test file organization or naming conventions

### Performance Optimizations
- No caching of port assignments across test runs
- No optimization for specific testing environments or CI systems
- No advanced port assignment strategies beyond basic availability checking

## Success Metrics

### Reliability Improvements
- Elimination of test failures due to port conflicts
- Consistent test server startup across different environments
- Reduced flakiness in HTTP integration tests

### Code Quality
- Type-safe port configuration through Effect system
- Clean integration with existing Layer-based testing patterns
- Proper error handling for port finding failures

### Development Experience
- More predictable test execution behavior
- Clearer error messages when port issues occur
- Maintained simplicity in test server usage patterns