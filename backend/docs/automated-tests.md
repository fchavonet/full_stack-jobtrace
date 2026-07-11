# JobTrace - Backend: automated tests

The JobTrace backend includes an automated API test suite built with Vitest and Supertest.

These tests validate the main API behavior through real HTTP requests against the Express application, while using Prisma to prepare and clean the test database.

## Test commands

From the `backend` directory:

- Run the complete automated test suite:

```bash
npm test
```

- Run the complete test suite with detailed output for each test case:

```bash
npm run test:verbose
```

- Run the tests in watch mode during development:

```bash
npm run test:watch
```

- Run the complete test suite and generate a coverage report:

```bash
npm run test:coverage
```

## Test stack

- Node.js test environment with `NODE_ENV=test`.
- Vitest: test runner.
- Supertest: HTTP assertions against the Express application.
- Prisma: database cleanup and test data preparation.
- V8 coverage: test coverage reporting.

## Test execution strategy

The automated tests are integration-oriented API tests.

The test files are executed sequentially because they share the same test database and clean it before each test case. This avoids race conditions between test files and keeps the test results reproducible.

The test command uses:

```bash
--fileParallelism=false
```

This is intentional and documented because several test files create users, authenticate them, and manipulate related resources in the same database.

## Covered areas

The automated test suite covers the main backend features.

### Health and error handling

- API health check.
- Database health check.
- Global 404 error handling.

### Authentication

- User registration.
- Duplicate email rejection.
- Email verification.
- Login before email verification rejection.
- Login with verified account.
- Authentication cookie creation.
- JWT exclusion from login responses.
- Invalid credentials rejection.
- Current authenticated user retrieval with the authentication cookie.
- Logout.
- Authentication cookie deletion.
- Logout without an authentication cookie.
- Forgot password flow.
- Reset password flow.
- Authentication cookie creation after password reset.
- User data export.
- Account deletion.
- Authentication cookie deletion after account deletion.
- Cookie-protected route rejection without authentication.

### Profile and settings

- Authenticated user profile retrieval.
- Profile update.
- Invalid profile data rejection.
- User settings update.
- Invalid settings rejection.
- Authenticated password update.
- Authentication cookie creation after password update.
- Invalid current password rejection.
- Protected profile routes without authentication.

### Applications

- Application creation.
- Application listing.
- Single application retrieval.
- Application update.
- Application deletion.
- Invalid application data rejection.
- Unknown application handling.
- Application history retrieval.
- Protected application routes without authentication.

### Tags

- Tag creation.
- Tag listing.
- Single tag retrieval.
- Tag update.
- Tag deletion.
- Duplicate tag rejection.
- Invalid tag color rejection.
- Unknown tag handling.
- Protected tag routes without authentication.

### Contacts

- Contact creation.
- Contact listing.
- Single contact retrieval.
- Contact update.
- Contact deletion.
- Invalid contact email rejection.
- Invalid contact LinkedIn URL rejection.
- Empty update payload rejection.
- Unknown contact handling.
- Protected contact routes without authentication.

### Documents

- Document upload.
- Document listing.
- Single document retrieval.
- Document type update.
- Document download.
- Document deletion.
- Missing file rejection.
- Missing document type rejection.
- Invalid document type rejection.
- Invalid file type rejection.
- Unknown document handling.
- Protected document routes without authentication.

### Relations between resources

- Link tag to application.
- Unlink tag from application.
- Prevent duplicate tag links.
- Link contact to application.
- Update existing contact link role.
- Unlink contact from application.
- Link document to application.
- Unlink document from application.
- Prevent duplicate document links.
- Validate missing relation identifiers.
- Validate missing relation links.
- Validate relation history entries.
- Protected relation routes without authentication.

### Achievements

- Default locked achievements retrieval.
- First application achievement.
- First follow-up achievement.
- Ten applications achievement.
- First tag achievement.
- First contact achievement.
- First document achievement.
- User-scoped achievements.
- Protected achievements route without authentication.

## Latest validation result

The latest complete automated validation passed successfully:

```bash
Test Files  10 passed (10)
Tests       142 passed (142)
```

The latest coverage result was:

```bash
Statements  81.94%
Branches    73.47%
Functions   94.95%
Lines       81.94%
```

## Notes

The authentication tests verify that the JWT is stored in an HTTP cookie instead of being returned in the JSON response.

The authentication cookie is validated with the following properties:

* `HttpOnly`.
* `SameSite=Lax`.
* `Path=/`.
* `Secure` in production.

The logout tests verify that the authentication cookie is cleared by the backend.

The account deletion tests also verify that the authentication cookie is cleared after the user account is deleted.

Uploaded document files are cleaned during the tests while preserving the tracked `.gitkeep` file inside the upload directory.

Email sending is mocked in the authentication tests. This avoids sending real SMTP emails during automated test execution and keeps the test suite deterministic.

The `email.service.js` file is therefore not covered directly by automated tests, because external email delivery is intentionally isolated from the test environment.

This test suite complements the manual validation document by providing repeatable backend regression checks for the main API behavior.
