# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-27

### Added

#### Core Features
- Initial release of Discord Conversation Wizard
- Complete TypeScript implementation with full type safety
- Library-agnostic architecture supporting multiple Discord libraries
- Event-driven wizard system with comprehensive event hooks

#### Adapters
- **DiscordJSAdapter** - Full support for discord.js v14+
- **ErisAdapter** - Full support for Eris v0.17+
- Extensible adapter interface for adding new library support

#### Step Types
- `TEXT` - Text input with length validation
- `NUMBER` - Numeric input with min/max validation
- `SELECT_MENU` - Discord select menus with single/multi-select support
- `BUTTON` - Button interactions
- `CONFIRMATION` - Yes/No confirmation dialogs
- `ATTACHMENT` - File upload support with validation

#### Advanced Features
- **Middleware System** - Hooks for beforeStep, afterStep, onError, onComplete, onCancel
- **Step Navigation** - Back, skip, jump to step, and cancel functionality
- **Conditional Steps** - Show/hide steps based on previous responses
- **Session Persistence** - Save and resume wizard sessions
- **Data Transformation** - Transform user responses before validation
- **Custom Validation** - Flexible validation with custom error messages
- **Retry Limits** - Configurable maximum retry attempts per step
- **Multi-Select Support** - Allow multiple selections in select menus
- **Timeout Management** - Per-step and global timeout configuration

#### Developer Experience
- Full TypeScript type definitions
- Comprehensive JSDoc documentation
- Rich error messages with context
- Event system for monitoring wizard state
- Detailed API reference

#### Documentation
- Comprehensive README with examples
- Quick start guides for discord.js and Eris
- Advanced usage patterns and best practices
- Complete API reference documentation
- Contributing guidelines
- MIT License

### Infrastructure
- ESLint configuration for code quality
- Prettier configuration for code formatting
- TypeScript compilation setup
- npm package configuration
- GitHub repository setup

---

## Upcoming Features

### Planned for v1.1.0
- React-style component composition
- Step groups and nested wizards
- Built-in validators library (email, URL, phone, etc.)
- Progress indicators
- Custom component builders
- Wizard templates for common use cases

### Planned for v1.2.0
- Database adapters for session persistence (MongoDB, PostgreSQL, Redis)
- Multi-language support (i18n)
- Wizard analytics and metrics
- Rate limiting and spam protection
- Webhook support for external integrations

### Planned for v2.0.0
- Support for Discord modals
- Voice channel interactions
- Thread-based wizards
- Branching conversation flows with visualization
- AI-powered response suggestions
- Visual wizard builder

---

## Version History

### [1.0.0] - 2025-11-27
- 🎉 Initial release

[1.0.0]: https://github.com/jersuxsss/discord-conversation-wizard/releases/tag/v1.0.0
