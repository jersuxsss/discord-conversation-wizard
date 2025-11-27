# Contributing to Discord Conversation Wizard

Thank you for your interest in contributing to Discord Conversation Wizard! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to uphold. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/discord-conversation-wizard.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add your commit message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- TypeScript knowledge

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

### Project Structure

```
discord-conversation-wizard/
├── src/
│   ├── adapters/
│   │   ├── AdapterInterface.ts    # Adapter interface definition
│   │   ├── DiscordJSAdapter.ts    # Discord.js implementation
│   │   └── ErisAdapter.ts         # Eris implementation
│   ├── Wizard.ts                  # Main wizard class
│   ├── types.ts                   # TypeScript type definitions
│   └── index.ts                   # Package exports
├── test/                          # Test files
├── examples/                      # Example implementations
└── dist/                          # Compiled output (generated)
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Provide proper type annotations
- Avoid `any` types when possible
- Use interfaces for object shapes
- Export types that may be useful to consumers

### Code Style

- Use 4 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Example of Good Code

```typescript
/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if valid, error message if invalid
 */
export function validateEmail(email: string): boolean | string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Invalid email address';
}
```

### Naming Conventions

- Classes: PascalCase (e.g., `Wizard`, `ErisAdapter`)
- Functions/Methods: camelCase (e.g., `startWizard`, `validateResponse`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- Private members: prefix with underscore is optional, use `private` keyword
- Interfaces: PascalCase with descriptive names (e.g., `WizardOptions`, `StepContext`)

## Pull Request Process

### Before Submitting

1. **Test your changes** - Ensure your changes work with both discord.js and Eris
2. **Update documentation** - Update README.md if you're adding features
3. **Follow code style** - Run `npm run lint` and `npm run format`
4. **Write clear commits** - Use descriptive commit messages
5. **Keep PRs focused** - One feature/fix per PR

### PR Title Format

Use conventional commit format:

- `feat: Add multi-select support for buttons`
- `fix: Correct timeout handling in ErisAdapter`
- `docs: Update README with new examples`
- `refactor: Simplify validation logic`
- `test: Add tests for step navigation`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this change?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Works with discord.js
- [ ] Works with Eris
```

## Reporting Bugs

### Before Reporting

1. Check if the issue already exists
2. Verify you're using the latest version
3. Make sure it's not a configuration issue

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Initialize wizard with...
2. Call method...
3. See error

**Expected behavior**
What you expected to happen

**Environment:**
- Library version:
- Discord library (discord.js/Eris):
- Discord library version:
- Node.js version:

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Clearly describe the use case
3. Provide examples of how it would work
4. Explain why it would be useful to other users

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## Areas for Contribution

We especially welcome contributions in these areas:

- 🧪 **Testing** - Adding comprehensive test coverage
- 📚 **Documentation** - Improving docs and examples
- 🎨 **Examples** - Creating real-world example bots
- 🐛 **Bug Fixes** - Fixing reported issues
- ✨ **Features** - Implementing requested features
- 🌐 **i18n** - Adding internationalization support
- 🔌 **Adapters** - Supporting additional Discord libraries

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new discussion on GitHub
3. Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Discord Conversation Wizard better! 🙏
