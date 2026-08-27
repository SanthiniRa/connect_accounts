# Requirements: Connect Your Accounts

## 1. Purpose

A client must provide a recent statement for every bank, pension, or investment provider they hold money with before an adviser can give advice. The application should make the client's progress and readiness to submit obvious.

## 2. Scope

### Technical baseline

- Frontend: React, TypeScript, and Vite.
- Backend: Java, Spring Boot, and Maven.
- Repository: one seeded in-memory repository for the current server run.
- Distribution: Docker images for the frontend and backend, orchestrated locally with Docker Compose.

### In scope

- One implicit client.
- A deterministic set of known providers.
- A seeded set of providers already added to the client's accounts.
- Adding one or more known providers.
- Removing an added provider.
- Uploading or replacing statement metadata only: a filename and statement date; no file bytes are accepted or stored.
- Filtering the account list by statement status.
- Server-side validation of submission readiness.
- In-memory repository state for the current application run.
- Loading, success, and failure feedback in the UI.

### Out of scope

- Authentication and authorization.
- Multiple clients.
- Real file upload or file storage.
- Real provider integrations.
- Deployment, scaling, and production operations.
- Durable persistence between server restarts.
- Production container orchestration, scaling, and secret management.

## 3. Domain Definitions

### Known provider

A provider in the complete catalogue that a client may hold money with. Known providers are searchable and can be selected when adding accounts.

### Client account

A provider selected for this client. A provider may appear only once in the client's account list.

### Statement

Demo metadata attached to an account. Upload means filename and date only; no file bytes are accepted or stored:

- `fileName`: non-empty filename.
- `statementDate`: ISO calendar date in `YYYY-MM-DD` format.

### Statement status

Each client account has exactly one derived status:

- `MISSING`: no statement exists.
- `UPLOADED`: a statement exists and is current.
- `OUTDATED`: a statement exists but is more than three calendar months old.

The status is derived by the backend from the statement date and the current server date. A statement dated exactly three calendar months before today is current. Future statement dates are rejected.

### Readiness

The client is ready to submit only when every added account has status `UPLOADED`. An empty account list is not considered ready; at least one account must exist.

## 4. Functional Requirements

### FR-001: View accounts

The client can see every added provider, its status, its statement filename and date when present, and an aggregate readiness summary.

### FR-002: Add providers

The client can search known providers and select several providers in one action. Providers already added to the client must be excluded from search results and cannot be added again.

### FR-003: Remove providers

The client can remove an added provider. The account list and readiness summary update after a successful removal.

### FR-004: Upload a statement

The client can provide a filename and statement date for an account. For this exercise, upload means filename and date only; no real file bytes are handled. Uploading replaces any existing statement metadata and recalculates the status.

### FR-005: Filter accounts

The client can filter the account list by `ALL`, `MISSING`, `UPLOADED`, or `OUTDATED`.

### FR-006: Submit a complete set

The client can submit when at least one account exists and all accounts have current statements. The backend is the final authority for this decision.

### FR-007: Reject incomplete submission

If any account is `MISSING` or `OUTDATED`, submission is rejected. The response identifies the providers that still need attention. This remains true even if a client bypasses frontend controls.

### FR-008: Communicate state

The client shows initial loading, action-in-progress, success, empty, and error states. A failed mutation must not silently change the displayed data.

### FR-009: Seed and repository behavior

The backend starts with one deterministic client state held by an in-memory repository. Add, remove, and statement changes remain available during the current server run and reset to seed data after restart.

## 5. API Acceptance Contract

### `GET /api/accounts`

Returns the current accounts, derived statuses, and readiness summary.

Expected response shape:

```json
{
  "accounts": [
    {
      "providerId": "barclays",
      "providerName": "Barclays",
      "statement": {
        "fileName": "statement.pdf",
        "statementDate": "2026-08-01"
      },
      "status": "UPLOADED"
    }
  ],
  "summary": {
    "total": 1,
    "readyCount": 1,
    "needsAttention": 0,
    "canSubmit": true
  }
}
```

### `GET /api/providers?query={text}`

Returns known providers whose names match the optional query, excluding providers already added to the client.

### `POST /api/accounts`

Accepts one or more provider IDs:

```json
{ "providerIds": ["hsbc", "fidelity"] }
```

Rejects unknown IDs and duplicates with a clear `4xx` response.

### `DELETE /api/accounts/{accountId}`

Removes the selected provider. Unknown or unadded providers receive a clear `4xx` response.

### `PUT /api/accounts/{accountId}/statement`

Accepts statement metadata:

```json
{ "fileName": "august.pdf", "statementDate": "2026-08-01" }
```

Rejects malformed dates, blank filenames, future dates, and unknown accounts.

### `POST /api/submit`

Returns success only when the server determines that every account is current. Otherwise it returns a structured `4xx` response containing the incomplete providers and their statuses.

## 6. Acceptance Criteria

- [x] A seeded client account list loads successfully.
- [x] Every account displays exactly one of the three defined statuses.
- [x] The readiness summary accurately reflects current, missing, and outdated statements.
- [x] Search results exclude already-added providers.
- [x] Multiple providers can be added in one operation.
- [x] Duplicate and unknown providers cannot be added.
- [x] A provider can be removed and disappears from the account list.
- [x] A statement can be uploaded or replaced with filename and date metadata.
- [x] The three-month boundary is tested: exactly three months old is current; older is outdated.
- [x] The account list can be filtered by status.
- [x] The UI prevents or guards incomplete submission.
- [x] The backend rejects incomplete submission independently of the UI.
- [x] A complete submission succeeds.
- [x] Loading, pending, success, and failure states are visible.
- [x] Mutations remain available until the server stops, then reset to seed data.
- [x] At least one meaningful frontend test and one meaningful backend test are included.
