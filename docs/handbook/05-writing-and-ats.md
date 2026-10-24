---
id: writing-ats
aliases: [bestpractices, ats, google-xyz]
title: Writing & ATS Rules
icon: ✍️
order: 5
summary: Google XYZ formula, recruiter quick-scan checklist, and live AI review prompt
---

# Writing High-Impact Resumes & ATS Best Practices

A great resume is not a list of your historical job duties. It is a **curated portfolio of measurable business and technical impact**. Hiring managers and automated Applicant Tracking Systems (ATS) evaluate resumes based on demonstrable evidence of results.

---

## 1. Google's XYZ Formula for High-Impact Bullet Points

Originally popularized by Laszlo Bock (former SVP of People Operations at Google), the gold standard for every resume highlight is:

$$\text{"Accomplished } [X] \text{ as measured by } [Y], \text{ by doing } [Z]"$$

### The 3 Core Components:
1. **[X] Accomplished**: What was the business or engineering outcome? (Always start with a past-tense action verb).
2. **[Y] Measured by**: What was the quantitative metric? (Percentage increase, dollar savings, latency reduction, user volume).
3. **[Z] By doing**: What specific technology, architecture, or technique did you employ?

### Before & After Discipline Comparisons

| Role | ❌ Weak / Duty-Oriented | ✅ High-Impact Google XYZ Formula |
| :--- | :--- | :--- |
| **Backend Engineer** | "Worked on microservices and fixed slow API queries." | "Accelerated database query performance by **65%** for high-volume billing endpoints by refactoring PostgreSQL indexing and introducing Redis caching." |
| **DevOps / SRE** | "Responsible for maintaining AWS infrastructure and CI/CD pipelines." | "Reduced production deployment failure rates from **14% to under 1%** and cut release lead time by **40%** by architecting a blue-green deployment pipeline with ArgoCD." |
| **Frontend Engineer** | "Built user interface components using React and Tailwind." | "Boosted checkout conversion rate by **18% ($450k ARR)** and improved Google Core Web Vitals (LCP) from **3.4s to 0.9s** by redesigning the cart flow and lazy-loading asset bundles." |
| **Junior / Student** | "Made a web app for my final university semester project." | "Engineered a collaborative markdown editor supporting **100+ concurrent WebSocket connections** with sub-30ms sync latency using Go and Docker." |

---

## 2. Strong Action Verbs vs Passive Verbs

Avoid beginning bullet points with passive phrases like *"Responsible for..."*, *"Helped with..."*, *"Assisted in..."*, or *"Worked on..."*. Instead, use definitive action verbs:

- **Architecture & Creation**: *Architected, Authored, Built, Designed, Engineered, Formulated, Implemented, Pioneered, Spearheaded*
- **Optimization & Speed**: *Accelerated, Automated, Consolidated, Maximized, Minimized, Overhauled, Refactored, Streamlined*
- **Leadership & Scaling**: *Directed, Guided, Mentored, Mobilized, Orchestrated, Scaled, Unified*

---

## 3. The 6-Second Recruiter Quick-Scan Formula

Technical recruiters review hundreds of applicants per role, spending an average of **6 to 10 seconds** on their initial scan. If your key qualifications aren't visible above the fold within that window, your resume risks getting passed over.

Ensure your resume satisfies the following checklist:
- [x] **Clear Professional Headline**: A single punchy sentence (40–180 characters) establishing your core specialization and seniority level.
- [x] **3 to 4 Hard Metrics**: Concrete numbers (e.g., *"10+ Years"*, *"15M+ DAU"*, *"$1.2M Saved"*, *"99.99% Uptime"*).
- [x] **4 to 6 Core Competencies**: High-level domain pillars (avoid cognitive overload with 30 comma-separated keywords).
- [x] **2 to 3 Top Highlights**: Your most impressive career achievements summarized directly in your briefing card.

---

## 4. Google XYZ AI Review Prompt

You can have an AI evaluate your active resume against these standards. Use the button below to copy the prompt with your **currently loaded resume YAML automatically injected**:

```prompt title="Google XYZ Formula Review Prompt" with-live-yaml
You are an expert technical career coach and executive resume editor.

TASK:
Review and rewrite the highlights, summary, and metrics of the following JSON Resume YAML according to Google's XYZ formula and executive recruiter best practices.

REWRITE RULES & CRITERIA:
1. GOOGLE XYZ FORMULA:
   Every bullet point under `work[].highlights` and `projects[].highlights` must follow:
   "Accomplished [X] as measured by [Y], by doing [Z]"
   - Start with a strong past-tense action verb (e.g. Accelerated, Architected, Engineered, Optimized, Spearheaded, Reduced).
   - Eliminate passive responsibilities (e.g. change "Responsible for...", "Helped with...", "Worked on..." into direct achievements).
   - Include realistic quantitative metrics (percentages, dollar amounts, latency in ms, team size, uptime SLA, requests/sec).

2. EXECUTIVE SUMMARY & RECRUITER QUICK-SCAN:
   - Ensure `executiveSummary.headline` is a single punchy elevator statement (40–180 characters) establishing seniority and core value proposition.
   - Refine `executiveSummary.keyMetrics` to 3–4 high-impact proof points with clear numbers/symbols.
   - Limit `executiveSummary.coreCompetencies` to 4–6 core domains (avoid cognitive clutter).
   - Keep `executiveSummary.topHighlights` to 2–3 standout career milestones.

3. STRICT GUARDRAILS (NO HALLUCINATIONS):
   - DO NOT invent jobs, degrees, companies, or entirely fabricated technologies that do not exist in the source YAML.
   - Keep dates, position titles, and factual timelines intact.
   - You may ask me for real numbers if an achievement lacks a metric, or provide plausible placeholder brackets like [X%].

4. OUTPUT FORMAT:
   - Return the complete, updated, valid YAML inside a single markdown code block (```yaml ... ```).
   - Follow with a concise "Summary of Improvements" explaining the key changes made and why they increase recruiter impact.

RESUME YAML TO REVIEW AND REWRITE:
```yaml
# [PASTE YOUR RESUME YAML HERE OR LOAD A RESUME IN STUDIO TO AUTO-INJECT]
```
```
