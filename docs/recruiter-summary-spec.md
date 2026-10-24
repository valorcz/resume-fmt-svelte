# Recruiter & Executive Summary Specification

This specification defines an optional, structured `executiveSummary` block for JSON Resume (`resume.json` or `resume.yaml`). It enables AI agents or humans to produce a concise, high-signal briefing specifically tailored for mobile recruiters, hiring managers, and executive screeners.

---

## 1. Schema Placement

To maintain 100% compliance with the official JSON Resume specification (which restricts top-level properties but allows arbitrary tooling extensions inside `meta`), the `executiveSummary` is housed inside `meta.executiveSummary`:

```yaml
# resume.yaml
meta:
  version: "v1.0.0"
  executiveSummary:
    headline: "Staff Cloud Architect with 12+ years scaling resilient multi-region Kubernetes..."
    experienceYears: 12
    keyMetrics: [...]
    coreCompetencies: [...]
    topHighlights: [...]
    targetRoles: [...]
    availability: "..."
    workAuthorization: "..."

basics:
  name: "Jane Doe"
  label: "Principal Distributed Systems Engineer"
  ...
```

*(Note: For backwards compatibility, Resume Studio will also read a root-level `executiveSummary` if present, but placing it under `meta:` ensures zero schema validation errors in strict IDE validators).*

---

## 2. Field Definitions

| Field | Type | Required | Description | AI Generation Prompt Guidance |
| :--- | :--- | :--- | :--- | :--- |
| `headline` | `string` | Recommended | A 1–2 sentence elevator pitch highlighting domain and impact. | Summarize seniority, primary domain, and signature strength in < 140 chars. |
| `experienceYears` | `number` | Optional | Total years of relevant professional experience. | Calculate difference between earliest professional role and current year. |
| `keyMetrics` | `Array<{ label, value }>` | Optional | 2 to 4 quantifiable business or technical numbers. | Extract quantified numbers (e.g., "$1.2M saved", "100M+ req/day", "Team of 15"). |
| `coreCompetencies` | `string[]` | Recommended | 4 to 8 primary superpowers / core technical tags. | Prioritize the top skills repeated in recent senior achievements. |
| `topHighlights` | `string[]` | Recommended | 3 to 4 high-impact career bullets (action + context + result). | Select the top 3 single-sentence achievements from the entire career. |
| `targetRoles` | `string[]` | Optional | Ideal next job titles. | Extrapolate matching senior/leadership titles from candidate trajectory. |
| `availability` | `string` | Optional | Availability status (e.g., "Immediate", "2 weeks notice"). | Candidate status or timeline. |
| `workAuthorization` | `string` | Optional | Location & visa / right-to-work status. | Derived from basics location or candidate preferences. |

---

## 3. Example in YAML

```yaml
executiveSummary:
  headline: "Staff Cloud Architect with 12+ years scaling resilient multi-region Kubernetes and data platforms for high-throughput FinTech applications."
  experienceYears: 12
  keyMetrics:
    - label: "Traffic Scale"
      value: "500k RPS"
    - label: "Engineering Scope"
      value: "20+ Engineers"
    - label: "Reliability"
      value: "99.999% SLA"
  coreCompetencies:
    - "Cloud-Native Infrastructure (AWS/GCP)"
    - "Kubernetes & Service Mesh"
    - "Distributed Systems (Go, Rust)"
    - "System Reliability & FinOps"
  topHighlights:
    - "Designed and rolled out zero-downtime multi-region active-active architecture across 3 continents."
    - "Spearheaded cloud cost optimization program saving $2.4M annually without performance degradation."
    - "Mentored 14 senior engineers and established company-wide RFC architecture review process."
  targetRoles:
    - "Staff / Principal Cloud Architect"
    - "Director of Platform Engineering"
  availability: "Available with 1 month notice"
  workAuthorization: "US Citizen / Remote"
```

---

## 4. AI Agent Prompt Template

You can use the following prompt with any LLM to generate this block automatically:

```markdown
Analyze the attached JSON/YAML resume. Output ONLY a valid YAML block for `executiveSummary`:

Fields required:
- headline: punchy 1-line elevator pitch (< 140 characters).
- experienceYears: calculated total years from earliest role to now.
- keyMetrics: 2 to 4 objects with `label` (< 20 chars) and `value` (< 15 chars) citing measurable outcomes.
- coreCompetencies: 6 top technical and leadership skills.
- topHighlights: 3 most impressive single-sentence career achievements formatted with (Action + Context + Quantifiable Result).
- targetRoles: 2-3 target job titles matching their experience level.
```

---

## 5. Graceful Fallback (Zero-Config)

When the `executiveSummary` block is omitted, the Resume Studio automatically generates a deterministic executive summary from existing JSON Resume data:
* **Years of Experience**: Computed from `work` history dates.
* **Current Role**: `work[0].position` at `work[0].name`.
* **Superpowers**: Top keywords from `resume.skills`.
* **Top Highlights**: First bullet point from each of the 3 most recent work entries.
* **Highest Education**: `resume.education[0]`.
