# Skills and Methods Manager — Release Plan

**Author:** Daniel · **Updated:** May 18, 2026 · **Solo dev**

Structured as **Epics → Stories → Tasks**. Each Epic ships as a minor semver release driven by semantic-release. Stories map to `feat:` / `fix:` commits. Tasks are the concrete implementation steps.

---

## Versioning quick-ref

| Commit | Bump | When to use |
|--------|------|-------------|
| `feat:` | minor `0.x+1.0` | New user-facing capability |
| `fix:` | patch `0.x.x+1` | Bug fix |
| `feat!:` / `BREAKING CHANGE:` | major `x+1.0.0` | Breaking schema / API change |
| `chore:` `docs:` `refactor:` `test:` `perf:` `style:` | no release | Everything else |

---

## Per-Epic workflow (bigpowers)

Run these **once** before starting any Epic:

```
/seed-conventions   → writes CLAUDE.md, CONVENTIONS.md, specs/
/map-codebase       → writes specs/CONTEXT.md
```

Run these **for each Epic**:

```
/kickoff-branch     → create branch  epic/N-short-name
/plan-work          → writes specs/PLAN.md (Karpathy steps + verify cmds)
/execute-plan       → works through specs/PLAN.md step by step
/request-review     → optional: multi-agent code review
/release-branch     → PR + merge → semantic-release fires → vX.Y.Z tagged
```

---

## Epic 1 · v0.1.0 — App shell

> Branch: `epic/1-app-shell`
> Commit: `feat: initial app shell with macos window chrome and sidebar nav`

The skeleton you open and close. No real data yet.

### Story 1.1 — Liquid Glass window primitives
*As a dev, I have a component library that matches the macOS Tahoe design system so every screen looks native from day one.*

- [ ] Copy `components/macos-window.jsx` into the repo (already built)
      verify: `ls src/components/macos-window.jsx`

- [ ] Verify `MacWindow`, `MacSidebar`, `MacSidebarItem`, `MacSidebarHeader`, `MacToolbar`, `MacGlass`, `MacTrafficLights` all render without errors
      verify: `npx vitest run src/components/__tests__/macos-window.smoke.test.tsx`

- [ ] Write smoke test: render `MacWindow` with a minimal sidebar, assert no thrown errors
      verify: `npx vitest run src/components/__tests__/macos-window.smoke.test.tsx`

- [ ] Confirm JSDoc prop documentation matches actual props exported
      verify: `npm run lint` (no type errors on import)

### Story 1.2 — Tauri app shell
*As Daniel, I can run `tauri dev` and see the app window open on my Mac.*

- [ ] Scaffold Tauri project (`cargo tauri init`) with React + TypeScript frontend
      verify: `cargo tauri build --debug` (exits 0, binary produced under `src-tauri/target/debug/`)

- [ ] Configure `tauri.conf.json`: app name, bundle id `com.danielvm.skillmanager`, default window size 1200×800, min 900×600
      verify: `cat src-tauri/tauri.conf.json | grep -E 'identifier|width|height'`

- [ ] Wire `MacWindow` as the root layout component
      verify: `npx vitest run src/App.test.tsx`

- [ ] Set up Vite dev server proxied through Tauri
      verify: `npm run build` (exits 0)

- [ ] Confirm window opens, resizes, and closes correctly on macOS
      verify: `manual — cargo tauri dev, confirm window on macOS`

### Story 1.3 — Sidebar navigation
*As Daniel, I can click between Library and Settings in the sidebar and the main area changes.*

- [ ] Set up React Router with routes: `/` (Library), `/settings`
      verify: `npx vitest run src/routes/__tests__/routing.test.tsx`

- [ ] Render `MacSidebarItem` for each route; highlight selected item based on current path
      verify: `npx vitest run src/components/__tests__/sidebar-nav.test.tsx`

- [ ] Stub Library view: heading "Library" + placeholder text
      verify: `npx vitest run src/views/__tests__/LibraryView.test.tsx`

- [ ] Stub Settings view: heading "Settings" + placeholder text
      verify: `npx vitest run src/views/__tests__/SettingsView.test.tsx`

- [ ] Keyboard: arrow keys navigate sidebar items; Enter activates
      verify: `manual — cargo tauri dev, test arrow key navigation`

