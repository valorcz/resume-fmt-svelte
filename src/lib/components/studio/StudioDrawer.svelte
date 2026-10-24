<script>
  import StyleTab from './tabs/StyleTab.svelte';
  import LayoutTab from './tabs/LayoutTab.svelte';
  import ModeTab from './tabs/ModeTab.svelte';
  import GistTab from './tabs/GistTab.svelte';
  import AuditTab from './tabs/AuditTab.svelte';

  let {
    isOpen = $bindable(false),
    activeTab = $bindable('style'),
    themes = [],
    activeTheme = $bindable('classic'),
    activeThemeConfig = {},
    customAccent = $bindable(null),
    customLayout = $bindable(null),
    colorMode = $bindable('system'),
    paperFormat = $bindable('a4'),
    printMargin = $bindable('1.5cm'),
    printScale = $bindable(100),
    annexBreak = $bindable(false),
    showPageGuides = $bindable(false),
    gistId = null,
    resume = null,
    activeI18n = {},
    auditReport = {},
    atsPlainText = '',
    onSelectTheme = () => {},
    onResetAccent = () => {},
    onResetLayout = () => {},
    onResetAll = () => {},
    onOpenGuide = () => {},
    onExportHtml = () => {}
  } = $props();

  let recruiterFeedback = $state(false);
  let shareFeedback = $state(false);

  function copyRecruiterUrl() {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'recruiter');
      navigator.clipboard.writeText(url.toString()).then(() => {
        recruiterFeedback = true;
        setTimeout(() => recruiterFeedback = false, 2000);
      });
    }
  }

  function copyShareUrl() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        shareFeedback = true;
        setTimeout(() => shareFeedback = false, 2000);
      });
    }
  }

  // Active columns derived from customLayout or activeThemeConfig.layout
  let effectiveLayout = $derived.by(() => {
    if (customLayout) return customLayout;
    return {
      main: [...(activeThemeConfig?.layout?.main || [])],
      sidebar: [...(activeThemeConfig?.layout?.sidebar || [])]
    };
  });

  let isDarkMode = $derived(
    colorMode === 'dark' || (colorMode === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  );
</script>

{#if isOpen}
  <!-- Backdrop for screens < 1200px -->
  <div
    class="drawer-backdrop"
    onclick={() => isOpen = false}
    onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
    role="button"
    tabindex="0"
    aria-label="Close studio customizer"
  ></div>

  <!-- Studio Drawer Panel -->
  <aside class="config-drawer mode-{colorMode}" class:is-dark={isDarkMode} aria-label="Studio Customizer">
    <!-- Header -->
    <div class="drawer-header">
      <div class="drawer-title-group">
        <div class="drawer-title-row">
          <h2 class="drawer-title">Resume Studio</h2>
          <span class="version-badge">v1.2.0</span>
        </div>
        <span class="drawer-subtitle">Theme & Layout Customizer · Privacy First</span>
      </div>

      <div class="drawer-header-actions">
        <!-- Recruiter View Link Button -->
        <button
          class="header-pill-btn recruiter-btn"
          onclick={copyRecruiterUrl}
          title="Copy clean Recruiter URL (?view=recruiter) to clipboard"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>{recruiterFeedback ? 'Copied Link!' : 'Recruiter Link'}</span>
        </button>

        <!-- Share URL Button -->
        <button
          class="header-icon-btn"
          onclick={copyShareUrl}
          title="Share direct configuration link"
          aria-label="Share direct configuration link"
        >
          {#if shareFeedback}
            <span class="copied-badge">✓</span>
          {:else}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          {/if}
        </button>

        <!-- Close Drawer Button -->
        <button
          class="header-icon-btn close-btn"
          onclick={() => isOpen = false}
          title="Close Customizer"
          aria-label="Close Customizer"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Navigation Tabs (Consolidated 5 tabs, evenly distributed, 0 scrolling) -->
    <nav class="drawer-nav" aria-label="Studio Tabs">
      <button
        class="tab-btn"
        class:active={activeTab === 'style' || activeTab === 'theme' || activeTab === 'accent'}
        onclick={() => activeTab = 'style'}
      >
        Style
        {#if customAccent}<span class="tab-indicator"></span>{/if}
      </button>

      <button
        class="tab-btn"
        class:active={activeTab === 'layout'}
        onclick={() => activeTab = 'layout'}
      >
        Layout
        {#if customLayout}<span class="tab-indicator"></span>{/if}
      </button>

      <button
        class="tab-btn"
        class:active={activeTab === 'format' || activeTab === 'mode'}
        onclick={() => activeTab = 'format'}
      >
        Format
      </button>

      <button
        class="tab-btn"
        class:active={activeTab === 'gist' || activeTab === 'source' || activeTab === 'config'}
        onclick={() => activeTab = 'gist'}
      >
        Gist
        {#if gistId}<span class="tab-indicator gist-dot"></span>{/if}
      </button>

      <button
        class="tab-btn"
        class:active={activeTab === 'audit'}
        onclick={() => activeTab = 'audit'}
      >
        Check
        {#if auditReport.score !== undefined}
          <span class="tab-score-badge" style="background-color: {auditReport.gradeColor}">{auditReport.score}%</span>
        {/if}
      </button>
    </nav>

    <!-- Drawer Body -->
    <div class="drawer-body">
      {#if activeTab === 'style' || activeTab === 'theme' || activeTab === 'accent'}
        <StyleTab
          {themes}
          bind:activeTheme
          bind:customAccent
          {onSelectTheme}
          {onResetAccent}
        />
      {:else if activeTab === 'layout'}
        <LayoutTab {activeThemeConfig} bind:customLayout {onResetLayout} />
      {:else if activeTab === 'format' || activeTab === 'mode'}
        <ModeTab
          bind:colorMode
          bind:paperFormat
          bind:printMargin
          bind:printScale
          bind:annexBreak
          bind:showPageGuides
          {onExportHtml}
        />
      {:else if activeTab === 'gist' || activeTab === 'source' || activeTab === 'config'}
        <GistTab
          {gistId}
          {activeTheme}
          {customAccent}
          {colorMode}
          {effectiveLayout}
          {onOpenGuide}
        />
      {:else if activeTab === 'audit'}
        <AuditTab {auditReport} {atsPlainText} />
      {/if}
    </div>

    <!-- Footer Actions -->
    <div class="drawer-footer">
      <button class="footer-btn reset-btn" onclick={onResetAll}>Reset All Settings</button>
      <button class="footer-btn close-action-btn" onclick={() => isOpen = false}>Done</button>
    </div>
  </aside>
{/if}

<style>
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    z-index: 9991;
  }
  @media (min-width: 1200px) {
    .drawer-backdrop {
      background: transparent;
      backdrop-filter: none;
      pointer-events: none;
    }
  }

  .config-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 420px;
    max-width: 100vw;
    background: #ffffff;
    box-shadow: -8px 0 24px -4px rgba(15, 23, 42, 0.15);
    z-index: 9992;
    display: flex;
    flex-direction: column;
    color: #1e293b;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  :global(.mode-dark) .config-drawer,
  :global(body.app-dark) .config-drawer,
  .config-drawer.is-dark,
  .config-drawer.mode-dark {
    background: #121316;
    color: #f1f5f9;
    box-shadow: -12px 0 32px rgba(0, 0, 0, 0.5);
    border-left: 1px solid #27272a;
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e2e8f0;
  }
  .config-drawer.is-dark .drawer-header,
  .config-drawer.mode-dark .drawer-header,
  :global(.mode-dark) .drawer-header,
  :global(.is-dark) .drawer-header,
  :global(body.app-dark) .drawer-header {
    border-color: #27272a;
  }

  .drawer-title-group {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .drawer-title-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .version-badge {
    font-size: 0.65rem;
    font-weight: 700;
    font-family: ui-monospace, monospace;
    color: #2563eb;
    background: #eff6ff;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  .config-drawer.is-dark .version-badge,
  .config-drawer.mode-dark .version-badge,
  :global(.mode-dark) .version-badge,
  :global(.is-dark) .version-badge,
  :global(body.app-dark) .version-badge {
    background: rgba(37, 99, 235, 0.2);
    color: #93c5fd;
  }

  .drawer-title {
    font-size: 1.05rem;
    font-weight: 800;
    margin: 0;
    color: inherit;
    letter-spacing: -0.02em;
  }

  .drawer-subtitle {
    font-size: 0.72rem;
    color: #64748b;
  }
  .config-drawer.is-dark .drawer-subtitle,
  .config-drawer.mode-dark .drawer-subtitle,
  :global(.mode-dark) .drawer-subtitle,
  :global(.is-dark) .drawer-subtitle,
  :global(body.app-dark) .drawer-subtitle {
    color: #94a3b8;
  }

  .drawer-header-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .header-pill-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 600;
    font-family: inherit;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .config-drawer.is-dark .header-pill-btn,
  .config-drawer.mode-dark .header-pill-btn,
  :global(.mode-dark) .header-pill-btn,
  :global(.is-dark) .header-pill-btn,
  :global(body.app-dark) .header-pill-btn {
    background: rgba(37, 99, 235, 0.15);
    border-color: rgba(37, 99, 235, 0.3);
    color: #93c5fd;
  }
  .header-pill-btn:hover {
    background: #2563eb;
    color: #ffffff;
  }

  .header-icon-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }
  .config-drawer.is-dark .header-icon-btn,
  .config-drawer.mode-dark .header-icon-btn,
  :global(.mode-dark) .header-icon-btn,
  :global(.is-dark) .header-icon-btn,
  :global(body.app-dark) .header-icon-btn {
    border-color: #27272a;
    color: #cbd5e1;
  }
  .header-icon-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  .config-drawer.is-dark .header-icon-btn:hover,
  .config-drawer.mode-dark .header-icon-btn:hover,
  :global(.mode-dark) .header-icon-btn:hover,
  :global(.is-dark) .header-icon-btn:hover,
  :global(body.app-dark) .header-icon-btn:hover {
    background: #27272a;
    color: #ffffff;
  }

  .copied-badge {
    color: #10b981;
    font-weight: 700;
    font-size: 0.8rem;
  }

  /* Navigation Tabs (Consolidated 5 tabs, evenly distributed) */
  .drawer-nav {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 0.25rem;
    background: #f8fafc;
    overflow-x: hidden;
  }
  .config-drawer.is-dark .drawer-nav,
  .config-drawer.mode-dark .drawer-nav,
  :global(.mode-dark) .drawer-nav,
  :global(.is-dark) .drawer-nav,
  :global(body.app-dark) .drawer-nav {
    background: #181a20;
    border-color: #27272a;
  }

  .tab-btn {
    flex: 1;
    justify-content: center;
    padding: 0.65rem 0.2rem;
    font-size: 0.74rem;
    font-weight: 600;
    font-family: inherit;
    border: none;
    background: none;
    color: #64748b;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    transition: color 0.15s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .config-drawer.is-dark .tab-btn,
  .config-drawer.mode-dark .tab-btn,
  :global(.mode-dark) .tab-btn,
  :global(.is-dark) .tab-btn,
  :global(body.app-dark) .tab-btn {
    color: #94a3b8;
  }
  .tab-btn:hover {
    color: #0f172a;
  }
  .config-drawer.is-dark .tab-btn:hover,
  .config-drawer.mode-dark .tab-btn:hover,
  :global(.mode-dark) .tab-btn:hover,
  :global(.is-dark) .tab-btn:hover,
  :global(body.app-dark) .tab-btn:hover {
    color: #ffffff;
  }
  .tab-btn.active {
    color: #2563eb;
    font-weight: 700;
  }
  .config-drawer.is-dark .tab-btn.active,
  .config-drawer.mode-dark .tab-btn.active,
  :global(.mode-dark) .tab-btn.active,
  :global(.is-dark) .tab-btn.active,
  :global(body.app-dark) .tab-btn.active {
    color: #60a5fa;
  }
  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0.4rem;
    right: 0.4rem;
    height: 2px;
    background: #2563eb;
    border-radius: 2px;
  }
  .config-drawer.is-dark .tab-btn.active::after,
  .config-drawer.mode-dark .tab-btn.active::after,
  :global(.mode-dark) .tab-btn.active::after,
  :global(.is-dark) .tab-btn.active::after,
  :global(body.app-dark) .tab-btn.active::after {
    background: #60a5fa;
  }

  .tab-indicator {
    width: 5px;
    height: 5px;
    background: #2563eb;
    border-radius: 50%;
  }
  .tab-indicator.gist-dot {
    background: #10b981;
  }

  .tab-score-badge {
    font-size: 0.65rem;
    font-weight: 700;
    color: #ffffff;
    padding: 0.1rem 0.35rem;
    border-radius: 999px;
    line-height: 1;
  }

  /* Drawer Body */
  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
  }

  /* Drawer Footer */
  .drawer-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1.25rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }
  .config-drawer.is-dark .drawer-footer,
  .config-drawer.mode-dark .drawer-footer,
  :global(.mode-dark) .drawer-footer,
  :global(.is-dark) .drawer-footer,
  :global(body.app-dark) .drawer-footer {
    background: #181a20;
    border-color: #27272a;
  }

  .footer-btn {
    padding: 0.45rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: inherit;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reset-btn {
    background: none;
    border: 1px solid #cbd5e1;
    color: #64748b;
  }
  .config-drawer.is-dark .reset-btn,
  .config-drawer.mode-dark .reset-btn,
  :global(.mode-dark) .reset-btn,
  :global(.is-dark) .reset-btn,
  :global(body.app-dark) .reset-btn {
    border-color: #3f3f46;
    color: #a1a1aa;
  }
  .reset-btn:hover {
    background: #f1f5f9;
    color: #ef4444;
    border-color: #fca5a5;
  }
  .config-drawer.is-dark .reset-btn:hover,
  .config-drawer.mode-dark .reset-btn:hover,
  :global(.mode-dark) .reset-btn:hover,
  :global(.is-dark) .reset-btn:hover,
  :global(body.app-dark) .reset-btn:hover {
    background: #27272a;
    color: #f87171;
    border-color: #ef4444;
  }

  .close-action-btn {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
  }
  .close-action-btn:hover {
    background: #1d4ed8;
  }

  @media print {
    .drawer-backdrop,
    .config-drawer {
      display: none !important;
    }
  }
</style>
