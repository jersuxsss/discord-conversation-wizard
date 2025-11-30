# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to the maintainer. Please do not create a public GitHub issue.

We will respond as quickly as possible and work with you to address the issue.

## Security Best Practices

When using discord-conversation-wizard:

1. **Input Validation**: The library provides built-in validation, but always validate sensitive data on your end.
2. **State Management**: Conversation state is stored in memory. Be mindful of memory usage with many concurrent conversations.
3. **Timeouts**: Configure appropriate timeouts to prevent stale conversations from consuming resources.

Thank you for helping keep discord-conversation-wizard and its users safe!
