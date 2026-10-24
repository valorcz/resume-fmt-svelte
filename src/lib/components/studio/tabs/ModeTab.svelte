<script>
  let {
    colorMode = $bindable('system'),
    paperFormat = $bindable('a4'),
    printMargin = $bindable('1.5cm'),
    printScale = $bindable(100),
    annexBreak = $bindable(false),
    showPageGuides = $bindable(false),
    onExportHtml = () => {}
  } = $props();

  let exportFeedback = $state(false);

  function handleTriggerExport() {
    exportFeedback = true;
    onExportHtml();
    setTimeout(() => exportFeedback = false, 2500);
  }

  const printScales = [
    { val: 100, label: '100% (Default standard)', desc: 'Normal 1:1 scale' },
    { val: 95, label: '95% (Gentle squeeze)', desc: 'Fits 1-2 trailing lines' },
    { val: 90, label: '90% (Compact squeeze)', desc: 'Balanced single-page fit' },
    { val: 85, label: '85% (Page 1 squeeze)', desc: 'Optimal 1-page compaction' },
    { val: 80, label: '80% (Dense fit)', desc: 'Squeezes long careers onto 1 page' },
    { val: 75, label: '75% (Maximum squeeze)', desc: 'Maximum density 1-page fit' }
  ];

  const modes = [
    { id: 'system', name: 'System Auto', desc: 'Syncs with OS preference' },
    { id: 'light', name: 'Light Mode', desc: 'Pure white background' },
    { id: 'dark', name: 'Dark Mode', desc: 'Deep slate dark background' }
  ];

  const paperFormats = [
    { id: 'a4', name: 'A4', desc: '210 × 297 mm (Standard worldwide)' },
    { id: 'letter', name: 'US Letter', desc: '8.5 × 11 in (North America)' }
  ];

  const a4Margins = [
    { id: '1.0cm', name: 'Compact (1.0 cm)', desc: 'Best for fitting onto 1 page' },
    { id: '1.5cm', name: 'Standard (1.5 cm)', desc: 'Balanced print layout' },
    { id: '2.0cm', name: 'Generous (2.0 cm)', desc: 'Wide luxury margins' }
  ];

  const letterMargins = [
    { id: '0.5in', name: 'Compact (0.5 in)', desc: 'Best for fitting onto 1 page' },
    { id: '0.75in', name: 'Standard (0.75 in)', desc: 'Balanced North American standard' },
    { id: '1.0in', name: 'Generous (1.0 in)', desc: 'Wide luxury margins' }
  ];

  let currentMargins = $derived(paperFormat === 'letter' ? letterMargins : a4Margins);

  function selectPaperFormat(pfId) {
    if (pfId === paperFormat) return;
    paperFormat = pfId;
    // Auto-convert unit to match paper standard
    if (pfId === 'letter' && printMargin.includes('cm')) {
      if (printMargin === '1.0cm') printMargin = '0.5in';
      else if (printMargin === '2.0cm') printMargin = '1.0in';
      else printMargin = '0.75in';
    } else if (pfId === 'a4' && printMargin.includes('in')) {
      if (printMargin === '0.5in') printMargin = '1.0cm';
      else if (printMargin === '1.0in') printMargin = '2.0cm';
      else printMargin = '1.5cm';
    }
  }
</script>

