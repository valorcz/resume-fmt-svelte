---
id: tour
title: Quick Tour
icon: 🧭
order: 1
summary: Overview of Resume Studio, zero-backend privacy guarantee, and shortcut keys
---

# Welcome to Resume Studio

Resume Studio is a modern, developer-centric environment for crafting, linting, and publishing technical resumes using the open **JSON Resume** standard. It combines live multi-theme previewing with automated recruiter-scanning diagnostics and export tools.

---

> [!NOTE]
> **Zero-Backend Privacy Guarantee**:
> Resume Studio operates **100% client-side in your browser**. Your resume data, contact information, work history, and compensation details are **never** transmitted to any external server, database, or analytics service. Everything is parsed, validated, and rendered entirely on your local machine.

---

## Core Studio Capabilities

### 🎨 18 Production-Ready Themes
Instantly switch between 18 distinct design themes—ranging from single-column minimalist tech layouts to two-column executive briefings and compact academic CVs. All themes feature pixel-perfect `@media print` CSS for consistent PDF generation.

### ◈ Recruiter Briefing & Executive Summary
Recruiters spend an average of **6 to 10 seconds** on an initial resume review. Resume Studio evaluates your resume's `executiveSummary` extension in real time, calculating metrics coverage, core competencies, and high-impact proof points.

### ⚡ Schema & ATS Compliance Audit
An integrated 6-category linter analyzes your data against the JSON Resume v1.0.0 specification and Applicant Tracking System (ATS) parsing rules, alerting you to missing metrics, empty sections, or structural issues.

### 📥 One-Click Print & Export
Export your resume as a pristine, vector-rendered PDF using standard browser print (`Ctrl/Cmd + P`), download raw YAML/JSON files, or copy sharing URLs with embedded theme presets.

---

## Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>?</kbd> | **Open Handbook** | Launch this guide and reference handbook from anywhere in the Studio. |
| <kbd>/</kbd> | **View YAML Source** | Display the active resume YAML source code with 1-click copy & download. |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> / <kbd>Cmd</kbd> + <kbd>P</kbd> | **Print / Export PDF** | Open the browser print dialog with print-optimized CSS applied. |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> / <kbd>Cmd</kbd> + <kbd>S</kbd> | **Save / Download YAML** | Download the currently active resume as a `.yaml` file. |
| <kbd>B</kbd> | **Toggle Page Guides** | Show / hide print page break alignment boundaries. |
| <kbd>Esc</kbd> | **Dismiss / Close** | Close open modals, drawers, or popovers. |

---

## Getting Started

1. **Load or Import Your Resume**: Use the **Source** tab in the sidebar to paste a GitHub Gist ID, upload a `.yaml`/`.json` file, or load the built-in sample resume.
2. **Review Best Practices**: If you are migrating from Word or PDF, check the **Word/PDF → AI** tab for ready-to-copy migration prompts.
3. **Inspect the Recruiter Briefing**: Click the `◈ Briefing` pill in the top navigation bar to verify how recruiters view your top achievements at a glance.