### Story 1.4 — CI and semantic-release
*As Daniel, every push to `main` that contains a `feat:` or `fix:` commit produces a tagged GitHub release automatically.*

- [ ] Add `.releaserc` with plugins: `commit-analyzer`, `release-notes-generator`, `changelog`, `github`
      verify: `cat .releaserc | grep -E 'commit-analyzer|changelog|github'`

- [ ] Add GitHub Actions workflow: lint → test → build → semantic-release (on push to `main`)
      verify: `cat .github/workflows/release.yml | grep -E 'on:|push:|main'`

- [ ] Configure `GITHUB_TOKEN` secret in repo settings
      verify: `manual — confirm secret visible in Settings → Secrets`

- [ ] Set `"firstRelease": true` so the first successful run tags `v0.1.0`
      verify: `cat .releaserc | grep firstRelease`

- [ ] Add `eslint`, `prettier`, `vitest` configs; all pass on clean checkout
      verify: `npm run lint && npx vitest run`

- [ ] Dry-run semantic-release locally
      verify: `npx semantic-release --dry-run`

### Epic 1 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes, `npm run lint` clean
- [ ] Manual smoke: `cargo tauri dev` opens window, sidebar nav works
- [ ] `/release-branch` → PR created → merge → `v0.1.0` tagged by semantic-release

---

## Epic 2 · v0.2.0 — Skills directory scan

> Branch: `epic/2-skills-scan`
> Commit: `feat: scan local skills directory and display installed skills in library view`

The app reads your real skills from disk for the first time.

### Story 2.1 — Skills store (Tauri backend)
*As the app, I can read all installed skills from a configurable directory and expose them to the frontend.*

- [ ] Define `Skill` TypeScript type: `{ id, name, version, author, description, type, status, path, dependencies, updatedAt }`
      verify: `npm run lint` (no type errors)

- [ ] Write Tauri command `get_skills(dir: string) -> Vec<Skill>` in Rust that walks the directory and parses each `SKILL.md` front-matter block
      verify: `cargo test -p skill-manager -- get_skills`

- [ ] Handle missing or malformed manifests gracefully (return `status: "broken"` instead of crashing)
      verify: `cargo test -p skill-manager -- test_broken_manifest`

- [ ] Write unit tests for the parser covering: valid manifest, missing fields, malformed YAML
      verify: `cargo test -p skill-manager -- parser`

- [ ] Expose command to frontend via `invoke('get_skills', { dir })`
      verify: `npx vitest run src/store/__tests__/skills.test.tsx`

### Story 2.2 — Library view: skill list
*As Daniel, I can see all my installed skills listed with their name, version, author, and status.*

- [ ] Build `SkillCard` component: name (bold), version pill, author, status badge (active / inactive / outdated / broken)
      verify: `npx vitest run src/components/__tests__/SkillCard.test.tsx`

- [ ] Build `LibraryView` that calls `get_skills` on mount and renders a `SkillCard` per result
      verify: `npx vitest run src/views/__tests__/LibraryView.test.tsx`

- [ ] Status badge colours: active → green, inactive → grey, outdated → amber, broken → red; defined as CSS variables
      verify: `npm run lint`

- [ ] Sort default: alphabetical by name
      verify: `npx vitest run src/views/__tests__/LibraryView.sort.test.tsx`

### Story 2.3 — Empty state and loading skeleton
*As Daniel, I see useful feedback when the skills directory is empty or still loading.*

- [ ] Build `SkillCardSkeleton` component: same dimensions as `SkillCard`, animated shimmer fill
      verify: `npx vitest run src/components/__tests__/SkillCardSkeleton.test.tsx`

- [ ] Show 6 skeletons while `get_skills` is in-flight
      verify: `npx vitest run src/views/__tests__/LibraryView.loading.test.tsx`

- [ ] Show empty-state illustration + "No skills found" message + hint text when result is empty
      verify: `npx vitest run src/views/__tests__/LibraryView.empty.test.tsx`

- [ ] Show error state if the directory path is invalid or unreadable
      verify: `npx vitest run src/views/__tests__/LibraryView.error.test.tsx`

### Story 2.4 — Live directory watch
*As Daniel, when I install or delete a skill file outside the app, the library updates automatically.*

