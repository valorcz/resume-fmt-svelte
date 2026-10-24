# Svelte JSON & YAML Resume Studio

A privacy-first, zero-backend resume studio and print engine built on the open [JSON Resume standard](https://jsonresume.org/schema/). Author in clean YAML, switch between 18 responsive themes, customize typography and layouts, and generate pixel-perfect, ATS-verified PDFs.

<p align="center">
  <img src="static/assets/preview.jpg" alt="Resume Studio & Theme Customizer Preview" width="100%" />
</p>

---

## Why Resume Studio?

Most online resume builders trap your career data in proprietary silos, charge subscriptions for PDF downloads, or transmit your private contact details to external databases.

**Resume Studio is designed differently:**

- **100% Client-Side Privacy**: No tracking cookies, no telemetry, no analytics, and zero backend databases. All YAML parsing, theme compilation, and ATS diagnostics run exclusively in your browser memory.
- **Open Standard (JSON Resume v1.0.0)**: Never get locked into a single tool. Your resume is stored in standard JSON Resume format, fully compatible with IDE schema validators, linters, and the global JSON Resume ecosystem.
- **Native YAML with Comments**: Write your career history in readable `resume.yaml` with multiline strings, markdown formatting, and comments without escaping quotes.
- **ATS-Optimized & Robot-Verified**: Applicant Tracking Systems (ATS) strip visual styling and parse text linearly. Our automated test harness verifies that PDF text extraction is 100% ungarbled across every theme.
- **Pixel-Perfect A4 & US Letter Printing**: Dedicated `@media print` mechanics with intelligent **2-page core budgeting**, live cutline indicators (<kbd>B</kbd>), anti-widow header protection, and 1-click Auto-Fit.
- **Recruiter Executive Summary**: 6–10 second recruiter briefing card highlighting years of experience, core competencies, and quantifiable achievements.
- **Standalone Offline Export**: Export a self-contained, single-file `.html` bundle with inlined CSS, interactive briefing modal, and embedded compliant YAML source that works completely offline.

---

## Quick Start: 3 Ways to Use

### 1. Web App (GitHub Gist or Local File)
1. Write your resume in `resume.yaml`.
2. Host it publicly or unlisted on [GitHub Gists](https://gist.github.com) (or open it locally in the studio).
3. Open Resume Studio and enter your Gist ID:
   ```text
   https://valorcz.github.io/resume-fmt-svelte/?gist=<YOUR_GIST_ID>
   ```

### 2. Standalone Offline HTML Export
Inside Resume Studio, open the **Download** menu and select **Export Standalone HTML Bundle**. You get a single, portable `.html` file containing your resume, styles, recruiter briefing, and full YAML source code that can be sent directly to hiring managers or opened offline in any browser.

### 3. Run Locally or Self-Host
For local development, custom deployments, or running the automated test suite, check out our **[Developer & Contributor Guide](docs/DEVELOPMENT.md)**.

```bash
git clone https://github.com/valorcz/resume-fmt-svelte.git
cd resume-fmt-svelte
pnpm install
pnpm run dev
```

---

## Writing Your Resume in YAML

Resume Studio uses the standard **JSON Resume v1.0.0** specification. Tooling settings and the optional recruiter briefing live neatly inside the standard `meta:` block, guaranteeing **zero schema validation errors** in IDEs like VS Code and Cursor.

Add this schema header at the top of your `resume.yaml` for instant autocomplete and tooltip validation:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json

meta:
  version: "v1.0.0"
  
  # Studio Theme & Print Settings
  studio:
    theme: modern-timeline
    accent: '#2563eb'
    mode: system             # 'system' | 'light' | 'dark'
    paperFormat: a4          # 'a4' | 'letter'
    printMargin: '1.5cm'     # '1.0cm' | '1.5cm' | '2.0cm' (A4) or '0.5in' | '0.75in' | '1.0in' (Letter)
    printScale: 100          # 100 | 95 | 90 | 85 (%)
    annexBreak: false        # Set true to break extended sections cleanly onto Page 3+
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

  # Recruiter Executive Summary (6–10 Second Briefing)
  executiveSummary:
    headline: "Senior Cloud & Distributed Systems Engineer with 8+ years scaling high-throughput architectures."
    experienceYears: 8
    availability: "Available for Senior / Staff Platform roles (2 weeks notice)"
    targetRoles:
      - "Staff Infrastructure Engineer"
      - "Lead Platform Architect"
    keyMetrics:
      - label: "Experience"
        value: "8+ Years"
      - label: "Throughput"
        value: "500k RPS"
      - label: "Scale"
        value: "20M+ DAU"
    coreCompetencies:
      - "Distributed Systems (Go, Rust)"
      - "Kubernetes & Cloud Infrastructure"
      - "High-Reliability Observability"

basics:
  name: "Jane Doe"
  label: "Senior Cloud & Distributed Systems Engineer"
  email: "jane.doe@example.com"
  phone: "+1 (555) 234-5678"
  url: "https://janedoe.dev"
  location:
    city: "San Francisco"
    region: "California"
    countryCode: "US"
  profiles:
    - network: "GitHub"
      username: "janedoe"
      url: "https://github.com/janedoe"
    - network: "LinkedIn"
      username: "janedoe"
      url: "https://linkedin.com/in/janedoe"

work:
  - name: "Acme Cloud Systems"
    position: "Lead Systems Architect"
    location: "San Francisco, CA"
    startDate: "2021-03-01"
    summary: "Architected and scaled cloud infrastructure pipelines across 4 global regions."
    highlights:
      - "Reduced cloud infrastructure expenditures by 35% through automated autoscaling policies."
      - "Scaled API gateway to sustain 500k RPS at 99.999% availability during peak events."
      - "Mentored an engineering group of 14 across distributed time zones."

education:
  - institution: "UC Berkeley"
    area: "Computer Science"
    studyType: "Bachelor of Science"
    startDate: "2013-09-01"
    endDate: "2017-05-30"

skills:
  - name: "Core Technologies"
    keywords:
      - "Go"
      - "Rust"
      - "Kubernetes"
      - "TypeScript"
      - "PostgreSQL"
```

A complete reference starter template is available in [`static/resume.example.yaml`](static/resume.example.yaml).

---

## Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>?</kbd> | **Open Handbook** | Open the built-in authoring, ATS scoring, and AI migration handbook. |
| <kbd>/</kbd> | **View Source** | Open the YAML source viewer modal with 1-click copy and download. |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> / <kbd>Cmd</kbd> + <kbd>P</kbd> | **Print / PDF** | Open the browser print dialog with print-ready stylesheets applied. |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> / <kbd>Cmd</kbd> + <kbd>S</kbd> | **Download YAML** | Download active resume as an enriched, compliant `.yaml` file. |
| <kbd>B</kbd> | **Cutline Guides** | Toggle live A4 / Letter page break cutlines and auto-fit advisor. |
| <kbd>Esc</kbd> | **Dismiss** | Close active modals, drawers, or popovers. |

---

## URL Parameters & Instant Sharing

Every styling change is continuously synchronized to the URL query string:

| Parameter | Example | Description |
| :--- | :--- | :--- |
| `theme` | `?theme=modern-timeline` | Theme name to load |
| `accent` | `&accent=2563eb` | Custom accent HEX color override |
| `mode` | `&mode=dark` | UI appearance mode (`system`, `light`, `dark`) |
| `format` | `&format=a4` | Paper format (`a4`, `letter`) |
| `margin` | `&margin=1.5cm` | Page margin preset |
| `scale` | `&scale=95` | Print scaling percentage (75–100) |
| `annex` | `&annex=true` | Enable Page 3+ Supplemental Annex break |
| `layout` | `&layout=work,projects\|skills,education` | Custom column section distribution |
| `gist` | `?gist=8f9a2b4c6d...` | Public/secret GitHub Gist ID |
| `view` | `&view=recruiter` | Clean recruiter mode (hides studio bars for clean sharing) |

---

## Curated Themes (18 Included)

| Theme | Archetype | Default Accent | Best For |
| :--- | :--- | :--- | :--- |
| `classic` | Floated Left Rail | `#111827` | Traditional technical, academic, and executive CVs |
| `modern-timeline` | Two-Tone Timeline | `#2563eb` | Senior software engineers and cloud architects |
| `executive-slate` | Split Navy Column | `#1e293b` | Engineering managers, Directors, and CTOs |
| `editorial` | Newsprint Serif | `#b45309` | Technical writers, researchers, and journalists |
| `europass` | Tabular European CV | `#0e4194` | European Union institutions and international roles |
| `gov` | Formal Federal Serif | `#3b82f6` | Public sector, defense, and federal positions |
| `executive-baseline` | Harvard Strict B&W | `#000000` | Finance, consulting, and conservative industries |
| `elegant-split` | Soft Dual-Pane | `#2f5233` | Full-stack developers and product designers |
| `noir-city` | High-Contrast Dark | `#18181b` | Designers and frontend specialists |
| `tailwind-blueprint` | Monospace Grid | `#0284c7` | DevOps, SRE, and systems engineers |
| `bio-vision` | Teal / Scientific | `#0d9488` | Data scientists, biotech, and research engineers |
| `neural-botany` | Foliage / Emerald | `#15803d` | Machine learning and AI practitioners |
| `the-verge` | Magazine Editorial | `#ff005d` | Creative technologists and tech leads |
| `vibe-glow` | Dark Cyber Neon | `#00f0ff` | Game developers and web3 engineers |
| `terminal` | CRT Green Console | `#22c55e` | Security researchers and Linux sysadmins |
| `cyber-script` | Bold Cyberpunk | `#ff0055` | Creative coders and indie hackers |
| `8bit-demo` | Demoscene Retro | `#55ffff` | Retro gaming enthusiasts and demo creators |
| `16bit-amiga` | Workbench 1.3 | `#ff8800` | Vintage computing nostalgia |

---

## Documentation & Developer Resources

- **[Developer & Contributor Guide](docs/DEVELOPMENT.md)**: Setup, architecture, Svelte 5 runes, theme linters, and headless print testing.
- **[Theme Developer Blueprint](docs/themes/THEME_BLUEPRINT.md)**: Architecture, design tokens, scoping rules, and checklist for adding custom themes.
- **[Print & Pagination Guide](docs/themes/PRINT_GUIDE.md)**: Deep dive into browser print engines, fragmentation, and avoiding blank pages.
- **[Resume Authoring & Migration Handbook](docs/resume-authoring-handbook.md)**: AI prompts for converting Word/PDF resumes, Google XYZ formulas, and ATS scoring.
- **[Recruiter Briefing Specification](docs/recruiter-summary-spec.md)**: Specification for structured `executiveSummary` briefing cards.

---

## License

MIT License. Open source and free for personal and commercial use.
