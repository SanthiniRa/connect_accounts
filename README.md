# Account Connection

Account Connection provides a small full-stack app (Java Spring Boot backend + TypeScript/Vite React frontend) that collects and validates account/provider submission data and computes readiness. It is a sample API + UI for connecting accounts and validating submissions.

## Quick links
- Backend: `backend/` — Spring Boot (Java 17, Maven)
- Frontend: `frontend/` — Vite + React + TypeScript
- Developer notes: `NOTES.md`
- Design / requirements / tasks: `design.md`, `requirements.md`, `tasks.md`

## Status
Work-in-progress. Basic REST API and a matching frontend exist. Frontend includes unit and e2e tests; backend includes unit tests.

## Stack
- Languages: Java (backend), TypeScript (frontend), CSS
- Backend: Spring Boot (Java 17), Maven (mvnw included)
- Frontend: Vite + React + TypeScript
- Testing: JUnit/Maven (backend), Playwright + Jest (frontend)
- Container: Dockerfiles for backend and frontend; docker-compose at repo root

## Repository layout
```
backend/         Spring Boot app (Java 17, pom.xml, Dockerfile, mvnw)
frontend/        Vite + React + TypeScript app (package.json, Dockerfile, src/)
docker-compose.yml
NOTES.md         developer notes
design.md
requirements.md
tasks.md
```

## How it fits together
The backend implements REST controllers and services under `backend/src/main/java/com/example/accounts` (AccountController, ProviderController, SubmissionController, AccountService, validators, in-memory repository). The frontend uses `frontend/src/api.ts` to call the backend and renders forms and readiness views. `docker-compose.yml` can run both services together for local integration.

## Quickstart — run locally

1) Clone
```bash
git clone https://github.com/SanthiniRa/connect_accounts.git
cd connect_accounts
```

2) Start both services with Docker Compose (recommended)
From the repository root:

```bash
docker compose up --build
```

Open http://localhost:5173 in a browser. The API is available at http://localhost:8080.

Stop the services with:

```bash
docker compose down
```

2b) Or run services individually

Backend (local Java run)
```bash
cd backend
# Unix-like systems
./mvnw spring-boot:run
# or with installed Maven
mvn spring-boot:run
```

Frontend (local dev)
```bash
cd frontend
npm install
npm run dev
```

If needed, copy the frontend example env:
```bash
cp frontend/.env.example frontend/.env
# edit frontend/.env
```

## Testing
- Backend unit tests:
```bash
cd backend
./mvnw test
```
- Frontend tests:
```bash
cd frontend
npm test
npx playwright test
```
The optional Playwright end-to-end test runs against the Docker stack:

```bash
cd frontend
npm run test:e2e
```

## API overview
The backend exposes REST controllers in `com.example.accounts`:
- AccountController — read/manage accounts and views
- ProviderController — list/select providers
- SubmissionController — submit account/provider data and compute readiness

Base URL (default): http://localhost:8080

Example (replace with exact controller paths as needed):
```bash
curl http://localhost:8080/accounts
curl -X POST http://localhost:8080/submit -H "Content-Type: application/json" -d '{"accounts": [...], "provider": "example"}'
```

## Development notes & where to look
- backend/
  - `pom.xml` — Maven + Spring Boot config (Java 17)
  - `src/main/java/com/example/accounts` — controllers, services, validators, DTOs
  - `Dockerfile`
- frontend/
  - `package.json`, `vite.config.ts` — build & dev tooling
  - `src/api.ts` — frontend API wrapper
  - `src/` — components and App.tsx
  - `playwright.config.ts`, `e2e/` — Playwright tests
- Root docs: `NOTES.md`, `design.md`, `requirements.md`, `tasks.md`

## Environment & configuration
- Copy `frontend/.env.example` to `.env` and edit as needed.
- Backend uses Spring Boot configuration (check `application.properties` / `WebConfiguration` in code).
- For Docker Compose, inspect `docker-compose.yml` for env var wiring.

## Troubleshooting
- Check backend (Spring Boot) and frontend (Vite) logs for port conflicts.
- For CORS/API proxy issues, either configure a Vite proxy or enable CORS in backend (`WebConfiguration`).

## Contributing
- Open issues for features/bugs (see `tasks.md`).
- Follow existing conventions: Java 17 + Spring Boot idioms, TypeScript + React patterns.
- Update `NOTES.md` when changing design assumptions.

## License
No LICENSE file detected. Add a LICENSE (e.g., MIT) if you want to publish this repository as open source.

---

If you want, I can also generate exact API docs by reading controller route annotations and request/response DTOs and add them to this README or a separate API.md.
