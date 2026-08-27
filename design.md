# Design: Connect Your Accounts

## 1. Design Goals

1. Make submission readiness immediately visible.
2. Keep business rules in the backend so the workflow cannot be bypassed through the UI.
3. Keep the implementation small enough for a two-hour interview task.
4. Make the frontend responsive, keyboard accessible, and explicit about asynchronous state.
5. Keep the repository boundary easy to replace with durable storage later.

## 2. System Overview

```text
React + TypeScript + Vite
        |
        | JSON over HTTP
        v
Spring Boot REST API
        |
        v
AccountService
        |
        v
InMemoryAccountRepository
        |
        v
Seeded single-client state
```

The frontend owns presentation state and request state. The backend owns account mutations, status derivation, validation, and submission eligibility.

## 2.1 Local Distribution

Provide a lower-priority Docker-based quick start for reviewers. Core account behavior, tests, and the browser workflow take priority over container polish:

- `frontend/Dockerfile`: multi-stage Node build followed by a small static web server image.
- `backend/Dockerfile`: multi-stage Maven build followed by a Java runtime image.
- `docker-compose.yml`: starts both services, publishes the frontend, and connects the frontend to the backend through a browser-reachable API URL.
- `.dockerignore` files: exclude dependencies, build output, editor files, and local secrets from build contexts.

The frontend must not use a container-only hostname such as `backend` for browser requests, because the browser runs outside the Compose network. Use a configurable API base URL and expose the backend on a host port for the browser.

## 3. Backend Design

### Build and runtime

- Use Java with Spring Boot and Maven.
- Keep the backend independently runnable with the Maven wrapper when available.
- Use Spring Boot's test support for unit and HTTP-layer tests.
- Keep the backend image multi-stage so Maven and source files are not included in the runtime image.

### Modules

- `AccountController`: maps HTTP requests and responses.
- `AccountService`: coordinates use cases and enforces business rules.
- `InMemoryAccountRepository`: stores one client, known providers, and selected accounts in memory; initializes from deterministic seed data.
- Domain records/classes: provider, account, statement, status, readiness summary, and API error models.
- `Clock` dependency: allows status rules to be deterministic in tests while production uses the server clock.

### Repository behavior

The repository owns mutable state for one application process. It exposes operations to:

- Read known providers.
- Read selected accounts.
- Add providers.
- Remove providers.
- Replace statement metadata.

The repository is seeded in its constructor or application configuration. It has no filesystem or database dependency. A new process creates a fresh copy of the seed state.

### Business rules

- Provider IDs are stable lowercase identifiers.
- Provider names are display values.
- A provider may be selected only once.
- Status is derived, not stored as mutable state.
- `MISSING` applies when there is no statement.
- `UPLOADED` applies when `statementDate >= today.minusMonths(3)`.
- `OUTDATED` applies when a statement exists and is older than that boundary.
- Future statement dates are invalid input.
- Submission requires at least one account and all accounts to be `UPLOADED`.

### Error model

Use a consistent response shape for expected errors:

```json
{
  "code": "INCOMPLETE_SUBMISSION",
  "message": "All accounts need a current statement before submission.",
  "issues": [
        { "providerId": "hsbc", "providerName": "HSBC", "status": "MISSING" }
  ]
}
```

Validation errors use appropriate `4xx` statuses. Unexpected failures are handled by a global exception handler and return a generic safe message.

## 4. API Design

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/accounts` | Read accounts, derived statuses, and readiness summary |
| GET | `/api/providers?query=` | Search available known providers |
| POST | `/api/accounts` | Add one or more providers |
| DELETE | `/api/accounts/{accountId}` | Remove an account |
| PUT | `/api/accounts/{accountId}/statement` | Add or replace statement metadata |
| POST | `/api/submit` | Perform authoritative submission validation |

The API uses JSON and ISO dates. Statement upload is metadata-only: the request contains a filename and date, and no file bytes are transferred or stored. The frontend should refetch the account snapshot after every successful mutation so the server remains the source of truth.

## 5. Data Model

### Provider

```text
id: String
name: String
```

### ClientAccount

```text
providerId: String
statement: Statement? 
```

### Statement

```text
fileName: String
statementDate: LocalDate
```

### AccountView

```text
providerId: String
providerName: String
statement: StatementView?
status: StatementStatus
```

### ReadinessSummary

```text
total: Integer
readyCount: Integer
needsAttention: Integer
canSubmit: Boolean
```

## 6. Seed Data

Seed enough variation to exercise the workflow immediately:

- Barclays: current statement, status `UPLOADED`.
- HSBC: no statement, status `MISSING`.
- Vanguard: statement older than three months, status `OUTDATED`.
- Fidelity: current statement, status `UPLOADED`.

Keep additional providers such as Monzo, Nutmeg, and AJ Bell in the known-provider catalogue so search and multi-add can be demonstrated.

## 7. Frontend Design

### Page structure

- Header with product title and a prominent readiness summary.
- Attention panel listing missing and outdated providers.
- Filter control for account status.
- Account list with provider, status, statement metadata, and row actions.
- Add-provider dialog or drawer with search and multi-select.
- Statement metadata dialog for upload and replace.
- Submit action with disabled state while incomplete and pending state while submitting.
- Inline feedback region with `aria-live` for success and error messages.

### Visual direction

Use a warm, editorial workspace rather than a generic dashboard:

- Expressive serif display type paired with a practical sans-serif body type.
- Pale neutral canvas, dark readable text, and green as the readiness accent.
- Use distinct warning and error colors for outdated and missing states.
- Keep cards limited to repeated records and dialogs; avoid nesting page sections inside cards.
- Use familiar icons for search, upload, remove, close, and submit actions with accessible labels/tooltips.
- Use subtle entrance and status-change transitions, respecting `prefers-reduced-motion`.

### Interaction states

- Initial loading: show a compact skeleton or loading label.
- Mutation pending: disable the affected control and show progress.
- Mutation success: refresh data and announce the result.
- Mutation failure: preserve the current data and show the API error.
- Empty filter result: explain that no accounts match the selected status.
- Submit success: show a clear confirmation state.
- Submit rejection: show the server-provided issue list and refresh the account snapshot.

## 8. Frontend State Strategy

Use a small stateful application component or focused hooks:

- `accounts`: latest server snapshot.
- `filter`: selected status filter.
- `providerSearch`: current query and available providers.
- `selectedProviderIds`: pending multi-select values.
- `pendingAction`: action and provider ID currently in progress.
- `feedback`: success or error message.
- `dialog`: currently open add/upload/remove interaction.

Use a typed API client rather than scattering `fetch` calls through components. After add, remove, or upload, refetch `/api/accounts` and close the successful dialog.

## 9. Testing Strategy

### Backend tests

Unit-test `AccountService` with a fixed clock and fresh in-memory repository per test. Cover status boundaries, provider exclusion, duplicate prevention, mutations, input validation, and submit gating.

### Frontend tests

Use a request mock layer and test user-visible behavior: initial readiness, filtering, multi-provider add, upload replacement, remove, submit disabled/rejected/success states, and API error rendering.

### Integration check

Run both services and complete the seeded flow in a browser. Verify that a server restart resets the in-memory state to its seed.

## 10. Trade-offs and Future Changes

In-memory state minimizes setup and makes the interview behavior deterministic, but it is not durable, multi-user, or safe for multiple backend instances. Docker Compose improves repeatability for reviewers but is a local packaging solution, not production orchestration. Production would introduce authentication, a database repository, durable file storage, optimistic concurrency, audit logging, container security, health checks, and observability. The service interface should remain stable while replacing the repository implementation.
