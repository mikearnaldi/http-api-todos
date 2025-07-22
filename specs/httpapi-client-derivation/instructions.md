# HttpApi Client Derivation Feature

## Feature Overview
Implement HttpApi client derivation functionality to automatically generate type-safe HTTP clients from our existing HttpApi specifications. This enables consistent and type-safe communication between client and server code, reducing boilerplate and improving developer experience.

## User Stories
- **As a developer**, I want to derive a typed client from our HttpApi specification so that I can make API calls with full type safety
- **As a test author**, I want to use the derived client in tests to verify API behavior with the same types used by the server
- **As a maintainer**, I want client-server consistency guaranteed by shared type definitions

## Acceptance Criteria
- [ ] HttpApi client can be derived from existing API specification using `HttpApiClient.make()`
- [ ] Client provides full TypeScript type safety for requests and responses
- [ ] Client is implemented in `src/` directory for reuse across the codebase
- [ ] At least one test in `http.test.ts` demonstrates client usage for the health endpoint
- [ ] Client works with different base URLs (localhost for tests, production URLs for deployment)
- [ ] Implementation follows Effect patterns and integrates with existing FetchHttpClient

## Technical Requirements
- Use `@effect/platform` HttpApiClient for client derivation
- Integrate with existing `FetchHttpClient.layer` for HTTP transport
- Support configurable base URLs
- Maintain type safety throughout the client interface
- Follow project's Effect TypeScript patterns

## Constraints
- Must work with existing HttpApi specification without modifications
- Should integrate seamlessly with current testing setup
- Must follow project's linting and type checking standards
- No breaking changes to existing API structure

## Dependencies
- Existing HttpApi specification (TodosApi)
- @effect/platform HttpApiClient functionality
- FetchHttpClient.layer for HTTP transport
- Current test infrastructure with @effect/vitest

## Out of Scope
- Modifications to existing HttpApi specification
- Advanced client features like caching or retry logic
- Multiple client configurations for different environments
- Client middleware or interceptors