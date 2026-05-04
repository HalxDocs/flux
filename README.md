# reqit

A fast, local-first API client built for developers who want speed without the bloat. No Electron. No cloud account. No telemetry. Your collections live as plain JSON files you own.

[![Release](https://img.shields.io/github/v/release/HalxDocs/reqit?style=flat-square)](https://github.com/HalxDocs/reqit/releases/latest)
[![Stars](https://img.shields.io/github/stars/HalxDocs/reqit?style=flat-square)](https://github.com/HalxDocs/reqit/stargazers)
[![License](https://img.shields.io/github/license/HalxDocs/reqit?style=flat-square)](LICENSE)

---

## Download

| Platform | Link |
|----------|------|
| Windows  | [reqit-windows-amd64.exe](https://github.com/HalxDocs/reqit/releases/latest/download/reqit-windows-amd64.exe) |
| macOS    | [reqit-macos-universal.zip](https://github.com/HalxDocs/reqit/releases/latest/download/reqit-macos-universal.zip) |
| Linux    | [reqit-linux-amd64](https://github.com/HalxDocs/reqit/releases/latest/download/reqit-linux-amd64) |

Or visit the [releases page](https://github.com/HalxDocs/reqit/releases).

---

## Features

- **HTTP client** — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS with full params, headers, and body support
- **Collections** — save and organise requests; plain JSON files on your machine
- **Workspaces** — group collections by project; each workspace is a folder you own
- **Environments** — `{{VAR}}` interpolation across URLs, headers, and body fields
- **Auth** — Bearer token, Basic, and API Key support
- **Response viewer** — syntax-highlighted JSON, XML, and HTML pretty-print; in-body search
- **Code generation** — copy as cURL, JavaScript `fetch`, or Python `requests`
- **Postman import** — drop in a v2.1 collection instantly
- **cURL import** — paste any curl command and it opens as a request tab
- **History** — every request is automatically logged
- **Team collaboration** — Git-based sync; see active teammates, commit & push, invite via shared remote URL
- **Cross-device sync** — drop a workspace folder into Dropbox, Drive, or OneDrive; no account needed
- **Keyboard shortcuts** — built for keyboard-first use

## Data storage

Everything is local. No data leaves your machine.

| Platform | Path |
|----------|------|
| Windows  | `%APPDATA%\reqit\` |
| macOS    | `~/Library/Application Support/reqit/` |
| Linux    | `~/.config/reqit/` |

---

## macOS — Gatekeeper Warning

macOS blocks apps that aren't notarized. reqit is safe — this warning appears because the app isn't signed with an Apple Developer certificate yet.

**To open it anyway:**

1. Right-click `reqit.app` → **Open** → **Open** in the dialog
2. Or: **System Settings → Privacy & Security → Open Anyway**

Or via Terminal:
```bash
xattr -cr /path/to/reqit.app
```

---

## Built with

| Layer | Technology |
|-------|-----------|
| Desktop framework | [Wails v2](https://wails.io) |
| Backend | [Go 1.22](https://go.dev) |
| Frontend | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build tool | [Vite](https://vitejs.dev) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com) |
| Icons | [HugeIcons](https://hugeicons.com) |
| JSON editor | [CodeMirror 6](https://codemirror.net) |
| State management | [Zustand](https://zustand-demo.pmnd.rs) |
| Git sync | [go-git](https://github.com/go-git/go-git) |
| Fonts | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) + [Inter](https://rsms.me/inter/) |

---

## Running from source

**Prerequisites:** Go 1.22+, Node 20+, [Wails CLI v2](https://wails.io/docs/gettingstarted/installation)

```bash
# Install Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Clone and run in dev mode
git clone https://github.com/HalxDocs/reqit.git
cd reqit/flux
wails dev
```

**Production build:**

```bash
cd reqit/flux
wails build
```

**Web landing page only:**

```bash
cd reqit/flux/frontend
npm install --include=dev
npm run build:web
```

---

## Documentation

See [DOCS.md](DOCS.md) for the full user guide including team collaboration setup.

---

## Contributing

Issues and PRs are welcome. Keep requests focused — one feature or fix per PR.

---

Built by [HalxDocs](https://halxdocs.com)
