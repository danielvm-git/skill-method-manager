# Design Prompt: Skills and Methods Manager — macOS App

Use this prompt in **claude.ai** (or any design-focused AI tool) to generate the full design
package for the Skills and Methods Manager app.

---

## PROMPT (copy everything below this line)

---

I need you to act as a senior product designer and systems architect. Your job is to produce the complete design package for a **macOS desktop application** called **Skills and Methods Manager**. This is a developer/power-user tool that lets people manage AI skills and SDD (Software-Driven Development) methods installed on their Mac — similar to how Homebrew or npm manage packages, but with a polished native macOS GUI.

---

### 1. WHAT THE APP DOES

The app is a **package manager GUI** for AI-powered skills and methods. Concretely:

- **Browse** all installed AI skills and SDD methods in one place
- **Install** new skills/methods from a registry or marketplace
- **Uninstall** skills/methods no longer needed
- **Update** skills/methods to newer versions
- **View details** about each skill (description, version, author, dependencies, last updated)
- **Search & filter** the local library and the remote registry
- **Enable/disable** individual skills without fully uninstalling them
- **See status** of each skill (active, inactive, outdated, broken)

Think of it as **Homebrew Cask + VS Code Extensions + macOS System Settings** combined into one native-feeling app.

---

### 2. TARGET USER

- macOS power users and developers who work with AI tools daily
- They are comfortable with terminal but **prefer a GUI for management tasks**
- They may have dozens of skills installed and need a fast, scannable overview
- They care about clarity, speed, and not having to memorize CLI commands

---

### 3. WHAT I NEED FROM YOU

Please produce all of the following:

#### A. System Architecture Overview
- High-level diagram (described textually or as ASCII/Mermaid) showing the major components: UI layer, local skills store, remote registry, CLI bridge, and file system
- How the app reads installed skills (file paths, config files, manifests)
- How it communicates with a remote registry to discover and install new skills
- Data models: what a "Skill" object looks like, what a "Method" object looks like

#### B. Information Architecture & Screen Map
- A complete sitemap / screen flow showing every view in the app
- Navigation model (sidebar? tabs? top nav?)
- How the user moves from browsing → detail → install → confirmation → success

#### C. UI/UX Design Specification

Design a **native macOS app** with these screens. For each screen, describe the layout, key components, and interaction patterns:

1. **Main Library View** — list/grid of all installed skills and methods, with status badges, search bar, and filters (by type, status, author)
2. **Skill Detail View** — full info card for a selected skill: name, description, version history, dependencies, enable/disable toggle, uninstall button, update button
3. **Discover / Registry View** — browse and search available skills from the remote registry; install button, ratings/popularity, categories
4. **Install Flow** — step-by-step modal or sheet: select → review dependencies → confirm → progress indicator → success/error
5. **Settings View** — registry URL, local install path, update preferences, CLI path configuration
6. **Notifications / Activity Feed** — recent installs, updates, errors

#### D. Visual Design Language

Define a complete design system for the app:

- **Color palette** — primary, secondary, accent, semantic colors (success, warning, error, info). Choose something that feels at home on macOS but has a modern, slightly "AI-forward" personality. Provide hex codes.
- **Typography** — font choices (system fonts preferred: SF Pro), sizes, weights for headings, body, labels, code snippets
- **Iconography style** — SF Symbols recommendations for each major action and skill type
- **Component library** — describe the key reusable components: skill cards, status badges, search bar, sidebar nav items, install buttons, progress indicators, toggle switches
- **Dark mode** — specify how the palette adapts; the app must look great in both light and dark
- **Spacing & grid** — base unit, padding conventions, card sizes

#### E. Prototype Specification

Describe (or generate as HTML/CSS mockup if possible) the following prototype screens in enough detail that a developer could build them:

1. **Library View** (default landing screen)
2. **Skill Detail side panel** (opens when a skill is clicked)
3. **Discover tab**
4. **Install confirmation modal**

For each prototype screen include:
- Exact layout dimensions and proportions
- Which elements are interactive and what they do
- Hover, active, and focus states for key controls
- Empty states and loading states

#### F. Micro-interactions & Animations

Describe the key animations that bring the app to life:
- Skill card hover
- Install progress (downloading → installing → done)
- Enable/disable toggle
- Search filtering (live results)
- Sidebar collapse/expand
- Error shake / success checkmark

#### G. Accessibility Checklist

- Minimum contrast ratios met (WCAG AA)
- Full keyboard navigation plan
- VoiceOver labels for all interactive elements
- Focus ring styles

---

### 4. DESIGN CONSTRAINTS & PREFERENCES

- **Platform**: macOS 13 Ventura and above (use SwiftUI idioms as reference for spacing and controls, even if the final impl is Electron or Tauri)
- **Window size**: Default 1200×800, minimum 900×600
- **Style**: Clean, modern, slightly minimal — inspired by **Linear**, **Raycast**, and **macOS System Settings**. Not overly colorful. Neutral base with purposeful accent use.
- **Tone**: Professional but approachable. This is a power tool, not a toy.
- **No external dependencies for fonts** — use SF Pro / system fonts only
- **The app should feel fast** — loading states should be subtle, transitions under 200ms

---

### 5. DELIVERABLES FORMAT

Please structure your response as follows:

1. System Architecture section (with diagram)
2. Screen Map (text or Mermaid diagram)
3. UI/UX Spec per screen (one section per screen)
4. Visual Design Language (color palette table, typography table, component descriptions)
5. Prototype Descriptions with layout specs
6. Micro-interactions list
7. Accessibility Checklist

If you can generate any HTML/CSS mockups or SVG wireframes, please include them inline.

---

*End of prompt*
