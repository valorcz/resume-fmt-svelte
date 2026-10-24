<script>
  let {
    resume = {},
    isDark = false,
    onClose = () => {}
  } = $props();

  // Check for explicit executiveSummary or meta.executiveSummary in data
  let explicitSummary = $derived(
    resume.executiveSummary || resume.meta?.executiveSummary || null
  );

  // Deterministically calculate total years of experience
  function getCalculatedYears(work) {
    if (!work || !Array.isArray(work) || work.length === 0) return null;
    let earliest = Infinity;
    let latest = -Infinity;
    const currentYear = new Date().getFullYear();

    for (const job of work) {
      if (job.startDate) {
        const y = parseInt(String(job.startDate).substring(0, 4), 10);
        if (!isNaN(y) && y < earliest) earliest = y;
      }
      if (job.endDate) {
        const y = parseInt(String(job.endDate).substring(0, 4), 10);
        if (!isNaN(y) && y > latest) latest = y;
      } else {
        latest = currentYear;
      }
    }

    if (earliest === Infinity) return null;
    return Math.max(1, (latest === -Infinity ? currentYear : latest) - earliest);
  }

  let calculatedYears = $derived(getCalculatedYears(resume.work));

  // Resolved Headline / Elevator statement
  let headline = $derived(
    explicitSummary?.headline ||
    resume.basics?.headline ||
    resume.basics?.label ||
    (resume.work?.[0] ? `${resume.work[0].position} with extensive professional track record` : 'Professional Profile')
  );

  // Resolved Years of experience
  let experienceYears = $derived(
    explicitSummary?.experienceYears || calculatedYears
  );

  // Key metrics (explicit or auto-derived)
  let metrics = $derived.by(() => {
    if (explicitSummary?.keyMetrics && explicitSummary.keyMetrics.length > 0) {
      return explicitSummary.keyMetrics;
    }
    const derived = [];
    if (experienceYears) {
      derived.push({ label: 'Experience', value: `${experienceYears}+ Years` });
    }
    if (resume.work?.[0]?.position) {
      derived.push({ label: 'Current / Recent', value: resume.work[0].position });
    }
    if (resume.education?.[0]?.studyType) {
      const edu = resume.education[0];
      derived.push({ label: 'Education', value: `${edu.studyType}${edu.area ? ` in ${edu.area}` : ''}` });
    }
    return derived;
  });

  // Core Competencies / Superpowers
  let competencies = $derived.by(() => {
    if (explicitSummary?.coreCompetencies && explicitSummary.coreCompetencies.length > 0) {
      return explicitSummary.coreCompetencies;
    }
    const skillsList = [];
    if (resume.skills && Array.isArray(resume.skills)) {
      for (const group of resume.skills) {
        if (group.keywords && Array.isArray(group.keywords)) {
          for (const kw of group.keywords) {
            if (!skillsList.includes(kw)) skillsList.push(kw);
            if (skillsList.length >= 8) break;
          }
        }
        if (skillsList.length >= 8) break;
      }
    }
    return skillsList;
  });

  // Top Achievements / Highlights
  let highlights = $derived.by(() => {
    if (explicitSummary?.topHighlights && explicitSummary.topHighlights.length > 0) {
      return explicitSummary.topHighlights;
    }
    const extracted = [];
    if (resume.work && Array.isArray(resume.work)) {
      for (const job of resume.work) {
        if (job.highlights && job.highlights[0]) {
          extracted.push(job.highlights[0]);
          if (extracted.length >= 3) break;
        }
      }
    }
    return extracted;
  });

  let availability = $derived(explicitSummary?.availability || null);
  let targetRoles = $derived(explicitSummary?.targetRoles || null);
</script>

