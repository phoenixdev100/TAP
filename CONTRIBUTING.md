# 🤝 Contributing Guide

Thank you for your interest in contributing to TAP (Training, Academics, and Placement)! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Report unacceptable behavior to maintainers

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing opinions
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination
- Offensive comments or personal attacks
- Trolling or deliberate disruption
- Publishing private information without consent
- Any form of abuse

---

## Getting Started

### Fork the Repository

1. Go to [TAP Repository](https://github.com/phoenixdev100/tap)
2. Click "Fork" in the top right
3. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/tap.git
cd tap
```

### Set Up Development Environment

```bash
# Install dependencies
npm install

# Frontend
cd frontend
npm install

# Backend
cd backend
npm install

# Return to root
cd ..
```

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/add-new-feature` - New features
- `fix/fix-bug-description` - Bug fixes
- `docs/update-documentation` - Documentation updates
- `refactor/improve-code` - Code refactoring
- `test/add-tests` - Adding tests

---

## Development Workflow

### Before Starting

1. Check existing issues and pull requests
2. Create an issue for discussion if needed
3. Get feedback from maintainers
4. Ensure your changes align with project goals

### During Development

```bash
# Keep your branch updated
git fetch origin
git rebase origin/main

# Make small, focused commits
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name
```

### Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Linting
npm run lint

# Build
npm run build
```

### Code Review

- Be open to feedback
- Respond to comments promptly
- Make requested changes
- Re-request review after updates

---

## Coding Standards

### Frontend (React + TypeScript)

**File Structure:**
```
src/
├── components/
│   ├── ComponentName.tsx
│   ├── ComponentName.test.tsx
│   └── index.ts
├── hooks/
├── services/
├── types/
└── utils/
```

**Component Example:**
```typescript
import React from 'react';
import { ComponentProps } from './types';

interface Props extends ComponentProps {
  title: string;
  onClick?: () => void;
}

/**
 * MyComponent - A brief description
 * @param title - The title text
 * @param onClick - Callback when clicked
 */
export const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  return (
    <div onClick={onClick}>
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;
```

**Naming Conventions:**
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Functions: camelCase (`handleSubmit`)
- Types: PascalCase (`UserType`)

**TypeScript Rules:**
- Always use explicit types
- Avoid `any` type
- Use interfaces for objects
- Use enums for constants
- Enable strict mode

**Styling:**
- Use Tailwind CSS classes
- Avoid inline styles
- Use CSS modules for complex styles
- Follow BEM naming for custom CSS

### Backend (Node.js + Express)

**File Structure:**
```
src/
├── models/
├── routes/
├── controllers/
├── middleware/
├── services/
├── utils/
└── config/
```

**Controller Example:**
```javascript
/**
 * Get user by ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Business logic
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Response
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

**Naming Conventions:**
- Files: camelCase (`userController.js`)
- Functions: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`DB_CONNECTION_TIMEOUT`)
- Classes: PascalCase (`UserModel`)

**Error Handling:**
- Use try-catch blocks
- Return appropriate HTTP status codes
- Include error messages
- Log errors for debugging

**Security:**
- Validate all inputs
- Sanitize data
- Use parameterized queries
- Hash passwords
- Validate JWT tokens

---

## Commit Guidelines

### Conventional Commits

Follow the [Conventional Commits](https://conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process or dependencies

### Examples

```bash
# Feature
git commit -m "feat(auth): add JWT token refresh endpoint"

# Bug fix
git commit -m "fix(schedule): correct date filtering logic"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple lines
git commit -m "feat(assignments): add file upload support

- Support PDF, DOC, DOCX files
- Validate file size
- Store in uploads directory

Closes #123"
```

---

## Pull Request Process

### Before Creating PR

1. **Update your branch:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests:**
   ```bash
   npm test
   npm run lint
   ```

3. **Build project:**
   ```bash
   npm run build
   ```

### Creating PR

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to GitHub and click "New Pull Request"

3. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings generated
```

### PR Review

- Respond to feedback promptly
- Make requested changes
- Push updates to the same branch
- Re-request review
- Be patient and respectful

### Merging

- Ensure all checks pass
- Squash commits if requested
- Delete branch after merge

---

## Reporting Issues

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows/macOS/Linux
- Browser: Chrome/Firefox/Safari
- Node version: 18.x
- npm version: 9.x

## Screenshots
If applicable, add screenshots

## Additional Context
Any other relevant information
```

### Before Reporting

1. Check existing issues
2. Search closed issues
3. Check documentation
4. Try to reproduce locally
5. Gather error messages and logs

---

## Feature Requests

### Feature Request Template

```markdown
## Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternative Solutions
Other possible approaches

## Additional Context
Any other relevant information
```

### Guidelines

- One feature per issue
- Be specific and detailed
- Provide use cases
- Consider implementation complexity
- Be open to discussion

---

## Development Tips

### Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm test -- --watch # Watch mode

# Backend
npm run dev          # Start dev server
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
```

### Debugging

**Frontend:**
```bash
# React DevTools
# Redux DevTools
# Browser DevTools (F12)
```

**Backend:**
```bash
# Node Inspector
node --inspect server.js

# VS Code Debugger
# Add breakpoints and debug
```

### Performance

- Use React DevTools Profiler
- Check bundle size with `npm run build`
- Monitor API response times
- Use database indexes
- Implement caching

---

## Resources

- [GitHub Help](https://help.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## Questions?

- Open an issue with the `question` label
- Check existing discussions
- Join our community chat
- Email maintainers

---

**Thank you for contributing to TAP! 🎉**
