# HTTP API Integration - Instructions

## Overview

This feature implements a simple HTTP API integration using Effect's `@effect/platform` package. The goal is to create a basic HTTP server with a single GET endpoint that always returns a positive response, demonstrating the foundation for future API expansion.

## User Story

**As a developer**, I want to integrate HTTP API functionality into the todos application so that I can serve HTTP requests and build upon this foundation for future API endpoints.

## Core Requirements

### 1. Basic HTTP Server Setup
- Integrate Effect's `@effect/platform` HTTP API system
- Create a minimal HTTP server that runs on a configurable port (default: 3000)
- Use Effect's declarative approach with `HttpApi`, `HttpApiGroup`, and `HttpApiEndpoint`

### 2. Single GET Endpoint
- Create a simple GET endpoint at the root path `/`
- The endpoint should always return a successful response
- Response should be a simple string message indicating the server is working
- No path parameters, query parameters, or request body required
- No error handling needed for this basic implementation

### 3. Integration with Current Architecture
- Follow the project's Effect TypeScript patterns and conventions
- Use proper Effect error handling and composable abstractions
- Integrate with the existing build system and development workflow
- Maintain compatibility with Bun runtime

### 4. Development Experience
- Server should support hot reload during development (`pnpm dev`)
- Include basic logging to console when server starts
- Server should gracefully handle startup and shutdown

## Technical Specifications

### API Structure
```
HttpApi ("TodosApi")
└── HttpApiGroup ("Health")
    └── HttpApiEndpoint ("status") - GET /
```

### Expected Response
- **Endpoint**: `GET /`
- **Status Code**: 200 OK
- **Content-Type**: application/json
- **Response Body**: `"Server is running successfully"`

### Dependencies
- Use existing `@effect/platform` (already in project dependencies)
- Use appropriate Effect platform integration for Bun runtime
- No additional external dependencies required

## Acceptance Criteria

1. **Server Startup**: Server starts successfully on port 3000 with no errors
2. **Endpoint Accessibility**: GET request to `http://localhost:3000/` returns expected response
3. **Response Format**: Response is properly formatted JSON string
4. **Integration**: Code follows project's Effect patterns and coding standards
5. **Development Workflow**: Works with existing `pnpm dev` command
6. **Type Safety**: Full TypeScript type safety maintained throughout

## Out of Scope

- Authentication or authorization
- Multiple endpoints or complex routing
- Error handling beyond basic Effect patterns
- Database integration for this initial implementation
- Request validation or complex schemas
- Production deployment configuration
- HTTPS/TLS setup

## Success Metrics

- Server responds to GET requests within 100ms
- Zero compilation errors with `pnpm typecheck`
- Zero linting errors with `pnpm lint`
- Server starts successfully with `pnpm dev`

## Future Considerations

This basic HTTP API integration will serve as the foundation for:
- Additional CRUD endpoints for todos management
- Request/response schema validation
- Error handling and status codes
- Authentication middleware
- API documentation generation
- Client SDK generation

## Testing Requirements

- Unit tests for the HTTP endpoint handler
- Integration tests to verify server startup
- Tests should use `@effect/vitest` following project patterns
- Verify response content and status codes