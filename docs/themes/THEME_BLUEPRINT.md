# Theme Developer Guide & Blueprint

This document outlines the architecture, configuration format, styling conventions, and print-optimization guidelines for creating themes in `resume-json-svelte`.

---

## 1. Directory Structure

All themes reside in `src/lib/themes/<theme-name>/`. The directory name serves as the unique identifier for the theme and is automatically discovered at build and runtime.

```
src/lib/themes/<theme-name>/
├── config.yaml    # Layout structure, default i18n labels, section ordering
└── style.css      # Scoped CSS styling, design tokens, and print overrides
```

---

## 2. Configuration (`config.yaml`)

Each theme defines default layout rules and localization keys in `config.yaml`.

```yaml
theme: my-theme-name

# Default section headers (overridable by user in resume.yaml or standalone config)
i18n:
  work: "Experience"
  education: "Education"
  volunteer: "Volunteering"
  projects: "Featured Projects"
  publications: "Publications"
  skills: "Skills & Technologies"
  languages: "Languages"
  certificates: "Certifications"
  awards: "Honors & Awards"
  interests: "Interests"
  references: "References"

# Layout section distribution
layout:
  # Main flow (Primary column)
  main:
    - work
    - education
    - volunteer
    - projects
    - publications
  
  # Sidebar flow (Secondary column) - leave empty [] for single-column themes
  sidebar:
    - skills
    - languages
    - certificates
    - awards
    - interests
    - references
```

---

## 3. Styling Rules & CSS Contracts (`style.css`)

### A. Strict Scope Isolation
To avoid collisions across themes, **all CSS selectors must be scoped** under the root `.theme-<theme-name>` class.

```css
/* Good */
.theme-my-theme-name {
  --bg: #ffffff;
  --ink: #1e293b;
}

.theme-my-theme-name .cv-name {
  font-size: 2.5rem;
}

/* Bad - NEVER declare unscoped top-level selectors */
.cv-name {
  font-size: 2.5rem;
}
```

### B. Standard Design Tokens (CSS Variables)
Define your theme variables on `.theme-<theme-name>`. `core.css` reads these tokens automatically:

| Variable Category | Variable Name | Description | Example |
| :--- | :--- | :--- | :--- |
| **Color Palette** | `--bg` | Background color of paper / wrapper | `#ffffff` |
| | `--surface` | Contrast / card surface color | `#f8fafc` |
| | `--ink` | Primary text color | `#0f172a` |
| | `--muted` | Secondary / metadata text color | `#64748b` |
| | `--accent` | Theme accent color (headers, highlights) | `#2563eb` |
| | `--border` | Subtle border / divider color | `#e2e8f0` |
| | `--border-heavy` | Prominent separator color | `#94a3b8` |
| **Typography** | `--font-body` | Main body copy typeface | `'Inter', sans-serif` |
| | `--font-heading` | Main section & name typeface | `'Merriweather', serif` |
| | `--font-mono` | Monospace / metadata typeface | `'JetBrains Mono', monospace` |
| **Item Metadata** | `--item-subtitle-separator` | Separator glyph between Title and Subtitle | `" — "` or `" // "` or `" \| "` |
| | `--item-subtitle-separator-color` | Color of the separator glyph | `var(--accent)` |
| | `--item-date-bg` | Background for date badges (if styled as pill) | `#eef2ff` |
| | `--item-date-border` | Border for date badges | `1px solid #c7d2fe` |
| | `--item-date-radius` | Border radius for date badges | `9999px` |
| **Skills & Badges** | `--skill-tag-bg` | Background of skill tags | `var(--surface)` |
| | `--skill-tag-color` | Text color of skill tags | `var(--ink)` |
| | `--skill-tag-border` | Border of skill tags | `1px solid var(--border)` |
| | `--skill-tag-radius` | Corner radius of skill tags | `4px` or `0` or `9999px` |
| | `--skill-tag-shadow` | Hard 2D offset shadow for tags | `2px 2px 0px var(--accent)` |
| | `--skill-tag-transform` | Text transformation | `lowercase` or `uppercase` |
| **Layout & Shadow** | `--screen-shadow` | Screen-only drop shadow | `0 10px 25px rgba(0,0,0,0.05)` |
| | `--wrapper-radius` | Corner radius of paper wrapper | `0` or `8px` |

### C. Specificity & No `!important` Rule
- `core.css` uses plain component selectors without `!important`.
- Theme rules scoped by `.theme-<theme-name>` naturally have specificity `(0, 2, 0)`, which automatically beats `core.css` `(0, 1, 0)`.
- **Never use `!important` in screen CSS.** Reserve `!important` strictly for `@media print` directives where overriding browser print engines is required (e.g. `print-color-adjust: exact !important;`).

