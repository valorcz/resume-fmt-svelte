# 📄 Svelte JSON & YAML Resume

An ultra-fast, responsive, and printable resume viewer and customization studio built with **Svelte 5 (Runes)** and **SvelteKit**. Fully compliant with the official **[JSON Resume](https://jsonresume.org/)** open standard, with first-class support for clean **YAML** resumes, live GitHub Gist loading, 18 bespoke themes, drag-and-drop layout editing, and instant URL synchronization.

---

## ✨ Features

- **⚡ Modern Svelte 5 Core**: Powered by Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for reactive performance and small bundle size.
- **🎨 18 Bespoke Themes**: Curated collection ranging from classic academic Harvard styles to modern timelines, split layouts, cyber aesthetics, and retro demo computing.
- **🎛️ Interactive Resume Studio**:
  - **Theme Picker**: Switch between 18 themes.
  - **Color Palette & Accent Customizer**: Choose from curated tonal palettes or enter any custom HEX color (applies to screen and print).
  - **Visual Column & Layout Manager**: Cross-browser HTML5 drag-and-drop column organizer with section hiding and theme-specific persistence.
  - **Appearance Mode**: Toggle between **System Auto**, **Light**, and **Dark** modes.
  - **Live `config.yaml` Generator**: Copy ready-to-use configuration files in real time.
- **🔗 Zero-Flicker URL Synchronization & Sharing**:
  - All customizations (`theme`, `accent`, `mode`, `layout`) are seamlessly encoded into the URL via `history.replaceState`.
  - Shareable links load the exact custom theme and column layout on first paint without screen flickering.
  - One-click **"Share URL"** button in the Studio drawer.
- **🌐 GitHub Gist Integration**: Load any public resume on the fly by appending `?gist=<GIST_ID>` to the URL.
- **🖨️ Universal Print & PDF Engine**:
  - Pixel-perfect A4 page-break mechanics.
  - Guaranteed background color and gradient preservation (`print-color-adjust: exact`).
  - No clipped timeline lines, orphan badges, or awkward page gaps.
- **🛡️ Built-in Theme Linter**: Automated CLI tool (`npm run lint:themes`) that checks for design token integrity, CSS scoping, brand icon font families, and print hygiene.

---

## 📋 JSON & YAML Resume Standard

This viewer validates against the official **JSON Resume Schema v1.0.0**:
- **Official Specification**: [https://jsonresume.org/schema/](https://jsonresume.org/schema/)
- **Schema Validator**: Precompiled with Ajv draft-04 for instantaneous client and server validation.

### Why YAML?
While standard JSON Resume is fully supported, writing your resume in YAML (`resume.yaml`) offers major advantages:
- Support for inline comments (`# TODO`).
- Clean multiline strings (`>` and `|`) without messy `\n` escapes.
- Human-friendly editing with minimal syntax noise.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/resume-json-svelte.git
cd resume-json-svelte
npm install
```

### 2. Add Your Resume
Place your resume data in `static/resume.yaml` (or `static/resume.json`):
```bash
cp static/resume.example.yaml static/resume.yaml
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
To generate an optimized static website in the `build/` directory (ready for GitHub Pages, Cloudflare Pages, Vercel, Netlify, or S3):
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 📑 YAML Resume Example

Below is a complete `resume.yaml` snippet conforming to the schema (a full copy is available in [`static/resume.example.yaml`](static/resume.example.yaml)):

```yaml
# Optional theme & layout configuration
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
    Passionate software architect with 10+ years of experience building resilient, 
    distributed web applications and high-throughput microservices in TypeScript, Go, and Rust.
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
    summary: Architected and scaled Kubernetes-native data processing pipelines.
    highlights:
      - Reduced cloud infrastructure costs by 35% through autoscaling policies.
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

---

## 🔗 URL Query Parameters

You can share pre-configured views of any resume by passing query parameters in the URL:

| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `theme` | `string` | `?theme=modern-timeline` | Slug of the theme to load |
| `accent` | `hex` | `&accent=2563eb` | Custom accent HEX color override |
| `mode` | `enum` | `&mode=dark` | UI color mode (`system`, `light`, `dark`) |
| `layout` | `string` | `&layout=work,projects\|skills,education` | Custom column arrangement (`main\|sidebar`) |
| `gist` | `string` | `?gist=8f9a2b4c6d...` | Public GitHub Gist ID containing `resume.json`/`resume.yaml` |

#### Shareable URL Example:
```text
https://your-resume.com/?theme=modern-timeline&accent=0d9488&mode=dark&layout=work,projects,volunteer|skills,education,certificates
```

---

## 🎨 Theme Directory

All themes reside in `src/lib/themes/` and provide both screen styling and dedicated `@media print` rules:

| Theme Slug | Style Description | Recommended Accent |
| :--- | :--- | :--- |
| **`classic`** | Traditional black & white single-column resume | `#111827` (Charcoal) |
| **`modern-timeline`** | Two-tone header with vertical timeline dots & badges | `#2563eb` (Cobalt) |
| **`executive-slate`** | Premium corporate split sidebar with dark slate nav | `#1e293b` (Navy Slate) |
| **`elegant-split`** | Sophisticated dual-pane layout with subtle borders | `#2f5233` (Forest) |
| **`europass`** | Standardized European Commission tabular CV format | `#0e4194` (EU Blue) |
| **`gov`** | Formal federal serif CV with top banner accent | `#3b82f6` (Federal Blue) |
| **`editorial`** | New York Times inspired serif newsprint layout | `#b45309` (Amber Ink) |
| **`noir-city`** | High-contrast film noir monochrome design | `#18181b` (Zinc) |
| **`tailwind-blueprint`**| Technical blueprint with monospace accents & grid lines | `#0284c7` (Sky Blue) |
| **`vibe-glow`** | Neon synthwave glow aesthetic with glassmorphism | `#00f0ff` (Cyan Glow) |
| **`cyber-script`** | Cyberpunk terminal styling with offset shadows | `#ff0055` (Laser Magenta) |
| **`terminal`** | Retro CRT phosphor green hacker terminal | `#22c55e` (Matrix Green) |
| **`bio-vision`** | Clean medical and biotechnology palette | `#0d9488` (Teal) |
| **`neural-botany`** | Organic emerald and lime foliage tones | `#15803d` (Spruce) |
| **`16bit-amiga`** | Commodore Amiga Workbench 1.3 retro computing style | `#ff8800` (Workbench Orange) |
| **`8bit-demo`** | Commodore 64 / ZX Spectrum 8-bit demoscene layout | `#55ffff` (C64 Cyan) |
| **`the-verge`** | Bold editorial tech magazine styling | `#ff005d` (Verge Pink) |
| **`executive-baseline`**| Strict Harvard black & white corporate layout | `#000000` (Black) |

---

## 🛠️ Theme Authoring & Linter

To create a new theme:
1. Create a new directory in `src/lib/themes/<theme-name>/`.
2. Add `config.yaml` defining default layout and section titles.
3. Add `style.css` scoped under `.theme-<theme-name>`.
4. Run the theme validator:
   ```bash
   npm run lint:themes
   ```

The validator checks for:
- Required design tokens (`--bg`, `--ink`, `--accent`, `--border`, `--font-body`, `--font-heading`).
- Universal `@media print` rules and `print-color-adjust` declarations.
- Dangerous `break-inside: avoid` page-break traps.
- Proper Font Awesome 6 Brand font scoping.

---

## 📜 License

MIT License. Open source and free for personal and commercial use.