- [ ] Add Tauri `watch_skills_dir(dir)` command using `notify` crate; emit `skills-changed` event on any change
      verify: `cargo test -p skill-manager -- watch_skills_dir`

- [ ] Frontend subscribes to `skills-changed` and re-fetches the skill list
      verify: `npx vitest run src/store/__tests__/skills-watch.test.tsx`

- [ ] Debounce re-fetch by 300 ms to avoid thrashing on bulk file operations
      verify: `npx vitest run src/store/__tests__/skills-debounce.test.tsx`

- [ ] Write integration test: create a mock SKILL.md, verify it appears in list within 500 ms
      verify: `cargo test -p skill-manager --test integration -- watch_integration`

### Epic 2 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes, `cargo clippy -- -D warnings` clean
- [ ] Manual smoke: skills in `~/.claude/skills/` appear in the Library
- [ ] `/release-branch` → PR created → merge → `v0.2.0` tagged by semantic-release

---

## Epic 3 · v0.3.0 — Skill detail panel

> Branch: `epic/3-detail-panel`
> Commit: `feat: add slide-in detail panel with full skill metadata and enable/disable toggle`

Click a skill, see everything, flip the toggle.

### Story 3.1 — Detail panel component
*As Daniel, I can click any skill card and see its full metadata in a panel that slides in from the right.*

- [ ] Build `DetailPanel` component: name, description, version, author, file path, dependencies list, last-updated date
      verify: `npx vitest run src/components/__tests__/DetailPanel.test.tsx`

- [ ] Animate open: slide from right + fade-in, 180 ms ease-out (respect `prefers-reduced-motion`)
      verify: `manual — cargo tauri dev, click a skill card`

- [ ] Animate close: reverse, triggered by clicking outside or pressing Escape
      verify: `manual — cargo tauri dev, press Escape to close`

- [ ] Clicking a different card while panel is open swaps content without closing
      verify: `npx vitest run src/components/__tests__/DetailPanel.swap.test.tsx`

- [ ] Panel width: 360 px fixed; main content area compresses, not obscured
      verify: `manual — cargo tauri dev, check layout at minimum window width`

### Story 3.2 — Enable / disable toggle
*As Daniel, I can toggle a skill on or off and the change persists when I restart the app.*

- [ ] Add `enabled` field to `Skill` type and local config file (`~/.config/skill-manager/overrides.json`)
      verify: `npm run lint`

- [ ] Render toggle switch in detail panel; match macOS toggle style using `MacGlass` as base
      verify: `npx vitest run src/components/__tests__/SkillToggle.test.tsx`

- [ ] Tauri command `set_skill_enabled(id, enabled)` writes to config file
      verify: `cargo test -p skill-manager -- set_skill_enabled`

- [ ] Toggle is reflected immediately in the library view status badge (no reload required)
      verify: `npx vitest run src/views/__tests__/LibraryView.toggle.test.tsx`

- [ ] Restart persistence: toggle off → restart → skill still shows as inactive
      verify: `cargo test -p skill-manager --test integration -- toggle_persists`

### Epic 3 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: click skill → panel slides in, toggle persists after `cargo tauri dev` restart
- [ ] `/release-branch` → PR created → merge → `v0.3.0` tagged by semantic-release

---

## Epic 4 · v0.4.0 — Uninstall

> Branch: `epic/4-uninstall`
> Commit: `feat: add uninstall action with confirmation sheet`

Remove skills from within the app.

### Story 4.1 — Uninstall confirmation sheet
*As Daniel, I can uninstall a skill from the detail panel; the app asks me to confirm before deleting anything.*

- [ ] Add "Uninstall" button to detail panel (destructive style: red text, no fill)
      verify: `npx vitest run src/components/__tests__/DetailPanel.uninstall.test.tsx`

- [ ] Build `ConfirmSheet` modal component: skill name, warning message, Cancel and Confirm buttons
      verify: `npx vitest run src/components/__tests__/ConfirmSheet.test.tsx`

- [ ] Escape and clicking outside = cancel; only the red Confirm button proceeds
      verify: `npx vitest run src/components/__tests__/ConfirmSheet.dismiss.test.tsx`

