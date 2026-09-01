# Contributing to IntelliPrep

Thank you for your interest in contributing to IntelliPrep! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Report issues responsibly

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in Issues tab
2. Provide a clear description of the bug
3. Include steps to reproduce
4. Attach error logs or screenshots
5. Specify your environment (OS, Browser, Node version)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Clearly describe the feature and its benefits
3. Provide use cases if applicable
4. Suggest implementation approach if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write clear commit messages following conventional commits
5. Push to your fork
6. Create a Pull Request with clear description

## Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Test-related changes
- **chore**: Build process, dependencies, etc.

### Examples:
```
feat(ai): Add response evaluation feature
fix(voice): Resolve speech synthesis initialization delay
docs: Add API endpoint documentation
refactor(frontend): Simplify state management
```

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a new branch for your work
4. Make changes and test thoroughly
5. Commit with descriptive messages

## Testing

Before submitting a PR:
- Test all modified features
- Check browser console for errors
- Verify no breaking changes
- Test with different resume formats

## Code Style

- Use 2-space indentation
- Use semicolons
- Avoid console logs in production code
- Add comments for complex logic
- Use meaningful variable names

## Questions?

Feel free to open a discussion or issue if you have questions.

Happy contributing! 🚀
