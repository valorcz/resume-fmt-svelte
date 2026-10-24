<script>
  import yaml from 'js-yaml';
  import { synthesizeExecutiveSummary } from '$lib/audit/recruiterAudit.js';

  let {
    isOpen = false,
    resume = null,
    colorMode = 'system',
    activeTheme = 'classic',
    customAccent = null,
    effectiveLayout = { main: [], sidebar: [] },
    onExportHtml = () => {},
    onClose = () => {}
  } = $props();

  let viewMode = $state('clean'); // 'clean' | 'studio'
  let copyFeedback = $state(false);

  // Clean original YAML (standard JSON Resume without studio configuration)
  let cleanYaml = $derived.by(() => {
    if (!resume) return '# No resume loaded';
    try {
      // Omit legacy root _config and studio meta for clean standard portability
      const { _config, ...cleanData } = resume;
      if (cleanData.meta && cleanData.meta.studio) {
        const { studio, ...pureMeta } = cleanData.meta;
        cleanData.meta = Object.keys(pureMeta).length > 0 ? pureMeta : undefined;
        if (!cleanData.meta) delete cleanData.meta;
      }
      return yaml.dump(cleanData, { lineWidth: -1, noRefs: true });
    } catch (err) {
      return `# Error serializing resume to YAML:\n# ${err.message}`;
    }
  });

  // Configured YAML (merges Studio theme, accent, mode, layout & synthesized recruiter executive summary under meta)
  let studioConfiguredYaml = $derived.by(() => {
    if (!resume) return '# No resume loaded';
    try {
      const config = {
        theme: activeTheme,
        ...(customAccent ? { accent: customAccent } : {}),
        ...(colorMode && colorMode !== 'system' ? { mode: colorMode } : {}),
        layout: {
          main: [...(effectiveLayout?.main || [])],
          sidebar: [...(effectiveLayout?.sidebar || [])]
        }
      };

      // Ensure a complete, rich executiveSummary block is present (derived if not explicit)
      const executiveSummary = synthesizeExecutiveSummary(resume);

      // Separate existing meta and sections, stripping legacy top-level _config or top-level executiveSummary
      const { _config, executiveSummary: _legacyExec, meta: origMeta, basics, ...otherSections } = resume;

      // Clean existing meta of any previous studio/config blocks
      const baseMeta = origMeta ? { ...origMeta } : {};
      delete baseMeta.studio;
      delete baseMeta.studioConfig;
      delete baseMeta.resumeStudio;
      delete baseMeta.config;
      delete baseMeta._config;
      delete baseMeta.executiveSummary;

      // Build 100% JSON Resume compliant meta block
      const meta = {
        ...baseMeta,
        studio: config,
        executiveSummary
      };

      // Standard JSON Resume key ordering: meta -> basics -> rest of sections
      const fullDoc = {
        meta,
        ...(basics ? { basics } : {}),
        ...otherSections
      };

      return yaml.dump(fullDoc, { lineWidth: -1, noRefs: true });
    } catch (err) {
      return `# Error building configured YAML:\n# ${err.message}`;
    }
  });

  let activeYaml = $derived(viewMode === 'studio' ? studioConfiguredYaml : cleanYaml);

  let lineCount = $derived(activeYaml.split('\n').length);
  let byteSize = $derived.by(() => {
    const bytes = new TextEncoder().encode(activeYaml).length;
    return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
  });

  function handleCopy() {
    navigator.clipboard.writeText(activeYaml).then(() => {
      copyFeedback = true;
      setTimeout(() => copyFeedback = false, 2000);
    });
  }

  function handleDownload() {
    if (!resume) return;
    try {
      const blob = new Blob([activeYaml], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const baseName = resume.basics?.name
        ? resume.basics.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        : 'resume';
      const suffix = viewMode === 'studio' ? '.studio.yaml' : '.yaml';
      a.href = url;
      a.download = `${baseName}${suffix}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export YAML:', err);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' || (e.key === '/' && !e.shiftKey)) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={isOpen ? handleKeydown : undefined} />

{#if isOpen}
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="yaml-modal-title">
    <button
      type="button"
      class="popover-backdrop"
      onclick={onClose}
      aria-label="Close YAML Viewer"
    ></button>

    <div
      class="modal-dialog"
      class:mode-dark={colorMode === 'dark'}
      class:mode-light={colorMode === 'light'}
    >
      <!-- TWO-ROW PURPOSEFUL HEADER -->
      <header class="modal-header-container">
        <!-- ROW 1: Static Title, Stable Stats, Mode Navigation & Close -->
        <div class="header-top-row">
          <div class="header-identity">
            <span class="eyebrow-pill">YAML Source</span>
            <h2 id="yaml-modal-title" class="modal-title">Resume Source Document</h2>
            <div class="stats-pills" title="Document size">
              <span class="meta-pill">{lineCount} lines</span>
              <span class="meta-dot">·</span>
              <span class="meta-pill">{byteSize}</span>
            </div>
          </div>

          <div class="header-top-actions">
            <!-- Mode Segmented Switcher (Concise, Symmetrical, Layout-Stable) -->
            <div class="mode-segmented-control" role="group" aria-label="YAML Document Mode">
              <button
                type="button"
                class="segment-btn"
                class:active={viewMode === 'clean'}
                onclick={() => viewMode = 'clean'}
                title="Plain standard JSON Resume v1.0.0 without tool configuration"
              >
                📄 Plain Original
              </button>
              <button
                type="button"
                class="segment-btn"
                class:active={viewMode === 'studio'}
                onclick={() => viewMode = 'studio'}
                title="Enriched with Studio theme configuration and synthesized recruiter executive summary"
              >
                ⚡ Enriched Studio
              </button>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              class="modal-close-btn"
              onclick={onClose}
              aria-label="Close modal"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- ROW 2: Stable Description & Action Toolbar -->
        <div class="header-toolbar-row">
          <div class="toolbar-context">
            {#if viewMode === 'clean'}
              <span class="context-desc">
                Standard JSON Resume v1.0.0 · Clean unaugmented schema
              </span>
            {:else}
              <span class="context-desc">
                Enriched with <code>meta.studio</code> ({activeTheme}) and <code>meta.executiveSummary</code> (100% JSON Resume compliant)
              </span>
            {/if}
          </div>

          <div class="toolbar-buttons">
            <button
              type="button"
              class="btn btn-primary"
              class:btn-copied={copyFeedback}
              onclick={handleCopy}
              title="Copy active YAML to clipboard"
            >
              <span class="btn-icon">{copyFeedback ? '✓' : '📋'}</span>
              <span>{copyFeedback ? 'Copied to Clipboard!' : 'Copy YAML'}</span>
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              onclick={handleDownload}
              title="Download {viewMode === 'clean' ? 'clean' : 'configured'} YAML file"
            >
              <span class="btn-icon">📥</span>
              <span>Download YAML</span>
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              onclick={onExportHtml}
              title="Download 100% offline self-contained HTML bundle (.html)"
            >
              <span class="btn-icon">📦</span>
              <span>HTML Bundle</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Code Viewer Body -->
      <main class="modal-code-body">
        <pre class="yaml-pre"><code class="yaml-code">{activeYaml}</code></pre>
      </main>

      <!-- Footer Info -->
      <footer class="modal-footer">
        <div class="shortcut-hint">
          {#if viewMode === 'clean'}
            <span>Standard JSON Resume schema</span>
          {:else}
            <span>Includes synthesized recruiter proof points, competencies, and Studio theme configuration</span>
          {/if}
          · Press <kbd>/</kbd> or <kbd>Esc</kbd> to close
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick={onClose}>
          Done
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    box-sizing: border-box;
  }

  .popover-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(4px);
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    cursor: default;
  }

  .modal-dialog {
    position: relative;
    z-index: 10000;
    width: 920px;
    max-width: 96vw;
    height: 84vh;
    max-height: 820px;
    background: #ffffff;
    color: #18181b;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .modal-dialog.mode-dark,
  :global(.mode-dark) .modal-dialog,
  :global(.is-dark) .modal-dialog,
  :global(body.app-dark) .modal-dialog {
    background: #14161b;
    color: #f4f4f5;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  /* TWO-ROW HEADER CONTAINER */
  .modal-header-container {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #e4e4e7;
    background: #fafafa;
    flex-shrink: 0;
  }

  .modal-dialog.mode-dark .modal-header-container,
  :global(.mode-dark) .modal-header-container,
  :global(.is-dark) .modal-header-container,
  :global(body.app-dark) .modal-header-container {
    background: #181a20;
    border-bottom-color: #2e3039;
  }

  /* ROW 1: Identity & Mode Switching */
  .header-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.25rem;
    height: 52px;
    min-height: 52px;
    box-sizing: border-box;
    gap: 1rem;
    border-bottom: 1px solid #f0f0f2;
  }

  .modal-dialog.mode-dark .header-top-row,
  :global(.mode-dark) .header-top-row,
  :global(.is-dark) .header-top-row,
  :global(body.app-dark) .header-top-row {
    border-bottom-color: #232630;
  }

  .header-identity {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: nowrap;
    min-width: 0;
  }

  .eyebrow-pill {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    flex-shrink: 0;
  }

  .modal-dialog.mode-dark .eyebrow-pill,
  :global(.mode-dark) .eyebrow-pill,
  :global(.is-dark) .eyebrow-pill,
  :global(body.app-dark) .eyebrow-pill {
    background: #1e293b;
    color: #60a5fa;
    border-color: #3b82f6;
  }

  .modal-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .stats-pills {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    color: #71717a;
    font-family: ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .meta-dot {
    color: #d4d4d8;
  }

  .header-top-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
  }

  /* Segmented Control */
  .mode-segmented-control {
    display: inline-flex;
    background: #e4e4e7;
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
  }

  .modal-dialog.mode-dark .mode-segmented-control,
  :global(.mode-dark) .mode-segmented-control,
  :global(.is-dark) .mode-segmented-control,
  :global(body.app-dark) .mode-segmented-control {
    background: #272a34;
  }

  .segment-btn {
    border: none;
    background: transparent;
    padding: 0.25rem 0.65rem;
    min-width: 105px;
    text-align: center;
    font-size: 0.72rem;
    font-weight: 600;
    color: #52525b;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    white-space: nowrap;
  }

  .modal-dialog.mode-dark .segment-btn,
  :global(.mode-dark) .segment-btn,
  :global(.is-dark) .segment-btn,
  :global(body.app-dark) .segment-btn {
    color: #a1a1aa;
  }

  .segment-btn.active {
    background: #ffffff;
    color: #18181b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .modal-dialog.mode-dark .segment-btn.active,
  :global(.mode-dark) .segment-btn.active,
  :global(.is-dark) .segment-btn.active,
  :global(body.app-dark) .segment-btn.active {
    background: #14161b;
    color: #f4f4f5;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  .modal-close-btn {
    background: transparent;
    border: none;
    font-size: 1.15rem;
    color: #71717a;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .modal-close-btn:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .modal-dialog.mode-dark .modal-close-btn:hover,
  :global(.mode-dark) .modal-close-btn:hover,
  :global(.is-dark) .modal-close-btn:hover,
  :global(body.app-dark) .modal-close-btn:hover {
    background: #272a34;
    color: #ffffff;
  }

  /* ROW 2: Action Toolbar & Context */
  .header-toolbar-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.25rem;
    height: 46px;
    min-height: 46px;
    box-sizing: border-box;
    gap: 1rem;
    background: #ffffff;
  }

  .modal-dialog.mode-dark .header-toolbar-row,
  :global(.mode-dark) .header-toolbar-row,
  :global(.is-dark) .header-toolbar-row,
  :global(body.app-dark) .header-toolbar-row {
    background: #14161b;
  }

  .toolbar-context {
    font-size: 0.74rem;
    color: #64748b;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .modal-dialog.mode-dark .toolbar-context,
  :global(.mode-dark) .toolbar-context,
  :global(.is-dark) .toolbar-context,
  :global(body.app-dark) .toolbar-context {
    color: #94a3b8;
  }

  .toolbar-context code {
    font-size: 0.72rem;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    background: #f1f5f9;
    color: #2563eb;
    font-family: ui-monospace, monospace;
  }

  .modal-dialog.mode-dark .toolbar-context code,
  :global(.mode-dark) .toolbar-context code,
  :global(.is-dark) .toolbar-context code,
  :global(body.app-dark) .toolbar-context code {
    background: #272a34;
    color: #60a5fa;
  }

  .toolbar-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .btn {
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .btn-sm {
    padding: 0.35rem 0.75rem;
    font-size: 0.74rem;
  }

  .btn-secondary {
    background: #ffffff;
    border: 1px solid #d4d4d8;
    color: #3f3f46;
  }

  .btn-secondary:hover {
    background: #f4f4f5;
  }

  .modal-dialog.mode-dark .btn-secondary,
  :global(.mode-dark) .btn-secondary,
  :global(.is-dark) .btn-secondary,
  :global(body.app-dark) .btn-secondary {
    background: #272a34;
    border-color: #3f3f46;
    color: #e4e4e7;
  }

  .modal-dialog.mode-dark .btn-secondary:hover,
  :global(.mode-dark) .btn-secondary:hover,
  :global(.is-dark) .btn-secondary:hover,
  :global(body.app-dark) .btn-secondary:hover {
    background: #323642;
  }

  .btn-primary {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-copied {
    background: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
  }

  /* Code Body */
  .modal-code-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    background: #0f172a;
    padding: 1.15rem 1.4rem;
  }

  .yaml-pre {
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8rem;
    line-height: 1.6;
    color: #f1f5f9;
    white-space: pre;
    tab-size: 2;
  }

  .yaml-code {
    font-family: inherit;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 1.25rem;
    border-top: 1px solid #e4e4e7;
    background: #f8fafc;
    flex-shrink: 0;
  }

  .modal-dialog.mode-dark .modal-footer,
  :global(.mode-dark) .modal-footer,
  :global(.is-dark) .modal-footer,
  :global(body.app-dark) .modal-footer {
    background: #181a20;
    border-top-color: #2e3039;
  }

  .shortcut-hint {
    font-size: 0.74rem;
    color: #71717a;
  }

  .modal-dialog.mode-dark .shortcut-hint,
  :global(.mode-dark) .shortcut-hint,
  :global(.is-dark) .shortcut-hint,
  :global(body.app-dark) .shortcut-hint {
    color: #94a3b8;
  }

  kbd {
    display: inline-block;
    padding: 0.1rem 0.35rem;
    font-size: 0.7rem;
    font-family: inherit;
    color: #374151;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-shadow: 0 1px 0 #94a3b8;
  }

  .modal-dialog.mode-dark kbd,
  :global(.mode-dark) kbd,
  :global(.is-dark) kbd,
  :global(body.app-dark) kbd {
    background: #22252e;
    color: #e5e7eb;
    border-color: #3f3f46;
    box-shadow: 0 1px 0 #18181b;
  }

  /* Responsive Stacking for Small Screens */
  @media (max-width: 768px) {
    .header-top-row,
    .header-toolbar-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.65rem;
    }

    .header-top-actions {
      justify-content: space-between;
    }

    .toolbar-buttons {
      flex-wrap: wrap;
    }
  }
</style>
