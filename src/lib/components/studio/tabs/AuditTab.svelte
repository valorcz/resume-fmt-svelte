<script>
  let {
    auditReport = {},
    atsPlainText = ''
  } = $props();

  let copyAtsFeedback = $state(false);

  function copyAtsText() {
    navigator.clipboard.writeText(atsPlainText).then(() => {
      copyAtsFeedback = true;
      setTimeout(() => copyAtsFeedback = false, 2000);
    });
  }
</script>

<div class="section-group">
  <div class="header-flex">
    <h3 class="group-title">Resume & ATS Audit</h3>
    {#if auditReport.grade}
      <span class="audit-grade-pill" style="border-color: {auditReport.gradeColor}40; color: {auditReport.gradeColor}">
        {auditReport.grade}
      </span>
    {/if}
  </div>
  <p class="group-desc">
    Automated quality and ATS compatibility check evaluating structure, contact reachability, and keyword readiness.
  </p>

  <!-- Overall Score Card -->
  <div class="audit-summary-card">
    <div class="audit-score-row">
      <div class="audit-score-val" style="color: {auditReport.gradeColor}">
        {auditReport.score}<span class="score-max">/100</span>
      </div>
      <div class="audit-score-meta">
        <span class="audit-score-status">Overall Quality Score</span>
        <span class="audit-score-stats">
          {auditReport.stats?.passed || 0} passed · {auditReport.stats?.warnings || 0} suggestion{(auditReport.stats?.warnings === 1) ? '' : 's'}{#if auditReport.stats?.info} · {auditReport.stats.info} tip{/if}
        </span>
      </div>
    </div>

    <!-- Progress Meter -->
    <div class="audit-progress-track">
      <div 
        class="audit-progress-fill" 
        style="width: {auditReport.score}%; background-color: {auditReport.gradeColor}"
      ></div>
    </div>
  </div>

  <!-- Section: Checklist Findings -->
  <div class="audit-checklist-section">
    <h4 class="audit-subheading">Audit Checklist ({auditReport.checks?.length || 0} Rules)</h4>

    <div class="audit-items-list">
      {#each (auditReport.checks || []) as check}
        <div class="audit-item {check.isInfo ? 'is-info' : (check.passed ? 'is-pass' : 'is-warn')}">
          <div class="audit-item-icon">
            {#if check.isInfo}
              <!-- Info Circle Icon -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            {:else if check.passed}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            {/if}
          </div>
          <div class="audit-item-body">
            <div class="audit-item-header">
              <span class="audit-item-title">{check.title}</span>
              <span class="audit-category-tag">{check.category}</span>
            </div>
            <p class="audit-item-msg">{check.message}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Section: ATS Plain-Text Simulation ("What the Robot Sees") -->
  <div class="ats-preview-section">
    <div class="header-flex">
      <div>
        <h4 class="audit-subheading" style="margin: 0">What the ATS Robot Sees</h4>
        <p class="group-desc" style="margin: 0.2rem 0 0.5rem 0">
          Linear plain-text stream extracted by applicant tracking systems (Workday, Greenhouse, Lever).
        </p>
      </div>
      <button class="text-btn" onclick={copyAtsText}>
        {copyAtsFeedback ? '✓ Copied Plain Text!' : 'Copy Text'}
      </button>
    </div>

    <pre class="yaml-viewer ats-text-viewer"><code>{atsPlainText}</code></pre>
  </div>
</div>

<style>
  .section-group {
    margin-bottom: 2rem;
  }

  .header-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;
  }

  .group-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  :global(.mode-dark) .group-title,
  :global(.is-dark) .group-title {
    color: #f8fafc;
  }

  .audit-grade-pill {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    border: 1px solid;
    background: transparent;
  }

  .group-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 1rem 0;
    line-height: 1.45;
  }
  :global(.mode-dark) .group-desc {
    color: #94a3b8;
  }

  .audit-summary-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.25rem;
  }
  :global(.mode-dark) .audit-summary-card {
    background: #181a20;
    border-color: #27272a;
  }

  .audit-score-row {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .audit-score-val {
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1;
    font-feature-settings: 'tnum';
  }

  .score-max {
    font-size: 1rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .audit-score-meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .audit-score-status {
    font-size: 0.85rem;
    font-weight: 700;
    color: #0f172a;
  }
  :global(.mode-dark) .audit-score-status,
  :global(.is-dark) .audit-score-status {
    color: #f8fafc;
  }

  .audit-score-stats {
    font-size: 0.75rem;
    color: #64748b;
  }
  :global(.mode-dark) .audit-score-stats,
  :global(.is-dark) .audit-score-stats {
    color: #94a3b8;
  }

  .audit-progress-track {
    height: 6px;
    width: 100%;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }
  :global(.mode-dark) .audit-progress-track,
  :global(.is-dark) .audit-progress-track {
    background: #27272a;
  }

  .audit-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .audit-checklist-section {
    margin-bottom: 1.5rem;
  }

  .audit-subheading {
    margin: 0 0 0.75rem 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  :global(.mode-dark) .audit-subheading,
  :global(.is-dark) .audit-subheading {
    color: #f8fafc;
  }

  .audit-items-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .audit-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem 0.85rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    align-items: flex-start;
  }
  :global(.mode-dark) .audit-item,
  :global(.is-dark) .audit-item {
    background: #181a20;
    border-color: #27272a;
  }

  .audit-item.is-pass {
    border-left: 3px solid #16a34a;
  }
  .audit-item.is-warn {
    border-left: 3px solid #d97706;
  }
  .audit-item.is-info {
    border-left: 3px solid #2563eb;
  }

  .audit-item-icon {
    margin-top: 0.15rem;
    flex-shrink: 0;
  }
  .is-pass .audit-item-icon { color: #16a34a; }
  .is-warn .audit-item-icon { color: #d97706; }
  .is-info .audit-item-icon { color: #2563eb; }

  .audit-item-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .audit-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .audit-item-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #0f172a;
  }
  :global(.mode-dark) .audit-item-title,
  :global(.is-dark) .audit-item-title {
    color: #f8fafc;
  }

  .audit-category-tag {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    letter-spacing: 0.03em;
  }
  :global(.mode-dark) .audit-category-tag,
  :global(.is-dark) .audit-category-tag {
    background: #27272a;
    color: #94a3b8;
  }

  .audit-item-msg {
    margin: 0;
    font-size: 0.74rem;
    line-height: 1.4;
    color: #64748b;
  }
  :global(.mode-dark) .audit-item-msg,
  :global(.is-dark) .audit-item-msg { color: #a1a1aa; }

  .ats-preview-section {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e2e8f0;
  }
  :global(.mode-dark) .ats-preview-section,
  :global(.is-dark) .ats-preview-section {
    border-color: #27272a;
  }

  .text-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.75rem;
    font-family: inherit;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
  }
  :global(.mode-dark) .text-btn,
  :global(.is-dark) .text-btn {
    color: #60a5fa;
  }
  .text-btn:hover {
    text-decoration: underline;
  }

  .yaml-viewer {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 6px;
    padding: 0.75rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.73rem;
    line-height: 1.5;
    overflow-x: auto;
    margin: 0;
  }
  :global(.mode-dark) .yaml-viewer,
  :global(.is-dark) .yaml-viewer {
    background: #090a0f;
    border: 1px solid #27272a;
  }

  .ats-text-viewer {
    max-height: 240px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
</style>
