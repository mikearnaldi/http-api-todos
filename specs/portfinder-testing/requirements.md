# Portfinder Testing Enhancement - Requirements

## Functional Requirements

### F1: Portfinder Package Integration
- **F1.1**: System SHALL install `portfinder` as a development dependency
- **F1.2**: System SHALL use `portfinder.getPortPromise()` API for dynamic port assignment
- **F1.3**: System SHALL wrap portfinder promises with `Effect.promise` for Effect integration
- **F1.4**: System SHALL replace all usage of port 0 strategy in test infrastructure
- **F1.5**: System SHALL ensure genuinely available ports are assigned to test servers

### F2: Effect Integration Pattern
- **F2.1**: Port finding SHALL be integrated using `Layer.unwrapEffect` pattern
- **F2.2**: Test server layers SHALL be constructed dynamically based on found ports
- **F2.3**: Port configuration SHALL maintain type safety through Effect system
- **F2.4**: System SHALL follow existing Effect patterns and conventions in the codebase

### F3: Test Infrastructure Updates
- **F3.1**: System SHALL update `test/utils/testServer.ts` to use portfinder
- **F3.2**: System SHALL remove fragile port extraction logic from log messages
- **F3.3**: Test utilities SHALL provide direct access to assigned ports
- **F3.4**: System SHALL maintain existing test server interfaces and behaviors
- **F3.5**: All existing tests SHALL continue to pass without modification

### F4: Error Handling Strategy
- **F4.1**: Port finding failures SHALL crash tests immediately (fail-fast approach)
- **F4.2**: System SHALL use `Effect.promise` to let portfinder errors bubble up as test failures
- **F4.3**: System SHALL NOT implement retry or fallback strategies for port finding
- **F4.4**: Port unavailability SHALL be treated as a system issue requiring test failure

## Non-Functional Requirements

### NF1: Performance
- **NF1.1**: Port finding SHALL NOT significantly impact test execution speed
- **NF1.2**: Dynamic port assignment SHALL complete within reasonable timeframes
- **NF1.3**: System SHALL support parallel test execution without port conflicts
- **NF1.4**: Port finding overhead SHALL be minimal compared to test server startup time

### NF2: Reliability
- **NF2.1**: Port assignment SHALL be 100% reliable in standard development environments
- **NF2.2**: System SHALL eliminate test failures due to port conflicts
- **NF2.3**: Test server startup SHALL be deterministic and consistent
- **NF2.4**: Port finding SHALL work correctly in CI/CD environments

### NF3: Maintainability
- **NF3.1**: Code SHALL follow project's Effect TypeScript patterns and conventions
- **NF3.2**: Implementation SHALL pass all linting rules (pnpm lint:fix)
- **NF3.3**: Code SHALL compile without TypeScript errors (pnpm typecheck)
- **NF3.4**: Implementation SHALL be well-documented and self-explanatory

### NF4: Compatibility
- **NF4.1**: Solution SHALL work with NodeHttpServer for test environments
- **NF4.2**: System SHALL maintain compatibility with existing test patterns
- **NF4.3**: Implementation SHALL not affect production server configurations
- **NF4.4**: Solution SHALL be compatible with both local and CI test execution

### NF5: Type Safety
- **NF5.1**: All port configurations SHALL be type-safe through TypeScript
- **NF5.2**: Effect error types SHALL be properly propagated through the system
- **NF5.3**: Layer composition SHALL maintain compile-time type checking
- **NF5.4**: No use of `any` types or type assertions in port finding logic

## Technical Requirements

### TR1: Package Management
- **TR1.1**: Add `portfinder` package to devDependencies in package.json
- **TR1.2**: Install `@types/portfinder` if available for TypeScript support
- **TR1.3**: Ensure package versions are compatible with existing dependencies
- **TR1.4**: Update package-lock.json through pnpm install

### TR2: Effect Integration Architecture
- **TR2.1**: Create port finding service using `Effect.promise` wrapper
- **TR2.2**: Implement `Layer.unwrapEffect` pattern for test server configuration
- **TR2.3**: Integrate with existing Layer-based testing infrastructure
- **TR2.4**: Maintain Effect error propagation through layer composition

### TR3: Test Infrastructure Modifications
- **TR3.1**: Modify `test/utils/testServer.ts` to use portfinder-based port assignment
- **TR3.2**: Remove port extraction logic from HTTP server log parsing
- **TR3.3**: Update test server layer factory functions to use dynamic ports
- **TR3.4**: Preserve existing test server API interfaces for backward compatibility

### TR4: Code Quality Standards
- **TR4.1**: Implementation SHALL pass ESLint rules defined in project configuration
- **TR4.2**: Code SHALL use Effect-specific ESLint rules and patterns
- **TR4.3**: TypeScript compilation SHALL succeed without errors or warnings
- **TR4.4**: Code formatting SHALL follow dprint configuration via ESLint

## Integration Requirements

