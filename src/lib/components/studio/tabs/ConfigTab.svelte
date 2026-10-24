<script>
  let {
    activeTheme = 'classic',
    customAccent = null,
    colorMode = 'system',
    effectiveLayout = { main: [], sidebar: [] }
  } = $props();

  let configFormat = $state('yaml');
  let copyEmbeddedFeedback = $state(false);
  let copyStandaloneFeedback = $state(false);

  let activeConfigPayload = $derived.by(() => {
    const obj = { theme: activeTheme };
    if (customAccent) obj.accent = customAccent;
    if (colorMode && colorMode !== 'system') obj.mode = colorMode;
    obj.layout = {
      main: [...effectiveLayout.main],
      sidebar: [...effectiveLayout.sidebar]
    };
    return obj;
  });

  let embeddedYamlSnippet = $derived.by(() => {
    let lines = ['# Add this under meta: in your resume.yaml:', 'meta:', '  studio:'];
    lines.push(`    theme: ${activeTheme}`);
    if (customAccent) lines.push(`    accent: '${customAccent}'`);
    if (colorMode && colorMode !== 'system') lines.push(`    mode: ${colorMode}`);
    lines.push('    layout:');
    lines.push('      main:');
    if (effectiveLayout.main.length === 0) lines.push('        []');
    else effectiveLayout.main.forEach(k => lines.push(`        - ${k}`));
    lines.push('      sidebar:');
    if (effectiveLayout.sidebar.length === 0) lines.push('        []');
    else effectiveLayout.sidebar.forEach(k => lines.push(`        - ${k}`));
    return lines.join('\n');
  });

  let standaloneYamlSnippet = $derived.by(() => {
    let lines = ['# Save as config.yaml in your Gist:', `theme: ${activeTheme}`];
    if (customAccent) lines.push(`accent: '${customAccent}'`);
    if (colorMode && colorMode !== 'system') lines.push(`mode: ${colorMode}`);
    lines.push('layout:');
    lines.push('  main:');
    if (effectiveLayout.main.length === 0) lines.push('    []');
    else effectiveLayout.main.forEach(k => lines.push(`    - ${k}`));
    lines.push('  sidebar:');
    if (effectiveLayout.sidebar.length === 0) lines.push('    []');
    else effectiveLayout.sidebar.forEach(k => lines.push(`    - ${k}`));
    return lines.join('\n');
  });

  let embeddedJsonSnippet = $derived.by(() => {
    return JSON.stringify({ meta: { studio: activeConfigPayload } }, null, 2);
  });

  let standaloneJsonSnippet = $derived.by(() => {
    return JSON.stringify(activeConfigPayload, null, 2);
  });

  function copyEmbeddedConfig() {
    const text = configFormat === 'yaml' ? embeddedYamlSnippet : embeddedJsonSnippet;
    navigator.clipboard.writeText(text).then(() => {
      copyEmbeddedFeedback = true;
      setTimeout(() => copyEmbeddedFeedback = false, 2000);
    });
  }

  function copyStandaloneConfig() {
    const text = configFormat === 'yaml' ? standaloneYamlSnippet : standaloneJsonSnippet;
    navigator.clipboard.writeText(text).then(() => {
      copyStandaloneFeedback = true;
      setTimeout(() => copyStandaloneFeedback = false, 2000);
    });
  }
</script>

