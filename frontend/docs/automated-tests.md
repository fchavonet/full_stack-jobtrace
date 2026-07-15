# JobTrace - Frontend: automated tests

The JobTrace frontend includes an automated test suite built with Vitest and React Testing Library.

These tests validate the application's user interface, reusable components, business utilities, React contexts and API layer through isolated unit and integration tests executed in a JSDOM environment.

External dependencies such as HTTP requests are mocked when required to ensure deterministic, reproducible and fast test execution.

## Test commands

From the `frontend` directory:

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
- React Testing Library: component rendering and user interaction testing.
- JSDOM: browser environment simulation.
- V8 coverage: test coverage reporting.

## Test execution strategy

The automated tests focus on frontend behavior and user interactions.

Each test file is executed independently and renders React components inside an isolated JSDOM environment.

External services such as the REST API are mocked whenever possible so that the frontend logic can be validated without requiring a running backend server.

This strategy provides deterministic, reproducible and fast test execution while validating the application's business logic and user experience.

## Covered areas

The automated test suite covers the main frontend features as well as the application's reusable utilities and user interface components.

### API layer

- Authentication requests.
- Applications API.
- Contacts API.
- Documents API.
- Tags API.
- Achievements API.
- Profile API.
- Settings API.
- API client helpers.
- File download handling.
- Error propagation.

### Authentication

- Authentication context initialization.
- Session restoration.
- User registration.
- Login.
- Logout.
- Session refresh.
- Authentication state updates.
- Authentication error handling.
- Protected context validation.

### Theme management

- Light theme initialization.
- Dark theme initialization.
- Theme persistence.
- Theme switching.
- Invalid stored theme fallback.

### Toast notifications

- Information notifications.
- Success notifications.
- Warning notifications.
- Error notifications.
- Automatic dismissal.
- Toast removal.
- Provider validation.

### Dashboard

- Dashboard loading state.
- Dashboard rendering.
- Daily objective calculations.
- Upcoming follow-ups.
- Upcoming interviews.
- Statistics aggregation.
- Display helpers.
- Error handling.

### Applications

- API requests.
- Payload generation.
- Date calculations.
- Automatic follow-up generation.
- Status management.
- Sorting.
- Filtering.
- History formatting.
- Relations with contacts, tags and documents.
- Form helper utilities.

### Contacts

- API requests.
- Contact cards.
- Contact summaries.
- Contact modal.
- Contact formatting.
- Search and filtering.
- External links.
- Payload generation.

### Documents

- API requests.
- Upload workflow.
- Document modal.
- Document summaries.
- File validation.
- MIME type detection.
- Preview detection.
- Extension handling.
- File size formatting.
- Search and filtering.
- Upload error handling.

### Tags

- API requests.
- Tag selection.
- Tag removal.
- Application tag relations.
- Tag validation.
- Tag formatting utilities.
- Maximum tag validation.

### Achievements

- API requests.
- Daily objective calculations.
- Achievement normalization.
- Progress calculation.
- Activity generation.
- Achievement formatting.

### Calendar

- Calendar generation.
- Month navigation.
- Event generation.
- Event grouping.
- Date formatting.
- Event sorting.

### Profile and settings

- Profile API.
- Settings API.
- Password update requests.
- Profile formatting.
- Display helpers.
- User initials generation.

### Common utilities

- API response parsing.
- API client.
- String normalization.
- Date formatting.
- Date and time formatting.
- Salary formatting.
- File size formatting.
- Generic entity extraction.
- Error message generation.

### Routing and error handling

- Protected routes.
- Authentication redirects.
- Not Found page.
- Generic error handling.

## Latest validation result

The latest complete automated validation passed successfully:

```bash
Test Files  15 passed (15)
Tests       548 passed (548)
```

The latest coverage result was:

```bash
Statements  38.90%
Branches    45.90%
Functions   44.08%
Lines       38.89%
```

## Notes

The frontend tests validate the application's behavior independently from the backend by mocking external API requests whenever possible.

React contexts, reusable utilities and business logic are extensively tested to ensure predictable application behavior and simplify future maintenance.

Component tests simulate real user interactions such as form submissions, button clicks and state changes in order to validate the user experience.

Utility functions are covered separately to guarantee consistent formatting, filtering, data manipulation and payload generation throughout the application.

The current test coverage can still be improved, particularly for complex pages, large modal components, layout components and browser-dependent features.

However, complete frontend coverage is neither realistic nor necessarily useful. Some parts of the application depend heavily on visual rendering, responsive layouts, file previews, maps, third-party libraries or complex user flows that are better validated through manual testing or end-to-end testing.

The automated test suite therefore focuses primarily on the most reusable and critical parts of the frontend, including API clients, contexts, hooks, utilities, validation rules, data transformations and key component interactions.

The automated test suite complements the manual frontend validation document by providing reliable regression testing for the application's core features.

