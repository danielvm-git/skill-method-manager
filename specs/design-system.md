# Design System — Skills & Methods Manager

**Based on:** macOS Tahoe "Liquid Glass" design language  
**Updated:** May 18, 2026  
**Component library:** `components/macos-window.jsx`

---

## Architecture & Philosophy

### One app, three sources of truth

The app is a thin GUI over three things it does not own:

1. **File system** — installed skill manifests at `$XDG_DATA_HOME/skills/`, `~/Library/Application Support/SkillsManager/methods/`, and optional project roots (⌘O).
2. **CLI bridge** — `skillctl` binary for all state-changing operations (install, uninstall, enable, update, disable).
3. **Remote registry** — discovery and download API for browsing and fetching new skills.

**State flow:** Registry and file system are the truth; the app reads, observes, and dispatches through the CLI bridge. The app never mutates files directly. Every operation streams JSON-line progress events that the install flow renders live.

### Skill vs. Method

- **Skill:** A unit of capability — typically a directory of prompts, scripts, and a manifest (`skill.toml`).
- **Method:** A higher-order workflow that composes skills. Adds a `phases[]` field to the base Skill shape.

Both are displayed in the Library and Discover views using the same card layout.

---

## Screen Map

**One window, persistent sidebar, single-page content area.**

| View | Sidebar | Content | Interaction |
|------|---------|---------|-------------|
| Library | Nav (Library, Discover, Settings) | Skill list, toolbar search | Click skill → detail panel slides in |
| Discover | Nav items | Registry card grid by category | Click card → fullscreen detail |
| Settings | Nav items | Two-column form (subsections + controls) | Changes auto-apply |
| Activity | Nav items | Reverse-chronological event feed | Filter by action type |

**Detail surfaces as a slide-in panel** (right edge, 420 px) rather than a new route. This preserves library context and keeps the back-stack at zero. Install is a sheet, not a route. There is no "home" tab; the library *is* home.

---

## Window & Layout

### MacWindow

Top-level container: sidebar + toolbar + content area.

```jsx
<MacWindow
  width={1200}           // default; min 900
  height={800}           // default; min 600
  title="Library"        // toolbar title
  sidebar={<...items/>}  // MacSidebar children
>
  {/* main content */}
</MacWindow>
```

**Default size:** 1200 × 800 px  
**Minimum size:** 900 × 600 px  
**Border radius:** 26 px  
**Shadow:** `0 0 0 1px rgba(0,0,0,0.23), 0 16px 48px rgba(0,0,0,0.35)`

Below 900 px width, the sidebar collapses to icon-only mode.

### MacSidebar

Frosted-glass sidebar panel (220 px wide) containing nav items and section headers.

```jsx
<MacSidebar>
  <MacSidebarHeader title="LIBRARY" />
  <MacSidebarItem label="Library" selected />
  <MacSidebarItem label="Discover" />
  <MacSidebarHeader title="APP" />
  <MacSidebarItem label="Settings" />
</MacSidebar>
```

**Width:** 220 px (fixed)  
**Background:** `rgba(210,225,245,0.45)` periwinkle-tinted frosted glass  
**Blur:** 50 px + 200% saturation  
**Border radius:** 18 px  
**Traffic lights:** rendered at top-left (14 px dots)

---

## Components

All primitives live in `components/macos-window.jsx`.

### MacGlass

Liquid-glass surface: backdrop blur + white tint + inset highlight ring.

```jsx
<MacGlass radius={16} dark={false}>
  <button>Action</button>
</MacGlass>
```

**Props:**
- `radius` (default 16): border-radius in px
- `dark` (default false): dark-variant tint for dark mode
- `children`: content to render on top

**Light mode:** `rgba(255,255,255,0.35)` tint, 40px blur, inset highlight  
**Dark mode:** `rgba(255,255,255,0.08)` tint, 40px blur, darker shadow

### MacToolbar

Toolbar row: title left, action button + search pill right.

```jsx
<MacToolbar
  title="Library"
  searchPlaceholder="Search"
  actions={<CustomButton />}
/>
```

**Props:**
- `title` (default "Folder"): window title
- `searchPlaceholder` (default "Search"): search input hint
- `actions`: optional custom control (replaces default dot)

**Height:** 44 px  
**Padding:** 8 px  
**Title font:** SF Pro, 15 px, bold (700)  
**Search icon:** SVG magnifier (13 × 13 px)

### MacSidebarItem

Clickable navigation row with selected state and optional icon.

```jsx
<MacSidebarItem
  label="Library"
  selected
  onClick={() => navigate('/library')}
/>
```

