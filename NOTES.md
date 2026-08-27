# Notes

## Current Decisions

- Frontend: React, TypeScript, and Vite.
- Backend: Java, Spring Boot, and Maven.
- Persistence: one in-memory repository with deterministic seed data.
- Scope: one implicit client; mutations last for the current server run and reset after a backend restart.
- Uploads: metadata only, using a filename and statement date rather than real file handling.
- Statement date rule: exactly three calendar months old is current; older is outdated; future dates are rejected.
- Docker: frontend and backend are built as multi-stage images and started with Docker Compose.

## Seeded Scenario

The initial client has four accounts:

- Barclays: current statement, `UPLOADED`.
- HSBC: no statement, `MISSING`.
- Vanguard: older statement, `OUTDATED`.
- Fidelity: current statement, `UPLOADED`.

The known-provider catalogue also includes Monzo, Nutmeg, and AJ Bell for search and multi-provider add behavior.

## Quick Start With Docker

From the repository root:

```bash
docker compose up --build
```

Open http://localhost:5173 in a browser. The API is available at http://localhost:8080.

Stop the services with:

```bash
docker compose down
```

The optional Playwright end-to-end test runs against the Docker stack:

```bash
cd frontend
npm run test:e2e
```

## Local Development

The host machine needs Node.js for the frontend and Java 17 plus Maven for the backend.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

## Test Details

### Backend tests

Run the backend tests with Java 17 and Maven:

```bash
cd backend
./mvnw test
```

The backend tests cover:

- Missing, current, and outdated statement status.
- The inclusive three-month boundary.
- Future dates, blank filenames, and missing dates.
- Provider search exclusion.
- Unknown and duplicate provider rejection.
- Adding multiple providers.
- Removing an account.
- Uploading and replacing statement metadata.
- Readiness calculation using `readyCount`, `needsAttention`, and `canSubmit`.
- Incomplete submission rejection with all affected providers.
- Successful submission when every account has a current statement.

### Frontend tests

Run the React unit and interaction tests with:

```bash
cd frontend
npm test
npm run build
```

The frontend tests cover:

- Loading and displaying the account snapshot.
- Readiness summary rendering.
- Status filtering and empty filter results.
- Adding multiple providers.
- Removing a provider after confirmation.
- Uploading and replacing statement metadata.
- Disabled submit state while an account needs attention.
- Successful submission and the disabled `Submitted` state.
- Visible API loading errors.

### End-to-end test

With the Docker stack running, execute the Playwright test:

```bash
cd frontend
npm run test:e2e
```

The end-to-end test uses the browser UI to verify the complete flow: start with the seeded incomplete state, upload HSBC's statement, replace Vanguard's outdated statement, confirm all four accounts are ready, and submit successfully.

### Docker smoke test

Build and start both services with:

```bash
docker compose up --build
```

Verify:

- Frontend responds at `http://localhost:5173`.
- Backend responds at `http://localhost:8080/api/accounts`.
- The initial summary is `2 of 4 ready`.
- Mutations remain available during the server run.
- Restarting the backend restores the deterministic seed data.

## Trade-offs

In-memory state keeps the interview implementation small and deterministic, but it is not durable, multi-user, or suitable for multiple backend instances. Real production work would add authentication, a database, durable file storage, concurrency controls, health checks, audit logging, and observability.

Docker Compose improves reviewer setup and repeatability, but it is intended for local demonstration rather than production orchestration.

## Architecture Note

The frontend is responsible for presentation, user interaction, request state, and communicating readiness clearly. The backend is the source of truth for provider membership, statement status, validation, and submission eligibility. The `AccountService` coordinates use cases, while `InMemoryAccountRepository` owns the seeded mutable state for the single demo client. Status is derived from statement metadata and an injectable clock rather than stored independently, which keeps the business rule consistent and testable.

The API is intentionally small and resource-oriented: accounts can be listed, added, removed, or updated with statement metadata, while submission has its own server-side validation endpoint. This repository boundary allows the in-memory implementation to be replaced with a database-backed repository without moving business rules into controllers or the frontend.

## What I'd Do With More Time

- Add authentication and authorization, then model clients explicitly instead of relying on one implicit client.
- Replace the in-memory repository with a database and add durable storage for uploaded files.
- Add optimistic concurrency handling so simultaneous updates cannot overwrite each other silently.
- Add a real file-upload flow with file type, size, malware, and storage validation.
- Improve error handling with correlation IDs, structured logs, health checks, and metrics.
- Add stronger API contract tests and a broader Playwright suite for accessibility, mobile layouts, and failure recovery.
- Add focus trapping and focus restoration for dialogs, plus automated accessibility checks.
- Add CI to run Maven tests, frontend tests, production builds, container builds, and end-to-end tests on every change.
