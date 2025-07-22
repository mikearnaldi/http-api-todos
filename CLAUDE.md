# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
**Important**: Use pnpm for package management, not bun install.
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Add new dependency
- `pnpm remove <package>` - Remove dependency

### Build and Run
- `pnpm dev` - Start development server with hot reload ⚠️ **DO NOT USE** - Never run dev mode during development
- `pnpm start` - Run the application in production mode
- `pnpm build` - Build the project for production (outputs to ./dist)

**IMPORTANT**: Never run `pnpm dev` during development work. The development server should only be started by the user manually when they want to test the application. Use tests instead of running the dev server.

### Code Quality
- `pnpm typecheck` - Run TypeScript type checking without emitting files
- `pnpm lint` - Run ESLint on all TypeScript/JavaScript files (.ts, .js, .mjs)
- `pnpm lint:fix` - Run ESLint with automatic fixes on all files

### Testing
- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode
- Uses Vitest with @effect/vitest for Effect-aware testing
- Test files: `test/**/*.test.ts` and `src/**/*.test.ts`

**CRITICAL DEVELOPMENT RULE**: After EVERY file change, you MUST:
1. Run `pnpm lint:fix` immediately
2. Run `pnpm typecheck` immediately  
3. Fix ALL lint errors and type errors before proceeding
4. Do NOT continue development until both commands pass without errors

This is non-negotiable and applies to every single file modification.

### Runtime vs Package Management
- **Runtime**: Bun (executes the JavaScript/TypeScript code)
- **Package Manager**: pnpm (manages dependencies and runs scripts)
- **Build Tool**: Bun (for building the final application)

## Project Architecture

### Technology Stack
- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript with ES2022 target
- **Module System**: ESNext with bundler module resolution
- **Effect Ecosystem**: Uses Effect TypeScript library with language service plugin

### Code Style and Linting
- Uses strict ESLint configuration with Effect-specific rules
- Configured with @effect/eslint-plugin for Effect-specific patterns
- Uses dprint for code formatting via @effect/dprint ESLint rule
- Import sorting and destructuring key sorting enforced
- Line width: 120 characters, 2-space indentation
- ASI (Automatic Semicolon Insertion) style, double quotes, no trailing commas

### TypeScript Configuration
- Strict mode enabled with bundler module resolution
- Allows importing .ts extensions (Bun runtime feature)
- Effect language service plugin enabled for enhanced TypeScript support
- No emit configuration (build handled by Bun runtime)
- Incremental compilation with build info caching for faster type checking
- Path aliases configured: `http-api-todos/*` maps to `./src/*`

### Project Structure
- `src/` - Source code directory
- `src/index.ts` - Main entry point
- Single-file project structure currently (expandable)

## Development Workflow - Spec-Driven Development

This project follows a **spec-driven development** approach where every feature is thoroughly specified before implementation.

**CRITICAL RULE: NEVER IMPLEMENT WITHOUT FOLLOWING THE COMPLETE SPEC FLOW**

### Mandatory Workflow Steps

**AUTHORIZATION PROTOCOL**: Before proceeding to any phase (2-5), you MUST:
1. Present the completed work from the current phase
2. Explicitly ask for user authorization to proceed  
3. Wait for clear user approval before continuing
4. NEVER assume permission or proceed automatically

### Phase-by-Phase Process

**Phase 1**: Create `instructions.md` (initial requirements capture)
- Create feature folder and capture user requirements
- Document user stories, acceptance criteria, constraints

**Phase 2**: Derive `requirements.md` from instructions - **REQUIRES USER APPROVAL**
- Structured analysis of functional/non-functional requirements
- STOP and ask for authorization before proceeding to Phase 3

**Phase 3**: Create `design.md` from requirements - **REQUIRES USER APPROVAL** 
- Technical design and implementation strategy
- STOP and ask for authorization before proceeding to Phase 4

**Phase 4**: Generate `plan.md` from design - **REQUIRES USER APPROVAL**
- Implementation roadmap and task breakdown  
- STOP and ask for authorization before proceeding to Phase 5

**Phase 5**: Execute implementation - **REQUIRES USER APPROVAL**
- Follow the plan exactly as specified
- NEVER start implementation without explicit user approval

### Specification Structure

#### Feature Directory Listing
**File**: `specs/README.md`
- **Purpose**: Simple directory listing of all features with completion status
- **Content**: Checkbox list with feature links and brief descriptions
- **Format**: `- [x] **[feature-name](./feature-name/)** - Brief feature description`
- **Keep Simple**: No detailed documentation, just directory navigation
- **Update**: Add new features as single line entries when created

