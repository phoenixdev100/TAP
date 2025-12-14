# 🧪 Testing Guide

Comprehensive testing documentation for TAP (Training, Academics, and Placement).

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Performance Testing](#performance-testing)
- [Test Coverage](#test-coverage)

## Testing Strategy

### Testing Pyramid

```
        ▲
       /|\
      / | \
     /  |  \  E2E Tests (5-10%)
    /   |   \
   /    |    \
  /     |     \
 /      |      \  Integration Tests (15-20%)
/       |       \
─────────────────  Unit Tests (70-80%)
```

### Test Types

| Type | Purpose | Tools | Coverage |
|------|---------|-------|----------|
| Unit | Test individual functions/components | Jest, React Testing Library | 70-80% |
| Integration | Test component interactions | Jest, Supertest | 15-20% |
| E2E | Test complete user workflows | Playwright, Cypress | 5-10% |
| Performance | Test speed and efficiency | Lighthouse, k6 | As needed |

---

## Frontend Testing

### Setup

**Install testing dependencies:**

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest @babel/preset-react vitest
```

### Unit Tests

**Example: Component Test**

```javascript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

**Example: Hook Test**

```javascript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import useAuth from '../useAuth';

describe('useAuth Hook', () => {
  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('updates user on login', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });
    
    expect(result.current.user).not.toBeNull();
    expect(result.current.user.email).toBe('user@example.com');
  });
});
```

**Example: Service Test**

```javascript
// src/services/__tests__/authService.test.ts
import axios from 'axios';
import * as authService from '../authService';

jest.mock('axios');

describe('Auth Service', () => {
  it('successfully logs in user', async () => {
    const mockResponse = {
      data: {
        token: 'jwt_token',
        user: { id: '1', email: 'user@example.com' }
      }
    };
    
    axios.post.mockResolvedValue(mockResponse);
    
    const result = await authService.login('user@example.com', 'password');
    
    expect(result.token).toBe('jwt_token');
    expect(axios.post).toHaveBeenCalledWith(
      '/api/auth/login',
      { email: 'user@example.com', password: 'password' }
    );
  });

  it('handles login error', async () => {
    const mockError = new Error('Invalid credentials');
    axios.post.mockRejectedValue(mockError);
    
    await expect(
      authService.login('user@example.com', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

### Integration Tests

**Example: Form Integration Test**

```javascript
// src/components/__tests__/LoginForm.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

describe('LoginForm Integration', () => {
  it('submits form with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      token: 'jwt_token',
      user: { id: '1', email: 'user@example.com' }
    });
    authService.login = mockLogin;

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    });
  });

  it('displays error message on failed login', async () => {
    const mockError = new Error('Invalid credentials');
    authService.login = jest.fn().mockRejectedValue(mockError);

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### Running Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

---

## Backend Testing

### Setup

**Install testing dependencies:**

```bash
cd backend
npm install --save-dev jest supertest @types/jest
```

**Create `jest.config.js`:**

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/server.js'
  ]
};
```

### Unit Tests

**Example: Model Test**

```javascript
// src/models/__tests__/User.test.js
const User = require('../User');
const mongoose = require('mongoose');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('creates user with valid data', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'student'
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe('john@example.com');
    expect(user.role).toBe('student');
  });

  it('fails to create user with duplicate email', async () => {
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: 'student'
    });

    await expect(
      User.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        role: 'student'
      })
    ).rejects.toThrow();
  });

  it('hashes password before saving', async () => {
    const user = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      role: 'student'
    });

    expect(user.password).not.toBe('password123');
  });
});
```

**Example: Controller Test**

```javascript
// src/controllers/__tests__/authController.test.js
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('registers new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('fails with duplicate email', async () => {
      await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'student'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password456',
          role: 'student'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in user with valid credentials', async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('fails with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

**Example: Service Test**

```javascript
// src/services/__tests__/emailService.test.js
const emailService = require('../emailService');

jest.mock('nodemailer');

describe('Email Service', () => {
  it('sends email successfully', async () => {
    const result = await emailService.sendEmail(
      'user@example.com',
      'Test Subject',
      '<h1>Test</h1>'
    );

    expect(result).toBe(true);
  });

  it('handles email sending error', async () => {
    jest.spyOn(emailService, 'sendEmail').mockRejectedValue(
      new Error('SMTP error')
    );

    await expect(
      emailService.sendEmail('user@example.com', 'Test', '<h1>Test</h1>')
    ).rejects.toThrow('SMTP error');
  });
});
```

### Running Backend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test User.test.js

# Run tests matching pattern
npm test -- --testNamePattern="register"
```

---

## Integration Testing

### API Integration Tests

```javascript
// tests/integration/api.integration.test.js
const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Schedule = require('../../src/models/Schedule');

describe('API Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student'
    });
    userId = user._id;

    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = response.body.data.token;
  });

  describe('Schedule API Flow', () => {
    it('creates and retrieves schedule', async () => {
      // Create schedule
      const createResponse = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: 'course_123',
          courseName: 'Data Structures',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:30',
          room: 'A101'
        });

      expect(createResponse.status).toBe(201);
      const scheduleId = createResponse.body.data.id;

      // Retrieve schedule
      const getResponse = await request(app)
        .get(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.courseName).toBe('Data Structures');
    });
  });

  describe('Assignment Submission Flow', () => {
    it('creates assignment and submits it', async () => {
      // Create assignment
      const createResponse = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: 'course_123',
          title: 'Assignment 1',
          description: 'Complete exercises',
          dueDate: '2025-01-20',
          totalMarks: 100
        });

      expect(createResponse.status).toBe(201);
      const assignmentId = createResponse.body.data.id;

      // Submit assignment
      const submitResponse = await request(app)
        .post(`/api/assignments/${assignmentId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test content'), 'submission.pdf');

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.data.status).toBe('submitted');
    });
  });
});
```

---

## E2E Testing

### Playwright Setup

**Install Playwright:**

```bash
npm install --save-dev @playwright/test
```

**Create `playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('user cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    const errorMessage = await page.locator('.error-message');
    await expect(errorMessage).toContainText('Invalid credentials');
  });
});
```

```typescript
// tests/e2e/assignments.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Assignment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'faculty@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('faculty can create assignment', async ({ page }) => {
    await page.goto('/assignments/create');
    
    await page.fill('input[name="title"]', 'Assignment 1');
    await page.fill('textarea[name="description"]', 'Complete the exercises');
    await page.fill('input[name="dueDate"]', '2025-01-20');
    await page.fill('input[name="totalMarks"]', '100');
    
    await page.click('button[type="submit"]');
    
    // Check success message
    const successMessage = await page.locator('.success-message');
    await expect(successMessage).toContainText('Assignment created');
  });

  test('student can submit assignment', async ({ page }) => {
    // Navigate to assignments
    await page.goto('/assignments');
    
    // Click on assignment
    await page.click('text=Assignment 1');
    
    // Upload file
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/submission.pdf');
    
    // Submit
    await page.click('button:has-text("Submit")');
    
    // Check success
    const successMessage = await page.locator('.success-message');
    await expect(successMessage).toContainText('Submitted successfully');
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests matching pattern
npx playwright test -g "login"

# Debug mode
npx playwright test --debug
```

---

## Performance Testing

### Lighthouse Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --view
```

### Load Testing with k6

**Install k6:**

```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-get install k6
```

**Create load test script:**

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  const url = 'http://localhost:5000/api/schedules';
  const params = {
    headers: {
      'Authorization': 'Bearer token_here',
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(url, params);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run load test:**

```bash
k6 run tests/performance/load-test.js
```

---

## Test Coverage

### Generate Coverage Reports

**Frontend:**

```bash
cd frontend
npm test -- --coverage
```

**Backend:**

```bash
cd backend
npm test -- --coverage
```

### Coverage Goals

| Type | Target |
|------|--------|
| Statements | 80%+ |
| Branches | 75%+ |
| Functions | 80%+ |
| Lines | 80%+ |

---

**Next Steps:** Proceed to [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.
