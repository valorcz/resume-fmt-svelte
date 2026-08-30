# Theme Starter Template

Use these starter files to quickly scaffold a new theme.

---

## 1. Create Theme Folder
Create a folder inside `src/lib/themes/`:
```bash
mkdir -p src/lib/themes/my-custom-theme
```

---

## 2. `config.yaml`
Save as `src/lib/themes/my-custom-theme/config.yaml`:

```yaml
theme: my-custom-theme

i18n:
  work: "Experience"
  education: "Education"
  volunteer: "Volunteering"
  projects: "Projects"
  publications: "Publications"
  skills: "Skills"
  languages: "Languages"
  certificates: "Certifications"
  awards: "Awards"
  interests: "Interests"
  references: "References"

layout:
  main:
    - work
    - education
    - volunteer
    - projects
    - publications
  sidebar:
    - skills
    - languages
    - certificates
    - awards
    - interests
    - references
```

---

## 3. `style.css`
Save as `src/lib/themes/my-custom-theme/style.css`:

```css
/* ==========================================================================
   THEME: MY CUSTOM THEME
   ========================================================================== */

/* 1. Import Theme Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

/* 2. Theme Tokens */
.theme-my-custom-theme {
  --bg: #ffffff;
  --surface: #f8fafc;
  --ink: #0f172a;
  --muted: #64748b;
  --accent: #2563eb;
  --border: #e2e8f0;
  --border-heavy: #cbd5e1;

  --font-body: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --screen-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

/* 3. Screen Layout & Styling */
.theme-my-custom-theme .cv-wrapper {
  background-color: var(--bg);
  color: var(--ink);
}

.theme-my-custom-theme .cv-name {
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 0.25rem;
}

.theme-my-custom-theme .cv-title {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--accent);
  margin-bottom: 1rem;
}

.theme-my-custom-theme .section-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.3rem;
  margin-bottom: 1.2rem;
}

.theme-my-custom-theme .item-card {
  margin-bottom: 1.5rem;
}

.theme-my-custom-theme .item-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.theme-my-custom-theme .item-subtitle {
  font-size: 0.95rem;
  color: var(--accent);
  font-weight: 600;
}

.theme-my-custom-theme .skill-tag {
  background-color: var(--surface);
  color: var(--ink);
  border: 1px solid var(--border);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* 4. Print Overrides */
@media print {
  .theme-my-custom-theme .cv-wrapper {
    padding: 0 !important;
    font-size: 9.5pt !important;
  }

  .theme-my-custom-theme .section-title {
    color: var(--accent) !important;
    border-bottom-color: var(--border) !important;
  }
}
```

---

## 4. Test It
Once saved, restart or view your app. The theme dropdown in the top-right corner will automatically detect and list **My Custom Theme**.
