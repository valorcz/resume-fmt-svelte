# Svelte JSON & YAML Resume

A clean, printable resume viewer and customization studio built with Svelte 5 and SvelteKit. It renders resumes conforming to the standard [JSON Resume schema](https://jsonresume.org/schema/), with native YAML support, theme customization, drag-and-drop column layout editing, and print-ready stylesheets.

<p align="center">
  <img src="static/assets/preview.jpg" alt="Resume Studio & Theme Customizer Preview" width="100%" />
</p>

---

## Features

- **JSON Resume Standard**: Validated against JSON Resume Schema v1.0.0 using precompiled Ajv validators.
- **Native YAML Support**: Write your resume in `resume.yaml` with comments and clean multiline strings without syntax escaping.
- **18 Themes**: Switch between minimal academic styles, split-column layouts, timelines, corporate formats, and retro computing themes.
- **Customization Studio**:
  - Live theme switcher.
  - Accent color picker with pre-tested palettes or custom HEX values.
  - HTML5 drag-and-drop column layout manager (reorder sections, move between main/sidebar, hide/restore sections).
  - Theme mode toggling (System / Light / Dark).
  - Real-time `config.yaml` generator.
- **URL Parameter Synchronization**: Theme, accent, color mode, and custom layout selections are automatically synchronized to URL query parameters for one-click sharing.
- **Print & PDF Export**: Dedicated `@media print` stylesheets with A4 page-break controls and background color preservation.
- **GitHub Gist Loading**: Load resumes dynamically from any public GitHub Gist via `?gist=<GIST_ID>`.
- **Theme Linter**: CLI tool (`npm run lint:themes`) that verifies design tokens, CSS scoping, brand font usage, and print rules across all themes.

---

## Quick Start

### 1. Installation

```bash
git clone https://github.com/your-username/resume-json-svelte.git
cd resume-json-svelte
npm install
```

### 2. Add Your Resume Data

Copy the provided starter template to `static/resume.yaml`:

```bash
cp static/resume.example.yaml static/resume.yaml
```

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build Static Site

```bash
npm run build
```

The output in `build/` can be deployed to any static hosting provider (Cloudflare Pages, GitHub Pages, Vercel, Netlify, or AWS S3).

---

## Writing Your Resume

You can supply your resume as either `static/resume.yaml` or `static/resume.json`.

### Schema Validation & IDE Autocomplete

To enable auto-completion, field validation, and documentation tooltips in VS Code, Cursor, and other editors, add this line at the top of your `resume.yaml`:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json
```

### Example `resume.yaml`

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json

# Optional embedded theme configuration
_config:
  theme: modern-timeline
  layout:
    main:
      - work
      - projects
      - volunteer
    sidebar:
      - skills
      - education
      - certificates
      - languages

basics:
  name: Jane Doe
  label: Senior Systems Architect
  image: https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80
  email: jane.doe@example.com
  phone: +1 (555) 234-5678
  url: https://janedoe.dev
  summary: >
    Systems architect with experience building distributed applications 
    and microservices in TypeScript, Go, and Rust.
  location:
    city: San Francisco
    region: California
    countryCode: US
  profiles:
    - network: GitHub
      username: janedoe
      url: https://github.com/janedoe
    - network: LinkedIn
      username: janedoe
      url: https://linkedin.com/in/janedoe

work:
  - name: Acme Cloud Systems
    position: Lead Systems Architect
    location: San Francisco, CA
    startDate: '2021-03-01'
    summary: Architected and scaled cloud infrastructure pipelines.
    highlights:
      - Reduced infrastructure costs by 35% through autoscaling policies.
      - Mentored an engineering team of 14 across distributed timezones.

education:
  - institution: UC Berkeley
    area: Computer Science
    studyType: Bachelor of Science
    startDate: '2013-09-01'
    endDate: '2017-05-30'

skills:
  - name: Core Technologies
    keywords:
      - TypeScript
      - Go
      - Rust
      - SvelteKit
      - Kubernetes
      - PostgreSQL
```

A complete starter template is available in [`static/resume.example.yaml`](static/resume.example.yaml).

---

## URL Parameters & Sharing

The application continuously syncs custom configurations to the browser URL using `history.replaceState`. Anyone opening the link will see the exact theme and layout on initial render:

| Parameter | Example | Description |
| :--- | :--- | :--- |
| `theme` | `?theme=modern-timeline` | Theme name to load |
| `accent` | `&accent=2563eb` | Custom accent HEX color override |
| `mode` | `&mode=dark` | UI appearance mode (`system`, `light`, `dark`) |
| `layout` | `&layout=work,projects\|skills,education` | Custom column layout (`main_sections\|sidebar_sections`) |
| `gist` | `?gist=8f9a2b4c6d...` | Public GitHub Gist ID containing `resume.yaml` or `resume.json` |

#### Example Shareable URL:
```text
https://your-domain.com/?theme=modern-timeline&accent=0d9488&mode=dark&layout=work,projects|skills,education
```

You can copy this link at any time using the **Share URL** button in the Studio drawer header.

---

## Available Themes

Themes are located in `src/lib/themes/` and include dedicated print rules:

| Theme Slug | Description | Default Accent |
| :--- | :--- | :--- |
| `classic` | Traditional black & white single-column resume | `#111827` |
| `modern-timeline` | Two-tone header with vertical timeline dots | `#2563eb` |
| `executive-slate` | Corporate split sidebar with navy navigation | `#1e293b` |
| `elegant-split` | Dual-pane layout with soft borders | `#2f5233` |
| `europass` | Standardized European Commission tabular CV | `#0e4194` |
| `gov` | Formal federal serif format with top accent bar | `#3b82f6` |
| `editorial` | Newsprint-style serif layout | `#b45309` |
| `noir-city` | High-contrast monochrome layout | `#18181b` |
| `tailwind-blueprint` | Technical layout with monospace grid accents | `#0284c7` |
| `vibe-glow` | Dark neon glow with glassmorphism | `#00f0ff` |
| `cyber-script` | Terminal layout with offset shadows | `#ff0055` |
| `terminal` | CRT phosphor green console layout | `#22c55e` |
| `bio-vision` | Teal and mint palette for technical/scientific CVs | `#0d9488` |
| `neural-botany` | Emerald and foliage tones | `#15803d` |
| `16bit-amiga` | Amiga Workbench 1.3 retro computing style | `#ff8800` |
| `8bit-demo` | Demoscene 8-bit aesthetic | `#55ffff` |
| `the-verge` | Tech magazine editorial styling | `#ff005d` |
| `executive-baseline` | Strict Harvard black & white corporate layout | `#000000` |

---

## Theme Authoring & Validation

To add a new theme:

1. Create a directory in `src/lib/themes/<theme-name>/`.
2. Add `config.yaml` specifying default layout (`main` and `sidebar` arrays) and section titles (`i18n`).
3. Add `style.css` scoped under `.theme-<theme-name>`.
4. Validate theme conformance:
   ```bash
   npm run lint:themes
   ```

The linter validates:
- Presence of required design tokens (`--bg`, `--ink`, `--accent`, `--border`, `--font-body`, `--font-heading`).
- Print stylesheet rules and `-webkit-print-color-adjust` declarations.
- Dangerous `break-inside: avoid` page-break declarations on top-level cards.
- Proper Font Awesome 6 Brands scoping for social icons.
- Valid JSON Resume section names in `config.yaml`.

---

## Development Commands

```bash
# Start local development server
npm run dev

# Run theme linting suite
npm run lint:themes

# Build static production bundle
npm run build

# Preview static build locally
npm run preview
```

---

## License

MIT License.
