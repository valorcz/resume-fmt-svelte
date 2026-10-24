# Resume Authoring & Migration Handbook

A practical guide for authoring, structuring, and migrating technical resumes into the open **JSON Resume** standard, optimized for both human recruiters (6–10 second visual scans) and Applicant Tracking Systems (ATS).

---

## Table of Contents
1. [The 4-Step Word / PDF Migration Workflow](#1-the-4-step-word--pdf-migration-workflow)
2. [Universal AI Conversion Prompt](#2-universal-ai-conversion-prompt)
3. [Hosting Your Resume on GitHub Gists](#3-hosting-your-resume-on-github-gists)
4. [Converting LinkedIn Profile to JSON Resume](#4-converting-linkedin-profile-to-json-resume)
5. [Junior & Fresh Graduate Blueprint ("When There's Little Experience")](#5-junior--fresh-graduate-blueprint)
6. [Writing High-Impact Bullet Points (Google XYZ Formula)](#6-writing-high-impact-bullet-points-google-xyz-formula)
7. [The 6-Second Recruiter Quick-Scan Formula](#7-the-6-second-recruiter-quick-scan-formula)

---

## 1. The 4-Step Word / PDF Migration Workflow

Converting a legacy Word (`.docx`) or `.pdf` CV into structured YAML doesn't require manual re-typing. You can leverage modern LLMs (Google Gemini, Anthropic Claude, or OpenAI ChatGPT) to do the heavy lifting in minutes.

### Step 1: Copy Raw Text from Word / PDF
Open your existing resume document, select all text (`Ctrl+A` or `Cmd+A`), and copy it to your clipboard. Don't worry about formatting, tables, or broken column wraps—the LLM will reconstruct the underlying semantic data.

### Step 2: Feed into AI with the Conversion Prompt
Open Gemini or Claude, paste the **Universal AI Conversion Prompt** (provided below), and paste your raw resume text at the bottom.

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
Once your baseline YAML is clean and verified, you can prompt the AI to emphasize specific skills:
> *"Rephrase my highlights to emphasize Kubernetes, Go, and distributed systems architecture for a Senior Platform Engineer role, without inventing new responsibilities."*

---

## 2. Universal AI Conversion Prompt

Copy and paste this prompt directly into Gemini, Claude, or ChatGPT alongside your raw CV text:

```text
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
# yaml-language-server: $schema=https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json

meta:
  version: "v1.0.0"
  studio:
    theme: "modern-timeline"
    accent: "#2563eb"
    paperFormat: "a4"
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
      - "<Single biggest career proof point / achievement>"
      - "<Second biggest career proof point / achievement>"
      - "<Third biggest career proof point / achievement>"

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

work:
  - name: "<Company Name>"
    position: "<Job Title>"
    startDate: "YYYY-MM-DD"
    endDate: "YYYY-MM-DD" # Omit or leave empty for current ongoing role
    summary: "<1-sentence team / scope overview>"
    highlights:
      - "<Accomplished X measured by Y doing Z>"
      - "<Accomplished X measured by Y doing Z>"

education:
  - institution: "<University / College Name>"
    area: "<Field of Study / Major>"
    studyType: "<Degree, e.g. B.S., M.S.>"
    startDate: "YYYY-MM-DD"
    endDate: "YYYY-MM-DD"

skills:
  - name: "<Category Name, e.g. Languages>"
    keywords:
      - "<Skill 1>"
      - "<Skill 2>"
      - "<Skill 3>"

projects:
  - name: "<Project Name>"
    description: "<1-2 sentence description>"
    url: "<Repo or Live Demo URL>"
    keywords: ["<Tech 1>", "<Tech 2>"]
    highlights:
      - "<Key technical accomplishment or scale reached>"
```

RAW RESUME TEXT TO CONVERT:
[PASTE YOUR RAW RESUME TEXT HERE]
```

---

## 3. Hosting Your Resume on GitHub Gists

Resume Studio operates with a **zero-backend, privacy-first** architecture. Your personal data is never stored on our servers. To load your resume into Resume Studio, publish your YAML to a public GitHub Gist:

1. Go to [gist.github.com](https://gist.github.com/).
2. In the **Gist description**, enter `My Resume`.
3. In the **Filename including extension**, type `resume.yaml`.
4. Paste your verified YAML content into the editor.
5. Click **Create public gist** (Gists must be public for GitHub's read API to deliver them to your browser).
6. Look at your browser address bar:
   ```text
   https://gist.github.com/your-username/a1b2c3d4e5f678901234567890abcdef
   ```
   The alphanumeric string at the end (`a1b2c3d4e5f6...`) is your **Gist ID**.
7. In Resume Studio, open the **Gist** tab, paste your Gist ID, and click **Load Gist**.
8. Share your resume link with anyone:
   - **Studio View**: `https://your-domain.com/?gist=YOUR_GIST_ID`
   - **Recruiter View**: `https://your-domain.com/?gist=YOUR_GIST_ID&view=recruiter`

---

## 4. Converting LinkedIn Profile to JSON Resume

If you keep your LinkedIn profile updated, you can export your data directly:

1. On LinkedIn, click your profile picture → **Settings & Privacy**.
2. Select **Data privacy** on the left menu.
3. Under *How LinkedIn uses your data*, click **Get a copy of your data**.
4. Select *Want something in particular?* → Check **Profile** → Click **Request archive**.
5. LinkedIn will email you a `.zip` file within 10 minutes containing `Profile.csv`, `Positions.csv`, `Education.csv`, and `Skills.csv`.
6. Open those CSV files, copy the text, and use the conversion prompt in Section 2, indicating that the input is a LinkedIn data export.

*(Alternative: On your LinkedIn profile, click **More** → **Save to PDF**, and copy the text from the generated PDF).*

---

## 5. Junior & Fresh Graduate Blueprint

When you are graduating or transitioning careers with little to no formal employment history, traditional resume advice often fails. Here is how to create a credible, impressive technical resume from scratch:

### Rule 1: Invert the Visual Hierarchy
Seasoned professionals always put `work` at the top. As a student or junior:
- Put **`education`** and **`projects`** at the top.
- Put **`skills`** right next to projects.
- Place `work` at the bottom (even if it's retail, tutoring, or campus work—it still demonstrates reliability and communication).

### Rule 2: Treat Academic & Capstone Projects as "Work"
Recruiters hiring juniors care about **what you can build** and **how you solve problems**, not who signed your paycheck.
- Frame your bachelor's/master's thesis, capstone team projects, or semester lab assignments under `projects:`.
- Specify the real technologies used (e.g. `PostgreSQL`, `Docker`, `React`, `C++`).
- Mention engineering constraints: unit test coverage, concurrency handling, database indexing, or benchmark latency.

### Rule 3: Highlight Practical Tooling over Generic Soft Skills
Avoid empty phrases like *"Hard worker, fast learner, passionate team player"*. Instead, prove your adaptability by listing real engineering practices you understand:
- Version control workflow (`Git`, PR reviews, branching).
- Containerization basics (`Docker`).
- Testing methodology (`Jest`, `PyTest`, `Go test`).
- Continuous integration (`GitHub Actions`).

### Rule 4: Include Homelabs, Open-Source & Competitions
- **Self-hosted Homelabs**: Running a Proxmox cluster, Raspberry Pi DNS sinkhole, or home media server shows genuine curiosity.
- **Hackathons & Game Jams**: Proves you can deliver working software under tight deadlines.
- **CTF / Coding Competitions**: Shows algorithmic problem-solving stamina.

### Ready-to-Use Junior Starter YAML Template
Copy this template into a new Gist to kickstart a graduate resume:

```yaml
basics:
  name: "Alex Taylor"
  label: "Junior Software Engineer / Computer Science Graduate"
  email: "alex.taylor@example.com"
  phone: "+1 (555) 012-3456"
  url: "https://alextaylor.dev"
  location:
    city: "Boston"
    region: "Massachusetts"
    countryCode: "US"
  summary: >-
    Recent Computer Science graduate with strong foundations in data structures, systems programming,
    and full-stack development. Experienced building distributed backend services in Go and containerized
    web applications through hands-on coursework and capstone projects.
  profiles:
    - network: "GitHub"
      username: "alextaylor"
      url: "https://github.com/alextaylor"
    - network: "LinkedIn"
      username: "alextaylor"
      url: "https://linkedin.com/in/alextaylor"

executiveSummary:
  headline: "Computer Science Graduate with solid foundations in systems programming, Go, and cloud-native architecture seeking Junior Software Engineering roles."
  experienceYears: 1
  availability: "Available immediately for full-time Junior / Associate Engineer roles"
  targetRoles:
    - "Junior Software Engineer"
    - "Associate Backend Developer"
    - "Graduate Cloud / DevOps Engineer"
  keyMetrics:
    - label: "GPA"
      value: "3.85 / 4.0"
    - label: "Code Shipped"
      value: "4 Capstone Apps"
    - label: "Test Coverage"
      value: "95% Avg"
    - label: "Open Source"
      value: "15+ PRs Merged"
  coreCompetencies:
    - "Go & Python"
    - "REST APIs & gRPC"
    - "Docker & Linux"
    - "PostgreSQL & SQL"
    - "Git & GitHub Actions"
    - "Data Structures & Algorithms"
  topHighlights:
    - "Engineered real-time distributed chat application in Go handling 5,000 concurrent WebSocket connections."
    - "Designed and deployed containerized student course scheduler using React, FastAPI, and PostgreSQL on AWS EC2."
    - "Completed competitive summer software engineering internship optimizing database query performance."

education:
  - institution: "Northeastern University"
    area: "Computer Science"
    studyType: "Bachelor of Science (B.S.)"
    startDate: "2022-09-01"
    endDate: "2026-05-15"
    score: "3.85 / 4.0"
    courses:
      - "Object-Oriented Design"
      - "Algorithms & Data Structures"
      - "Database Design"
      - "Computer Systems & Networks"

projects:
  - name: "Distributed Task Queue"
    description: "Asynchronous background task processing engine built in Go using Redis and worker pools."
    url: "https://github.com/alextaylor/task-queue"
    startDate: "2025-01-01"
    endDate: "2025-04-01"
    keywords: ["Go", "Redis", "Concurrency", "Docker"]
    highlights:
      - "Implemented exponential backoff retry logic and dead-letter queue for failed tasks."
      - "Achieved 95% unit test coverage using Go's built-in testing package with automated GitHub Actions CI."

  - name: "Campus Hub Scheduler"
    description: "Full-stack course and study-group discovery platform built with React, FastAPI, and PostgreSQL."
    url: "https://github.com/alextaylor/campus-hub"
    startDate: "2024-09-01"
    endDate: "2024-12-15"
    keywords: ["React", "FastAPI", "PostgreSQL", "Docker Compose"]
    highlights:
      - "Designed relational database schema with indexed search queries reducing page load from 1.2s to 180ms."
      - "Containerized frontend and backend services with Docker Compose for single-command development setup."

skills:
  - name: "Languages"
    keywords: ["Go", "Python", "JavaScript / TypeScript", "SQL", "C++"]
  - name: "Frameworks & Databases"
    keywords: ["React", "FastAPI", "Node.js", "PostgreSQL", "Redis", "SQLite"]
  - name: "Developer Tools"
    keywords: ["Git", "Docker", "Linux / Bash", "GitHub Actions", "Postman", "VS Code"]

work:
  - name: "Northeastern College of Computer Science"
    position: "Teaching Assistant – Computer Systems"
    startDate: "2024-09-01"
    endDate: "2025-05-01"
    summary: "Supported 80+ undergraduate students in systems programming, memory management, and debugging."
    highlights:
      - "Held weekly office hours assisting students with C programming, pointers, and memory leak analysis in Valgrind."
      - "Graded weekly programming assignments and provided constructive code quality feedback."
```

---

## 6. Writing High-Impact Bullet Points (Google XYZ Formula)

The most common resume flaw is listing job responsibilities instead of achievements:
- ❌ *Weak (Task-focused)*: "Responsible for managing cloud servers and fixing bugs."
- ✅ *Strong (XYZ formula)*: "Reduced cloud infrastructure spending by 28% ($45k/year) by refactoring underutilized AWS instances and introducing automated auto-scaling."

### The Formula
$$\text{Accomplished [X] as measured by [Y], by doing [Z]}$$

- **X (Result)**: What improved, launched, stabilized, or accelerated?
- **Y (Metric)**: How did you measure it? (Percentage, dollar value, latency in ms, team count, hours saved).
- **Z (Action)**: What specific tool, architectural change, or workflow did you implement?

### Examples by Engineering Discipline

| Role | Before (Task-oriented) | After (Google XYZ Formula) |
| :--- | :--- | :--- |
| **Backend** | "Worked on microservices in Go." | "Accelerated checkout API throughput by 65% (p99 latency from 450ms to 120ms) by replacing synchronous REST calls with gRPC streaming." |
| **Frontend** | "Maintained company web dashboard in React." | "Improved Core Web Vitals score from 52 to 96 and cut initial bundle size by 40% through code splitting and tree-shaking optimizations." |
| **DevOps / SRE** | "Automated deployments with CI/CD." | "Decreased deployment rollback rate from 14% to under 1% by engineering blue-green deployment pipelines in GitHub Actions." |
| **Security** | "Did vulnerability scanning and audits." | "Eliminated 95% of critical CVE exposure time across 120 microservices by building automated container vulnerability gates into the CI pipeline." |

### Google XYZ & Recruiter Review AI Prompt

Copy and paste this prompt into Gemini, Claude, or ChatGPT to review and polish your existing resume YAML according to Google's impact principles:

```text
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
[PASTE YOUR RESUME YAML HERE]
```
```

---

## 7. The 6-Second Recruiter Quick-Scan Formula

When an internal recruiter opens your CV link, they don't read line-by-line. They scan in an **F-shaped pattern** across:
1. Candidate Name & Headline
2. The Key Metrics Strip
3. Core Competency Chips
4. Most recent job title & company

### Checklist for Recruiter Readiness
- [ ] **Headline is under 180 characters**: State who you are and your primary specialty in one punchy sentence.
- [ ] **2–4 quantifiable metrics**: Give the recruiter anchor numbers (e.g. `10+ Years`, `$2M+ ARR`, `99.99% SLA`, `15 Engineers`).
- [ ] **4–6 core superpower chips**: Don't dump 30 technologies; list the top domains you want to be hired for.
- [ ] **Clear target roles**: Tell the hiring team exactly which positions match your career goals.
- [ ] **Clean 1-column mobile reflow**: Test your resume link with `?view=recruiter` on a mobile phone to ensure zero horizontal scroll or clipped text.