### D. Fonts & Dynamic Loading
- Import Google Fonts or custom web fonts directly at the top of your `style.css` using `@import url(...)`.
- Because themes are loaded dynamically on demand, fonts will only be fetched when the user actually switches to your theme.

---

## 4. DOM Class Reference

Your theme can style the following semantic components:

### Wrapper & Header
- `.cv-wrapper`: Master container.
- `.cv-header`: Header container.
- `.cv-image`: Profile photo (if present).
- `.cv-name`: Full name (`<h1>`).
- `.cv-title`: Professional headline / title (`<h2>`).
- `.cv-contact`: Contact links/badges container.
- `.contact-item`: Container for an individual contact datum.
- `.contact-location`: Address/location (`data-type="location"`).
- `.contact-email`: Email link (`data-type="email"`).
- `.contact-phone`: Phone link (`data-type="phone"`).
- `.contact-url`: Website/portfolio link (`data-type="url"`).
- `.contact-profile`: Social profile (`data-type="profile"`). Also includes `.contact-profile-<network>` (e.g. `.contact-profile-github`, `.contact-profile-linkedin`).
- `.cv-summary`: Bio / executive summary.

> [!TIP]
> Never use positional selectors like `span:nth-child(...)` for contact icons because fields may be omitted or reordered. Always target `.contact-location`, `.contact-email`, `.contact-phone`, `.contact-url`, or `.contact-profile-<network>`.

### Columns & Sections
- `.cv-layout`: Master layout grid/flex container.
- `.cv-main`: Primary content column.
- `.cv-sidebar`: Secondary column.
- `.cv-section`: Individual section block (e.g. `.section-work`, `.section-skills`).
- `.section-title`: Heading of the section (`<h3>`).
- `.section-content`: Container for item cards in the section.

### Item Cards & Compact Metadata
- `.item-card`: Individual entry block (work role, school, project).
- `.item-header`: Title, subtitle, and date container (flex layout recommended).
- `.item-header-primary`: Container grouping `.item-title` and `.item-subtitle` together.
- `.item-title`: Role / degree / project name / certification name.
- `.item-subtitle`: Company / institution / organization / issuer.
- `.item-date`: Date range or year string (e.g. `2020 — Present` or `2023`).
- `.item-summary`: Role description or overview paragraph.
- `.item-highlights`: Bulleted highlights list (`<ul>`).

> [!TIP]
> **Space-Efficient Item Headers**: Grouping title and subtitle inside `.item-header-primary` allows them to sit inline (e.g. `Senior Engineer` `— Google` or `Kubernetes Admin` `// CNCF`) while pinning `.item-date` to the right with `margin-left: auto; white-space: nowrap;`. This saves 1–2 vertical lines per entry and keeps resumes compact.

### Skills & Tags
- `.skill-group`: Skill category block.
- `.skill-name`: Category title (e.g. "Languages", "Cloud").
- `.skill-keywords`: Container for tag pills.
- `.skill-tag`: Individual keyword badge/pill.

---

## 5. Print Optimization Rules (Preventing Blank Pages)

Print engines (Chromium Blink, WebKit, Gecko) handle pagination differently from web browsers. To ensure that printed PDFs have no blank or half-empty pages:

1. **Avoid `break-inside: avoid` on large containers:**
   - Never place `break-inside: avoid` or `page-break-inside: avoid` on `.item-card`, `.cv-section`, or `.cv-main`.
   - Long jobs with multiple bullets must be allowed to break cleanly between bullet points.
2. **Prevent orphaned headers:**
   - Attach `break-after: avoid-page !important` and `break-inside: avoid !important` to `.section-title` and `.item-header`.
3. **Set Widows and Orphans:**
   - Ensure `.item-summary` and `.item-highlights` have `orphans: 3; widows: 3;`.
4. **Use Print-Friendly Units:**
   - Use `pt` or `rem` for print typography (`9.5pt` body, `11pt` titles, `14pt`–`18pt` name).
5. **Neutralize Screen-Only Overheads:**
   - In `@media print`, reset `.cv-wrapper` shadows, borders, and paddings (`padding: 0 !important; border: none !important; box-shadow: none !important;`).

---

## 6. Theme Checklist

Before committing a new theme, verify:

- [ ] Folder is named in `kebab-case` under `src/lib/themes/<theme-name>/`.
- [ ] Contains both `config.yaml` and `style.css`.
- [ ] Every CSS selector is scoped to `.theme-<theme-name>`.
- [ ] Tested with 1-page resume content (fits compactly without forcing a blank 2nd page).
- [ ] Tested with 3-page resume content (breaks cleanly without clipping or massive gaps).
- [ ] Tested in browser Print Preview (A4 and Letter paper sizes).
