# HTTP API Todos - Effect TypeScript Project

A todo API built with the Effect TypeScript ecosystem to demonstrate AI-driven development practices. This project implements a fully-featured todo management system using SQLite for persistence and exposes a RESTful HTTP API with OpenAPI specification.

## Project Overview

This project serves as a testing ground for AI development workflows using the Effect ecosystem. It showcases how to build a robust, type-safe API using Effect's powerful abstractions.

### Features

- **Todo Management**: Full CRUD operations for todos
- **SQLite Persistence**: Lightweight database integration
- **HTTP API**: RESTful endpoints with proper error handling
- **OpenAPI Specification**: Auto-generated API documentation
- **Effect Ecosystem**: Leverages Effect's type-safe error handling, data modeling, and dependency injection
- **Composable Architecture**: Built with testable abstractions

## Technology Stack

- **Runtime**: Bun (JavaScript runtime and build tool)
- **Package Manager**: pnpm (dependency management and script execution)
- **Language**: TypeScript with strict type checking
- **Framework**: Effect TypeScript ecosystem
- **Database**: SQLite
- **API Documentation**: OpenAPI/Swagger specification
- **Code Quality**: ESLint with Effect-specific rules

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system (runtime)
- [pnpm](https://pnpm.io/) installed on your system (package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd http-api-todos

# Install dependencies (use pnpm, not bun install)
pnpm install
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Run in production mode
pnpm start

# Build for production
pnpm build
```

### Code Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Auto-fix lint issues
pnpm lint:fix
```

## Project Structure

```
├── src/
│   ├── index.ts          # Application entry point
│   ├── models/           # Data models and schemas
│   ├── routes/           # HTTP route handlers
│   ├── services/         # Business logic services
│   ├── repositories/     # Data access layer
│   └── config/           # Configuration and environment
├── docs/                 # API documentation
├── tests/                # Test suites
└── database/             # Database migrations and seeds
```

## API Endpoints

The API will provide the following endpoints:

- `GET /todos` - List all todos
- `POST /todos` - Create a new todo
- `GET /todos/:id` - Get a specific todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

## Effect Ecosystem Integration

This project demonstrates the use of various Effect libraries:

- **@effect/platform**: HTTP server and request handling
- **@effect/sql**: Database integration and query building
- **@effect/schema**: Data validation and transformation
- **@effect/openapi**: API specification generation
- **Effect Core**: Error handling, dependency injection, and composable abstractions

## Development Goals

- **Type Safety**: Leverage TypeScript and Effect's type system for compile-time guarantees
- **Error Handling**: Use Effect's structured error handling for robust error management
- **Testability**: Build composable services that are easy to unit test
- **Documentation**: Maintain comprehensive API documentation through OpenAPI
- **Performance**: Utilize Bun's performance characteristics for fast runtime and pnpm's efficiency for dependency management

## Contributing

This project is designed for experimentation with AI-assisted development. Feel free to explore different Effect patterns and contribute improvements.

## License

MIT