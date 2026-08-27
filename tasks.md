# Tasks: Connect Your Accounts

## Spec-Driven Workflow

Each implementation task should be checked against `requirements.md` and the design decisions in `design.md`. Complete tasks in order unless a dependency is explicitly noted. Review the phase result before starting the next phase.

## Phase 1: Project Setup and Specification

- [x] T001 Confirm the three-month boundary rule and future-date validation.
- [x] T002 Create the React + TypeScript + Vite frontend project.
- [x] T003 Create the Java + Spring Boot + Maven backend project.
- [x] T004 Configure frontend and backend local run scripts.
- [x] T005 Add Dockerfiles, `.dockerignore` files, and root `docker-compose.yml` for a one-command local start.
- [x] T006 Add the root `NOTES.md` with interview assumptions, seed-data notes, and Docker quick start.
- [x] T007 Review `requirements.md`, `design.md`, and this task list before coding behavior.

**Checkpoint:** Both projects start independently and the agreed API/data decisions are documented.

## Phase 2: Backend Domain and Repository

- [x] T008 Define provider, statement, account, status, and readiness models.
- [x] T009 Implement `InMemoryAccountRepository` with deterministic known providers and seeded accounts.
- [x] T010 Add a clock dependency so date logic is testable.
- [x] T011 Implement status derivation for missing, current, and outdated statements.
- [x] T012 Implement account readiness calculation.
- [x] T013 Implement add-provider validation, including unknown and duplicate IDs.
- [x] T014 Implement remove-provider behavior.
- [x] T015 Implement statement creation and replacement validation.
- [x] T016 Implement authoritative submit validation and structured incomplete issues.

**Checkpoint:** Service-level behavior is correct without HTTP or frontend dependencies.

## Phase 3: Backend HTTP API

- [x] T017 Implement `GET /api/accounts`.
- [x] T018 Implement `GET /api/providers?query=` with exclusion of selected providers.
- [x] T019 Implement `POST /api/accounts` for multi-provider adds.
- [x] T020 Implement `DELETE /api/accounts/{accountId}`.
- [x] T021 Implement `PUT /api/accounts/{accountId}/statement`.
- [x] T022 Implement `POST /api/submit`.
- [x] T023 Add request validation and a consistent error response handler.
- [x] T024 Configure development CORS for the Vite client.

**Backend tests**

- [x] T025 Test missing statement status.
- [x] T026 Test exact three-month boundary as current.
- [x] T027 Test older statement as outdated.
- [x] T028 Test future-date rejection and malformed input.
- [x] T029 Test provider search exclusion.
- [x] T030 Test duplicate and unknown provider rejection.
- [x] T031 Test adding multiple providers.
- [x] T032 Test removing an account.
- [x] T033 Test statement upload and replacement.
- [x] T034 Test incomplete submission rejection with affected providers.
- [x] T035 Test complete submission success.
- [x] T035A Test readiness `readyCount` and `canSubmit` calculation.

**Checkpoint:** Run the Maven test task and review API responses against `requirements.md`.

## Phase 4: Frontend Foundation and Readiness View

- [x] T036 Define TypeScript types matching the API contract.
- [x] T037 Implement a typed API client for all endpoints.
- [x] T038 Build the application shell and visual design tokens.
- [x] T039 Load and render the seeded account list.
- [x] T040 Render status badges, statement metadata, and readiness summary.
- [x] T041 Add the status filter, including empty filtered results.
- [x] T042 Add responsive layout and keyboard-accessible controls.

**Checkpoint:** The client can load, inspect, and filter the seeded data.

## Phase 5: Frontend Mutations and Feedback

- [x] T043 Implement the add-provider dialog with search and multi-select.
- [x] T044 Remove successfully added providers from search results.
- [x] T045 Implement remove-provider confirmation and action.
- [x] T046 Implement upload and replace statement dialog.
- [x] T047 Validate client-side form input before requests.
- [x] T048 Add per-action pending states.
- [x] T049 Add success and error announcements with `aria-live`.
- [x] T050 Guard the submit action based on readiness.
- [x] T051 Display server-side submit rejection details.

**Frontend tests**

- [x] T052 Test initial loading and readiness summary.
- [x] T053 Test status filtering.
- [x] T054 Test adding multiple providers.
- [x] T055 Test removing a provider.
- [x] T056 Test uploading and replacing a statement.
- [x] T057 Test submit disabled or guarded when incomplete.
- [x] T058 Test submit success when all statements are current.
- [x] T059 Test API failure rendering and preservation of existing data.

**Checkpoint:** Run the frontend test task and verify the full workflow with mocked API responses.

## Phase 6: Integration and Documentation

- [x] T060 Add environment-based API URL configuration.
- [x] T061 Build frontend and backend Docker images (lower priority than core behavior).
- [x] T062 Add and test `docker-compose.yml` for one-command startup (lower priority than core behavior).
- [x] T063 Add concise local and Docker run/test instructions (lower priority than core behavior).
- [x] T064 Complete the seeded browser flow from load to successful submit.
- [x] T065 Verify incomplete submit is rejected by the API.
- [x] T066 Verify mutations remain available during one server run.
- [x] T067 Restart the backend and verify state resets to deterministic seed data.
- [x] T068 Add `NOTES.md` trade-offs and production follow-ups.
- [x] T069 Check responsive behavior at desktop and mobile widths.
- [x] T070 Check keyboard navigation and accessible status announcements.

## Final Verification

- [x] T071 Run all backend tests.
- [x] T072 Run all frontend tests.
- [x] T073 Run the frontend production build.
- [x] T074 Build both Docker images.
- [x] T075 Start the stack with Docker Compose and perform a smoke test.
- [x] T076 Walk through every acceptance criterion in `requirements.md`.
- [x] T077 Add and run one Playwright e2e test for the incomplete-to-successful submit flow instead of additional Docker work.

## Definition of Done

- All requirements in `requirements.md` are implemented or explicitly marked out of scope.
- The backend owns status derivation and submit authorization.
- The frontend presents every required interaction and asynchronous state.
- The repository is in-memory and seeded at startup.
- Backend and frontend tests cover the highest-risk behavior.
- The project can be run and reviewed using documented commands.