**Props:**
- `label`: display text
- `selected` (default false): highlights the row
- `icon`: optional custom icon (replaces default dot)
- `onClick`: click handler

**Height:** 24 px  
**Font:** SF Pro, 11 px, medium (500)  
**Icon:** 14 × 14 px dot (blue #007aff when selected, grey when not)  
**Selected state:** dark overlay + darker icon

### MacSidebarHeader

Muted section label inside the sidebar.

```jsx
<MacSidebarHeader title="LIBRARY" />
```

**Props:**
- `title`: section label text

**Font:** SF Pro, 11 px, bold (700), uppercase  
**Color:** `rgba(0,0,0,0.50)` muted grey  
**Padding:** 14 px top, 18 px horizontal

### MacTrafficLights

Close / minimise / zoom dot trio (14 × 14 px each).

```jsx
<MacTrafficLights />
```

**Colors:**
- Red (close): `#ff736a`
- Yellow (minimise): `#febc2e`
- Green (zoom): `#19c332`

**Border:** 0.5 px `rgba(0,0,0,0.10)`

---

## Design Tokens

### Color Palette

**Warm-neutral base, quiet indigo-violet accent.**

#### Surfaces

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | #F7F6F3 | (inverted) | Page background |
| `--paper` | #FFFFFF | (dark equivalent) | Card/container bg |
| `--paper-2` | #FBFAF7 | (dark equivalent) | Secondary surface |
| `--ink` | #14161A | (light equivalent) | Primary text |
| `--ink-2` | #2C2F36 | (light equivalent) | Secondary text |
| `--muted` | #6B6F78 | (light equivalent) | Tertiary text |
| `--line` | #E6E3DC | (light equivalent) | Borders |

#### Brand & Semantic

| Token | Value | Use |
|-------|-------|-----|
| `--accent` | `oklch(55% 0.16 280)` | Primary action, links |
| `--accent-soft` | `oklch(55% 0.16 280 / 0.10)` | Soft background |
| `--ok` | `oklch(58% 0.14 150)` | Success state |
| `--warn` | `oklch(72% 0.14 75)` | Warning / outdated |
| `--danger` | `oklch(60% 0.19 25)` | Error / destructive |
| `--info` | `oklch(62% 0.12 235)` | Informational |

**Dark mode:** Surface tokens invert with a slight warm bias. Accent and semantic colors are lifted by 8–10 `L` points so they sit confidently on dark surfaces without becoming candy.

### Type Scale

**System fonts only.** No custom font files.

| Use | Font | Size | Weight |
|-----|------|------|--------|
| Body / UI | SF Pro Text | 14 px | 400 (regular) |
| Labels | SF Pro Text | 13 px | 500 (medium) |
| Sidebar | SF Pro Text | 11 px | 500/700 |
| Toolbar title | SF Pro Display | 15 px | 700 (bold) |
| Card title | SF Pro Text | 15 px | 600 (semibold) |
| Heading | SF Pro Display | 20+ px | 700 (bold) |
| Monospace (IDs, versions, paths) | SF Mono | 12 px | 400 |

**Font stack (resolves to SF Pro on macOS):**
```
-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif
```

### Spacing Scale

**4 px base.** All spacing is a multiple of 4.

| Token | Value | Use |
|-------|-------|-----|
| s1 | 4 px | Micro gaps |
| s2 | 8 px | Small gaps, padding |
| s3 | 12 px | Regular gaps |
| s4 | 16 px | Comfortable spacing |
| s5 | 20 px | Card padding |
| s6 | 24 px | Section spacing |
| s8 | 32 px | Large sections |
| s10 | 40 px | Page margins |
| s12 | 48 px | Extra large |
| s16 | 64 px | Hero spacing |

**Applied layout:**
- **Card padding:** 20 px (s5)
- **Row padding:** 14 px vertical, 8 px horizontal
- **Sidebar width:** 220 px (fixed)
- **Detail panel:** 420 px (fixed)
- **Row height (list items):** 44 px (dense), 56 px (comfortable)

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| r-sm | 6 px | Small buttons |
| r-md | 10 px | Tags, pills |
| r-lg | 14 px | Cards |
| r-xl | 18 px | Modals, panels |
| r-2xl | 22 px | Large containers |
| Window radius | 26 px | MacWindow |
| Sidebar radius | 18 px | MacSidebar glass panel |

---

## Views & Patterns

### Library View

**The single most important view:** a flat, scannable list of everything installed.

- **Row height:** 44 px (dense) — shows ~14 skills at standard window size
- **Columns:** icon (36 px tiled) | name + version | status badge | author
- **Status badges:** active (green), inactive (grey), outdated (amber), broken (red)
- **Density & sort:** remembered per-user in localStorage
- **Interactions:**
  - Click skill → detail panel slides in from right
  - Search filters in real-time (name, author, description)
  - Filter chips for type (Skill / Method) and status

### Skill Detail (Slide-in)

Detail panel slides in from the right at 420 px wide.

- **Animation:** slide + fade-in, 180 ms ease-out (respect `prefers-reduced-motion`)
- **Library remains visible** on the left but dimmed to 60%
- **Close:** click outside, press Escape, or click back arrow
- **Sections:** metadata (version, author, path) | dependencies | enable/disable toggle | uninstall button
- **Clicking a different card** swaps content without closing the panel

### Discover View

Browse the remote registry.

- **Layout:** card grid (Featured row first, then categorized sections)
- **Cards show:** skill icon, name, author, description, install button
- **Sidebar:** category filter (from registry)
- **Search:** debounced 250 ms, filters registry results live
- **Click card → fullscreen registry detail** with screenshots, README, versions, dependencies

### Install Flow

Sheet (not a route) with three states:

1. **Review:** skill + dependencies list, conflicts highlighted, "Install" button
2. **Progress:** per-package status, progress ring, live event stream from CLI
3. **Result:** success toast + Library refresh, or error card + retry/report actions

If the user closes the sheet mid-install, `SIGINT` is sent to the CLI and partial files are rolled back.

### Settings View

Two-column layout: subsection nav left, form right.

- **Auto-apply:** settings write to config immediately on change (no save button)
- **Form rows:** 240 px label + flexible control, help text below label
- **Sections:** Skills directory, app preferences (auto-reload, launch at login, menu bar toggle)

### Activity Feed

Reverse-chronological event log: install, update, uninstall, enable, disable, error.

- **Grouped by day**
- **Filterable by action type**
- **Capped at 500 entries** (rotate automatically)
- **Audit trail** for debugging

---

## Micro-interactions

### Transitions

- **Panel slide-in:** 180 ms ease-out (right edge)
- **Panel close:** 140 ms reverse
- **Dimming (library behind panel):** 140 ms opacity fade
- **Toast appear:** 100 ms fade-in, 300 ms stagger if multiple
- **Skeleton shimmer:** 1.5 s ease-in-out, looping

### Feedback

- **Hover states:** slightly darker background, cursor pointer
- **Pressed states:** dark overlay, held until release
- **Focus rings:** 2 px `--accent` outline on all interactive elements
- **Loading:** 6 skill-card skeletons with animated shimmer
- **Empty state:** illustration + "No skills found" + hint text

### Keyboard

- **Tab:** navigate forward through interactive elements
- **Shift+Tab:** navigate backward
- **Arrow keys:** up/down in lists (Library, Discover, Activity)
- **Enter/Space:** activate button/link
- **Escape:** close panel, sheet, or modal
- **Cmd+F:** focus search input in toolbar
- **Cmd+O:** open project folder picker (Settings)

---

## Dark Mode

**System appearance sync** (respects macOS system settings by default, with manual override toggle in Settings).

**Token strategy:**
- Surface colors invert with a slight warm bias to keep the "doc" feel
- Accent and semantic colors are lifted by 8–10 `L` points (OKLch) so they sit confidently on dark surfaces

**Implementation:**
- All colors defined as CSS variables with `[data-theme="dark"]` overrides
- `data-theme` is set on `<html>` before first paint to avoid flash
- Subscribe to system appearance change events; flip `data-theme` immediately on change

**Contrast:** Verify WCAG 2.1 AA in both light and dark modes using axe-core in CI.

---

## Iconography

**Use SF Symbols throughout.** Default weight is `.regular`; selected sidebar items lift to `.medium`.

- **Icon sizes:** 16 px (inline), 20 px (list items), 24 px (toolbar)
- **Skill type icon:** 36 × 36 px tinted tile
- **Tile color:** derived from hash of skill ID, kept inside the palette
- **Grid:** all icons sit on the 4 px grid

---

## Accessibility

- **Every interactive element** has an accessible label (`aria-label`, `role="button"`, etc.)
- **Keyboard navigation:** full keyboard-only traversal of all views
- **Focus rings:** 2 px `--accent` outline visible on all interactive elements
- **Live regions:** `aria-live="polite"` on search result count, toast notifications
- **VoiceOver testing:** Library, Detail panel, Install flow, Settings
- **Reduced motion:** respect `prefers-reduced-motion` media query for animations

---

## Reference

- **Component code:** `components/macos-window.jsx`
- **Release plan:** `specs/release-plan.md`
- **Design prompt:** `specs/design-prompt.md` (used to generate this system via design tools)

---

*Last updated: May 18, 2026*
