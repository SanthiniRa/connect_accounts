# Backend Skill Guide

## Purpose

Provide the authoritative account and statement workflow for one client. The backend owns provider mutations, status derivation, validation, readiness, and submission authorization.

## Technology

- Java with Spring Boot.
- Maven for dependency management, builds, and tests.
- REST endpoints returning JSON.
- Use `LocalDate` for statement dates.
- Use an injectable `Clock` so date rules are deterministic in tests.

## Repository

Implement an `InMemoryAccountRepository` with deterministic seed data loaded at application startup.

The repository must:

- Store the known provider catalogue.
- Store the selected accounts for one implicit client.
- Support reads, multi-provider adds, removals, and statement replacement.
- Reject or prevent duplicate selected providers.
- Keep mutations for the current server process.
- Reset to seed data after a server restart.
- Avoid filesystem and database dependencies for this interview implementation.

Create a fresh repository for each service test so tests do not share mutable state.

## Domain Rules

Each account has exactly one derived status:

- `MISSING`: no statement exists.
- `UPLOADED`: a statement exists and its date is no more than three calendar months old.
- `OUTDATED`: a statement exists and is older than three calendar months.

The exact boundary is inclusive: on `2026-08-26`, a statement dated `2026-05-26` is current, while `2026-05-25` is outdated.

Additional rules:

- Provider IDs are stable lowercase identifiers.
- Provider names are display values.
- A provider can be added only once.
- Unknown providers cannot be added.
- Statement filenames must be non-empty.
- Statement dates must be valid ISO dates.
- Future statement dates are rejected.
- Submission requires at least one account.
- Submission succeeds only when every account is `UPLOADED`.
- Incomplete submission must be rejected by the backend even if the frontend is bypassed.

Do not store derived status as independent mutable state. Calculate it from the statement and the supplied clock.

## API Contract

Implement these endpoints:

- `GET /api/accounts`: return accounts, provider details, statements, derived statuses, and readiness summary.
- `GET /api/providers?query=`: search known providers and exclude already-selected providers.
- `POST /api/accounts`: accept `{ "providerIds": ["hsbc", "fidelity"] }` and add all valid providers atomically where practical.
- `DELETE /api/accounts/{providerId}`: remove an existing selected provider.
- `PUT /api/accounts/{providerId}/statement`: accept `{ "fileName": "august.pdf", "statementDate": "2026-08-01" }`.
- `POST /api/submit`: accept only when all accounts have current statements.

Use suitable `4xx` responses for validation and domain errors. Use a consistent error shape:

```json
{
  "code": "INCOMPLETE_SUBMISSION",
  "message": "All accounts need a current statement before submission.",
  "issues": [
    {
      "providerId": "hsbc",
      "providerName": "HSBC",
      "status": "MISSING"
    }
  ]
}
```

The submit response must identify all missing or outdated providers.

## Layering

Keep responsibilities separated:

- Controller: HTTP mapping, request binding, and response status.
- Service: use cases and business rules.
- Repository: mutable in-memory state.
- Domain models: providers, accounts, statements, statuses, summaries, and errors.
- Exception handler: predictable validation and unexpected-error responses.

Controllers must not calculate statement status or decide submit eligibility themselves.

## Testing Requirements

Use JUnit and Spring Boot test support as appropriate. Cover at least:

- Missing statement status.
- Current statement status.
- Exact three-month boundary.
- Outdated statement status.
- Future and malformed date rejection.
- Blank filename rejection.
- Provider search exclusion.
- Unknown and duplicate provider rejection.
- Adding multiple providers.
- Removing a provider.
- Uploading and replacing a statement.
- Incomplete submission rejection with provider issues.
- Complete submission success.
- Fresh seed state for a new repository instance.

Use a fixed clock in domain tests and avoid relying on the machine's current date.

## Definition of Done

- `mvn test` passes.
- The API matches `requirements.md` and `design.md`.
- Status and submit rules are enforced in the service layer.
- In-memory state is seeded and reset on restart.
- Expected failures return useful structured JSON.
- Tests protect the highest-risk business rules.
