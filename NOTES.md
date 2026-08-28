# Notes

## Quick links and set up:

Please refer the link.https://github.com/SanthiniRa/connect_accounts/blob/main/README.md
        
# What I Built
A full-stack account connection UI using React and Docker for containerization, with a standard Maven-based Spring Boot backend. 
I used Co-pilot for implementation and adopted spec-driven development, building features one by one according to requirements. The frontend is responsible for presentation, user interaction, request state, and communicating readiness clearly. The backend is the source of truth for provider membership, statement status, validation, and submission eligibility. The `AccountService` coordinates use cases, while `InMemoryAccountRepository` owns the seeded mutable state for the single demo client. Status is derived from statement metadata and an injectable clock rather than stored independently, which keeps the business rule consistent and testable.

The API is intentionally small and resource-oriented: accounts can be listed, added, removed, or updated with statement metadata, while submission has its own server-side validation endpoint. This repository boundary allows the in-memory implementation to be replaced with a database-backed repository without moving business rules into controllers or the frontend.

# Why?
Maven for Backend: Simple and direct for a small, focused task. Maven's declarative pom.xml makes dependency and build configuration straightforward, and Java 17 with Spring Boot provides solid, battle-tested patterns for REST services.

Docker for Deployment: Eliminates environment variability; reviewers can run docker-compose up --build without installing Java 17, Maven, or Node.js. Multi-stage images keep container sizes reasonable.

In-Memory Repository with Seeded Data: Sufficient for demonstrating all scenarios (missing, outdated, current statements) without the overhead of a real database. Deterministic seed data ensures reproducible behavior and enables reliable testing.

Spec-Driven Development with Copilot Agent: Breaking requirements into discrete tasks (define DTOs, build controllers, add validation, wire services) helped maintain focus and ensure completeness. Spec-driven development put me in control of the task, allowing each feature to be implemented and tested before moving to the next.

UI-Centric Scope: The focus was on the frontend experience and user interaction. The backend provides just enough structure to be credible: validation, business rules, and state management. This keeps the project focused and deliverable within time constraints.

## What I'd Do With More Time
Given more than 2 hours, the priority improvements would be:
1. Improve UI Look & Feel
2. Authentication & Authorization
3. Persistent Storage & Database
4. JSON & API Improvements
5. Observability & Logging
6. Audit & Compliance
7. Project-Specific Enhancements
All of these would be driven by requirements and prioritized based on business value and user feedback.


## Test Details

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

The frontend tests cover:

- Loading and displaying the account snapshot.
- Readiness summary rendering.
- Status filtering and empty filter results.
- Adding multiple providers.
- Removing a provider after confirmation.
- Uploading and replacing statement metadata.
- Disabled submit state while an account needs attention.
- Successful submission and the disabled `Submitted` state.