- [ ] Tauri command `uninstall_skill(id)` deletes the skill directory from disk and removes its config entry
      verify: `cargo test -p skill-manager -- uninstall_skill`

### Story 4.2 — Post-uninstall feedback
*As Daniel, after uninstalling I see a confirmation and the skill disappears from the list.*

- [ ] Close detail panel immediately on confirm (optimistic UI)
      verify: `npx vitest run src/views/__tests__/LibraryView.uninstall.test.tsx`

- [ ] Remove skill card from library view instantly
      verify: `npx vitest run src/views/__tests__/LibraryView.uninstall.test.tsx`

- [ ] Show toast: "Acme Skill uninstalled" with undo action (5 s window; moves files to trash instead of permanent delete)
      verify: `npx vitest run src/components/__tests__/Toast.undo.test.tsx`

- [ ] If uninstall fails (permission error, file locked), show error toast with the OS error message
      verify: `cargo test -p skill-manager -- uninstall_permission_error`

### Epic 4 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: uninstall a skill, confirm undo toast and file moves to Trash
- [ ] `/release-branch` → PR created → merge → `v0.4.0` tagged by semantic-release

---

## Epic 5 · v0.5.0 — Search and filter

> Branch: `epic/5-search-filter`
> Commit: `feat: add real-time search and filter controls to library view`

Find any skill instantly.

### Story 5.1 — Toolbar search
*As Daniel, I can type in the search bar and the library filters in real time.*

- [ ] Wire `MacToolbar` search input to filter the skill list (in-memory, no debounce needed for < 500 items)
      verify: `npx vitest run src/views/__tests__/LibraryView.search.test.tsx`

- [ ] Match against: name, author, description (case-insensitive)
      verify: `npx vitest run src/views/__tests__/LibraryView.search.test.tsx`

- [ ] Highlight matched substring in skill name on the card
      verify: `npx vitest run src/components/__tests__/SkillCard.highlight.test.tsx`

- [ ] Clear button appears when query is non-empty; Escape also clears and returns focus to list
      verify: `npx vitest run src/components/__tests__/ToolbarSearch.clear.test.tsx`

- [ ] Announce result count to screen readers via `aria-live`
      verify: `npx vitest run src/views/__tests__/LibraryView.a11y.test.tsx`

### Story 5.2 — Filter chips
*As Daniel, I can filter by skill type and status to quickly narrow the list.*

- [ ] Build `FilterChip` component: label + count badge, toggle active state
      verify: `npx vitest run src/components/__tests__/FilterChip.test.tsx`

- [ ] Render chips below toolbar: Type (Skill / Method) and Status (Active / Inactive / Outdated / Broken)
      verify: `npx vitest run src/views/__tests__/LibraryView.filters.test.tsx`

- [ ] Multiple chips in the same group → OR logic; chips across groups → AND logic
      verify: `npx vitest run src/views/__tests__/LibraryView.filter-logic.test.tsx`

- [ ] Persist last-used filter state in `localStorage`
      verify: `npx vitest run src/views/__tests__/LibraryView.filter-persist.test.tsx`

- [ ] "Clear filters" link appears when any filter is active
      verify: `npx vitest run src/views/__tests__/LibraryView.filters.test.tsx`

### Epic 5 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: search for a skill, apply type + status filters in `cargo tauri dev`
- [ ] `/release-branch` → PR created → merge → `v0.5.0` tagged by semantic-release

---

## Epic 6 · v0.6.0 — Settings

> Branch: `epic/6-settings`
> Commit: `feat: add settings view for skills directory path and app preferences`

Make the app configurable.

### Story 6.1 — Skills directory setting
*As Daniel, I can change which directory the app scans so I can manage skills in non-default locations.*

- [ ] Build `SettingsView` with a file-system path picker (native macOS folder picker via Tauri dialog)
      verify: `npx vitest run src/views/__tests__/SettingsView.test.tsx`

- [ ] Save chosen path to config file; reload skills list immediately
      verify: `cargo test -p skill-manager -- settings_save_path`

- [ ] Validate that the selected path exists and is readable; show inline error if not
      verify: `npx vitest run src/views/__tests__/SettingsView.invalid-path.test.tsx`

