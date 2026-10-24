# Developer & Contributor Guide

A comprehensive guide for developers, contributors, and maintainers working on **Resume Studio** (`resume-fmt-svelte`).

---

## 1. Architecture Overview

Resume Studio is built with modern web technologies adhering to a **100% client-side, zero-backend privacy architecture**:

- **Framework**: [Svelte 5](https://svelte.dev/) with SvelteKit.
- **Reactivity Model**: Svelte 5 Runes (`$state`, `$derived`, `$derived.by`, `$effect`, `$props`, `$bindable`).
- **Adapter**: `@sveltejs/adapter-static` generating fully offline, prerendered static assets in `build/`.
- **Validation**: Schema validation via [Ajv](https://ajv.js.org/) compiled against the standard [JSON Resume Schema v1.0.0](https://jsonresume.org/schema/).
- **Theme Architecture**: Dynamic on-demand CSS loading with scoped design tokens (`.theme-<theme-name>`).
- **Print Engine**: Universal `@media print` mechanics with strict page-budgeting, anti-widow bindings, and dynamic `@page` format/margin injection.

---

## 2. Prerequisites & Setup

### Requirements
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `pnpm` (recommended) or `npm`
- **Optional (for Headless Print & ATS Testing)**:
  - `chromium-browser` or `google-chrome`
  - `pdfinfo` and `pdftotext` (from `poppler-utils` on Ubuntu/Debian, or `poppler` on macOS Homebrew)

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/valorcz/resume-fmt-svelte.git
cd resume-fmt-svelte
pnpm install
```

---

## 3. Local Development

### Start Development Server
```bash
pnpm run dev
# or using Makefile
make dev
```
Navigate to [http://localhost:5173](http://localhost:5173). Vite provides instant Hot Module Replacement (HMR).

### Useful URL Query Parameters for Local Testing
- `?theme=<slug>`: Force a specific theme on boot (e.g. `?theme=classic`).
- `?src=<fixture-path>`: Load a local fixture file (e.g. `?src=fixtures/candidate-standard-2page.yaml`).
- `?format=a4` or `?format=letter`: Test paper dimensions.
- `?view=recruiter`: Test clean recruiter mode.

---

## 4. Verification & Testing Suites

We provide strict linters and automated tests to guarantee zero regressions.

### Comprehensive Health Check
```bash
make check
```
Runs the full verification pipeline:
1. `pnpm run lint:themes`: Validates CSS scoping, design tokens, print stylesheets, and `config.yaml` across all 18 themes.
2. `pnpm run check:support`: Checks Node.js and dependencies for active Long-Term Support (EOL prevention).
3. `pnpm run check:svelte`: Runs `svelte-check` type and rune analyzer.
4. `pnpm run build`: Tests Vite production bundling and static asset prerendering.

### Headless Print & ATS Text Linearity Test Suite
```bash
make test-print
# or directly
pnpm run test:print
```

This automated harness (`scripts/test-print.js`):
1. Boots an ephemeral local static HTTP server.
2. Drives headless Chromium (`--print-to-pdf`) across **all 18 themes** in both **A4** and **US Letter** formats.
3. Uses `pdfinfo` to verify the **2-page core budget** on standard 8-year senior engineering profiles (`fixtures/candidate-standard-2page.yaml`).
4. Uses `pdftotext` to extract the raw PDF text stream, asserting:
   - **ATS Linearity**: Correct reading order (Name -> Role -> Summary -> Work -> Skills).
   - **Anti-Widow Headings**: Guarantees no section heading sits orphaned at the bottom of a page.
5. Verifies 1-page junior candidate budget (`fixtures/candidate-junior-1page.yaml`).
6. Verifies Page 3+ Supplemental Annex break (`fixtures/candidate-senior-annex.yaml`).

---

## 5. Project Directory Structure

```
resume-fmt-svelte/
├── docs/                     # Guides, blueprints, and handbook source files
│   ├── handbook/             # User handbook chapters (Markdown)
│   ├── themes/               # Theme developer guides & print specifications
│   └── DEVELOPMENT.md        # This developer guide
├── scripts/                  # Development & automated test scripts
│   ├── check-support.js      # Dependency EOL validator
│   ├── lint-themes.js        # Theme CSS and configuration linter
│   └── test-print.js         # Headless Chromium print & ATS verification harness
├── src/
│   ├── lib/
│   │   ├── audit/            # Recruiter summary synthesis & ATS scoring
│   │   ├── components/       # Svelte UI components (Studio drawer, modals, preview)
│   │   │   └── studio/       # Studio drawer tabs, cutlines, and controls
│   │   ├── export/           # Offline single-file HTML & YAML exporter
│   │   ├── schema/           # JSON Resume schema & precompiled Ajv validator
│   │   ├── styles/           # core.css & universal print-core.css
│   │   └── themes/           # 18 self-contained theme directories
│   │       └── <theme>/      # config.yaml + style.css
│   └── routes/               # SvelteKit page routes (+page.svelte, +page.js)
├── static/                   # Static assets & test fixtures
│   ├── assets/               # Screenshots, logos, icons
│   └── fixtures/             # Candidate test fixtures for print verification
├── Makefile                  # Canonical CLI task runner
└── package.json              # Project scripts and dependencies
```

---

## 6. Building & Static Deployment

### Production Build
```bash
pnpm run build
```
The compiled, zero-backend static site is output to `build/`. It can be deployed to any static host without server runtime dependencies:

- **GitHub Pages**: Deploy the `build/` directory via the official GitHub Actions Pages workflow.
- **Cloudflare Pages**: Set build command to `pnpm run build` and output directory to `build`.
- **Vercel / Netlify**: Connect repository with static framework preset.
