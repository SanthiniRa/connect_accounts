# Frontend Skill Guide

## Purpose

Build the client workflow for connecting accounts and collecting current statements. The interface must make the answer to “Am I ready to submit?” visible at all times.

## Technology

- React with TypeScript.
- Vite for development and production builds.
- Use typed API functions instead of scattering raw `fetch` calls across components.
- Keep the frontend independently runnable from the backend.

## Required Behavior

- Load the seeded account snapshot on startup.
- Display every selected provider, statement metadata, and exactly one status: `MISSING`, `UPLOADED`, or `OUTDATED`.
- Display total accounts, accounts ready, accounts needing attention, and whether submission is allowed.
- Filter accounts by `ALL`, `MISSING`, `UPLOADED`, or `OUTDATED`.
- Search known providers and select multiple providers before adding them.
- Do not show already-added providers in available search results.
- Remove an added provider.
- Upload or replace statement metadata using a filename and statement date.
- Submit only when the server snapshot says the account set is complete.
- Display server-side submit rejection details when the request is rejected.

## State and Requests

Model these states explicitly:

- Initial loading.
- Empty account list.
- Empty filtered result.
- Request pending, preferably scoped to the affected action or row.
- Mutation success.
- Mutation failure without losing the last valid account snapshot.
- Submit success.
- Submit rejection with the incomplete providers listed.

After a successful add, remove, or statement update:

1. Refetch the account snapshot.
2. Update the readiness summary.
3. Clear or close the completed interaction.
4. Announce the result to the user.

Treat the backend response as the source of truth. Do not derive a different submission decision in the UI.

## Components and Boundaries

Prefer small components with clear responsibilities:

- `AppShell` or page container.
- `ReadinessSummary`.
- `AccountList` and `AccountRow`.
- `StatusFilter`.
- `AddProviderDialog`.
- `StatementDialog`.
- `FeedbackMessage`.

Keep API types separate from visual components where practical. Keep form state local to its dialog and application/server state at the page or hook level.

## Accessibility

- Use semantic headings, lists, forms, dialogs, and buttons.
- Every icon-only button needs an accessible name and tooltip where useful.
- Keep keyboard focus inside open dialogs and return focus when they close.
- Use labels for filename and date fields.
- Use `aria-live` for loading completion, mutation feedback, and submit errors.
- Do not rely on color alone to communicate status.
- Ensure disabled and pending controls remain understandable.

## Visual Direction

Use a distinctive, calm editorial workspace rather than a generic dashboard:

- Expressive serif headings with a readable sans-serif body.
- Neutral canvas with green readiness accent.
- Separate warning and error colors for outdated and missing states.
- Dense but breathable provider rows.
- Responsive layout that remains usable on narrow screens.
- Subtle motion only where it communicates state; respect `prefers-reduced-motion`.
- Avoid nested cards, decorative gradients, and oversized marketing sections.

## Testing Requirements

Use mocked API responses and test user-visible behavior:

- Initial loading and readiness summary.
- Status filtering and empty filtered results.
- Multi-provider add and provider exclusion.
- Remove provider.
- Upload and replace statement metadata.
- Incomplete submit guard.
- Successful submit.
- API failure feedback while preserving displayed data.

## Definition of Done

- The complete workflow is usable with keyboard and mouse.
- All required API states have visible feedback.
- The UI stays consistent with the latest server snapshot.
- Frontend tests pass.
- The production build passes.
- The design follows `requirements.md` and `design.md`.
