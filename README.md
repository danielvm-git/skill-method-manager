# Skills & Methods Manager

A native-feeling macOS package manager for browsing, installing, and managing AI skills and SDD methods. Built with Tauri, Rust, and React, following the "Liquid Glass" macOS Tahoe design language.

## Features
- ✨ **Discovery:** Browse a remote registry for new AI capabilities.
- 📦 **Library:** Manage your installed skills and methods with real-time status tracking.
- 🆙 **Updates:** Automatic detection of out-of-date skills with one-click updates.
- 🌙 **Dark Mode:** Full system appearance synchronization.
- ✨ **Onboarding:** Guided setup for new users.

## Stack
- **Frontend:** React, Vite, Vanilla CSS.
- **Backend:** Rust, Tauri.
- **Testing:** Vitest, React Testing Library.

## Getting Started
### Prerequisites
- Node.js (v20+)
- Rust toolchain (`rustup`)

### Installation
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run tauri dev` to start the application in development mode.

## Distribution
To build a production DMG:
```bash
npm run tauri build
```
The application will be built and packaged in `src-tauri/target/release/bundle/dmg`.

## License
ISC