<div class="section-group">
  <h3 class="group-title">Color Appearance</h3>
  <p class="group-desc">Choose your preferred visual display mode.</p>

  <div class="mode-options-list">
    {#each modes as m}
      <button
        class="mode-card"
        class:active={colorMode === m.id}
        onclick={() => colorMode = m.id}
      >
        <div class="mode-card-radio">
          <span class="radio-dot" class:checked={colorMode === m.id}></span>
        </div>
        <div class="mode-card-info">
          <span class="mode-name">{m.name}</span>
          <span class="mode-desc">{m.desc}</span>
        </div>
      </button>
    {/each}
  </div>

  <div class="section-divider"></div>

  <!-- PRINT & PAPER FORMAT CONTROLS -->
  <h3 class="group-title">Paper Format & Print Margins</h3>
  <p class="group-desc">
    Configures browser <code>@page</code> print engine rules and on-screen pagination guides.
  </p>

  <div class="format-grid">
    {#each paperFormats as pf}
      <button
        class="format-btn"
        class:active={paperFormat === pf.id}
        onclick={() => selectPaperFormat(pf.id)}
      >
        <div class="format-name">{pf.name}</div>
        <div class="format-desc">{pf.desc}</div>
      </button>
    {/each}
  </div>

  <div class="margin-select-row">
    <label class="margin-label" for="print-margin-select">
      Print Margins ({paperFormat === 'letter' ? 'inches' : 'centimeters'}):
    </label>
    <select id="print-margin-select" name="print_margin" class="margin-select" bind:value={printMargin}>
      {#each currentMargins as mg}
        <option value={mg.id}>{mg.name}</option>
      {/each}
    </select>
  </div>

  <div class="margin-select-row">
    <label class="margin-label" for="print-scale-select">
      Print Scale (Squeeze):
    </label>
    <select id="print-scale-select" name="print_scale" class="margin-select" bind:value={printScale}>
      {#each printScales as sc}
        <option value={sc.val}>{sc.label}</option>
      {/each}
    </select>
  </div>

  <div class="toggle-row">
    <label class="toggle-label" for="show-guides-checkbox">
      <div class="toggle-title-row">
        <span>Show Page Break Guides</span>
        <kbd class="keycap-pill">B</kbd>
      </div>
      <span class="toggle-subtext">Visual cutline indicator showing print page boundaries (Shortcut: B)</span>
    </label>
    <input
      id="show-guides-checkbox"
      name="show_page_guides"
      type="checkbox"
      class="toggle-checkbox"
      bind:checked={showPageGuides}
    />
  </div>

  <div class="toggle-row">
    <label class="toggle-label" for="annex-break-checkbox">
      <div class="toggle-title-row">
        <span>Page 3+ Supplemental Annex Break</span>
        <span class="annex-badge">ATS Golden Ratio</span>
      </div>
      <span class="toggle-subtext">Starts Projects & Supplemental sections cleanly on Page 3, keeping Pages 1–2 dedicated to Core Experience & Skills.</span>
    </label>
    <input
      id="annex-break-checkbox"
      name="annex_break"
      type="checkbox"
      class="toggle-checkbox"
      bind:checked={annexBreak}
    />
  </div>

  <div class="section-divider"></div>

  <!-- STANDALONE HTML PACKAGE EXPORT -->
  <h3 class="group-title">Self-Contained HTML Package</h3>
  <p class="group-desc">
    Export a standalone, 100% offline <code>.html</code> file with embedded theme styles, print CSS, interactive recruiter briefing toggle, and bundled original YAML.
  </p>

  <div class="package-export-card">
    <div class="package-features-list">
      <div class="package-feature-item">
        <span class="feature-bullet">✓</span>
        <span>Single-file bundle — zero external scripts or servers required</span>
      </div>
      <div class="package-feature-item">
        <span class="feature-bullet">✓</span>
        <span>Includes Executive Briefing Card & Recruiter quick-toggle</span>
      </div>
      <div class="package-feature-item">
        <span class="feature-bullet">✓</span>
        <span>Embedded original & configured YAML source for ATS/recruiters</span>
      </div>
    </div>

    <button
      type="button"
      class="btn-package-export"
      class:btn-exported={exportFeedback}
      onclick={handleTriggerExport}
    >
      <span class="btn-icon">{exportFeedback ? '✓' : '📦'}</span>
      <span>{exportFeedback ? 'Downloaded Standalone HTML!' : 'Export Standalone HTML (.html)'}</span>
    </button>
  </div>
</div>

<style>
  .section-group {
    margin-bottom: 2rem;
  }

  .group-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0 0 0.35rem 0;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  :global(.mode-dark) .group-title,
  :global(.is-dark) .group-title {
    color: #f8fafc;
  }

  .group-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 1rem 0;
    line-height: 1.45;
  }
  :global(.mode-dark) .group-desc,
  :global(.is-dark) .group-desc {
    color: #94a3b8;
  }

  .group-desc code {
    background: #e2e8f0;
    color: #0f172a;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }
  :global(.mode-dark) .group-desc code,
  :global(.is-dark) .group-desc code {
    background: #27272a;
    color: #e2e8f0;
  }

  .mode-options-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mode-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0.85rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    color: #1e293b;
    transition: all 0.15s ease;
  }
  :global(.mode-dark) .mode-card,
  :global(.is-dark) .mode-card {
    background: #181a20;
    border-color: #27272a;
    color: #f1f5f9;
  }

  .mode-card:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
  :global(.mode-dark) .mode-card:hover,
  :global(.is-dark) .mode-card:hover {
    background: #20222a;
    border-color: #3f3f46;
  }

  .mode-card.active {
    border-color: #2563eb;
    background: #eff6ff;
  }
  :global(.mode-dark) .mode-card.active,
  :global(.is-dark) .mode-card.active {
    background: rgba(37, 99, 235, 0.18);
    border-color: #3b82f6;
    color: #ffffff;
  }

  .mode-card-radio {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
  }
  :global(.mode-dark) .mode-card-radio,
  :global(.is-dark) .mode-card-radio {
    border-color: #3f3f46;
  }
  .mode-card.active .mode-card-radio {
    border-color: #2563eb;
  }

  .radio-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
  }
  .radio-dot.checked {
    background: #2563eb;
  }

  .mode-card-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .mode-name {
    font-size: 0.82rem;
    font-weight: 700;
    color: #0f172a;
  }
  :global(.mode-dark) .mode-name,
  :global(.is-dark) .mode-name {
    color: #f8fafc;
  }
  .mode-card.active .mode-name {
    color: #2563eb;
  }
  :global(.mode-dark) .mode-card.active .mode-name,
  :global(.is-dark) .mode-card.active .mode-name {
    color: #ffffff;
  }

  .mode-desc {
    font-size: 0.72rem;
    color: #64748b;
  }
  :global(.mode-dark) .mode-desc,
  :global(.is-dark) .mode-desc {
    color: #94a3b8;
  }
  .mode-card.active .mode-desc {
    color: #3b82f6;
  }
  :global(.mode-dark) .mode-card.active .mode-desc,
  :global(.is-dark) .mode-card.active .mode-desc {
    color: #93c5fd;
  }

  .section-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 1.5rem 0;
  }
  :global(.mode-dark) .section-divider,
  :global(.is-dark) .section-divider {
    background: #27272a;
  }

  /* Format Grid */
  .format-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .format-btn {
    padding: 0.65rem 0.75rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    color: #1e293b;
    transition: all 0.15s ease;
  }
  :global(.mode-dark) .format-btn,
  :global(.is-dark) .format-btn {
    background: #181a20;
    border-color: #27272a;
    color: #f1f5f9;
  }

  .format-btn:hover {
    border-color: #cbd5e1;
  }
  :global(.mode-dark) .format-btn:hover,
  :global(.is-dark) .format-btn:hover {
    background: #20222a;
    border-color: #3f3f46;
  }

  .format-btn.active {
    border-color: #2563eb;
    background: #eff6ff;
  }
  :global(.mode-dark) .format-btn.active,
  :global(.is-dark) .format-btn.active {
    background: rgba(37, 99, 235, 0.18);
    border-color: #3b82f6;
    color: #ffffff;
  }

  .format-name {
    font-size: 0.8rem;
    font-weight: 700;
    color: #0f172a;
  }
  :global(.mode-dark) .format-name,
  :global(.is-dark) .format-name {
    color: #f8fafc;
  }
  .format-btn.active .format-name {
    color: #2563eb;
  }
  :global(.mode-dark) .format-btn.active .format-name,
  :global(.is-dark) .format-btn.active .format-name {
    color: #ffffff;
  }

  .format-desc {
    font-size: 0.68rem;
    color: #64748b;
    margin-top: 0.15rem;
  }
  :global(.mode-dark) .format-desc,
  :global(.is-dark) .format-desc {
    color: #94a3b8;
  }
  .format-btn.active .format-desc {
    color: #3b82f6;
  }
  :global(.mode-dark) .format-btn.active .format-desc,
  :global(.is-dark) .format-btn.active .format-desc {
    color: #93c5fd;
  }

  .margin-select-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }
  :global(.mode-dark) .margin-select-row,
  :global(.is-dark) .margin-select-row {
    background: #181a20;
    border-color: #27272a;
  }

  .margin-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: #1e293b;
  }
  :global(.mode-dark) .margin-label,
  :global(.is-dark) .margin-label {
    color: #f1f5f9;
  }

  .margin-select {
    padding: 0.3rem 0.5rem;
    font-size: 0.78rem;
    font-family: inherit;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #ffffff;
    color: #0f172a;
    outline: none;
  }
  :global(.mode-dark) .margin-select,
  :global(.is-dark) .margin-select {
    background: #27272a;
    border-color: #3f3f46;
    color: #f8fafc;
  }
  .margin-select option {
    background: #ffffff;
    color: #0f172a;
  }
  :global(.mode-dark) .margin-select option,
  :global(.is-dark) .margin-select option {
    background: #181a20;
    color: #f8fafc;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
  :global(.mode-dark) .toggle-row,
  :global(.is-dark) .toggle-row {
    background: #181a20;
    border-color: #27272a;
  }

  .toggle-label {
    display: flex;
    flex-direction: column;
    font-size: 0.78rem;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    gap: 0.2rem;
  }
  :global(.mode-dark) .toggle-label,
  :global(.is-dark) .toggle-label {
    color: #f1f5f9;
  }

  .toggle-title-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .keycap-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.05rem 0.35rem;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-bottom-width: 2px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, monospace;
    color: #475569;
    line-height: 1;
  }
  :global(.mode-dark) .keycap-pill,
  :global(.is-dark) .keycap-pill {
    background: #27272a;
    border-color: #3f3f46;
    color: #e4e4e7;
  }

  .annex-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.1rem 0.4rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    color: #1d4ed8;
    line-height: 1;
  }
  :global(.mode-dark) .annex-badge,
  :global(.is-dark) .annex-badge {
    background: #1e293b;
    border-color: #3b82f6;
    color: #93c5fd;
  }

  .toggle-subtext {
    font-size: 0.68rem;
    font-weight: 400;
    color: #64748b;
  }
  :global(.mode-dark) .toggle-subtext,
  :global(.is-dark) .toggle-subtext {
    color: #94a3b8;
  }

  .toggle-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  /* Standalone Package Card */
  .package-export-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  :global(.mode-dark) .package-export-card,
  :global(.is-dark) .package-export-card {
    background: #181a20;
    border-color: #27272a;
  }

  .package-features-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.76rem;
    color: #475569;
  }
  :global(.mode-dark) .package-features-list,
  :global(.is-dark) .package-features-list {
    color: #94a3b8;
  }

  .package-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
  }

  .feature-bullet {
    color: #10b981;
    font-weight: 700;
  }

  .btn-package-export {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .btn-package-export:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .btn-package-export.btn-exported {
    background: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
  }
</style>
