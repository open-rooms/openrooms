# Contributing to OpenRooms

Thank you for your interest in contributing to OpenRooms! 🎉

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Commit your changes** with a clear message
7. **Push to your fork**: `git push origin feature/amazing-feature`
8. **Open a Pull Request** with a clear description

## Development Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

```bash
./setup.sh
pnpm dev
```

## Coding Standards

- **TypeScript**: Use strict mode, no `any` types
- **Naming**: PascalCase for classes/types, camelCase for functions/variables
- **Comments**: Document complex logic and public APIs
- **Testing**: Add tests for new features (when test infrastructure is added)
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
2. Ensure your code passes linting: `pnpm lint`
3. Update the README.md if needed
4. Link any related issues in your PR description
5. Request review from maintainers

## Types of Contributions

- **Bug fixes**: Fix existing issues
- **New features**: Add new capabilities
- **Documentation**: Improve or add documentation
- **Examples**: Add example workflows or use cases
- **Tools**: Create new tool plugins
- **Node types**: Implement new workflow node types
- **LLM providers**: Add new LLM provider integrations

## Questions?

Feel free to open an issue for discussion before starting work on major changes.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
