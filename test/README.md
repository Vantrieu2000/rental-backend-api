# Testing

Comprehensive testing strategy with unit tests, property-based tests, and E2E tests.

## Test Structure

```
test/
├── unit/           # Unit tests for individual components
├── property/       # Property-based tests for universal properties
├── e2e/            # End-to-end tests for complete flows
└── fixtures/       # Test data generators
```

## Testing Strategy

### 1. Unit Tests
Test individual components in isolation.

**Location**: `test/unit/`

**Purpose**:
- Test specific business logic
- Test error handling
- Test edge cases
- Test component interactions

**Example**:
```typescript
// test/unit/auth/auth.service.spec.ts
describe('AuthService', () => {
  it('should hash password before saving', async () => {
    const password = 'password123';
    const user = await authService.register({ email: 'test@test.com', password });
    expect(user.password).not.toBe(password);
    expect(await bcrypt.compare(password, user.password)).toBe(true);
  });
});
```

---

### 2. Property-Based Tests
Test universal properties across many generated inputs.

**Location**: `test/property/`

**Library**: `fast-check`

**Purpose**:
- Verify invariants hold for all inputs
- Test properties across random data
- Catch edge cases automatically
- Validate correctness properties

**Configuration**:
- Minimum 100 iterations per test
- Tag format: `Feature: rental-backend-nestjs, Property {number}: {description}`

**Example**:
```typescript
// test/property/auth.pbt.spec.ts
import * as fc from 'fast-check';

describe('Property 4: Password Hashing', () => {
  // Feature: rental-backend-nestjs, Property 4: For any user registration or password update,
  // the stored password should be a bcrypt hash and not plain text

  it('should always hash passwords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 50 }),
        fc.emailAddress(),
        async (password, email) => {
          const user = await authService.register({ email, password });
          
          // Password should not be stored as plain text
          expect(user.password).not.toBe(password);
          
          // Password should be a valid bcrypt hash
          expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/);
          
          // Should be able to verify with bcrypt
          const isValid = await bcrypt.compare(password, user.password);
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

---

### 3. E2E Tests
Test complete user flows from HTTP request to response.

**Location**: `test/e2e/`

**Purpose**:
- Test complete API flows
- Test authentication flows
- Test module interactions
- Validate API contracts

**Example**:
```typescript
// test/e2e/auth.e2e-spec.ts
describe('Authentication Flow (E2E)', () => {
  it('should complete full auth flow', async () => {
    // Register
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201);

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(200);

    const { accessToken, refreshToken } = loginResponse.body;

    // Access protected endpoint
    await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Refresh token
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    // Logout
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
```

---

### 4. Test Fixtures
Reusable test data generators.

**Location**: `test/fixtures/`

**Purpose**:
- Generate consistent test data
- Create valid test objects
- Support property-based tests
- Reduce test code duplication

**Example**:
```typescript
// test/fixtures/user.fixture.ts
import * as fc from 'fast-check';

export const userArbitrary = () =>
  fc.record({
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 }),
    name: fc.string({ minLength: 2, maxLength: 100 }),
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    role: fc.constantFrom('owner', 'manager', 'staff'),
  });

export const createTestUser = (overrides = {}) => ({
  email: 'test@test.com',
  password: 'password123',
  name: 'Test User',
  phone: '1234567890',
  role: 'owner',
  ...overrides,
});
```

---

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test -- auth.service.spec.ts
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:cov
```

### Run E2E tests
```bash
npm run test:e2e
```

### Run property-based tests only
```bash
npm test -- --testPathPattern=pbt
```

### Run unit tests only
```bash
npm test -- --testPathPattern=spec
```

---

## Test Configuration

### Jest Configuration
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

### E2E Jest Configuration
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

---

## Coverage Goals

- **Unit Test Coverage**: Minimum 80%
- **Property Test Coverage**: All correctness properties implemented
- **E2E Test Coverage**: All critical user flows tested
- **Integration Test Coverage**: All module interactions tested

---

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Clean up test data after each test
- Don't rely on test execution order

### 2. Test Database
- Use a separate test database
- Reset database between test runs
- Use in-memory MongoDB for faster tests

### 3. Mocking
- Mock external dependencies (email, SMS, etc.)
- Don't mock database for integration tests
- Use real implementations when possible

### 4. Assertions
- Use specific assertions
- Test both success and failure cases
- Verify error messages and codes

### 5. Test Data
- Use fixtures for consistent data
- Generate random data for property tests
- Use realistic test data

### 6. Test Organization
- Group related tests with `describe`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 7. Performance
- Keep tests fast
- Use parallel execution
- Optimize database operations

### 8. Documentation
- Document complex test scenarios
- Explain why tests exist
- Document test data requirements

---

## Continuous Integration

### Pre-commit Hooks
```bash
npm test
npm run lint
npm run format
```

### CI Pipeline
1. Install dependencies
2. Run linting
3. Run unit tests
4. Run property tests (100 iterations)
5. Run E2E tests
6. Generate coverage report
7. Fail if coverage < 80%

### Production Pipeline
- Run property tests with 1000+ iterations
- Run performance tests
- Run security scans

---

## Troubleshooting

### Tests Failing Randomly
- Check for test isolation issues
- Verify database cleanup
- Check for race conditions

### Slow Tests
- Use in-memory database
- Reduce test data size
- Optimize database queries
- Run tests in parallel

### Coverage Issues
- Check for untested branches
- Add tests for error cases
- Test edge cases

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
