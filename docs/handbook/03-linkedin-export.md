---
id: linkedin
aliases: [linkedin-export]
title: LinkedIn Export
icon: 💼
order: 3
summary: Extract your LinkedIn profile archive or PDF into JSON Resume
---

# Converting Your LinkedIn Profile to JSON Resume

If your LinkedIn profile is more up-to-date than your Word or PDF documents, you can extract your data directly from LinkedIn and convert it into JSON Resume YAML.

---

## Two Methods to Extract LinkedIn Data

### Method A: Quick PDF Export (Fastest — 2 Minutes)
1. Open your personal profile on LinkedIn.
2. In the profile introduction card, click the **More** button (next to *Open to* / *Add profile section*).
3. Select **Save to PDF**.
4. LinkedIn will generate a clean, condensed PDF summary of your profile.
5. Open the PDF, copy all text (<kbd>Ctrl+A</kbd> or <kbd>Cmd+A</kbd>), and use the AI prompt below.

### Method B: Official LinkedIn Data Archive (Most Comprehensive)
1. Click your profile avatar in the top navigation bar and select **Settings & Privacy**.
2. In the left sidebar, navigate to **Data privacy**.
3. Under *How LinkedIn uses your data*, click **Get a copy of your data**.
4. Select *Want something in particular?* and check:
   - **Profile**
   - **Positions**
   - **Education**
   - **Skills**
5. Click **Request archive**. LinkedIn will email you a download link to a `.zip` file within 10–20 minutes containing structured CSV spreadsheets.

---

## LinkedIn to YAML Conversion Prompt

Copy and paste this prompt into Gemini, Claude, or ChatGPT alongside either your LinkedIn PDF text or the raw content of your LinkedIn CSV files:

```prompt title="LinkedIn Export to YAML Conversion Prompt"
You are an expert technical resume architect. Parse the provided LinkedIn profile export (PDF text or CSV data) and convert it into valid YAML conforming to the JSON Resume schema (v1.0.0) with Resume Studio Executive Summary extensions.

CONVERSION GUIDELINES:
1. Preserve all factual job titles, company names, employment date ranges, degrees, and institutions.
2. Transform flat responsibility descriptions into high-impact Google XYZ bullet points ("Accomplished [X] as measured by [Y], by doing [Z]").
3. Group individual LinkedIn skills into 3–5 logical skill domains under the `skills` array (e.g. "Languages & Runtimes", "Cloud & Infrastructure", "Databases & Storage").
4. Formulate an `executiveSummary` section:
   - Calculate total years of experience from employment dates.
   - Craft a punchy 1-2 sentence executive headline (40–180 characters).
   - Identify 3–4 key quantitative metrics.
   - Select 4–6 core competencies.
5. Output ONLY valid YAML in a single markdown code block (```yaml ... ```).

LINKEDIN DATA TO CONVERT:
[PASTE YOUR LINKEDIN PDF TEXT OR CSV CONTENT HERE]
```