- [ ] "Reset to default" button restores `~/.claude/skills/`
      verify: `cargo test -p skill-manager -- settings_reset_default`

### Story 6.2 — App preferences
*As Daniel, I can configure auto-reload and startup behaviour.*

- [ ] Toggle: "Reload library when directory changes" (default: on)
      verify: `cargo test -p skill-manager -- prefs_auto_reload`

- [ ] Toggle: "Launch at login" (registers macOS login item via Tauri)
      verify: `manual — cargo tauri dev, enable toggle, check Login Items in System Settings`

- [ ] Toggle: "Show in menu bar" (future-proofed off for now, visible but disabled)
      verify: `npx vitest run src/views/__tests__/SettingsView.test.tsx` (toggle renders disabled)

- [ ] All settings write to config file immediately on change (no Save button)
      verify: `cargo test -p skill-manager -- prefs_immediate_write`

### Epic 6 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: change skills directory, confirm Library reloads in `cargo tauri dev`
- [ ] `/release-branch` → PR created → merge → `v0.6.0` tagged by semantic-release

---

## Epic 7 · v0.7.0 — Remote registry browse

> Branch: `epic/7-registry-browse`
> Commit: `feat: add Discover tab that browses the remote skills registry`

Browse available skills without leaving the app.

### Story 7.1 — Registry API client
*As the app, I can fetch skill listings from a remote registry and handle network errors gracefully.*

- [ ] Define registry API contract (REST, JSON): `GET /skills`, `GET /skills/:id`, query params: `q`, `category`, `page`
      verify: `cat docs/registry-api.md | grep -E 'GET /skills'`

- [ ] Build typed API client in TypeScript with `fetch`; set registry base URL from settings
      verify: `npx vitest run src/api/__tests__/registry.test.tsx`

- [ ] Cache responses in memory for the session; show stale data + refresh banner if cache is > 5 min old
      verify: `npx vitest run src/api/__tests__/registry.cache.test.tsx`

- [ ] Show offline banner and use cached data when the registry is unreachable
      verify: `npx vitest run src/api/__tests__/registry.offline.test.tsx`

### Story 7.2 — Discover tab
*As Daniel, I can browse available skills by category and search the registry.*

- [ ] Add "Discover" item to sidebar nav (below Library)
      verify: `npx vitest run src/components/__tests__/sidebar-nav.discover.test.tsx`

- [ ] Build `DiscoverView`: grid of `RegistryCard` components (name, author, short description, install button)
      verify: `npx vitest run src/views/__tests__/DiscoverView.test.tsx`

- [ ] Category filter sidebar within the Discover view (list of categories from registry)
      verify: `npx vitest run src/views/__tests__/DiscoverView.categories.test.tsx`

- [ ] Search bar in toolbar filters registry results (debounced 250 ms, re-fetches from API)
      verify: `npx vitest run src/views/__tests__/DiscoverView.search.test.tsx`

- [ ] Loading and empty states
      verify: `npx vitest run src/views/__tests__/DiscoverView.states.test.tsx`

### Story 7.3 — Fullscreen registry detail
*As Daniel, I can open a full-screen detail page for any registry skill to read its full description and changelog before installing.*

- [ ] Build `RegistryDetailView` (routed at `/discover/:id`)
      verify: `npx vitest run src/views/__tests__/RegistryDetailView.test.tsx`

- [ ] Sections: description, version history table, author, dependencies, install button
      verify: `npx vitest run src/views/__tests__/RegistryDetailView.test.tsx`

- [ ] Back button returns to Discover with scroll position preserved
      verify: `manual — cargo tauri dev, navigate to detail then back`

- [ ] "Already installed" badge if skill is in the local library (compare by `id`)
      verify: `npx vitest run src/views/__tests__/RegistryDetailView.installed.test.tsx`

### Epic 7 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: Discover tab loads, search and category filter work in `cargo tauri dev`
- [ ] `/release-branch` → PR created → merge → `v0.7.0` tagged by semantic-release

---

## Epic 8 · v0.8.0 — Install flow

> Branch: `epic/8-install`
> Commit: `feat: add install flow with dependency resolution and progress tracking`

Install a registry skill in a few clicks.

### Story 8.1 — Dependency resolver
*As the app, before installing I know which dependencies are missing and can resolve them automatically.*