#### Individual Feature Documentation
For each feature, create a folder `specs/[feature-name]/` containing:

#### 1. `instructions.md`
- **Purpose**: Capture initial feature requirements and user stories
- **Content**: Raw requirements, use cases, acceptance criteria
- **When**: Created first when a new feature is requested

#### 2. `requirements.md` 
- **Purpose**: Detailed, structured requirements derived from instructions
- **Content**: Functional/non-functional requirements, constraints, dependencies
- **When**: Created after analyzing instructions.md

#### 3. `design.md`
- **Purpose**: Technical design and implementation strategy
- **Content**: Architecture decisions, API design, data models, Error handling, Effect patterns to use
- **When**: Created after requirements are finalized

#### 4. `plan.md`
- **Purpose**: Implementation plan and progress tracking
- **Content**: Task breakdown, development phases, progress updates, blockers/issues
- **When**: Created from design.md, updated throughout implementation

### File Templates

Each specification file should follow consistent templates:
- Include clear headings and structure
- Reference related specifications when applicable
- Maintain traceability from instructions → requirements → design → plan
- Update files as understanding evolves

### Best Practices

- **One feature per spec folder**: Keep features focused and manageable
- **Iterative refinement**: Specs can evolve but major changes should be documented
- **Cross-reference**: Link between instruction/requirement/design/plan files
- **Progress tracking**: Update plan.md regularly during implementation
- **Effect-first design**: Consider Effect patterns and error handling in design phase

## Effect TypeScript Development Patterns

### Core Principles
- **Type Safety First**: Never use `any` or type assertions - prefer explicit types
- **Effect Patterns**: Use Effect's composable abstractions
- **Early Returns**: Prefer early returns over deep nesting
- **Input Validation**: Validate inputs at system boundaries
- **Resource Safety**: Use Effect's resource management for automatic cleanup

### Mandatory Development Workflow
For every implementation task:
1. **Research**: Thoroughly understand the problem and requirements
2. **Plan**: Create detailed implementation plan (in specs/[feature]/plan.md)
3. **Implement**: Write the function/feature implementation
4. **Lint & Type Check**: Run `pnpm lint:fix` and `pnpm typecheck`
5. **Test**: Write comprehensive tests using `@effect/vitest`
6. **Validate**: Ensure all checks pass before moving forward

### Effect-Specific Patterns

#### Sequential Operations
```typescript
// Use Effect.gen() for sequential operations
const program = Effect.gen(function* () {
  const user = yield* getUser(id)
  const profile = yield* getProfile(user.profileId)
  return { user, profile }
})
```

#### Error Handling
```typescript
// Use Data.TaggedError for custom errors
class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly id: string
}> {}

// Use Effect.tryPromise for Promise integration
const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`/users/${id}`).then(r => r.json()),
    catch: () => new UserNotFound({ id })
  })
```

#### Testing Framework Selection

**CRITICAL RULE**: Choose the correct testing framework based on what you're testing:

**Use @effect/vitest for Effect code:**
- **MANDATORY** for modules working with Effect, Stream, Layer, TestClock, etc.
- Import pattern: `import { assert, describe, it } from "@effect/vitest"`
- Test pattern: `it.effect("description", () => Effect.gen(function*() { ... }))`
- **FORBIDDEN**: Never use `expect` from vitest in Effect tests - use `assert` methods

**Use regular vitest for pure TypeScript:**
- **MANDATORY** for pure functions (Array, String, Number operations, etc.)
- Import pattern: `import { describe, expect, it } from "vitest"`
- Test pattern: `it("description", () => { ... })`

#### Correct it.effect Pattern

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("UserService", () => {
  it.effect("should fetch user successfully", () =>
    Effect.gen(function* () {
      const user = yield* fetchUser("123")
      
      // Use assert methods, NOT expect
      assert.strictEqual(user.id, "123")
      assert.deepStrictEqual(user.profile, expectedProfile)
      assert.isTrue(user.active)
    }))
})
```

**IMPORTANT**: `@effect/vitest` automatically provides `TestContext` - no need to manually provide it.

#### Testing with Services
```typescript
it.effect("should work with dependency injection", () =>
  Effect.gen(function* () {
    const result = yield* UserService.getUser("123")
    assert.strictEqual(result.name, "John")
  }).pipe(
    Effect.provide(TestUserServiceLayer)
  )
)
```

#### Time-dependent Testing
```typescript
import { TestClock } from "effect/TestClock"

