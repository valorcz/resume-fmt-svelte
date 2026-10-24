---
id: junior
aliases: [graduate, starter]
title: Junior Blueprint
icon: 🎓
order: 4
summary: Strategic resume blueprint for graduates and career switchers
---

# Junior & Fresh Graduate Resume Blueprint

> *"How do I fill out a professional technical resume when I have zero commercial experience?"*

This is the most common hurdle for university graduates, bootcamp alumni, and self-taught engineers. The secret is that technical recruiters hiring for junior roles are **not** looking for 10 years of commercial employment—they are looking for **engineering maturity, problem-solving initiative, and proof that you can ship clean code**.

---

## The Inverted Hierarchy Strategy

When you lack extensive corporate employment history, standard chronological resumes work against you by leaving large blank sections at the top. Instead, invert your emphasis:

### 1. Treat Projects as First-Class Work Experience
If you built a full-stack web application, a compiler, an IoT monitor, or contributed to an open-source library, treat it with the **exact same structural rigor** as a commercial job:
- Give it a clear name and a clickable GitHub or live demo URL.
- State the architectural problem you solved.
- Quantify your achievements (e.g., *"Achieved 94% unit test coverage"*, *"Engineered sub-50ms API response times"*, *"Integrated OAuth2 and Stripe webhooks"*).

### 2. Emphasize Technical Education & Relevant Coursework
- Highlight key computer science courses: *Algorithms & Data Structures, Distributed Systems, Database Internals, Computer Networks, Operating Systems*.
- Mention academic honors, dean's lists, or scholarship recognitions.
- Include your thesis or capstone project title and impact.

### 3. Highlight Practical Core Competencies
Instead of listing 40 buzzwords you glanced at once, focus on depth in 2–3 modern programming languages and the developer tools you actually use (e.g., Git, Docker, Linux CLI, PostgreSQL).

---

## Junior & Graduate Starter YAML Schema

Use this template as your starting point. It provides a balanced layout specifically structured for early-career developers:

```yaml title="Junior & Graduate Starter YAML Schema"
basics:
  name: "Alex Taylor"
  label: "Junior Software Engineer / Computer Science Graduate"
  email: "alex.taylor@example.com"
  phone: "+1 (555) 234-5678"
  url: "https://github.com/alextaylor"
  location:
    city: "San Francisco"
    region: "CA"
    countryCode: "US"
  summary: "Recent Computer Science graduate with hands-on experience building distributed backend services and TypeScript web applications. Passionate about clean code, robust automated testing, and developer tooling."
  profiles:
    - network: "GitHub"
      username: "alextaylor"
      url: "https://github.com/alextaylor"
    - network: "LinkedIn"
      username: "alex-taylor-dev"
      url: "https://linkedin.com/in/alex-taylor-dev"

executiveSummary:
  headline: "Recent CS graduate skilled in TypeScript, Go, and PostgreSQL with proven capstone project delivery."
  experienceYears: 1
  availability: "Immediately available"
  targetRoles:
    - "Junior Software Engineer"
    - "Associate Backend Developer"
  keyMetrics:
    - label: "Capstone Delivery"
      value: "Full-Stack App"
    - label: "Test Coverage"
      value: "92% Unit & E2E"
    - label: "Open Source"
      value: "15+ Merged PRs"
  coreCompetencies:
    - "Go & TypeScript"
    - "REST & GraphQL APIs"
    - "PostgreSQL & Redis"
    - "Docker & CI/CD Pipelines"
    - "Automated Testing"
  topHighlights:
    - "Designed and deployed open-source collaborative code editor serving 500+ active student users."
    - "Awarded 1st place in University Hackathon out of 42 competing engineering teams."

education:
  - institution: "University of California, Berkeley"
    url: "https://berkeley.edu"
    area: "Computer Science"
    studyType: "Bachelor of Science (B.S.)"
    startDate: "2022-09"
    endDate: "2026-05"
    score: "3.85 GPA · Dean's Honors"
    courses:
      - "CS 61B: Data Structures & Algorithms"
      - "CS 162: Operating Systems & System Programming"
      - "CS 186: Introduction to Database Systems"

projects:
  - name: "DevCollab: Real-Time Code Sync"
    description: "Distributed collaborative code editor powered by WebSockets and operational transformation."
    url: "https://github.com/alextaylor/devcollab"
    keywords: ["Go", "WebSockets", "Docker", "Redis"]
    highlights:
      - "Architected real-time synchronization backend handling up to 100 concurrent edits per document."
      - "Engineered Redis pub/sub message broker achieving sub-30ms event broadcast latency."
      - "Containerized service using Docker Compose and established automated GitHub Actions CI pipeline."

  - name: "MiniSQL Engine"
    description: "Lightweight in-memory relational database and B-Tree indexing engine written in Go."
    url: "https://github.com/alextaylor/minisql"
    keywords: ["Go", "B-Tree", "SQL Parser"]
    highlights:
      - "Implemented AST lexer and parser supporting basic SELECT, INSERT, and WHERE clause execution."
      - "Constructed custom B+ tree index achieving O(log N) lookup times across 100k test records."

skills:
  - name: "Languages"
    level: "Proficient"
    keywords: ["Go", "TypeScript", "JavaScript", "Python", "SQL"]
  - name: "Frameworks & Tools"
    level: "Familiar"
    keywords: ["Node.js", "Docker", "Git", "PostgreSQL", "Linux", "Svelte"]
```