- [ ] Tauri command `resolve_dependencies(skill_id) -> { toInstall: Skill[], conflicts: Conflict[] }`
      verify: `cargo test -p skill-manager -- resolve_dependencies`

- [ ] A conflict is when a required version of a dep is incompatible with an already-installed version
      verify: `cargo test -p skill-manager -- resolve_conflict`

- [ ] Write unit tests: no deps, deps already installed, missing deps, version conflict
      verify: `cargo test -p skill-manager -- resolve_dependencies`

### Story 8.2 — Install sheet
*As Daniel, I see a step-by-step sheet that shows what will be installed and lets me confirm before anything touches the disk.*

- [ ] Build `InstallSheet` modal: Step 1 — review skill + deps list; Step 2 — progress; Step 3 — success / error
      verify: `npx vitest run src/components/__tests__/InstallSheet.test.tsx`

- [ ] Step 1: list each package to be installed with version; surface conflicts with plain-language explanation
      verify: `npx vitest run src/components/__tests__/InstallSheet.conflicts.test.tsx`

- [ ] Cancel on any step aborts safely; no partial installs left on disk
      verify: `cargo test -p skill-manager --test integration -- install_cancel_cleanup`

- [ ] Proceed button disabled until dep resolution is complete
      verify: `npx vitest run src/components/__tests__/InstallSheet.test.tsx`

### Story 8.3 — Install progress and result
*As Daniel, I can see the download and install progress in real time and know exactly what succeeded or failed.*

- [ ] Tauri command `install_skill(id)` streams progress events: `downloading`, `extracting`, `writing`, `done` / `error`
      verify: `cargo test -p skill-manager -- install_skill_events`

- [ ] Progress ring on Step 2 driven by events; per-package status rows
      verify: `npx vitest run src/components/__tests__/InstallSheet.progress.test.tsx`

- [ ] On success: close sheet after 1.5 s, Library view refreshes, toast "Skill installed"
      verify: `npx vitest run src/views/__tests__/LibraryView.post-install.test.tsx`

- [ ] On error: show error message + "Try again" and "Report issue" actions; partial files cleaned up
      verify: `cargo test -p skill-manager --test integration -- install_error_cleanup`

### Epic 8 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: install a skill from Discover, watch progress, confirm it appears in Library
- [ ] `/release-branch` → PR created → merge → `v0.8.0` tagged by semantic-release

---

## Epic 9 · v0.9.0 — Updates and activity feed

> Branch: `epic/9-updates-activity`
> Commit: `feat: add update detection, one-click updates, and activity feed`

Keep skills current; know what changed.

### Story 9.1 — Update detection
*As Daniel, I can see at a glance which skills are out of date.*

- [ ] On Library load, compare local versions against registry for all installed skills
      verify: `npx vitest run src/store/__tests__/skills-updates.test.tsx`

- [ ] Set `status: "outdated"` and show amber badge on out-of-date cards
      verify: `npx vitest run src/components/__tests__/SkillCard.outdated.test.tsx`

- [ ] Show a "X updates available" banner at the top of the library when any exist
      verify: `npx vitest run src/views/__tests__/LibraryView.update-banner.test.tsx`

- [ ] Fetch check is cached for 30 min; manual refresh available
      verify: `npx vitest run src/store/__tests__/skills-updates.cache.test.tsx`

### Story 9.2 — One-click and bulk update
*As Daniel, I can update a single skill from its detail panel, or update everything at once.*

- [ ] Add "Update to vX.Y.Z" button in detail panel for outdated skills
      verify: `npx vitest run src/components/__tests__/DetailPanel.update.test.tsx`

- [ ] Add "Update all" button in library toolbar banner; runs updates serially with progress toasts
      verify: `npx vitest run src/views/__tests__/LibraryView.update-all.test.tsx`

- [ ] Reuse install flow progress events for update progress
      verify: `cargo test -p skill-manager -- update_skill_events`

- [ ] On completion, badges clear and version numbers update in place
      verify: `npx vitest run src/views/__tests__/LibraryView.post-update.test.tsx`

### Story 9.3 — Activity feed
*As Daniel, I can review a log of everything the app has done — installs, updates, uninstalls, errors.*

