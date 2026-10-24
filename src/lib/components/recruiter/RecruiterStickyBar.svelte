<script>
  let {
    resume = {},
    colorMode = 'system',
    isDark = false,
    compactHighlights = $bindable(true),
    showBriefing = $bindable(true)
  } = $props();

  let basics = $derived(resume.basics || {});
  
  // Extract LinkedIn & GitHub profiles
  let linkedin = $derived(
    basics.profiles?.find(p => (p.network || '').toLowerCase().includes('linkedin')) || null
  );

  let github = $derived(
    basics.profiles?.find(p => (p.network || '').toLowerCase().includes('github')) || null
  );
</script>

<div class="recruiter-bar-wrapper mode-{colorMode}" class:is-dark={isDark} class:mode-dark={isDark}>
  <nav class="recruiter-bar" class:is-dark={isDark} class:mode-dark={isDark} aria-label="Recruiter navigation">
    
    <!-- Recruiter Mode Badge -->
    <div class="bar-badge-pill" title="Recruiter view active">
      <span class="recruiter-indicator-dot"></span>
      <span>RECRUITER</span>
    </div>

    <div class="bar-divider"></div>

    <!-- Contact Quick Action Buttons -->
    <div class="bar-group contact-group">
      {#if basics.phone}
        <a href="tel:{basics.phone}" class="bar-btn contact-btn" title="Call {basics.name}" aria-label="Call candidate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span class="btn-text">Call</span>
        </a>
      {/if}

      {#if basics.email}
        <a href="mailto:{basics.email}" class="bar-btn contact-btn" title="Email {basics.name}" aria-label="Email candidate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span class="btn-text">Email</span>
        </a>
      {/if}

      {#if linkedin}
        <a href={linkedin.url} target="_blank" rel="noreferrer" class="bar-btn contact-btn linkedin-btn" title="LinkedIn Profile" aria-label="LinkedIn Profile">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
          </svg>
          <span class="btn-text">LinkedIn</span>
        </a>
      {/if}

      {#if github}
        <a href={github.url} target="_blank" rel="noreferrer" class="bar-btn contact-btn github-btn" title="GitHub Profile" aria-label="GitHub Profile">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
          <span class="btn-text">GitHub</span>
        </a>
      {/if}
    </div>

    <div class="bar-divider"></div>

    <!-- View & Export Actions -->
    <div class="bar-group">
      <!-- Toggle Briefing Dossier -->
      <button 
        class="bar-btn briefing-toggle-btn"
        class:active={showBriefing}
        onclick={() => showBriefing = !showBriefing}
        title={showBriefing ? "Hide Executive Briefing dossier" : "Show Executive Briefing dossier"}
        aria-label="Toggle executive briefing dossier"
      >
        <span class="briefing-icon">◈</span>
        <span class="btn-text">Briefing</span>
      </button>

      <!-- Toggle Highlights Density -->
      <button 
        class="bar-btn view-toggle-btn"
        class:active={!compactHighlights}
        onclick={() => compactHighlights = !compactHighlights}
        title={compactHighlights ? "Expand all achievement highlights" : "Collapse older achievements to summaries"}
        aria-label="Toggle highlights density"
      >
        <kbd class="keycap-hint">{compactHighlights ? '↕' : '—'}</kbd>
        <span class="btn-text">{compactHighlights ? 'Full' : 'Compact'}</span>
      </button>

      <!-- Print / Download Official PDF -->
      <button 
        class="bar-btn print-btn"
        onclick={() => window.print()}
        title="Print or Save official A4 / US Letter PDF (Ctrl+P / ⌘P)"
        aria-label="Download PDF"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span class="btn-text">Print / PDF</span>
      </button>
    </div>

  </nav>
</div>

<style>
  .recruiter-bar-wrapper {
    position: fixed;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 9990;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .recruiter-bar {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.45rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
    color: #1e293b;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .recruiter-bar.is-dark,
  .recruiter-bar.mode-dark,
  :global(.mode-dark) .recruiter-bar,
  :global(.is-dark) .recruiter-bar,
  :global(body.app-dark) .recruiter-bar {
    background: #181a20;
    border-color: #2e3039;
    color: #f1f5f9;
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4);
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .bar-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.55rem;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: inherit;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .bar-btn:hover {
    background: #f1f5f9;
  }

  .recruiter-bar.is-dark .bar-btn:hover,
  :global(.mode-dark) .bar-btn:hover,
  :global(.is-dark) .bar-btn:hover {
    background: #252833;
    color: #ffffff;
  }

  .bar-btn.active {
    background: #eff6ff;
    color: #2563eb;
  }

  .recruiter-bar.is-dark .bar-btn.active,
  :global(.mode-dark) .bar-btn.active,
  :global(.is-dark) .bar-btn.active {
    background: #1e2638;
    color: #60a5fa;
  }

  .bar-badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #1d4ed8;
    letter-spacing: 0.04em;
    font-family: inherit;
  }

  .recruiter-bar.is-dark .bar-badge-pill,
  :global(.mode-dark) .bar-badge-pill,
  :global(.is-dark) .bar-badge-pill {
    background: #1e2638;
    border-color: #2b3954;
    color: #93c5fd;
  }

  .recruiter-indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
  }

  .bar-divider {
    width: 1px;
    height: 16px;
    background: #e2e8f0;
    margin: 0 0.15rem;
  }

  .recruiter-bar.is-dark .bar-divider,
  :global(.mode-dark) .bar-divider,
  :global(.is-dark) .bar-divider {
    background: #2e3039;
  }

  .keycap-hint {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 17px;
    height: 17px;
    padding: 0 3px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-bottom-width: 2px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, monospace;
    color: #475569;
  }

  .recruiter-bar.is-dark .keycap-hint,
  :global(.mode-dark) .keycap-hint,
  :global(.is-dark) .keycap-hint {
    background: #252833;
    border-color: #3e4452;
    color: #94a3b8;
  }

  .print-btn {
    background: #2563eb;
    color: #ffffff !important;
  }

  .print-btn:hover {
    background: #1d4ed8;
  }

  /* Responsive Mobile Positioning */
  @media (max-width: 768px) {
    .recruiter-bar-wrapper {
      top: 0.65rem;
      right: auto;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 1.25rem);
      max-width: 500px;
    }

    .recruiter-bar {
      justify-content: space-between;
      padding: 0.3rem 0.4rem;
      border-radius: 10px;
    }

    .contact-group .bar-btn {
      padding: 0.35rem 0.45rem;
    }

    .contact-group .btn-text {
      display: none;
    }
  }

  @media (max-width: 380px) {
    .bar-badge-pill span:last-child {
      display: none;
    }
  }

  @media print {
    .recruiter-bar-wrapper {
      display: none !important;
    }
  }
</style>
