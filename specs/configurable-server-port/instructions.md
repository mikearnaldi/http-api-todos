# Configurable Server Port Feature

## Feature Overview
Implement configurable HTTP server port functionality using Effect's Config API and Layer.unwrap pattern. This allows the server to be configured via environment variables while maintaining a sensible default, improving deployment flexibility and development experience.

## User Stories
- **As a developer**, I want to configure the server port via environment variables so that I can avoid port conflicts during development
- **As a DevOps engineer**, I want to set the server port through environment variables so that I can deploy to different environments with appropriate port configurations
- **As a system administrator**, I want the server to have a sensible default port so that it works out-of-the-box without configuration

## Acceptance Criteria
- [ ] Server port can be configured via `PORT` environment variable
- [ ] Server defaults to port 3000 when `PORT` environment variable is not provided
- [ ] Port configuration uses Effect's `Config.port()` API for validation
- [ ] Invalid port values (non-numeric, out of range) result in clear error messages
- [ ] Port configuration is applied using `Layer.unwrap()` pattern for proper Effect integration
- [ ] Existing server functionality is preserved without breaking changes
- [ ] Both production (BunHttpServer) and test (NodeHttpServer) servers support configurable ports
- [ ] Documentation is updated to reflect the new configuration option

## Technical Requirements
- Use `Config.port("PORT")` from Effect's Config API for port configuration
- Apply `Config.withDefault(3000)` to provide fallback value
- Integrate configuration using `Layer.unwrap()` pattern
- Maintain type safety throughout the configuration chain
- Follow existing Effect patterns in the codebase

## Constraints
- Must not break existing server initialization
- Must work with both Bun runtime (production) and Node runtime (tests)
- Must follow project's linting and type checking standards
- Should not require changes to existing test infrastructure beyond port configuration

## Dependencies
- Effect's Config API (`Config.port`, `Config.withDefault`)
- Effect's Layer API (`Layer.unwrap`)
- Existing BunHttpServer and NodeHttpServer layer implementations
- Current server architecture (`serverLive`, `testServerLive`)

## Out of Scope
- Configuration of other server options (host, SSL settings, etc.)
- Dynamic port reconfiguration at runtime
- Port conflict detection and automatic port selection
- Advanced configuration file support
- Multiple server instances with different ports