it.effect("should handle delays correctly", () =>
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(
      Effect.sleep("5 seconds").pipe(Effect.as("completed"))
    )
    yield* TestClock.advance("5 seconds")
    const result = yield* Fiber.join(fiber)
    assert.strictEqual(result, "completed")
  })
)
```

#### Error Testing
```typescript
it.effect("should handle errors properly", () =>
  Effect.gen(function* () {
    const result = yield* Effect.flip(failingOperation())
    assert.isTrue(result instanceof UserNotFoundError)
  })
)
```

#### Console Testing Pattern

For testing code that uses `Console.log`, `Console.error`, etc., use the provided `createMockConsole` utility:

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { createMockConsole } from "../utils/mockConsole"

it.effect("should log messages correctly", () =>
  Effect.gen(function*() {
    const { mockConsole, messages } = createMockConsole()

    yield* Console.log("Hello, World!").pipe(
      Effect.withConsole(mockConsole)
    )

    assert.strictEqual(messages.length, 1)
    assert.strictEqual(messages[0], "Hello, World!")
  }))

it.effect("should capture different console methods", () =>
  Effect.gen(function*() {
    const { mockConsole, messages } = createMockConsole()

    yield* Effect.all([
      Console.log("Info message"),
      Console.error("Error message"),
      Console.warn("Warning message")
    ]).pipe(
      Effect.withConsole(mockConsole)
    )

    assert.strictEqual(messages.length, 3)
    assert.strictEqual(messages[0], "Info message")
    assert.strictEqual(messages[1], "error: Error message")
    assert.strictEqual(messages[2], "warn: Warning message")
  }))
```

**Mock Console Implementation:**

The `createMockConsole` utility is available at `test/utils/mockConsole.ts` and provides:

- **Complete Interface Coverage**: Implements both `UnsafeConsole` and `Console.Console` interfaces
- **Message Capture**: All console output is captured in a `messages` array for assertions
- **Type Safety**: No `as any` usage - proper interface implementation
- **Effect Integration**: Wraps unsafe operations in `Effect.sync()` for the Console interface
- **Special Handling**: Handles complex cases like group options (collapsed vs regular)

**Architecture:**
1. `UnsafeConsole` - Plain functions that capture messages to an array
2. `Console.Console` - Wraps `UnsafeConsole` methods in `Effect.sync()` calls
3. Returns both the `mockConsole` and `messages` array for testing

**Key Points:**
- Import `createMockConsole` from `test/utils/mockConsole`
- Use `Effect.withConsole(mockConsole)` to provide the mock
- Access captured output via the returned `messages` array
- Each console method prefixes messages appropriately (e.g., "error:", "warn:")
- The mock handles all Console interface methods for comprehensive testing

### Problem-Solving Strategy
- **Break Down**: Split complex problems into smaller, manageable parts
- **Validate Frequently**: Run tests and type checks often during development
- **Simplest Solution**: Choose the simplest approach that meets requirements
- **Clarity Over Cleverness**: Prioritize readable, maintainable code

## Implementation Patterns

The project includes comprehensive pattern documentation for future reference and consistency:

### Pattern Directory
**Location**: `patterns/`
- **Purpose**: Detailed documentation of all implementation patterns used in the project
- **Usage**: Reference material for maintaining consistency and best practices
- **Content**: Code examples, principles, and guidelines from actual implementation

### Available Patterns
- **[patterns/http-api.md](./patterns/http-api.md)**: HTTP API definition and implementation patterns
  - Declarative API structure (endpoints → groups → APIs)
  - Handler implementation with Effect composition
  - Server configuration and platform abstraction
  
- **[patterns/layer-composition.md](./patterns/layer-composition.md)**: Layer-based dependency injection patterns
  - Service provision strategies (`Layer.provide()` vs `Layer.provideMerge()`)
  - Environment-specific configurations
  - Factory patterns for test services

- **[patterns/generic-testing.md](./patterns/generic-testing.md)**: General testing patterns with @effect/vitest
  - Service mocking with complete interface implementation
  - Effect-based test structure and assertions
  - Test data management and state capture

- **[patterns/http-specific-testing.md](./patterns/http-specific-testing.md)**: HTTP API testing patterns
  - Layer-based HTTP testing with real servers
  - Dynamic port assignment and URL extraction
  - HTTP client integration testing

### Pattern Usage Guidelines
- **Reference First**: Check patterns directory before implementing new features
- **Consistency**: Follow established patterns for similar functionality
- **Documentation**: Update patterns when introducing new implementation approaches
- **Examples**: All patterns include actual code examples from the implementation

## Notes
- Vitest with @effect/vitest configured for Effect-aware testing
- Project set up for HTTP API todos functionality with SQLite persistence
- Effect TypeScript ecosystem integration for type-safe, composable architecture
- Comprehensive implementation patterns documented for consistency and reusability