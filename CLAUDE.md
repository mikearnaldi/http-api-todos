# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
**Important**: Use pnpm for package management, not bun install.
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Add new dependency
- `pnpm remove <package>` - Remove dependency

### Build and Run
- `pnpm dev` - Start development server with hot reload
- `pnpm start` - Run the application in production mode
- `pnpm build` - Build the project for production (outputs to ./dist)

### Code Quality
- `pnpm typecheck` - Run TypeScript type checking without emitting files
- `pnpm lint` - Run ESLint on source files
- `pnpm lint:fix` - Run ESLint with automatic fixes

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

### Project Structure
- `src/` - Source code directory
- `src/index.ts` - Main entry point
- Single-file project structure currently (expandable)

## Notes
- No test framework currently configured (test script returns error)
- Project appears to be set up for HTTP API todos functionality (based on name)
- Effect TypeScript ecosystem integration suggests functional programming patterns