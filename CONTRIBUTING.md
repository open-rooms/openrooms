# Contributing to OpenRooms

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a branch for your feature: `git checkout -b feature/feature-name`
4. Make changes following coding standards
5. Test changes
6. Commit changes with clear message
7. Push to your fork: `git push origin feature/feature-name`
8. Open a Pull Request with technical description

## Development Setup

```bash
pnpm install
docker-compose up -d
pnpm db:push
pnpm dev
```

## Coding Standards

- **TypeScript**: Use strict mode, no `any` types
- **Naming**: PascalCase for classes/types, camelCase for functions/variables
- **Comments**: Document complex logic and public APIs
- **Testing**: Add tests for new features
- **Linting**: Run `pnpm lint` before committing

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
feat: add new tool plugin system
fix: resolve state synchronization issue
docs: update API documentation
refactor: simplify workflow engine logic
test: add unit tests for node executors
chore: update dependencies
```

## Pull Request Process

1. Update documentation if you change APIs or functionality
2. Ensure code passes linting: `pnpm lint`
3. Update README.md if needed
4. Link related issues in PR description
5. Request review from maintainers

## Types of Contributions

- **Bug fixes**: Fix existing issues
- **New features**: Add new capabilities
- **Documentation**: Improve or add documentation
- **Tools**: Create new tool plugins
- **Node types**: Implement new workflow node types
- **LLM providers**: Add new LLM provider integrations

## Questions

Open an issue for discussion before starting work on major changes.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