### IR1: Layer System Integration
- **IR1.1**: Port finding SHALL integrate with existing Layer.provide patterns
- **IR1.2**: Test server layers SHALL compose correctly with other test infrastructure
- **IR1.3**: Layer.unwrapEffect SHALL properly handle port configuration Effects
- **IR1.4**: Error propagation SHALL work correctly through layer composition

### IR2: Test Framework Integration
- **IR2.1**: Portfinder integration SHALL work with @effect/vitest testing framework
- **IR2.2**: Test server lifecycle SHALL remain compatible with existing patterns
- **IR2.3**: HTTP client URL formation SHALL use dynamically assigned ports
- **IR2.4**: Test cleanup SHALL work correctly with dynamic port assignment

### IR3: HTTP Server Integration
- **IR3.1**: NodeHttpServer.layer SHALL accept dynamically found ports
- **IR3.2**: Server startup logging SHALL reflect actual assigned ports
- **IR3.3**: HTTP API testing SHALL work with dynamic port assignments
- **IR3.4**: Client derivation testing SHALL integrate with new port strategy

## Constraints and Limitations

### C1: Scope Constraints
- **C1.1**: Changes SHALL be limited to test infrastructure only
- **C1.2**: Production server port configuration SHALL remain unchanged
- **C1.3**: No modifications to test framework or runner configuration
- **C1.4**: Existing test file structure and organization SHALL be preserved

### C2: Backward Compatibility
- **C2.1**: All existing test files SHALL continue to work without modification
- **C2.2**: Test server interfaces SHALL remain stable and unchanged
- **C2.3**: Test assertion patterns SHALL not require updates
- **C2.4**: Development workflow SHALL remain the same for developers

### C3: Technical Limitations
- **C3.1**: Port finding SHALL depend on Node.js networking capabilities
- **C3.2**: System SHALL work within standard OS port allocation constraints
- **C3.3**: Implementation SHALL not require elevated privileges for port access
- **C3.4**: Solution SHALL work in containerized environments

### C4: Error Handling Constraints
- **C4.1**: No graceful degradation for port finding failures
- **C4.2**: No retry mechanisms or fallback strategies required
- **C4.3**: Port conflicts SHALL result in immediate test failure
- **C4.4**: Clear error messages SHALL be provided for debugging

## Validation Criteria

### VC1: Functional Validation
- **VC1.1**: Test servers SHALL start on genuinely available ports
- **VC1.2**: Port conflicts between parallel tests SHALL be eliminated
- **VC1.3**: All existing integration tests SHALL pass without modification
- **VC1.4**: HTTP clients SHALL connect successfully to dynamically assigned ports

### VC2: Technical Validation
- **VC2.1**: Code SHALL pass pnpm lint:fix without errors
- **VC2.2**: TypeScript compilation SHALL succeed with pnpm typecheck
- **VC2.3**: All tests SHALL pass with pnpm test
- **VC2.4**: Effect patterns SHALL be correctly implemented and type-safe

### VC3: Integration Validation
- **VC3.1**: Layer.unwrapEffect SHALL correctly resolve port configurations
- **VC3.2**: Test server layers SHALL compose properly with existing infrastructure
- **VC3.3**: HTTP API testing SHALL work reliably with dynamic ports
- **VC3.4**: Client derivation tests SHALL execute successfully

### VC4: Quality Validation
- **VC4.1**: Implementation SHALL follow Effect TypeScript best practices
- **VC4.2**: Code SHALL be maintainable and well-structured
- **VC4.3**: Error handling SHALL provide clear debugging information
- **VC4.4**: Performance impact SHALL be negligible for test execution

## Dependencies

### External Dependencies
- **portfinder**: npm package for finding available ports
- **@types/portfinder**: TypeScript definitions (if available)
- **Node.js**: Built-in networking and process capabilities
- **Effect**: Promise integration and layer composition

### Internal Dependencies
- **test/utils/testServer.ts**: Primary test server infrastructure
- **Layer-based testing patterns**: Existing Effect layer composition
- **@effect/vitest**: Current testing framework integration
- **HttpApiBuilder testing**: HTTP API integration testing infrastructure

### System Dependencies
- **Operating System**: Port allocation and networking stack
- **Development Environment**: Node.js runtime and pnpm package manager
- **CI/CD Environment**: Containerized test execution capabilities
- **Network Stack**: Available port range and conflict resolution

## Success Metrics

### Reliability Metrics
- **Zero test failures** due to port conflicts in standard environments
- **100% successful** test server startup with dynamic port assignment
- **Consistent behavior** across local development and CI environments
- **Elimination** of fragile log parsing for port extraction

### Quality Metrics
- **Full type safety** maintained throughout port configuration
- **Clean integration** with existing Effect patterns and conventions
- **No breaking changes** to existing test interfaces or behaviors
- **Improved maintainability** through robust port assignment strategy

### Performance Metrics
- **Minimal overhead** added to test execution time
- **Fast port finding** that doesn't impact test startup significantly
- **Efficient resource usage** without unnecessary port scanning
- **Parallel test compatibility** without performance degradation