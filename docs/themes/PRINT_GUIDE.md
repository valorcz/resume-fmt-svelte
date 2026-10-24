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

### Cause B: CSS Grid Monolithic Containers in Chromium Blink
In Chromium's Blink print engine (`@media print`), a CSS Grid container (`display: grid`) is treated as a monolithic layout context. When `.cv-section` is defined as a grid with two items (`.section-title` on the left and `.section-content` on the right containing multiple jobs), Blink cannot fragment the grid row cleanly across pages.
- When the section content doesn't fit on Page 1, Blink either pushes the **entire** section to Page 2 (leaving 30–50% empty void at the bottom of Page 1) or clips it.

**Fix:**
For 2-column section layouts (like `classic` and `europass`), replace CSS Grid with **Fragmentable Block Flow** in `@media print`:
```css
@media print {
  .theme-classic .cv-section {
    display: block !important;
    margin-bottom: 1.1rem !important;
  }
  .theme-classic .cv-section::after {
    content: "";
    display: table;
    clear: both;
  }
  .theme-classic .section-title {
    float: left !important;
    width: 140px !important;
    break-after: avoid-page !important;
    break-inside: avoid !important;
  }
  .theme-classic .section-content {
    margin-left: 155px !important;
    display: block !important;
  }
}
```
This preserves the visual 2-column aesthetic while allowing individual `.item-card` elements to fragment naturally across page boundaries.

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

### Cause D: Widowed Headings (Headings Detached from Content)
A section title or job header (`### Lead Systems Architect`) appears at the very bottom of Page 1, but its bullet points or summary appear at the top of Page 2.

**Fix:**
Bind headings directly to their subsequent content blocks in `print-core.css`:
```css
/* Keep title and company together */
.item-header {
  break-inside: avoid !important;
  break-after: avoid-page !important;
}

/* Bind item header to the immediate first content child */
.item-header + .item-summary,
.item-header + .item-highlights {
  break-before: avoid-page !important;
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

### Automated Headless Print & ATS Test Suite
We provide an automated test harness that prints all 18 themes in headless Chromium and validates page counts and text linearity:

```bash
make test-print
# or
pnpm run test:print
```

This verifies:
1. Standard senior profile fits within **<= 2 pages** on both **A4** and **US Letter**.
2. No widowed section headings appear at the ends of pages.
3. Extracted PDF plain text preserves linear reading order for Applicant Tracking Systems.

### Manual Print Verification
1. Start the dev server: `pnpm run dev`
2. Open Chrome, Edge, or Firefox and press `Ctrl + P` (or `Cmd + P`).
3. Set **Destination** to "Save as PDF".
4. Set **Margins** to "Default" (the `@page` CSS rule controls margins).
5. Enable **Background graphics** under Options.
6. Verify both **A4** and **Letter** paper sizes.