<aside class="recruiter-dossier-card no-print" class:is-dark={isDark} aria-label="Executive Briefing Dossier">
  
  <!-- Dossier Meta Header -->
  <div class="dossier-header">
    <div class="dossier-header-left">
      <div class="dossier-tag">
        <span class="dossier-dot"></span>
        <span>EXECUTIVE BRIEFING</span>
      </div>
      <span class="dossier-subtext">Hiring Team Quick-Scan</span>
    </div>

    <div class="dossier-header-right">
      {#if availability}
        <span class="dossier-availability" title="Candidate availability">{availability}</span>
      {/if}
      
      <!-- Close / Dismiss Button -->
      <button 
        class="btn-dossier-close" 
        onclick={onClose}
        title="Hide executive briefing (you can re-enable anytime via the top bar)"
        aria-label="Hide executive briefing"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Hide</span>
      </button>
    </div>
  </div>

  <!-- Main Elevator Statement -->
  <p class="dossier-headline">
    {headline}
  </p>

  <!-- Key Metrics Strip -->
  {#if metrics.length > 0}
    <div class="dossier-metrics">
      {#each metrics as m}
        <div class="metric-cell">
          <span class="metric-val">{m.value}</span>
          <span class="metric-lbl">{m.label}</span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Superpowers / Competencies Tags -->
  {#if competencies.length > 0}
    <div class="dossier-section">
      <span class="section-micro-label">CORE COMPETENCIES</span>
      <div class="competencies-chips">
        {#each competencies as skill}
          <span class="competency-chip">{skill}</span>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Top Career Highlights -->
  {#if highlights.length > 0}
    <div class="dossier-section">
      <span class="section-micro-label">KEY ACHIEVEMENTS</span>
      <ul class="dossier-highlights-list">
        {#each highlights as hl}
          <li>{@html hl}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Target Roles -->
  {#if targetRoles && targetRoles.length > 0}
    <div class="dossier-footer">
      <span class="section-micro-label">TARGET ROLES:</span>
      <span class="roles-text">{targetRoles.join(' · ')}</span>
    </div>
  {/if}

</aside>

<style>
  /*
   * VISUAL DISTINCTION:
   * Styled distinctly as an executive briefing card / dossier overlay
   * so it is clearly recognized as a tailored recruiter layer rather than
   * accidental duplicate body text in the resume.
   */
  .recruiter-dossier-card {
    position: relative;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-top: 3px solid #2563eb;
    border-radius: 8px;
    padding: 1.1rem 1.35rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.08);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    transition: background 0.25s ease, border-color 0.25s ease;
  }

  .recruiter-dossier-card.is-dark,
  :global(.is-dark) .recruiter-dossier-card,
  :global(.mode-dark) .recruiter-dossier-card {
    background: #181c24;
    border-color: #2e3545;
    border-top-color: #3b82f6;
    color: #f1f5f9;
    box-shadow: 0 6px 20px -2px rgba(0, 0, 0, 0.4);
  }

  .dossier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.85rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-bottom: 0.55rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .is-dark .dossier-header,
  :global(.is-dark) .dossier-header,
  :global(.mode-dark) .dossier-header {
    border-bottom-color: #2b3240;
  }

  .dossier-header-left,
  .dossier-header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dossier-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    padding: 0.18rem 0.45rem;
    font-size: 0.68rem;
    font-weight: 700;
    color: #1d4ed8;
    letter-spacing: 0.05em;
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
  }

  .is-dark .dossier-tag,
  :global(.is-dark) .dossier-tag,
  :global(.mode-dark) .dossier-tag {
    background: #1e2638;
    border-color: #2d3b55;
    color: #93c5fd;
  }

  .dossier-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2563eb;
  }

  .dossier-subtext {
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
  }

  .is-dark .dossier-subtext,
  :global(.is-dark) .dossier-subtext,
  :global(.mode-dark) .dossier-subtext {
    color: #94a3b8;
  }

  .dossier-availability {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.18rem 0.5rem;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.12);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .is-dark .dossier-availability,
  :global(.is-dark) .dossier-availability,
  :global(.mode-dark) .dossier-availability {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.4);
  }

  .btn-dossier-close {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: transparent;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 0.2rem 0.45rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-dossier-close:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .is-dark .btn-dossier-close,
  :global(.is-dark) .btn-dossier-close,
  :global(.mode-dark) .btn-dossier-close {
    border-color: #3e4758;
    color: #94a3b8;
  }

  .is-dark .btn-dossier-close:hover,
  :global(.is-dark) .btn-dossier-close:hover,
  :global(.mode-dark) .btn-dossier-close:hover {
    background: #252c3a;
    color: #ffffff;
  }

  .dossier-headline {
    font-size: 0.98rem;
    line-height: 1.5;
    font-weight: 500;
    color: #0f172a;
    margin: 0 0 1rem 0;
  }

  .is-dark .dossier-headline,
  :global(.is-dark) .dossier-headline,
  :global(.mode-dark) .dossier-headline {
    color: #f1f5f9;
  }

  .dossier-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 0.65rem 0.8rem;
    margin-bottom: 0.95rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }

  .is-dark .dossier-metrics,
  :global(.is-dark) .dossier-metrics,
  :global(.mode-dark) .dossier-metrics {
    background: #11141a;
    border-color: #272f3d;
  }

  .metric-cell {
    display: flex;
    flex-direction: column;
    min-width: 100px;
  }

  .metric-val {
    font-size: 1.05rem;
    font-weight: 700;
    color: #2563eb;
    line-height: 1.2;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }

  .is-dark .metric-val,
  :global(.is-dark) .metric-val,
  :global(.mode-dark) .metric-val {
    color: #60a5fa;
  }

  .metric-lbl {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-top: 0.2rem;
  }

  .dossier-section {
    margin-bottom: 0.85rem;
  }

  .section-micro-label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    margin-bottom: 0.4rem;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }

  .competencies-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .competency-chip {
    font-size: 0.74rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    background: #ffffff;
    color: #0f172a;
    border: 1px solid #cbd5e1;
  }

  .is-dark .competency-chip,
  :global(.is-dark) .competency-chip,
  :global(.mode-dark) .competency-chip {
    background: #202633;
    color: #f1f5f9;
    border-color: #3b4559;
  }

  .dossier-highlights-list {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.85rem;
    line-height: 1.48;
    color: #334155;
  }

  .is-dark .dossier-highlights-list,
  :global(.is-dark) .dossier-highlights-list,
  :global(.mode-dark) .dossier-highlights-list {
    color: #cbd5e1;
  }

  .dossier-highlights-list li {
    margin-bottom: 0.3rem;
  }

  .dossier-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    padding-top: 0.6rem;
    border-top: 1px dashed #cbd5e1;
  }

  .is-dark .dossier-footer,
  :global(.is-dark) .dossier-footer,
  :global(.mode-dark) .dossier-footer {
    border-top-color: #2b3240;
  }

  .roles-text {
    font-weight: 600;
    color: #1e293b;
  }

  .is-dark .roles-text,
  :global(.is-dark) .roles-text,
  :global(.mode-dark) .roles-text {
    color: #f1f5f9;
  }

  @media (max-width: 600px) {
    .recruiter-dossier-card {
      padding: 1.15rem 1rem;
      margin-bottom: 1.5rem;
    }

    .dossier-header {
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .dossier-header-left {
      width: 100%;
    }

    .dossier-header-right {
      width: 100%;
      justify-content: space-between;
    }

    .dossier-headline {
      font-size: 0.95rem;
      line-height: 1.45;
    }

    .metric-cell {
      min-width: 75px;
      padding: 0.45rem 0.6rem;
    }

    .dossier-footer {
      flex-wrap: wrap;
      gap: 0.35rem;
    }
  }

  @media print {
    .recruiter-dossier-card {
      display: none !important;
    }
  }
</style>