- [ ] Append a structured entry to `~/.config/skill-manager/activity.json` for every install, update, uninstall, enable/disable, and error
      verify: `cargo test -p skill-manager -- activity_log_write`

- [ ] Build `ActivityFeedPanel` (accessible via toolbar icon): scrollable list of entries with icon, skill name, action, timestamp
      verify: `npx vitest run src/components/__tests__/ActivityFeedPanel.test.tsx`

- [ ] Filter feed by action type; group by day
      verify: `npx vitest run src/components/__tests__/ActivityFeedPanel.filter.test.tsx`

- [ ] Cap log at 500 entries; rotate automatically
      verify: `cargo test -p skill-manager -- activity_log_rotation`

### Epic 9 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: trigger an update, confirm activity feed shows the entry in `cargo tauri dev`
- [ ] `/release-branch` → PR created → merge → `v0.9.0` tagged by semantic-release

---

## Epic 10 · v0.10.0 — Dark mode

> Branch: `epic/10-dark-mode`
> Commit: `feat: add full dark mode support across all views`

Looks great at night.

### Story 10.1 — Dark mode token layer
*As a dev, all colours are defined as CSS variables with a dark-mode override so switching modes is one class change.*

- [ ] Audit all hardcoded hex values across components; replace with CSS variables (`--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, etc.)
      verify: `grep -r '#[0-9a-fA-F]\{3,6\}' src/ | grep -v '.test.' | wc -l` (target: 0)

- [ ] Add `[data-theme="dark"]` overrides to each variable
      verify: `grep -r 'data-theme' src/styles/ | wc -l` (at least 1 per token file)

- [ ] Update `MacGlass`, `MacSidebar`, `MacWindow` to use variables instead of rgba literals
      verify: `npm run lint`

### Story 10.2 — System appearance sync
*As Daniel, the app follows my macOS system appearance automatically.*

- [ ] Use Tauri's `window-theme` API to detect current system theme on launch
      verify: `cargo test -p skill-manager -- detect_system_theme`

- [ ] Subscribe to system appearance change events; flip `data-theme` on `<html>` immediately
      verify: `manual — cargo tauri dev, toggle macOS appearance in System Settings`

- [ ] Add manual override toggle in Settings: "Appearance: System / Light / Dark"
      verify: `npx vitest run src/views/__tests__/SettingsView.appearance.test.tsx`

- [ ] No flash of wrong theme on cold start (set `data-theme` before first paint)
      verify: `manual — cargo tauri dev, cold-start in dark mode, no white flash`

### Epic 10 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes
- [ ] Manual smoke: switch macOS appearance mid-session, app follows instantly
- [ ] `/release-branch` → PR created → merge → `v0.10.0` tagged by semantic-release

---

## Epic 11 · v1.0.0 — Production release

> Branch: `epic/11-v1`
> Commit: `feat!: stable public release — onboarding, auto-update, accessibility, notarization`

`feat!:` triggers the major bump. Ship it.

### Story 11.1 — Onboarding flow
*As a new user, I'm guided to point the app at my skills directory and connect to the registry on first launch.*

- [ ] Detect first launch (no config file present)
      verify: `cargo test -p skill-manager -- detect_first_launch`

- [ ] Build 3-step onboarding sheet: Welcome → Select skills directory → Connect registry (optional, skippable)
      verify: `npx vitest run src/components/__tests__/OnboardingSheet.test.tsx`

- [ ] Grant necessary macOS permissions (file access) via Tauri during onboarding
      verify: `manual — cargo tauri dev on clean config, complete onboarding`

- [ ] "Get started" completes onboarding, config written, Library loads
      verify: `cargo test -p skill-manager -- onboarding_complete`

### Story 11.2 — Auto-update
*As Daniel, the app updates itself silently in the background and prompts me to restart when a new version is ready.*

- [ ] Configure Tauri updater with update server endpoint and public key
      verify: `cat src-tauri/tauri.conf.json | grep updater`

- [ ] Check for updates on launch (max once per 24 h)
      verify: `cargo test -p skill-manager -- auto_update_check_throttle`

- [ ] Download update in background; show unobtrusive "Update ready — restart to install" banner
      verify: `npx vitest run src/components/__tests__/UpdateBanner.test.tsx`

- [ ] "Release notes" link in banner opens the GitHub release page
      verify: `npx vitest run src/components/__tests__/UpdateBanner.release-notes.test.tsx`

### Story 11.3 — Accessibility
*As any user, I can use the entire app with keyboard only and with VoiceOver enabled.*

- [ ] Audit all interactive elements: every button, toggle, card, and input has an accessible label
      verify: `npx vitest run src/ --reporter=verbose 2>&1 | grep -i 'a11y'`

- [ ] Implement full keyboard navigation: Tab through interactive elements, arrow keys in lists, Enter/Space to activate
      verify: `manual — cargo tauri dev, navigate entire app without mouse`

- [ ] Verify WCAG 2.1 AA contrast ratios in both light and dark mode (use `axe-core` in CI)
      verify: `npx vitest run src/__tests__/a11y.contrast.test.tsx`

- [ ] Add visible focus rings to all interactive elements (2px `--color-accent` outline)
      verify: `manual — cargo tauri dev, Tab through all interactive elements`

- [ ] Test with macOS VoiceOver: Library, Detail panel, Install flow, Settings
      verify: `manual — enable VoiceOver (Cmd+F5), navigate all main flows`

### Story 11.4 — Performance hardening
*As Daniel, the app opens fast and stays fast even with 200+ skills installed.*

- [ ] Profile cold-start with Instruments; target < 1.5 s on M1
      verify: `manual — Instruments time profile, cold-start < 1.5 s`

- [ ] Virtualise the skill list (only render visible cards) using `react-virtual`
      verify: `npx vitest run src/components/__tests__/SkillList.virtual.test.tsx`

- [ ] Lazy-load Discover tab and Activity feed; don't fetch until first visit
      verify: `npx vitest run src/views/__tests__/LazyLoad.test.tsx`

- [ ] Run memory profile; resolve any leaks from the fs.watch subscription
      verify: `manual — Instruments memory profiler, open + navigate + close, no growth`

### Story 11.5 — Notarization and distribution
*As Daniel, the app is signed, notarized, and installable by anyone on macOS.*

- [ ] Set up Apple Developer ID signing in Tauri build config
      verify: `cat src-tauri/tauri.conf.json | grep signingIdentity`

- [ ] Add GitHub Actions job: build → sign → notarize → staple → upload to GitHub release
      verify: `cat .github/workflows/release.yml | grep -E 'notarize|staple'`

- [ ] Build for both `arm64` (Apple Silicon) and `x86_64` (Intel); produce a universal binary
      verify: `cargo tauri build --target universal-apple-darwin` (exits 0)

- [ ] Test install on a clean macOS VM: download DMG, open, drag to Applications, launch
      verify: `manual — install from DMG on a clean macOS VM`

### Story 11.6 — Documentation
*As a new user or contributor, I can find everything I need in the docs.*

- [ ] Write `README.md`: what the app does, install instructions, screenshots
      verify: `ls README.md && wc -l README.md` (non-empty)

- [ ] Write `docs/registry-api.md`: full API spec for the registry endpoints
      verify: `ls docs/registry-api.md`

- [ ] Write `docs/skill-manifest.md`: SKILL.md front-matter reference
      verify: `ls docs/skill-manifest.md`

- [ ] Verify `CHANGELOG.md` reads well (auto-generated by semantic-release)
      verify: `cat CHANGELOG.md | head -30`

### Epic 11 sign-off (`/release-branch`)
- [ ] All Stories complete and `specs/PLAN.md` tasks checked off
- [ ] `npx vitest run` passes, `cargo test` passes, `cargo clippy -- -D warnings` clean
- [ ] Manual smoke: full VoiceOver pass, cold-start < 1.5 s, install from DMG on clean VM
- [ ] `/release-branch` → PR created → merge → `v1.0.0` tagged by semantic-release 🎉

---

## Commit cheatsheet

```
feat: <what the user can now do>          → minor bump
fix: <what was broken>                     → patch bump
feat!: <breaking change title>             → major bump
chore: / docs: / refactor: / test: / perf: → no release
```

---

*Each story is a day or less of focused work. Check off tasks as you go — when all tasks in a story are done, write the `feat:` commit and push.*