<div class="section-group">
  <div class="header-flex">
    <h3 class="group-title">Gist Configuration</h3>
    <!-- Format Toggle -->
    <div class="format-toggle">
      <button 
        class="format-toggle-btn" 
        class:active={configFormat === 'yaml'}
        onclick={() => configFormat = 'yaml'}
      >
        YAML
      </button>
      <button 
        class="format-toggle-btn" 
        class:active={configFormat === 'json'}
        onclick={() => configFormat = 'json'}
      >
        JSON
      </button>
    </div>
  </div>

  <p class="group-desc">
    Persist your theme, accent color, and column layout in your GitHub Gist so anyone visiting your resume sees your chosen styling by default.
  </p>

  <!-- Option 1: Embedded Config -->
  <div class="config-card">
    <div class="config-card-header">
      <div>
        <span class="config-opt-badge">Recommended</span>
        <span class="config-card-title">
          {configFormat === 'yaml' ? 'Option 1: Embed in resume.yaml' : 'Option 1: Embed in resume.json'}
        </span>
      </div>
      <button class="text-btn" onclick={copyEmbeddedConfig}>
        {copyEmbeddedFeedback ? '✓ Copied!' : 'Copy Snippet'}
      </button>
    </div>
    <p class="config-card-desc">
      {configFormat === 'yaml' 
        ? 'Add a meta.studio block directly into your resume.yaml file (100% JSON Resume compliant).'
        : 'Add a "meta": { "studio": { ... } } object into your resume.json file (100% JSON Resume compliant).'}
    </p>
    <pre class="yaml-viewer"><code>{configFormat === 'yaml' ? embeddedYamlSnippet : embeddedJsonSnippet}</code></pre>
  </div>

  <!-- Option 2: Standalone Config File -->
  <div class="config-card" style="margin-top: 1.25rem;">
    <div class="config-card-header">
      <div>
        <span class="config-opt-badge alt">Alternative</span>
        <span class="config-card-title">
          {configFormat === 'yaml' ? 'Option 2: Standalone config.yaml' : 'Option 2: Standalone config.json'}
        </span>
      </div>
      <button class="text-btn" onclick={copyStandaloneConfig}>
        {copyStandaloneFeedback ? '✓ Copied!' : 'Copy Snippet'}
      </button>
    </div>
    <p class="config-card-desc">
      {configFormat === 'yaml'
        ? 'Create an independent config.yaml file alongside your resume.yaml in the Gist.'
        : 'Create an independent config.json file alongside your resume.json in the Gist.'}
    </p>
    <pre class="yaml-viewer"><code>{configFormat === 'yaml' ? standaloneYamlSnippet : standaloneJsonSnippet}</code></pre>
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

  .format-toggle {
    display: flex;
    background: #f1f5f9;
    padding: 0.15rem;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }
  :global(.mode-dark) .format-toggle,
  :global(.is-dark) .format-toggle {
    background: #181a20;
    border-color: #27272a;
  }

  .format-toggle-btn {
    padding: 0.2rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: inherit;
    border: none;
    background: none;
    color: #64748b;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }
  :global(.mode-dark) .format-toggle-btn,
  :global(.is-dark) .format-toggle-btn {
    color: #94a3b8;
  }

  .format-toggle-btn.active {
    background: #ffffff;
    color: #2563eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  :global(.mode-dark) .format-toggle-btn.active,
  :global(.is-dark) .format-toggle-btn.active {
    background: #27272a;
    color: #60a5fa;
  }

  .config-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.85rem;
  }
  :global(.mode-dark) .config-card,
  :global(.is-dark) .config-card {
    background: #181a20;
    border-color: #27272a;
  }

  .config-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;
  }

  .config-opt-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    background: #10b981;
    color: #ffffff;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    margin-right: 0.4rem;
  }
  .config-opt-badge.alt {
    background: #64748b;
  }

  .config-card-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #0f172a;
  }
  :global(.mode-dark) .config-card-title,
  :global(.is-dark) .config-card-title {
    color: #f1f5f9;
  }

  .config-card-desc {
    font-size: 0.73rem;
    color: #64748b;
    margin: 0.2rem 0 0.6rem 0;
    line-height: 1.4;
  }
  :global(.mode-dark) .config-card-desc,
  :global(.is-dark) .config-card-desc {
    color: #94a3b8;
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
    max-height: 180px;
  }
  :global(.mode-dark) .yaml-viewer,
  :global(.is-dark) .yaml-viewer {
    background: #090a0f;
    border: 1px solid #27272a;
  }
</style>
