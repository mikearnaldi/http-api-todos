# Specifications

This directory contains feature specifications following our spec-driven development approach.

## Structure

Each feature has its own directory containing:

- `instructions.md` - Initial feature requirements and user stories
- `requirements.md` - Detailed structured requirements 
- `design.md` - Technical design and implementation strategy
- `plan.md` - Implementation plan and progress tracking

## Workflow

1. **Specification Phase**: Create feature folder and document requirements/design
2. **Implementation Phase**: Follow design specifications and track progress
3. **Validation Phase**: Ensure implementation matches specifications

## Features

- [x] **[http-api-integration](./http-api-integration/)** - Basic HTTP API with health endpoint using Effect platform
- [x] **[github-actions-ci](./github-actions-ci/)** - Continuous Integration pipeline with lint, typecheck, and test automation
- [x] **[httpapi-client-derivation](./httpapi-client-derivation/)** - Derive type-safe HTTP clients from HttpApi specifications for testing and reuse
- [x] **[configurable-server-port](./configurable-server-port/)** - Make HTTP server port configurable via environment variables using Effect's Config API
- [x] **[portfinder-testing](./portfinder-testing/)** - Replace fragile port 0 testing with portfinder package for reliable test server port assignment
