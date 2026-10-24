---
id: ai-migration
aliases: [migrate, ai-migrate]
title: Word/PDF → AI
icon: ⚡
order: 2
badge: Recommended
summary: Convert existing Word or PDF resumes into structured YAML using AI
---

# Word/PDF to YAML Migration Guide

Converting an existing Word (`.docx`) or PDF resume into structured YAML does not require manual re-typing. Modern Large Language Models (such as Google Gemini, Anthropic Claude, or OpenAI ChatGPT) can reconstruct your resume into semantic JSON Resume YAML in a matter of minutes.

---

## The 4-Step Migration Workflow

### Step 1: Copy Raw Text from Word / PDF
Open your existing resume document, select all text (<kbd>Ctrl+A</kbd> or <kbd>Cmd+A</kbd>), and copy it to your clipboard. Do not worry about misaligned tables, multi-column breaks, or strange spacing—the AI will reconstruct the underlying semantic data.

### Step 2: Feed into AI with the Conversion Prompt
Open your preferred LLM interface, paste the **Universal AI Conversion Prompt** below, and paste your raw resume text at the bottom.

### Step 3: The Human Reality Check (Critical!)
> [!WARNING]
> **Beware AI Embellishment**:
> LLMs naturally try to "make things look impressive." In doing so, they often rewrite genuine, humble contributions into grandiose exaggerations (e.g., changing *"Assisted with vulnerability triaging"* into *"Architected enterprise-wide cyber defense operations"*).
>
> Always perform a reality check on:
> - **Job titles & dates**: Verify they reflect your actual contracts and timelines.
> - **Metrics**: Ensure numerical values (percentages, dollar amounts, team sizes) are numbers you can defend in a live technical interview.
> - **Skills**: Remove frameworks or tools you only touched once and wouldn't feel comfortable coding in during an interview.

### Step 4: Tailor & Rephrase for Desired Positions
Once your baseline YAML is clean and verified, you can prompt the AI to emphasize specific domains or skills for target positions:
> *"Rephrase my highlights to emphasize Kubernetes, Go, and distributed systems architecture for a Senior Platform Engineer role, without inventing new responsibilities."*

---

## Hosting Your Resume on GitHub Gists

Once you have your YAML file, you can host it publicly or unlisted using [GitHub Gists](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists):

1. Go to [gist.github.com](https://gist.github.com) and sign in.
2. In the filename field, enter `resume.yaml`.
3. Paste your generated YAML content into the editor.
4. Click **Create secret gist** (unlisted, accessible via URL) or **Create public gist**.
5. Copy the unique **Gist ID** from the URL bar:
   - For example, in the URL `https://gist.github.com/valorcz/e2af4f76a60a26541abdb1c8e4c6d820`, the ID is `e2af4f76a60a26541abdb1c8e4c6d820`.
   *(You can inspect [valorcz's sample gist](https://gist.github.com/valorcz/e2af4f76a60a26541abdb1c8e4c6d820) as a real-world reference).*
6. Enter this Gist ID into Resume Studio's **Source** tab to load your resume instantly on any device!

---

## Universal AI Conversion Prompt

Copy and paste this prompt directly into Gemini, Claude, or ChatGPT alongside your raw CV text:

```prompt title="Universal Word/PDF to YAML Conversion Prompt"
You are an expert technical resume architect. Convert my raw resume text provided below into valid YAML conforming to the JSON Resume schema (v1.0.0) with Resume Studio Executive Summary extensions.

STRICT CONVERSION RULES:
1. DO NOT fabricate, hallucinate, or invent employment history, credentials, or achievements.
2. Preserve all factual dates, company names, degrees, and responsibilities.
3. Improve grammar, punctuation, and clarity without converting realistic contributions into absurd corporate buzzwords.
4. Format every work experience highlight using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]" starting with strong action verbs.
5. Extract or calculate an "executiveSummary" block optimized for a 6–10 second recruiter scan.
6. Output ONLY valid YAML inside a single markdown code block (```yaml ... ```). Do not include conversational filler before or after.

TARGET SCHEMA SKELETON:
```yaml
basics:
  name: "<Full Name>"
  label: "<Target Professional Title>"
  email: "<Email Address>"
  phone: "<Phone Number>"
  url: "<Personal Portfolio / Blog URL>"
  location:
    city: "<City>"
    region: "<State / Region>"
    countryCode: "<2-letter ISO Country Code, e.g. US, CZ, DE, GB>"
  summary: "<2-3 sentence career summary>"
  profiles:
    - network: "LinkedIn"
      username: "<Handle>"
      url: "<LinkedIn Profile URL>"
    - network: "GitHub"
      username: "<Handle>"
      url: "<GitHub Profile URL>"

executiveSummary:
  headline: "<1-2 sentence elevator positioning statement, 40-180 characters>"
  experienceYears: <Total years calculated from work history>
  availability: "<e.g. Immediately / 2 weeks notice / Exploring Senior roles>"
  targetRoles:
    - "<Target Role Title 1>"
    - "<Target Role Title 2>"
  keyMetrics:
    - label: "Experience"
      value: "<e.g. 10+ Years>"
    - label: "<Impact Area 1>"
      value: "<e.g. 15M+ DAU or $300k Saved>"
    - label: "<Impact Area 2>"
      value: "<e.g. 99.99% Uptime or 12 Engineers>"
  coreCompetencies:
    - "<Core Domain 1>"
    - "<Core Domain 2>"
    - "<Core Domain 3>"
    - "<Core Domain 4>"
    - "<Core Domain 5>"
  topHighlights:
    - "<Standout milestone 1>"
    - "<Standout milestone 2>"

work:
  - name: "<Company Name>"
    position: "<Job Title>"
    url: "<Company URL>"
    startDate: "YYYY-MM"
    endDate: "YYYY-MM" # or omit for current role
    summary: "<1-2 sentence role overview>"
    highlights:
      - "<Google XYZ bullet: Accomplished [X] as measured by [Y], by doing [Z]>"
      - "<Google XYZ bullet: Accomplished [X] as measured by [Y], by doing [Z]>"

education:
  - institution: "<University / College Name>"
    url: "<Institution URL>"
    area: "<Field of Study, e.g. Computer Science>"
    studyType: "<Degree, e.g. Bachelor of Science>"
    startDate: "YYYY-MM"
    endDate: "YYYY-MM"
    score: "<GPA or honors, optional>"
    courses:
      - "<Notable Course 1>"

skills:
  - name: "<Category, e.g. Systems & Cloud>"
    level: "Master"
    keywords: ["Go", "Kubernetes", "Docker", "AWS", "Terraform"]
```

RAW RESUME TEXT TO CONVERT:
[PASTE YOUR RAW WORD OR PDF RESUME TEXT HERE]
```
