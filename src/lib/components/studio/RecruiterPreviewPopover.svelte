<script>
  import ExecutiveSummaryCard from '$lib/components/recruiter/ExecutiveSummaryCard.svelte';
  import { evaluateRecruiterSummary } from '$lib/audit/recruiterAudit.js';

  let {
    resume = {},
    isDark = false,
    isOpen = false,
    onClose = () => {},
    onOpenGistTab = null
  } = $props();

  let activeView = $state('preview'); // 'preview' | 'checks'
  let copyFeedback = $state(false);
  let copyTemplateFeedback = $state(false);

  let evalReport = $derived(evaluateRecruiterSummary(resume));

  const YAML_TEMPLATE = `executiveSummary:
  headline: "Principal Engineer with 12+ years designing resilient distributed systems and driving high-velocity engineering orgs."
  experienceYears: 12
  availability: "Available for Senior / Principal advisory & leadership roles"
  targetRoles:
    - Principal Software Engineer
    - Solutions Architect
    - Staff Infrastructure Engineer
  keyMetrics:
    - label: "Experience"
      value: "12+ Years"
    - label: "Cloud Scale"
      value: "10M+ Daily DAU"
    - label: "Infrastructure"
      value: "99.99% Uptime"
    - label: "Team Leadership"
      value: "15+ Engineers"
  coreCompetencies:
    - Distributed Systems
    - Cloud Infrastructure
    - System Architecture
    - DevOps & CI/CD
    - Team Mentorship
  topHighlights:
    - "Architected zero-downtime database migration handling 15k req/sec across multi-region AWS infrastructure."
    - "Spearheaded platform modernization decreasing p99 latency by 45% and cutting AWS compute costs by $250k/year."
    - "Grew infrastructure engineering group from 4 to 16 engineers and standardized internal developer tooling."`;

  function copyRecruiterUrl() {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'recruiter');
      navigator.clipboard.writeText(url.toString()).then(() => {
        copyFeedback = true;
        setTimeout(() => copyFeedback = false, 2000);
      });
    }
  }

  function copyTemplateYaml() {
    navigator.clipboard.writeText(YAML_TEMPLATE).then(() => {
      copyTemplateFeedback = true;
      setTimeout(() => copyTemplateFeedback = false, 2500);
    });
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop for click-outside -->
  <button 
    type="button"
    class="popover-backdrop"
    onclick={onClose}
    aria-label="Close Recruiter Inspector"
  ></button>

  <!-- Anchored Floating Popover -->
  <div 
    class="recruiter-inspector-popover" 
    class:is-dark={isDark} 
    role="dialog" 
    aria-modal="true" 
    aria-label="Recruiter Briefing Inspector"
  >
    <!-- Popover Header -->
    <div class="popover-header">
      <div class="header-left">
        <div class="popover-eyebrow">
          <span class="pulse-dot" style="background-color: {evalReport.gradeColor}"></span>
          <span>RECRUITER BRIEFING INSPECTOR</span>
        </div>
        <div class="header-title-row">
          <span class="status-badge" style="background-color: {evalReport.gradeColor}18; color: {evalReport.gradeColor}; border-color: {evalReport.gradeColor}40">
            {evalReport.statusLabel} · {evalReport.score}%
          </span>
          {#if !evalReport.isExplicit}
            <span class="heuristic-pill">Heuristic Fallback</span>
          {/if}
        </div>
      </div>

      <button class="btn-close" onclick={onClose} aria-label="Close popover" title="Close (Esc)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- View Mode Switcher -->
    <div class="popover-nav">
      <button 
        class="nav-tab" 
        class:active={activeView === 'preview'} 
        onclick={() => activeView = 'preview'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>Live Dossier Preview</span>
      </button>

      <button 
        class="nav-tab" 
        class:active={activeView === 'checks'} 
        onclick={() => activeView = 'checks'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Technical Diagnostics ({evalReport.stats.passed}/{evalReport.stats.total})</span>
      </button>
    </div>

    <!-- Body Content -->
    <div class="popover-body">
      {#if activeView === 'preview'}
        <!-- Fallback Warning Banner if applicable -->
        {#if !evalReport.isExplicit}
          <div class="fallback-notice-banner">
            <div class="notice-icon">ℹ</div>
            <div class="notice-text">
              <strong>Previewing heuristic fallback.</strong> Your resume has no <code>executiveSummary:</code> block defined in YAML. Customizing it lets you showcase tailored metrics and target roles.
            </div>
            <button class="btn-template-mini" onclick={() => activeView = 'checks'}>
              View Diagnostics & YAML
            </button>
          </div>
        {/if}

        <!-- Embedded Live Component -->
        <div class="preview-container">
          <ExecutiveSummaryCard 
            {resume} 
            {isDark} 
            onClose={() => {}}
          />
        </div>
      {:else}
        <!-- Technical Health Checks List -->
        <div class="checks-container">
          <p class="checks-intro">
            Evaluates data quality against recruiter scan habits (6–10s scanning time, quantitative proof points, and cognitive focus).
          </p>

          <div class="checks-list">
            {#each evalReport.checks as check}
              <div class="check-row level-{check.level}">
                <div class="check-icon">
                  {#if check.level === 'pass'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  {:else if check.level === 'warn'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  {:else if check.level === 'error'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  {:else}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  {/if}
                </div>
                <div class="check-details">
                  <div class="check-header">
                    <span class="check-title">{check.title}</span>
                    <span class="check-category">{check.category}</span>
                  </div>
                  <p class="check-msg">{check.message}</p>
                </div>
              </div>
            {/each}
          </div>

          <!-- Template YAML Section -->
          <div class="yaml-template-box">
            <div class="yaml-template-header">
              <span class="template-title">Recommended YAML Schema Block</span>
              <button class="btn-copy-template" onclick={copyTemplateYaml}>
                {#if copyTemplateFeedback}
                  ✓ Copied to Clipboard!
                {:else}
                  Copy Template YAML
                {/if}
              </button>
            </div>
            <pre class="yaml-code"><code>{YAML_TEMPLATE}</code></pre>
          </div>
        </div>
      {/if}
    </div>

    <!-- Popover Footer -->
    <div class="popover-footer">
      <div class="footer-left">
        <button 
          class="btn-footer action-btn" 
          onclick={copyRecruiterUrl}
          title="Copy clean Recruiter URL (?view=recruiter) to share with hiring managers"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>{copyFeedback ? 'Copied Recruiter Link!' : 'Copy Recruiter Link'}</span>
        </button>

        <a 
          class="btn-footer secondary-btn" 
          href="?view=recruiter" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Open dedicated Recruiter view in new tab"
        >
          <span>Open Full View</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>

      <button class="btn-footer close-btn" onclick={onClose}>
        Close
      </button>
    </div>

  </div>
{/if}

<style>
  .popover-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9991;
    background: transparent;
    border: none;
    padding: 0;
    outline: none;
    cursor: default;
  }

  .recruiter-inspector-popover {
    position: absolute;
    top: calc(100% + 0.65rem);
    right: 0;
    z-index: 9992;
    width: 600px;
    max-width: calc(100vw - 2.5rem);
    max-height: calc(85vh - 2rem);
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.08);
    color: #1e293b;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: popoverFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes popoverFadeIn {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .recruiter-inspector-popover.is-dark,
  :global(.is-dark) .recruiter-inspector-popover,
  :global(.mode-dark) .recruiter-inspector-popover {
    background: #181a20;
    border-color: #2e3039;
    color: #f1f5f9;
    box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.55);
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.15rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .is-dark .popover-header {
    border-bottom-color: #2e3039;
  }

  .popover-eyebrow {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #64748b;
  }

  .pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .header-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .status-badge {
    font-size: 0.76rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }

  .heuristic-pill {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
  }

  .is-dark .heuristic-pill {
    background: #202633;
    color: #94a3b8;
    border-color: #3b4559;
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #64748b;
    padding: 0.35rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .btn-close:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .is-dark .btn-close:hover {
    background: #272a34;
    color: #ffffff;
  }

  .popover-nav {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 0 0.85rem;
  }

  .is-dark .popover-nav {
    background: #14161b;
    border-bottom-color: #2e3039;
  }

  .nav-tab {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.55rem 0.75rem;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s ease;
  }

  .nav-tab:hover {
    color: #0f172a;
  }

  .is-dark .nav-tab:hover {
    color: #f1f5f9;
  }

  .nav-tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }

  .is-dark .nav-tab.active {
    color: #60a5fa;
    border-bottom-color: #60a5fa;
  }

  .popover-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.15rem;
  }

  .fallback-notice-banner {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.85rem;
    background: rgba(37, 99, 235, 0.06);
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.78rem;
  }

  .is-dark .fallback-notice-banner {
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.25);
  }

  .notice-icon {
    font-weight: bold;
    color: #2563eb;
  }

  .notice-text {
    flex: 1;
    line-height: 1.4;
  }

  .notice-text code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.1rem 0.25rem;
    border-radius: 3px;
    font-size: 0.72rem;
  }

  .btn-template-mini {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #2563eb;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.25rem 0.55rem;
    border-radius: 5px;
    cursor: pointer;
    white-space: nowrap;
  }

  .is-dark .btn-template-mini {
    background: #202633;
    border-color: #3b4559;
    color: #93c5fd;
  }

  .preview-container {
    border-radius: 8px;
  }

  .checks-intro {
    font-size: 0.78rem;
    color: #64748b;
    margin: 0 0 0.85rem 0;
    line-height: 1.4;
  }

  .checks-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .check-row {
    display: flex;
    gap: 0.65rem;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .is-dark .check-row {
    background: #14161b;
    border-color: #272a34;
  }

  .check-icon {
    margin-top: 0.15rem;
    flex-shrink: 0;
  }

  .check-row.level-pass .check-icon { color: #16a34a; }
  .check-row.level-warn .check-icon { color: #d97706; }
  .check-row.level-error .check-icon { color: #dc2626; }
  .check-row.level-info .check-icon { color: #2563eb; }

  .check-details {
    flex: 1;
  }

  .check-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.2rem;
  }

  .check-title {
    font-size: 0.8rem;
    font-weight: 700;
  }

  .check-category {
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.05em;
  }

  .check-msg {
    margin: 0;
    font-size: 0.75rem;
    color: #475569;
    line-height: 1.4;
  }

  .is-dark .check-msg {
    color: #94a3b8;
  }

  .yaml-template-box {
    background: #0f172a;
    border-radius: 8px;
    overflow: hidden;
  }

  .yaml-template-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #1e293b;
    padding: 0.5rem 0.85rem;
    color: #94a3b8;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .btn-copy-template {
    background: #2563eb;
    border: none;
    color: #ffffff;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-copy-template:hover {
    background: #1d4ed8;
  }

  .yaml-code {
    margin: 0;
    padding: 0.85rem;
    font-family: 'JetBrains Mono', SFMono-Regular, monospace;
    font-size: 0.72rem;
    line-height: 1.45;
    color: #e2e8f0;
    max-height: 220px;
    overflow-y: auto;
  }

  .popover-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.15rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
  }

  .is-dark .popover-footer {
    background: #14161b;
    border-top-color: #2e3039;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .btn-footer {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .action-btn {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
  }

  .action-btn:hover {
    background: #1d4ed8;
  }

  .secondary-btn {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
  }

  .is-dark .secondary-btn {
    background: #202633;
    border-color: #3b4559;
    color: #cbd5e1;
  }

  .secondary-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .is-dark .secondary-btn:hover {
    background: #2a3140;
    color: #ffffff;
  }

  .close-btn {
    background: transparent;
    border: 1px solid transparent;
    color: #64748b;
  }

  .close-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .is-dark .close-btn:hover {
    background: #272a34;
    color: #f1f5f9;
  }
</style>
