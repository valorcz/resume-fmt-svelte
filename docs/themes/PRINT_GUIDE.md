# Print & Pagination Guide

This guide explains how CSS print mechanics work in `resume-json-svelte` and how to avoid blank or half-empty pages when generating PDFs.

---

## 1. How Browsers Paginate Content

When printing or exporting to PDF via the browser:
1. The viewport is fixed to the physical page dimensions defined in `@page` (e.g. `size: A4; margin: 1.2cm 1.5cm;`).
2. The browser renders the document from top to bottom.
3. When an element exceeds the remaining vertical height of the current page, the browser evaluates CSS fragmentation properties (`break-inside`, `break-before`, `break-after`, `orphans`, `widows`).

---

## 2. The Root Causes of Blank & Half-Empty Pages

### Cause A: Premature Container Breaking (`break-inside: avoid`)
If a job entry (`.item-card`) contains a title, metadata, summary paragraph, and 6 bullet points, its total height might be ~6cm.
- If there are only 4cm remaining on Page 1, and `.item-card` has `break-inside: avoid`, the browser **cannot split the card**.
- The browser pushes the **entire card to Page 2**, leaving the bottom 4cm of Page 1 completely blank.

**Fix:**
Allow cards to break naturally across pages, but protect the header:
```css
/* Allow card to break */
.item-card {
  break-inside: auto;
  page-break-inside: auto;
}

/* Keep title and company together */
.item-header {
  break-inside: avoid !important;
  break-after: avoid-page !important;
}

/* Ensure at least 3 lines stay together before/after a page split */
.item-summary,
.item-highlights {
  orphans: 3;
  widows: 3;
}

/* Keep individual bullet points intact */
.item-highlights li {
  break-inside: avoid;
}
```

---

### Cause B: Multi-Column Flexbox / Grid Bugs in Print Engines
Chromium (Blink) and WebKit have historical bugs when calculating heights of flex and grid containers across page boundaries.
- When `.cv-layout` has 2 columns (Main + Sidebar) and content exceeds 1 page, flex containers often force equal heights across the page break or push elements into unintended positions.

**Fix:**
For multi-page content, ensure:
1. `.cv-sidebar` content is kept concise or allowed to break gracefully.
2. If designing for lengthy CVs (3+ pages), prefer a single-column layout or ensure sidebars have `break-inside: auto`.

---

### Cause C: Unintended Screen Paddings & Fixed Heights
Web themes often feature decorative padding (e.g., `padding: 4rem;` on `.cv-wrapper`).
- On paper, this padding is added on top of the `@page` margin, creating giant borders and wasting up to 30% of printable paper space.

**Fix:**
Reset wrapper geometry in `@media print`:
```css
@media print {
  .cv-wrapper {
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    max-width: 100% !important;
    width: 100% !important;
  }
}
```

---

## 3. Print Typography & Scale

Screen displays use pixels (`px`) or root-relative units (`rem`). Print engines work best with points (`pt`) or well-proportioned relative scales:

| Element | Recommended Print Size | Recommended Line Height |
| :--- | :--- | :--- |
| Candidate Name (`.cv-name`) | `18pt` – `22pt` | `1.1` |
| Section Title (`.section-title`) | `11pt` – `12pt` | `1.2` |
| Item Title / Role (`.item-title`) | `10pt` – `10.5pt` | `1.2` |
| Body Text / Bullets | `9pt` – `9.5pt` | `1.35` – `1.4` |
| Metadata / Tags / Dates | `8pt` – `8.5pt` | `1.2` |

---

## 4. Testing Print Layouts

1. Start the dev server: `npm run dev`
2. Open Chrome, Edge, or Firefox and press `Ctrl + P` (or `Cmd + P`).
3. Set **Destination** to "Save as PDF".
4. Set **Margins** to "Default" (the `@page` CSS rule controls margins).
5. Enable **Background graphics** under Options.
6. Verify both **A4** and **Letter** paper sizes.
