# Skills & Methods Manager — Claude Code

Read CONVENTIONS.md before any GitHub or git operation.

## Project
A native-feeling macOS package manager GUI for browsing, installing, and managing AI skills and SDD methods.
Stack: TypeScript / React / Tauri (Rust) / Vite

## Commands
| Action | Command |
|--------|---------|
| Run    | `npm run tauri dev` |
| Test   | `npm test` |
| Build  | `npm run tauri build` |
| Lint   | `npm run lint` |

## Architecture
Thin React GUI over three sources of truth (File System, CLI Bridge, Remote Registry). Follows the macOS Tahoe "Liquid Glass" design language.

## Conventions
- Use functional React components and hooks.
- Prefer Vanilla CSS for styling.
- Follow the component patterns in `components/macos-window.jsx`.

## Never
- Never mutate the local file system directly; always dispatch via the `skillctl` CLI bridge.
- Do not add external font dependencies; use SF Pro / system fonts only.

## Agent Rules
- Read specs/ before writing code.
- Write the minimum code that solves the stated problem. Nothing extra.
- Never refactor, rename, or reorganize code outside the task scope.
- Run tests after every change. Show evidence before declaring done.
- One clarifying question beats a wrong assumption baked into 200 lines.
