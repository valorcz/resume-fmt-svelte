<script>
  import { formatName } from './studioUtils.js';
  import RecruiterPreviewPopover from './RecruiterPreviewPopover.svelte';
  import { evaluateRecruiterSummary } from '$lib/audit/recruiterAudit.js';

  let {
    themes = [],
    activeTheme = $bindable('classic'),
    colorMode = $bindable('system'),
    isOpen = $bindable(false),
    gistId = null,
    resume = null,
    hasCustomizations = false,
    onCycleMode = () => {},
    onPrint = () => {},
    onOpenGuide = () => {},
    onOpenGistTab = () => {}
  } = $props();

  let isRecruiterPopoverOpen = $state(false);
  let recruiterEval = $derived(evaluateRecruiterSummary(resume));

  let isDarkMode = $derived(
    colorMode === 'dark' || (colorMode === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  );

  // Close inspector popover if the full customizer drawer opens
  $effect(() => {
    if (isOpen) {
      isRecruiterPopoverOpen = false;
    }
  });
</script>

<div class="floating-controls-wrapper mode-{colorMode}" class:is-dark={isDarkMode} class:mode-dark={isDarkMode}>
  <div class="floating-bar" class:is-dark={isDarkMode} class:mode-dark={isDarkMode}>
    <!-- Active Gist Pill -->
    {#if gistId}
      <button 
        class="bar-badge-pill" 
        onclick={onOpenGistTab} 
        title="Resume loaded from GitHub Gist: {gistId}. Click to manage source."
      >
        <span class="gist-indicator-dot"></span>
        <span>GIST</span>
      </button>
      <div class="bar-divider"></div>
    {/if}

    <!-- Quick Help Guide Button -->
    <button 
      class="bar-btn help-btn" 
      onclick={onOpenGuide}
      title="Open User Guide & Shortcuts (?)"
      aria-label="Open User Guide"
    >
      <kbd class="keycap-hint">?</kbd>
      <span>Help</span>
    </button>

    <div class="bar-divider"></div>

    <!-- Quick Theme Dropdown -->
    <div class="bar-group">
      <span class="bar-label">STYLE</span>
      <select 
        id="studio-quick-theme-select"
        name="studio_quick_theme"
        class="bar-select" 
        bind:value={activeTheme} 
        title="Select Theme"
      >
        {#each themes as t}
          <option value={t}>{formatName(t)}</option>
        {/each}
      </select>
    </div>

    <div class="bar-divider"></div>

    <!-- Mode Cycle Button -->
    <button 
      class="bar-btn mode-btn" 
      onclick={onCycleMode} 
      title="Appearance: {colorMode.toUpperCase()} (Click to toggle)"
      aria-label="Toggle Color Mode"
    >
      {#if colorMode === 'dark'}
        <!-- Moon Icon -->
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      {:else if colorMode === 'light'}
        <!-- Sun Icon -->
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="12" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {:else}
        <!-- Monitor (System) Icon -->
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      {/if}
    </button>

    <div class="bar-divider"></div>

    <!-- Recruiter Briefing Health & Preview Popover Trigger -->
    <button 
      class="bar-btn briefing-pill" 
      class:active={isRecruiterPopoverOpen}
      onclick={() => isRecruiterPopoverOpen = !isRecruiterPopoverOpen}
      title="Recruiter Briefing: {recruiterEval.statusLabel} ({recruiterEval.score}%). Click to inspect & preview."
      aria-label="Inspect Recruiter Briefing"
    >
      <span class="briefing-dot" style="background-color: {recruiterEval.gradeColor}"></span>
      <span>Briefing</span>
      {#if recruiterEval.score !== undefined}
        <span class="briefing-score-badge" style="color: {recruiterEval.gradeColor}">{recruiterEval.score}%</span>
      {/if}
    </button>

    <div class="bar-divider"></div>

    <!-- Customize Drawer Trigger Button -->
    <button 
      class="bar-btn" 
      class:active={isOpen}
      onclick={() => isOpen = !isOpen} 
      title="Customize Colors, Layout & Source"
      aria-label="Customize Colors & Layout"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      <span>Studio</span>
      {#if hasCustomizations}
        <span class="active-dot" title="Customized"></span>
      {/if}
    </button>

    <!-- Print Action Button -->
    <button class="bar-btn print-btn" onclick={onPrint} title="Print or Save as PDF">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      <span>Print</span>
    </button>
  </div>

  <!-- Embedded Inspector Popover -->
  <RecruiterPreviewPopover 
    {resume}
    isDark={isDarkMode}
    isOpen={isRecruiterPopoverOpen}
    onClose={() => isRecruiterPopoverOpen = false}
  />
</div>

<style>
  .briefing-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .briefing-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .briefing-score-badge {
    font-size: 0.72rem;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, monospace;
    opacity: 0.9;
  }
  .floating-controls-wrapper {
    position: fixed;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 9990;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .floating-bar {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.45rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
    color: #1e293b;
  }
  .floating-bar.is-dark,
  .floating-bar.mode-dark,
  :global(.mode-dark) .floating-bar,
  :global(.is-dark) .floating-bar,
  :global(body.app-dark) .floating-bar {
    background: #181a20;
    border-color: #2e3039;
    color: #f1f5f9;
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4);
  }

  .bar-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.6rem;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: inherit;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .bar-btn:hover {
    background: #f1f5f9;
  }
  .floating-bar.is-dark .bar-btn:hover,
  :global(.mode-dark) .bar-btn:hover,
  :global(.is-dark) .bar-btn:hover,
  :global(body.app-dark) .bar-btn:hover {
    background: #252833;
    color: #ffffff;
  }
  .bar-btn.active {
    background: #eff6ff;
    color: #2563eb;
  }
  .floating-bar.is-dark .bar-btn.active,
  :global(.mode-dark) .bar-btn.active,
  :global(.is-dark) .bar-btn.active,
  :global(body.app-dark) .bar-btn.active {
    background: #1e2638;
    color: #60a5fa;
  }

  .bar-badge-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #0f172a;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.03em;
  }
  .floating-bar.is-dark .bar-badge-pill,
  :global(.mode-dark) .bar-badge-pill,
  :global(.is-dark) .bar-badge-pill,
  :global(body.app-dark) .bar-badge-pill {
    background: #20222a;
    border-color: #2e3039;
    color: #f1f5f9;
  }

  .gist-indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
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
    line-height: 1;
  }
  .floating-bar.is-dark .keycap-hint,
  :global(.mode-dark) .keycap-hint,
  :global(.is-dark) .keycap-hint,
  :global(body.app-dark) .keycap-hint {
    background: #20222a;
    border-color: #3f3f46;
    color: #cbd5e1;
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 0.2rem;
  }

  .bar-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.06em;
  }
  .floating-bar.is-dark .bar-label,
  :global(.mode-dark) .bar-label,
  :global(.is-dark) .bar-label,
  :global(body.app-dark) .bar-label {
    color: #94a3b8;
  }

  .bar-select {
    padding: 0.25rem 0.5rem;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: inherit;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: inherit;
    border-radius: 6px;
    outline: none;
    cursor: pointer;
  }
  .floating-bar.is-dark .bar-select,
  :global(.mode-dark) .bar-select,
  :global(.is-dark) .bar-select,
  :global(body.app-dark) .bar-select {
    background: #20222a;
    border-color: #2e3039;
    color: #f1f5f9;
  }
  .bar-select option {
    background: #ffffff;
    color: #0f172a;
  }
  .floating-bar.is-dark .bar-select option,
  :global(.mode-dark) .bar-select option,
  :global(.is-dark) .bar-select option,
  :global(body.app-dark) .bar-select option {
    background: #181a20;
    color: #f1f5f9;
  }

  .bar-divider {
    width: 1px;
    height: 18px;
    background: #e2e8f0;
    margin: 0 0.15rem;
  }
  .floating-bar.is-dark .bar-divider,
  :global(.mode-dark) .bar-divider,
  :global(.is-dark) .bar-divider,
  :global(body.app-dark) .bar-divider {
    background: #2e3039;
  }

  .active-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background: #2563eb;
    border-radius: 50%;
  }

  .print-btn {
    background: #2563eb;
    color: #ffffff !important;
  }
  .print-btn:hover {
    background: #1d4ed8;
  }

  @media print {
    .floating-controls-wrapper {
      display: none !important;
    }
  }
</style>
