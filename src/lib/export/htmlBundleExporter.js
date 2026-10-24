import yaml from 'js-yaml';
import coreCss from '../styles/core.css?raw';
import printCoreCss from '../styles/print-core.css?raw';
import { synthesizeExecutiveSummary } from '../audit/recruiterAudit.js';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildRecruiterBriefingHtml(resume) {
  const summary = resume.executiveSummary || resume.meta?.executiveSummary || {};
  const headline = summary.headline || resume.basics?.label || resume.basics?.headline || 'Professional Profile';
  const targetRoles = summary.targetRoles || [];
  const metrics = summary.keyMetrics || [];
  const competencies = summary.coreCompetencies || [];
  const highlights = summary.topHighlights || [];

  return `
    <section id="recruiter-briefing-card" class="recruiter-briefing-card">
      <div class="briefing-header">
        <div class="briefing-tag-row">
          <span class="briefing-badge">◈ Executive Briefing</span>
          ${summary.availability ? `<span class="availability-badge">${escapeHtml(summary.availability)}</span>` : ''}
        </div>
        <h3 class="briefing-headline">${escapeHtml(headline)}</h3>
        ${targetRoles.length > 0 ? `
          <div class="target-roles-row">
            <span class="roles-label">Target Roles:</span>
            ${targetRoles.map(r => `<span class="role-chip">${escapeHtml(r)}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      ${metrics.length > 0 ? `
        <div class="briefing-metrics-grid">
          ${metrics.map(m => `
            <div class="metric-card">
              <span class="metric-val">${escapeHtml(m.value)}</span>
              <span class="metric-lbl">${escapeHtml(m.label)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${competencies.length > 0 ? `
        <div class="briefing-skills-section">
          <span class="skills-heading">Core Competencies:</span>
          <div class="skills-chip-row">
            ${competencies.map(c => `<span class="competency-chip">${escapeHtml(c)}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${highlights.length > 0 ? `
        <div class="briefing-highlights-section">
          <span class="highlights-heading">Career Highlights:</span>
          <ul class="highlights-list">
            ${highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </section>
  `;
}

export function generateStandaloneHtml({
  resume,
  activeTheme = 'classic',
  activeThemeCss = '',
  colorMode = 'system',
  paperFormat = 'a4',
  printMargin = '1.5cm',
  printScale = 100,
  customAccent = null,
  effectiveLayout = null,
  includeBriefingCard = true,
  includeStudioConfig = true
}) {
  const candidateName = resume?.basics?.name || 'Resume';

  // 1. Prepare Embedded YAML Source (standard JSON Resume with meta.studio & meta.executiveSummary)
  let yamlDoc = resume;
  if (includeStudioConfig) {
    const existingMeta = resume.meta ? { ...resume.meta } : {};
    delete existingMeta.studio;
    delete existingMeta.studioConfig;
    delete existingMeta.resumeStudio;
    delete existingMeta.config;
    delete existingMeta._config;
    delete existingMeta.executiveSummary;

    const { _config, executiveSummary: _legacyExec, meta: _origMeta, basics, ...otherSections } = resume;
    const synthesizedExec = synthesizeExecutiveSummary(resume);

    yamlDoc = {
      meta: {
        ...existingMeta,
        studio: {
          theme: activeTheme,
          ...(customAccent ? { accent: customAccent } : {}),
          ...(colorMode && colorMode !== 'system' ? { mode: colorMode } : {}),
          layout: {
            main: [...(effectiveLayout?.main || [])],
            sidebar: [...(effectiveLayout?.sidebar || [])]
          }
        },
        executiveSummary: synthesizedExec
      },
      ...(basics ? { basics } : {}),
      ...otherSections
    };
  }
  const serializedYaml = yaml.dump(yamlDoc, { lineWidth: -1, noRefs: true });

  // 2. Clone active resume HTML from the live DOM
  let resumeBodyHtml = '';
  if (typeof document !== 'undefined') {
    const wrapper = document.querySelector('.cv-wrapper');
    if (wrapper) {
      const clone = wrapper.cloneNode(true);
      // Remove any internal editor guides or existing briefing card from the clone
      clone.querySelectorAll('.page-guide-indicator, .guide-label, .page-boundary-ruler, .recruiter-briefing-card')
        .forEach(el => el.remove());
      resumeBodyHtml = clone.innerHTML;
    }
  }

  // 3. Render Recruiter Card if requested and available
  const hasExecutiveSummary = Boolean(resume.executiveSummary || resume.meta?.executiveSummary);
  const briefingCardHtml = (includeBriefingCard && hasExecutiveSummary)
    ? buildRecruiterBriefingHtml(resume)
    : '';

  // 4. Accent CSS override
  const accentOverrideCss = customAccent ? `
    :root, .theme-${activeTheme} {
      --custom-accent: ${customAccent};
      --primary: ${customAccent};
    }
  ` : '';

  // 5. Build full HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="Resume Studio v1.2">
  <title>${escapeHtml(candidateName)} — Resume</title>

  <style>
    /* Base Core & Universal Reset */
    ${coreCss}

    /* Active Theme CSS (${activeTheme}) */
    ${activeThemeCss}

    /* Print Core Rules */
    ${printCoreCss}

    /* Custom Accent & Page Sizing */
    ${accentOverrideCss}

    @page {
      size: ${paperFormat.toUpperCase()};
      margin: ${printMargin};
    }

    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }

    .theme-${activeTheme} {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem 4rem 1rem;
      box-sizing: border-box;
    }

    .standalone-shell {
      width: 100%;
      max-width: 920px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Standalone Top Action Toolbar */
    .standalone-toolbar {
      position: sticky;
      top: 1rem;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      color: #ffffff;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
      margin-bottom: 0.5rem;
    }

    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .toolbar-badge {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #2563eb;
      color: #ffffff;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toolbar-btn {
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .toolbar-btn:hover {
      background: rgba(255, 255, 255, 0.22);
    }

    .toolbar-btn.active {
      background: #2563eb;
      border-color: #3b82f6;
    }

    .toolbar-btn-primary {
      background: #2563eb;
      border-color: #3b82f6;
    }

    .toolbar-btn-primary:hover {
      background: #1d4ed8;
    }

    /* Recruiter Briefing Card Styling */
    .recruiter-briefing-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #2563eb;
    }

    .briefing-tag-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.45rem;
    }

    .briefing-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563eb;
    }

    .availability-badge {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .briefing-headline {
      margin: 0 0 0.5rem 0;
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.4;
      color: #0f172a;
    }

    .target-roles-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .roles-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }

    .role-chip {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: #f1f5f9;
      color: #334155;
    }

    .briefing-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .metric-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #2563eb;
    }

    .metric-lbl {
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .briefing-skills-section {
      margin-bottom: 1rem;
    }

    .skills-heading, .highlights-heading {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 0.4rem;
    }

    .skills-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .competency-chip {
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .highlights-list {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.82rem;
      line-height: 1.55;
      color: #334155;
    }

    .highlights-list li {
      margin-bottom: 0.3rem;
    }

    /* Resume Document Wrapper */
    .cv-wrapper {
      background: #ffffff;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
    }

    /* Print Overrides */
    @media print {
      body {
        background: none !important;
      }
      .standalone-toolbar {
        display: none !important;
      }
      .theme-${activeTheme} {
        padding: 0 !important;
      }
      .standalone-shell {
        max-width: 100% !important;
      }
      .cv-wrapper {
        box-shadow: none !important;
      }
    }
  </style>

  <!-- Embedded Standalone YAML Source -->
  <script type="application/x-yaml" id="resume-yaml-source">
${serializedYaml}
  </script>
</head>
<body class="theme-${escapeHtml(activeTheme)} mode-${escapeHtml(colorMode)}">
  <div class="theme-${escapeHtml(activeTheme)}">
    <div class="standalone-shell">
      <!-- Minimalist Standalone Action Toolbar (Hidden when printed) -->
      <aside class="standalone-toolbar" aria-label="Resume Actions">
        <div class="toolbar-brand">
          <span class="toolbar-name">${escapeHtml(candidateName)}</span>
          <span class="toolbar-badge">Resume</span>
        </div>
        <div class="toolbar-actions">
          ${briefingCardHtml ? `
            <button type="button" class="toolbar-btn active" id="btn-toggle-briefing" onclick="toggleBriefing()">
              ◈ Briefing
            </button>
          ` : ''}
          <button type="button" class="toolbar-btn" id="btn-copy-yaml" onclick="copyYaml()">
            📋 Copy YAML
          </button>
          <button type="button" class="toolbar-btn toolbar-btn-primary" onclick="window.print()">
            🖨️ Print / Save PDF
          </button>
        </div>
      </aside>

      <!-- Recruiter Briefing Card -->
      ${briefingCardHtml}

      <!-- Full Rendered Resume -->
      <div class="cv-wrapper">
        ${resumeBodyHtml}
      </div>
    </div>
  </div>

  <script>
    function copyYaml() {
      var yamlEl = document.getElementById('resume-yaml-source');
      if (!yamlEl) return;
      var text = yamlEl.textContent.trim();
      navigator.clipboard.writeText(text).then(function() {
        var btn = document.getElementById('btn-copy-yaml');
        if (!btn) return;
        var orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        setTimeout(function() { btn.innerHTML = orig; }, 2000);
      });
    }

    function toggleBriefing() {
      var card = document.getElementById('recruiter-briefing-card');
      var btn = document.getElementById('btn-toggle-briefing');
      if (!card || !btn) return;
      var isHidden = card.style.display === 'none';
      card.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtml(options) {
  const htmlContent = generateStandaloneHtml(options);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const baseName = options.resume?.basics?.name
    ? options.resume.basics.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    : 'resume';
  a.href = url;
  a.download = `${baseName}.standalone.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
