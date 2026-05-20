# Project Conventions

All agents and contributors must follow these rules to ensure high-integrity, maintainable code.

## 1. Planning & Specs
- **Specs First:** Every feature or bug fix must have a corresponding document in `specs/` before implementation begins.
- **Verification-Led:** Every task in a plan must include a `verify:` command or manual check.
- **Traceability:** Code changes should be linkable to stories in `specs/release-plan.md`.

## 2. Technical Standards
- **Stack:** TypeScript, React, Tauri (Rust backend), Vite.
- **Styling:** Vanilla CSS, following the macOS Tahoe design system.
- **Architecture:** The GUI is a consumer of state managed by the `skillctl` CLI and the file system. Use Tauri commands for all backend interactions.

## 3. Defensive Programming
- **Rate Limiting:** Implement rate limiting for all remote registry API calls to avoid throttling.
- **Error Handling:** Use Graceful Degradation. If the CLI bridge is unavailable, show a clear "Disconnected" state in the UI.

## 4. Git & Workflow
- **Conventional Commits:** Use `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- **Vertical Slices:** Implement features one full vertical slice (frontend + backend) at a time.
- **TDD:** Write failing tests before implementing fixes or features when possible.

## 5. Agent-Specific Rules
- Always read `CLAUDE.md` and `CONVENTIONS.md` at the start of a session.
- Do not perform broad refactors unless explicitly tasked.
- Maintain the `specs/` directory as the single source of truth for intent.
