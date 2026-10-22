<script>
  import { onMount } from 'svelte';
  import { auditResume, generateAtsPlainText } from '$lib/audit/resumeAudit.js';

  let {
    themes = [],
    activeTheme = $bindable('classic'),
    activeThemeConfig = {},
    customAccent = $bindable(null),
    customLayout = $bindable(null),
    colorMode = $bindable('system'),
    gistId = null,
    resume = null,
    activeI18n = {},
    isOpen = $bindable(false),
    activeTab = $bindable('theme'),
    onResetLayout = () => {},
    onResetAll = () => {},
    onOpenGuide = () => {}
  } = $props();

  let customColorInput = $state('#2563eb');
  let copyFeedback = $state(false);
  let shareFeedback = $state(false);
  let recruiterFeedback = $state(false);
  let copyEmbeddedFeedback = $state(false);
  let copyStandaloneFeedback = $state(false);
  let copyAtsFeedback = $state(false);

  // Gist Source state
  let gistInput = $state('');
  let gistError = $state('');

  // Format selector for config tab ('yaml' | 'json')
  let configFormat = $state('yaml');

  $effect(() => {
    gistInput = gistId || '';
  });

  // Derived audit report and ATS linear plain text
  let auditReport = $derived(auditResume(resume, effectiveLayout));
  let atsPlainText = $derived(generateAtsPlainText(resume, activeI18n));

  function copyAtsText() {
    navigator.clipboard.writeText(atsPlainText).then(() => {
      copyAtsFeedback = true;
      setTimeout(() => copyAtsFeedback = false, 2000);
    });
  }

  // Drag-and-Drop state with Firefox dataTransfer support
  let draggedItem = $state(null); // { col: 'main'|'sidebar', index: number, key: string }
  let dropTarget = $state(null);  // { col: 'main'|'sidebar', index: number }

  // Curated versatile accent palette options
  const colorPresets = [
    { name: 'Cobalt Blue', hex: '#2563eb' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Laser Magenta', hex: '#ff0055' },
    { name: 'Sunset Amber', hex: '#d97706' },
    { name: 'Royal Indigo', hex: '#4f46e5' },
    { name: 'Crimson Ruby', hex: '#dc2626' },
    { name: 'Petrol Teal', hex: '#0d9488' },
    { name: 'Amethyst Violet', hex: '#7c3aed' },
    { name: 'Slate Charcoal', hex: '#334155' },
    { name: 'Steel Sky', hex: '#0284c7' }
  ];

  // All available section identifiers in standard JSON resume
  const allSectionKeys = [
    'work', 'volunteer', 'projects', 'education', 
    'skills', 'languages', 'certificates', 'awards', 
    'publications', 'interests', 'references'
  ];

  function formatName(slug) {
    if (!slug) return '';
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function getSectionLabel(key) {
    const customTitle = activeThemeConfig?.i18n?.[key];
    if (customTitle) return `${customTitle} (${key})`;
    return formatName(key);
  }

  // Active columns derived from customLayout (for activeTheme) or activeThemeConfig.layout
  let effectiveLayout = $derived.by(() => {
    if (customLayout) return customLayout;
    return {
      main: [...(activeThemeConfig?.layout?.main || [])],
      sidebar: [...(activeThemeConfig?.layout?.sidebar || [])]
    };
  });

  // Calculate unassigned/hidden sections
  let hiddenSections = $derived.by(() => {
    const active = new Set([...effectiveLayout.main, ...effectiveLayout.sidebar]);
    return allSectionKeys.filter(k => !active.has(k));
  });

  // Select a theme and load its specific saved layout
  function selectTheme(themeName) {
    if (themeName === activeTheme) return;
    activeTheme = themeName;
    if (typeof window !== 'undefined') {
      const savedLayout = localStorage.getItem(`resume-layout-${themeName}`);
      if (savedLayout) {
        try {
          customLayout = JSON.parse(savedLayout);
        } catch (e) {
          customLayout = null;
        }
      } else {
        customLayout = null;
      }
    }
  }

  // 1. Move section within a column (up/down)
  function moveSection(column, index, direction) {
    const targetCol = [...effectiveLayout[column]];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= targetCol.length) return;

    const temp = targetCol[index];
    targetCol[index] = targetCol[newIndex];
    targetCol[newIndex] = temp;

    customLayout = {
      ...effectiveLayout,
      [column]: targetCol
    };
  }

  // 2. Transfer section between Main and Sidebar
  function transferSection(fromCol, toCol, index) {
    const source = [...effectiveLayout[fromCol]];
    const dest = [...effectiveLayout[toCol]];
    const [item] = source.splice(index, 1);
    dest.push(item);

    customLayout = {
      main: fromCol === 'main' ? source : dest,
      sidebar: fromCol === 'sidebar' ? source : dest
    };
  }

  // 3. Remove/Hide a section
  function removeSection(fromCol, index) {
    const source = [...effectiveLayout[fromCol]];
    source.splice(index, 1);

    customLayout = {
      ...effectiveLayout,
      [fromCol]: source
    };
  }

  // 4. Add/Restore a hidden section
  function addSection(key, targetCol = 'main') {
    const dest = [...effectiveLayout[targetCol], key];
    customLayout = {
      ...effectiveLayout,
      [targetCol]: dest
    };
  }

  // --- Firefox & Cross-Browser HTML5 Drag and Drop Handlers ---
  function handleDragStart(e, col, index, key) {
    draggedItem = { col, index, key };
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', key);
    }
  }

  function handleDragOver(e, col, index = null) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    dropTarget = { col, index };
  }

  function handleDrop(e, targetCol, targetIndex = null) {
    e.preventDefault();
    if (!draggedItem) return;

    const { col: sourceCol, index: sourceIndex, key } = draggedItem;

    const newMain = [...effectiveLayout.main];
    const newSidebar = [...effectiveLayout.sidebar];

    // Remove from source
    if (sourceCol === 'main') {
      newMain.splice(sourceIndex, 1);
    } else {
      newSidebar.splice(sourceIndex, 1);
    }

    // Insert into target
    if (targetCol === 'main') {
      const idx = (targetIndex !== null && targetIndex !== undefined) ? targetIndex : newMain.length;
      newMain.splice(idx, 0, key);
    } else {
      const idx = (targetIndex !== null && targetIndex !== undefined) ? targetIndex : newSidebar.length;
      newSidebar.splice(idx, 0, key);
    }

    customLayout = {
      main: newMain,
      sidebar: newSidebar
    };

    draggedItem = null;
    dropTarget = null;
  }

  function handleDragEnd() {
    draggedItem = null;
    dropTarget = null;
  }

  // Smart Gist ID extractor from raw ID or full GitHub Gist URL
  function extractGistId(input) {
    if (!input) return null;
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/gist\.github(?:usercontent)?\.com\/([^\/]+\/)?([a-f0-9]+)/i);
    if (urlMatch && urlMatch[2]) {
      return urlMatch[2];
    }
    const idMatch = trimmed.match(/^[a-f0-9]+$/i);
    if (idMatch) {
      return trimmed;
    }
    const clean = trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');
    const segments = clean.split('/');
    const last = segments[segments.length - 1];
    return last || null;
  }

  function handleLoadGist() {
    const id = extractGistId(gistInput);
    if (!id) {
      gistError = 'Please enter a valid GitHub Gist ID or URL.';
      return;
    }
    gistError = '';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('gist', id);
      window.location.href = url.toString();
    }
  }

  function handleResetToDemo() {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('gist');
      window.location.href = url.toString();
    }
  }

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

  // 5. Generate config payloads for Gist preservation
  let activeConfigPayload = $derived.by(() => {
    const obj = {
      theme: activeTheme
    };
    if (customAccent) {
      obj.accent = customAccent;
    }
    if (colorMode && colorMode !== 'system') {
      obj.mode = colorMode;
    }
    obj.layout = {
      main: [...effectiveLayout.main],
      sidebar: [...effectiveLayout.sidebar]
    };
    return obj;
  });

  let embeddedYamlSnippet = $derived.by(() => {
    let lines = ['# Add this to the top of your resume.yaml:', '_config:'];
    lines.push(`  theme: ${activeTheme}`);
    if (customAccent) {
      lines.push(`  accent: '${customAccent}'`);
    }
    if (colorMode && colorMode !== 'system') {
      lines.push(`  mode: ${colorMode}`);
    }
    lines.push('  layout:');
    lines.push('    main:');
    if (effectiveLayout.main.length === 0) {
      lines.push('      []');
    } else {
      effectiveLayout.main.forEach(k => lines.push(`      - ${k}`));
    }
    lines.push('    sidebar:');
    if (effectiveLayout.sidebar.length === 0) {
      lines.push('      []');
    } else {
      effectiveLayout.sidebar.forEach(k => lines.push(`      - ${k}`));
    }
    return lines.join('\n');
  });

  let standaloneYamlSnippet = $derived.by(() => {
    let lines = ['# Save as config.yaml in your Gist:', `theme: ${activeTheme}`];
    if (customAccent) {
      lines.push(`accent: '${customAccent}'`);
    }
    if (colorMode && colorMode !== 'system') {
      lines.push(`mode: ${colorMode}`);
    }
    lines.push('layout:');
    lines.push('  main:');
    if (effectiveLayout.main.length === 0) {
      lines.push('    []');
    } else {
      effectiveLayout.main.forEach(k => lines.push(`    - ${k}`));
    }
    lines.push('  sidebar:');
    if (effectiveLayout.sidebar.length === 0) {
      lines.push('    []');
    } else {
      effectiveLayout.sidebar.forEach(k => lines.push(`    - ${k}`));
    }
    return lines.join('\n');
  });

  let embeddedJsonSnippet = $derived.by(() => {
    return JSON.stringify({
      _config: activeConfigPayload
    }, null, 2);
  });

  let standaloneJsonSnippet = $derived.by(() => {
    return JSON.stringify(activeConfigPayload, null, 2);
  });

  let yamlOutput = $derived(standaloneYamlSnippet);

  function copyYaml() {
    navigator.clipboard.writeText(yamlOutput).then(() => {
      copyFeedback = true;
      setTimeout(() => copyFeedback = false, 2000);
    });
  }

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

  function handleResetLayout() {
    customLayout = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`resume-layout-${activeTheme}`);
    }
    onResetLayout();
  }

  function handleResetAccent() {
    customAccent = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resume-accent-color');
    }
  }

  function handleResetAll() {
    handleResetAccent();
    handleResetLayout();
    colorMode = 'system';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resume-color-mode');
      themes.forEach(t => localStorage.removeItem(`resume-layout-${t}`));
    }
    onResetAll();
  }

  // Theme Mode cycle helper (system -> light -> dark -> system)
  function cycleColorMode() {
    if (colorMode === 'system') colorMode = 'light';
    else if (colorMode === 'light') colorMode = 'dark';
    else colorMode = 'system';
  }

  // Print trigger
  function handlePrint() {
    window.print();
  }

  function copyShareUrl() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        shareFeedback = true;
        setTimeout(() => shareFeedback = false, 2000);
      });
    }
  }

  // Read stored preferences on mount if not already populated from URL
  onMount(() => {
    if (!activeTheme || activeTheme === 'classic') {
      const storedTheme = localStorage.getItem('resume-active-theme');
      if (storedTheme && themes.includes(storedTheme)) {
        activeTheme = storedTheme;
      }
    }

    if (!customAccent) {
      const storedAccent = localStorage.getItem('resume-accent-color');
      if (storedAccent) {
        customAccent = storedAccent;
        customColorInput = storedAccent;
      }
    } else {
      customColorInput = customAccent;
    }

    if (!colorMode || colorMode === 'system') {
      const storedMode = localStorage.getItem('resume-color-mode');
      if (storedMode && ['system', 'light', 'dark'].includes(storedMode)) {
        colorMode = storedMode;
      }
    }

    if (!customLayout) {
      const storedLayout = localStorage.getItem(`resume-layout-${activeTheme}`);
      if (storedLayout) {
        try {
          customLayout = JSON.parse(storedLayout);
        } catch (e) {
          console.error('Failed to parse saved layout', e);
        }
      }
    }
  });

  // Save changes to localStorage
  $effect(() => {
    if (typeof window !== 'undefined') {
      if (activeTheme) {
        localStorage.setItem('resume-active-theme', activeTheme);
      }
      if (customAccent) {
        localStorage.setItem('resume-accent-color', customAccent);
      } else {
        localStorage.removeItem('resume-accent-color');
      }
      if (customLayout) {
        localStorage.setItem(`resume-layout-${activeTheme}`, JSON.stringify(customLayout));
      }
      if (colorMode) {
        localStorage.setItem('resume-color-mode', colorMode);
      }
    }
  });
</script>

<!-- Floating Controls Bar -->
<div class="floating-controls-wrapper mode-{colorMode}">
  <div class="floating-bar">
    <!-- Active Gist Pill (if Gist is loaded) -->
    {#if gistId}
      <button 
        class="bar-badge-pill" 
        onclick={() => { activeTab = 'source'; isOpen = true; }} 
        title="Resume loaded from GitHub Gist: {gistId}. Click to manage source."
      >
        <span class="gist-indicator-dot"></span>
        <span>GIST</span>
      </button>
      <div class="bar-divider"></div>
    {/if}

    <!-- Quick Theme Dropdown -->
    <div class="bar-group">
      <span class="bar-label">STYLE</span>
      <select 
        class="bar-select" 
        value={activeTheme} 
        onchange={(e) => selectTheme(e.currentTarget.value)}
        title="Select Theme"
      >
        {#each themes as t}
          <option value={t}>{formatName(t)}</option>
        {/each}
      </select>
    </div>

    <div class="bar-divider"></div>

    <!-- Mode Cycle Button (SVG Icons) -->
    <button 
      class="bar-btn mode-btn" 
      onclick={cycleColorMode} 
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
          <line x1="12" y1="1" x2="12" y2="3"></line>
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
      {#if customAccent || customLayout}
        <span class="active-dot" title="Customized"></span>
      {/if}
    </button>

    <!-- Print Action Button -->
    <button class="bar-btn print-btn" onclick={handlePrint} title="Print or Save as PDF">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      <span>Print</span>
    </button>

    <div class="bar-divider"></div>

    <!-- Help / Guide Button -->
    <button class="bar-btn guide-trigger-btn" onclick={onOpenGuide} title="Help & Guide (Press ?)" aria-label="Help & Guide">
      <span class="help-keycap">?</span>
    </button>
  </div>
</div>

<!-- Slide-Out Configuration Drawer -->
{#if isOpen}
  <!-- Backdrop -->
  <div 
    class="drawer-backdrop" 
    onclick={() => isOpen = false}
    onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
    tabindex="0"
    role="button"
    aria-label="Close Customizer Drawer"
  ></div>

  <!-- Drawer Container -->
  <aside class="drawer-panel mode-{colorMode}" aria-label="Resume Customization Panel">
    <!-- Header -->
    <div class="drawer-header">
      <div class="drawer-header-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <h2>Resume Studio</h2>
      </div>
      <div class="drawer-header-actions">
        <!-- Recruiter Link Action Button -->
        <button 
          class="header-action-btn recruiter-action-btn" 
          onclick={copyRecruiterUrl} 
          title="Copy clean, recruiter-ready link (hides all Studio bars and controls)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <span>{recruiterFeedback ? '✓ Copied!' : 'Recruiter Link'}</span>
        </button>

        <!-- Share Studio Action Button -->
        <button 
          class="header-action-btn header-share-btn" 
          onclick={copyShareUrl} 
          title="Copy Shareable Studio URL with current configuration"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>{shareFeedback ? '✓ Copied' : 'Share'}</span>
        </button>

        <!-- Guide Trigger Action Button -->
        <button 
          class="header-guide-btn" 
          onclick={onOpenGuide} 
          title="Open Guide & README (Press ?)"
          aria-label="Open Guide"
        >
          <span class="help-keycap small">?</span>
        </button>

        <button class="drawer-close-btn" onclick={() => isOpen = false} aria-label="Close Panel">✕</button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="drawer-tabs">
      <button class="tab-btn" class:active={activeTab === 'source'} onclick={() => activeTab = 'source'}>
        Source
        {#if gistId}<span class="tab-indicator gist-active"></span>{/if}
      </button>
      <button class="tab-btn" class:active={activeTab === 'theme'} onclick={() => activeTab = 'theme'}>Theme</button>
      <button class="tab-btn" class:active={activeTab === 'colors'} onclick={() => activeTab = 'colors'}>
        Colors
        {#if customAccent}<span class="tab-indicator"></span>{/if}
      </button>
      <button class="tab-btn" class:active={activeTab === 'layout'} onclick={() => activeTab = 'layout'}>
        Layout
        {#if customLayout}<span class="tab-indicator"></span>{/if}
      </button>
      <button class="tab-btn" class:active={activeTab === 'mode'} onclick={() => activeTab = 'mode'}>Mode</button>
      <button class="tab-btn" class:active={activeTab === 'config' || activeTab === 'yaml'} onclick={() => activeTab = 'config'}>Config</button>
      <button class="tab-btn" class:active={activeTab === 'audit'} onclick={() => activeTab = 'audit'}>
        Check
        <span class="tab-score-badge" style="background-color: {auditReport.gradeColor}">{auditReport.score}%</span>
      </button>
    </nav>

    <!-- Tab Content Area -->
    <div class="drawer-body">
      
      <!-- TAB 0: RESUME SOURCE -->
      {#if activeTab === 'source'}
        <div class="section-group">
          <h3 class="group-title">Resume Source</h3>
          <p class="group-desc">
            Load resume data dynamically from any public GitHub Gist or view the built-in demo resume.
          </p>

          <!-- Current Source Card -->
          <div class="source-status-card {gistId ? 'is-gist' : 'is-demo'}">
            <div class="source-status-header">
              <span class="source-status-badge">
                {gistId ? '☁️ GitHub Gist Active' : '📄 Local Demo Active'}
              </span>
              {#if gistId}
                <a 
                  href="https://gist.github.com/{gistId}" 
                  target="_blank" 
                  rel="noreferrer" 
                  class="source-external-link"
                >
                  View Gist on GitHub ↗
                </a>
              {/if}
            </div>
            <div class="source-status-body">
              {#if gistId}
                <div class="source-id-display">
                  <span class="source-id-label">Active Gist ID:</span>
                  <code class="source-id-val">{gistId}</code>
                </div>
              {:else}
                <p class="source-demo-desc">
                  Currently rendering default resume (<code>static/resume.yaml</code>).
                </p>
              {/if}
            </div>
          </div>

          <!-- Gist Input Form -->
          <div class="gist-input-section">
            <label for="gist-id-input" class="input-label">Load Custom GitHub Gist</label>
            <div class="gist-input-row">
              <input 
                id="gist-id-input" 
                type="text" 
                class="gist-text-input" 
                bind:value={gistInput} 
                placeholder="Paste Gist ID or URL (e.g. 8f9a2b4...)" 
                onkeydown={(e) => e.key === 'Enter' && handleLoadGist()}
              />
              <button class="gist-load-btn" onclick={handleLoadGist}>
                Load Gist
              </button>
            </div>
            {#if gistError}
              <div class="gist-error-msg">{gistError}</div>
            {/if}

            {#if gistId}
              <button class="reset-to-demo-btn" onclick={handleResetToDemo}>
                ← Switch Back to Demo Resume
              </button>
            {/if}
          </div>

          <!-- Gist Setup Guide Box -->
          <div class="gist-instructions-box">
            <h4 class="instructions-title">Quick Gist Setup Guide:</h4>
            <ol class="instructions-list">
              <li>Open <a href="https://gist.github.com" target="_blank" rel="noreferrer">gist.github.com</a> to create a new public gist.</li>
              <li>Name your file <code>resume.yaml</code> (or <code>resume.json</code>).</li>
              <li>Optionally add a <code>_config:</code> block or a separate <code>config.yaml</code> to preset your styling (use the <strong>Config</strong> tab to generate it).</li>
              <li>Save as a <strong>Public Gist</strong> and paste its ID or URL into the field above.</li>
            </ol>
          </div>
        </div>
      {/if}

      <!-- TAB 1: THEMES -->
      {#if activeTab === 'theme'}
        <div class="section-group">
          <h3 class="group-title">Select Theme ({themes.length} Available)</h3>
          <div class="theme-grid">
            {#each themes as t}
              <button 
                class="theme-card" 
                class:active={activeTheme === t}
                onclick={() => selectTheme(t)}
              >
                <div class="theme-card-name">{formatName(t)}</div>
                <div class="theme-card-badge">{t}</div>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- TAB 2: ACCENT COLORS -->
      {#if activeTab === 'colors'}
        <div class="section-group">
          <div class="group-header-flex">
            <h3 class="group-title">Accent Color Palette</h3>
            {#if customAccent}
              <button class="text-btn" onclick={handleResetAccent}>Reset to Theme Default</button>
            {/if}
          </div>
          <p class="group-desc">Choose a subtle accent color or enter a custom hex code. Overrides apply live and to print output.</p>
          
          <!-- Default Theme Accent Card -->
          <div class="palette-grid">
            <button 
              class="color-preset-btn" 
              class:selected={customAccent === null}
              onclick={handleResetAccent}
            >
              <span class="color-swatch default-swatch">✓</span>
              <div class="color-meta">
                <span class="color-title">Theme Default</span>
                <span class="color-sub">Original palette</span>
              </div>
            </button>

            <!-- Preset Swatches -->
            {#each colorPresets as preset}
              <button 
                class="color-preset-btn" 
                class:selected={customAccent === preset.hex}
                onclick={() => { customAccent = preset.hex; customColorInput = preset.hex; }}
              >
                <span class="color-swatch" style="background-color: {preset.hex};"></span>
                <div class="color-meta">
                  <span class="color-title">{preset.name}</span>
                  <span class="color-sub">{preset.hex}</span>
                </div>
              </button>
            {/each}
          </div>

          <!-- Custom Color Picker -->
          <div class="custom-color-row">
            <label class="custom-color-label" for="custom-hex-input">Custom HEX:</label>
            <div class="color-input-wrapper">
              <input 
                id="custom-color-picker"
                type="color" 
                bind:value={customColorInput} 
                oninput={(e) => customAccent = e.currentTarget.value} 
                class="native-color-picker"
                aria-label="Color Picker"
              />
              <input 
                id="custom-hex-input"
                type="text" 
                bind:value={customColorInput} 
                onchange={(e) => customAccent = e.currentTarget.value} 
                class="hex-text-input" 
                placeholder="#2563eb" 
              />
            </div>
          </div>
        </div>
      {/if}

      <!-- TAB 3: THEME-SPECIFIC VISUAL LAYOUT & COLUMN MANAGER -->
      {#if activeTab === 'layout'}
        <div class="section-group">
          <!-- Theme-Specific Indicator Banner -->
          <div class="layout-theme-indicator">
            <div class="layout-theme-info">
              <span class="layout-theme-label">Theme Layout:</span>
              <strong class="layout-theme-name">{formatName(activeTheme)}</strong>
            </div>
            {#if customLayout}
              <span class="layout-custom-badge">Customized</span>
            {:else}
              <span class="layout-default-badge">Theme Default</span>
            {/if}
          </div>

          <div class="group-header-flex">
            <h3 class="group-title">Column Arrangement</h3>
            {#if customLayout}
              <button class="text-btn" onclick={handleResetLayout}>
                Reset {formatName(activeTheme)} Layout
              </button>
            {/if}
          </div>
          <p class="group-desc">Rearrange sections specifically for <strong>{formatName(activeTheme)}</strong>. Layout customizations are saved independently per theme.</p>

          <div class="columns-manager">
            
            <!-- Main Column Manager -->
            <div 
              class="col-box"
              class:drop-active={dropTarget?.col === 'main'}
              ondragover={(e) => handleDragOver(e, 'main')}
              ondrop={(e) => handleDrop(e, 'main')}
              role="region"
              aria-label="Main Column Sections"
            >
              <div class="col-box-header">
                <span class="col-badge">Main Column</span>
                <span class="col-count">{effectiveLayout.main.length} sections</span>
              </div>
              
              <div class="section-list">
                {#if effectiveLayout.main.length === 0}
                  <div class="empty-col-msg">Drop sections here to add to Main column.</div>
                {/if}
                {#each effectiveLayout.main as item, i (item)}
                  <div 
                    class="section-item-card"
                    class:dragging={draggedItem?.key === item}
                    class:drag-over={dropTarget?.col === 'main' && dropTarget?.index === i}
                    draggable="true"
                    ondragstart={(e) => handleDragStart(e, 'main', i, item)}
                    ondragover={(e) => handleDragOver(e, 'main', i)}
                    ondrop={(e) => handleDrop(e, 'main', i)}
                    ondragend={handleDragEnd}
                    role="listitem"
                  >
                    <span class="item-drag-handle" title="Drag to reorder">☰</span>
                    <span class="item-name">{getSectionLabel(item)}</span>
                    <div class="item-actions">
                      <button 
                        class="icon-btn" 
                        disabled={i === 0} 
                        onclick={() => moveSection('main', i, -1)} 
                        title="Move Up"
                      >▲</button>
                      <button 
                        class="icon-btn" 
                        disabled={i === effectiveLayout.main.length - 1} 
                        onclick={() => moveSection('main', i, 1)} 
                        title="Move Down"
                      >▼</button>
                      <button 
                        class="icon-btn transfer-btn" 
                        onclick={() => transferSection('main', 'sidebar', i)} 
                        title="Transfer to Sidebar"
                      >→</button>
                      <button 
                        class="icon-btn remove-btn" 
                        onclick={() => removeSection('main', i)} 
                        title="Hide section"
                      >✕</button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Sidebar Column Manager -->
            <div 
              class="col-box"
              class:drop-active={dropTarget?.col === 'sidebar'}
              ondragover={(e) => handleDragOver(e, 'sidebar')}
              ondrop={(e) => handleDrop(e, 'sidebar')}
              role="region"
              aria-label="Sidebar Column Sections"
            >
              <div class="col-box-header">
                <span class="col-badge sidebar-badge">Sidebar Column</span>
                <span class="col-count">{effectiveLayout.sidebar.length} sections</span>
              </div>
              
              <div class="section-list">
                {#if effectiveLayout.sidebar.length === 0}
                  <div class="empty-col-msg">Drop sections here to add to Sidebar column.</div>
                {/if}
                {#each effectiveLayout.sidebar as item, i (item)}
                  <div 
                    class="section-item-card"
                    class:dragging={draggedItem?.key === item}
                    class:drag-over={dropTarget?.col === 'sidebar' && dropTarget?.index === i}
                    draggable="true"
                    ondragstart={(e) => handleDragStart(e, 'sidebar', i, item)}
                    ondragover={(e) => handleDragOver(e, 'sidebar', i)}
                    ondrop={(e) => handleDrop(e, 'sidebar', i)}
                    ondragend={handleDragEnd}
                    role="listitem"
                  >
                    <span class="item-drag-handle" title="Drag to reorder">☰</span>
                    <span class="item-name">{getSectionLabel(item)}</span>
                    <div class="item-actions">
                      <button 
                        class="icon-btn transfer-btn" 
                        onclick={() => transferSection('sidebar', 'main', i)} 
                        title="Transfer to Main"
                      >←</button>
                      <button 
                        class="icon-btn" 
                        disabled={i === 0} 
                        onclick={() => moveSection('sidebar', i, -1)} 
                        title="Move Up"
                      >▲</button>
                      <button 
                        class="icon-btn" 
                        disabled={i === effectiveLayout.sidebar.length - 1} 
                        onclick={() => moveSection('sidebar', i, 1)} 
                        title="Move Down"
                      >▼</button>
                      <button 
                        class="icon-btn remove-btn" 
                        onclick={() => removeSection('sidebar', i)} 
                        title="Hide section"
                      >✕</button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Inactive / Available Sections Tray -->
            {#if hiddenSections.length > 0}
              <div class="hidden-tray">
                <span class="hidden-tray-title">Hidden Sections (Click to restore):</span>
                <div class="hidden-chips">
                  {#each hiddenSections as key}
                    <div class="hidden-chip">
                      <span>{getSectionLabel(key)}</span>
                      <div class="hidden-chip-actions">
                        <button class="chip-add-btn" onclick={() => addSection(key, 'main')} title="Add to Main">+ Main</button>
                        <button class="chip-add-btn" onclick={() => addSection(key, 'sidebar')} title="Add to Sidebar">+ Sidebar</button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

          </div>
        </div>
      {/if}

      <!-- TAB 4: THEME / COLOR MODE -->
      {#if activeTab === 'mode'}
        <div class="section-group">
          <h3 class="group-title">UI Appearance Mode</h3>
          <p class="group-desc">Control the look of the navigation and studio tools.</p>

          <div class="mode-options-grid">
            <button 
              class="mode-card" 
              class:selected={colorMode === 'system'} 
              onclick={() => colorMode = 'system'}
            >
              <span class="mode-card-icon">💻</span>
              <div class="mode-card-text">
                <span class="mode-card-title">System Auto</span>
                <span class="mode-card-desc">Follows OS dark/light mode preference</span>
              </div>
            </button>

            <button 
              class="mode-card" 
              class:selected={colorMode === 'light'} 
              onclick={() => colorMode = 'light'}
            >
              <span class="mode-card-icon">☀️</span>
              <div class="mode-card-text">
                <span class="mode-card-title">Light Mode</span>
                <span class="mode-card-desc">Bright and crisp workspace</span>
              </div>
            </button>

            <button 
              class="mode-card" 
              class:selected={colorMode === 'dark'} 
              onclick={() => colorMode = 'dark'}
            >
              <span class="mode-card-icon">🌙</span>
              <div class="mode-card-text">
                <span class="mode-card-title">Dark Mode</span>
                <span class="mode-card-desc">Dimmed slate workspace for night viewing</span>
              </div>
            </button>
          </div>
        </div>
      {/if}

      <!-- TAB 5: GIST STYLE CONFIGURATION & EXPORT -->
      {#if activeTab === 'config' || activeTab === 'yaml'}
        <div class="section-group">
          <div class="group-header-flex">
            <h3 class="group-title">Gist Style Configuration</h3>
            <!-- Format selector -->
            <div class="format-toggle">
              <button 
                class="format-btn" 
                class:active={configFormat === 'yaml'} 
                onclick={() => configFormat = 'yaml'}
              >
                YAML
              </button>
              <button 
                class="format-btn" 
                class:active={configFormat === 'json'} 
                onclick={() => configFormat = 'json'}
              >
                JSON
              </button>
            </div>
          </div>
          <p class="group-desc">
            Save these styling settings into your GitHub Gist to permanently preserve your selected theme, accent color, and column layout.
          </p>

          <!-- Snippet 1: Embedded _config -->
          <div class="config-snippet-card">
            <div class="snippet-header">
              <div class="snippet-title-group">
                <span class="snippet-badge">Option A</span>
                <strong class="snippet-name">Embedded <code>_config</code></strong>
                <span class="snippet-sub">(Add to top of {configFormat === 'yaml' ? 'resume.yaml' : 'resume.json'})</span>
              </div>
              <button class="text-btn snippet-copy-btn" onclick={copyEmbeddedConfig}>
                {copyEmbeddedFeedback ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre class="yaml-viewer"><code>{configFormat === 'yaml' ? embeddedYamlSnippet : embeddedJsonSnippet}</code></pre>
          </div>

          <!-- Snippet 2: Standalone config file -->
          <div class="config-snippet-card">
            <div class="snippet-header">
              <div class="snippet-title-group">
                <span class="snippet-badge">Option B</span>
                <strong class="snippet-name">Standalone <code>{configFormat === 'yaml' ? 'config.yaml' : 'config.json'}</code></strong>
                <span class="snippet-sub">(Save as separate file in Gist)</span>
              </div>
              <button class="text-btn snippet-copy-btn" onclick={copyStandaloneConfig}>
                {copyStandaloneFeedback ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre class="yaml-viewer"><code>{configFormat === 'yaml' ? standaloneYamlSnippet : standaloneJsonSnippet}</code></pre>
          </div>

          <!-- Recruiter View Callout -->
          <div class="recruiter-share-callout">
            <div class="callout-icon">💼</div>
            <div class="callout-body">
              <div class="callout-title">Sending to Recruiters?</div>
              <p class="callout-desc">
                Hiring managers and recruiters should see a clean document without any Studio bars or controls. Click the <strong>Recruiter Link</strong> button in the header or copy directly below:
              </p>
              <button class="callout-btn" onclick={copyRecruiterUrl}>
                {recruiterFeedback ? '✓ Recruiter Link Copied!' : 'Copy Clean Recruiter Link'}
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- TAB 6: RESUME AUDIT & ATS READINESS -->
      {#if activeTab === 'audit'}
        <div class="section-group">
          <div class="group-header-flex">
            <h3 class="group-title">Resume & ATS Audit</h3>
            <span class="audit-grade-pill" style="border-color: {auditReport.gradeColor}40; color: {auditReport.gradeColor}">
              {auditReport.grade}
            </span>
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
                  {auditReport.stats.passed} passed · {auditReport.stats.warnings} suggestion{auditReport.stats.warnings === 1 ? '' : 's'}{#if auditReport.stats.info} · {auditReport.stats.info} tip{/if}
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
            <h4 class="audit-subheading">Audit Checklist ({auditReport.checks.length} Rules)</h4>

            <div class="audit-items-list">
              {#each auditReport.checks as check}
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
            <div class="group-header-flex">
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
      {/if}

    </div>

    <!-- Drawer Footer Actions -->
    <div class="drawer-footer">
      <button class="footer-btn reset-btn" onclick={handleResetAll}>Reset All Settings</button>
      <button class="footer-btn close-action-btn" onclick={() => isOpen = false}>Done</button>
    </div>
  </aside>
{/if}

<style>
  /* ==========================================================================
     FLOATING TRIGGER BAR
     ========================================================================== */
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
    border: 1px solid #e4e4e7;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    user-select: none;
    transition: all 0.2s ease;
  }

  .mode-dark .floating-bar,
  :global(body.app-dark) .floating-bar {
    background: #181a20;
    border-color: #27272a;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding-left: 0.4rem;
  }

  .bar-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.6px;
    color: #71717a;
  }

  .mode-dark .bar-label,
  :global(body.app-dark) .bar-label {
    color: #a1a1aa;
  }

  .bar-select {
    appearance: none;
    -webkit-appearance: none;
    background-color: transparent;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.4rem center;
    background-size: 0.55rem auto;
    border: none;
    border-radius: 6px;
    padding: 0.25rem 1.4rem 0.25rem 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #18181b;
    cursor: pointer;
    outline: none;
    transition: background 0.15s;
  }
  .bar-select:hover { background-color: #f4f4f5; }

  .mode-dark .bar-select,
  :global(body.app-dark) .bar-select {
    color: #f4f4f5;
  }
  .mode-dark .bar-select:hover,
  :global(body.app-dark) .bar-select:hover {
    background-color: #27272a;
  }

  .bar-divider {
    width: 1px;
    height: 18px;
    background-color: #e4e4e7;
  }
  .mode-dark .bar-divider,
  :global(body.app-dark) .bar-divider {
    background-color: #27272a;
  }

  .bar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    font-size: 0.8rem;
    font-weight: 600;
    color: #3f3f46;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
  }
  .bar-btn:hover { background-color: #f4f4f5; color: #18181b; }
  .bar-btn.active { background-color: #18181b; color: #ffffff; }

  .mode-dark .bar-btn,
  :global(body.app-dark) .bar-btn {
    color: #d4d4d8;
  }
  .mode-dark .bar-btn:hover,
  :global(body.app-dark) .bar-btn:hover {
    background-color: #27272a;
    color: #f4f4f5;
  }
  .mode-dark .bar-btn.active,
  :global(body.app-dark) .bar-btn.active {
    background-color: #2563eb;
    color: #ffffff;
  }

  .mode-btn {
    padding: 0.35rem 0.5rem;
    color: #52525b;
  }
  .mode-dark .mode-btn,
  :global(body.app-dark) .mode-btn {
    color: #a1a1aa;
  }

  .print-btn {
    background-color: #fbfbfb;
    border: 1px solid #e4e4e7;
  }
  .print-btn:hover { background-color: #f4f4f5; }

  .mode-dark .print-btn,
  :global(body.app-dark) .print-btn {
    background-color: #1e2028;
    border-color: #27272a;
  }

  .bar-badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.55rem;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #065f46;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition: all 0.15s ease;
  }
  .bar-badge-pill:hover {
    background: #d1fae5;
  }
  .mode-dark .bar-badge-pill,
  :global(body.app-dark) .bar-badge-pill {
    background: #064e3b;
    border-color: #047857;
    color: #6ee7b7;
  }
  .mode-dark .bar-badge-pill:hover,
  :global(body.app-dark) .bar-badge-pill:hover {
    background: #065f46;
  }

  .gist-indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #10b981;
  }

  .guide-trigger-btn {
    padding: 0.25rem 0.35rem;
  }

  .help-keycap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #f4f4f5;
    border: 1px solid #d4d4d8;
    border-bottom: 2px solid #a1a1aa;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: #18181b;
    line-height: 1;
  }
  .mode-dark .help-keycap,
  :global(body.app-dark) .help-keycap {
    background: #27272a;
    border-color: #3f3f46;
    border-bottom-color: #52525b;
    color: #f4f4f5;
  }
  .help-keycap.small {
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
  }

  .active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #2563eb;
    margin-left: 2px;
  }

  .active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #2563eb;
    margin-left: 2px;
  }

  /* ==========================================================================
     DRAWER OVERLAY & HIGH CONTRAST DARK STYLING
     ========================================================================== */
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 9995;
    animation: fadeIn 0.2s ease;
  }

  .drawer-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 440px;
    max-width: 90vw;
    background: #ffffff;
    color: #0f172a;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .mode-dark.drawer-panel,
  :global(body.app-dark) .drawer-panel {
    background: #0f172a;
    color: #f8fafc;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.7);
    border-left: 1px solid #334155;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideLeft {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }
  .mode-dark .drawer-header,
  :global(body.app-dark) .drawer-header {
    border-color: #334155;
    background-color: #0f172a;
  }

  .drawer-header-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .drawer-header-title h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    color: inherit;
  }

  .drawer-header-actions {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .header-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    font-size: 0.73rem;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  .header-action-btn:hover {
    background: #eff6ff;
    border-color: #93c5fd;
  }
  .mode-dark .header-action-btn,
  :global(body.app-dark) .header-action-btn {
    background: #1e293b;
    border-color: #334155;
    color: #38bdf8;
  }
  .mode-dark .header-action-btn:hover,
  :global(body.app-dark) .header-action-btn:hover {
    background: #172554;
    border-color: #38bdf8;
  }

  .recruiter-action-btn {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #16a34a;
  }
  .recruiter-action-btn:hover {
    background: #dcfce7;
    border-color: #86efac;
  }
  .mode-dark .recruiter-action-btn,
  :global(body.app-dark) .recruiter-action-btn {
    background: #064e3b;
    border-color: #047857;
    color: #4ade80;
  }
  .mode-dark .recruiter-action-btn:hover,
  :global(body.app-dark) .recruiter-action-btn:hover {
    background: #065f46;
    border-color: #34d399;
  }

  .header-guide-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid #cbd5e1;
    background: #f1f5f9;
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .header-guide-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
  .mode-dark .header-guide-btn,
  :global(body.app-dark) .header-guide-btn {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;
  }
  .mode-dark .header-guide-btn:hover,
  :global(body.app-dark) .header-guide-btn:hover {
    background: #334155;
    color: #ffffff;
  }

  .drawer-close-btn {
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: #64748b;
    cursor: pointer;
  }
  .drawer-close-btn:hover { background: #e2e8f0; color: #0f172a; }

  .mode-dark .drawer-close-btn,
  :global(body.app-dark) .drawer-close-btn {
    background: #1e293b;
    color: #cbd5e1;
  }
  .mode-dark .drawer-close-btn:hover,
  :global(body.app-dark) .drawer-close-btn:hover {
    background: #334155;
    color: #ffffff;
  }

  .drawer-tabs {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 0 0.5rem;
  }
  .mode-dark .drawer-tabs,
  :global(body.app-dark) .drawer-tabs {
    background: #090d16;
    border-color: #334155;
  }

  .tab-btn {
    flex: 1;
    padding: 0.75rem 0.4rem;
    border: none;
    background: transparent;
    font-size: 0.78rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    position: relative;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  .tab-btn:hover { color: #0f172a; }
  .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; background: #ffffff; }

  .mode-dark .tab-btn,
  :global(body.app-dark) .tab-btn {
    color: #94a3b8;
  }
  .mode-dark .tab-btn:hover,
  :global(body.app-dark) .tab-btn:hover {
    color: #f8fafc;
  }
  .mode-dark .tab-btn.active,
  :global(body.app-dark) .tab-btn.active {
    color: #38bdf8;
    border-bottom-color: #38bdf8;
    background: #0f172a;
    font-weight: 700;
  }

  .tab-indicator {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #2563eb;
    position: absolute;
    top: 6px;
    right: 8px;
  }
  .tab-indicator.gist-active {
    background-color: #10b981;
  }
  .mode-dark .tab-indicator,
  :global(body.app-dark) .tab-indicator {
    background-color: #38bdf8;
  }
  .mode-dark .tab-indicator.gist-active,
  :global(body.app-dark) .tab-indicator.gist-active {
    background-color: #34d399;
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .section-group {
    margin-bottom: 1.5rem;
  }

  .group-header-flex {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .group-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0 0 0.4rem 0;
    color: #0f172a;
  }
  .mode-dark .group-title,
  :global(body.app-dark) .group-title {
    color: #f8fafc;
  }

  .group-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0.2rem 0 1rem 0;
    line-height: 1.4;
  }
  .mode-dark .group-desc,
  :global(body.app-dark) .group-desc {
    color: #cbd5e1;
  }

  .text-btn {
    background: none;
    border: none;
    font-size: 0.78rem;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    padding: 0;
  }
  .text-btn:hover { text-decoration: underline; }
  .mode-dark .text-btn,
  :global(body.app-dark) .text-btn {
    color: #38bdf8;
  }

  /* Theme Grid */
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .theme-card {
    text-align: left;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .theme-card:hover { border-color: #94a3b8; transform: translateY(-1px); }
  .theme-card.active { border-color: #2563eb; background: #eff6ff; }

  .mode-dark .theme-card,
  :global(body.app-dark) .theme-card {
    background: #1e293b;
    border-color: #334155;
  }
  .mode-dark .theme-card:hover,
  :global(body.app-dark) .theme-card:hover {
    border-color: #64748b;
    background: #273549;
  }
  .mode-dark .theme-card.active,
  :global(body.app-dark) .theme-card.active {
    background: #172554;
    border-color: #38bdf8;
  }

  .theme-card-name {
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
    color: inherit;
  }
  .mode-dark .theme-card-name,
  :global(body.app-dark) .theme-card-name {
    color: #f8fafc;
  }

  .theme-card-badge {
    font-size: 0.68rem;
    font-family: monospace;
    color: #64748b;
  }
  .mode-dark .theme-card-badge,
  :global(body.app-dark) .theme-card-badge {
    color: #94a3b8;
  }

  /* Color Preset Grid */
  .palette-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .color-preset-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.65rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
  }
  .color-preset-btn:hover { border-color: #94a3b8; }
  .color-preset-btn.selected { border-color: #2563eb; background: #f0f7ff; }

  .mode-dark .color-preset-btn,
  :global(body.app-dark) .color-preset-btn {
    background: #1e293b;
    border-color: #334155;
    color: #f8fafc;
  }
  .mode-dark .color-preset-btn:hover,
  :global(body.app-dark) .color-preset-btn:hover {
    background: #273549;
    border-color: #64748b;
  }
  .mode-dark .color-preset-btn.selected,
  :global(body.app-dark) .color-preset-btn.selected {
    background: #172554;
    border-color: #38bdf8;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(0, 0, 0, 0.15);
  }

  .default-swatch {
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #475569;
  }
  .mode-dark .default-swatch,
  :global(body.app-dark) .default-swatch {
    background: #334155;
    color: #f8fafc;
  }

  .color-meta {
    display: flex;
    flex-direction: column;
  }

  .color-title { font-size: 0.8rem; font-weight: 700; color: inherit; }
  .color-sub { font-size: 0.7rem; color: #64748b; }
  .mode-dark .color-sub,
  :global(body.app-dark) .color-sub { color: #94a3b8; }

  .custom-color-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
  }
  .mode-dark .custom-color-row,
  :global(body.app-dark) .custom-color-row { border-color: #334155; }

  .custom-color-label { font-size: 0.82rem; font-weight: 600; color: inherit; }
  .color-input-wrapper { display: flex; align-items: center; gap: 0.4rem; }

  .native-color-picker {
    appearance: none;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    padding: 0;
    cursor: pointer;
    background: none;
  }

  .hex-text-input {
    width: 85px;
    padding: 0.4rem 0.6rem;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: monospace;
    text-transform: uppercase;
    background: transparent;
    color: inherit;
  }
  .mode-dark .hex-text-input,
  :global(body.app-dark) .hex-text-input { 
    border-color: #475569; 
    color: #f8fafc; 
    background: #1e293b;
  }

  /* Theme Indicator Banner */
  .layout-theme-indicator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0.85rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
  .mode-dark .layout-theme-indicator,
  :global(body.app-dark) .layout-theme-indicator {
    background: #1e293b;
    border-color: #334155;
  }

  .layout-theme-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
  }
  .layout-theme-label { color: #64748b; }
  .mode-dark .layout-theme-label,
  :global(body.app-dark) .layout-theme-label { color: #94a3b8; }
  .layout-theme-name { color: #0f172a; }
  .mode-dark .layout-theme-name,
  :global(body.app-dark) .layout-theme-name { color: #f8fafc; }

  .layout-custom-badge {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.2rem 0.5rem;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 20px;
  }
  .mode-dark .layout-custom-badge,
  :global(body.app-dark) .layout-custom-badge {
    background: #1e3a8a;
    color: #93c5fd;
  }

  .layout-default-badge {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.2rem 0.5rem;
    background: #e2e8f0;
    color: #475569;
    border-radius: 20px;
  }
  .mode-dark .layout-default-badge,
  :global(body.app-dark) .layout-default-badge {
    background: #334155;
    color: #cbd5e1;
  }

  /* Visual Column Manager */
  .columns-manager {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .col-box {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    overflow: hidden;
    transition: all 0.2s;
  }
  .col-box.drop-active {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
  .mode-dark .col-box,
  :global(body.app-dark) .col-box {
    background: #090d16;
    border-color: #334155;
  }
  .mode-dark .col-box.drop-active,
  :global(body.app-dark) .col-box.drop-active {
    border-color: #38bdf8;
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
  }

  .col-box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.9rem;
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
  }
  .mode-dark .col-box-header,
  :global(body.app-dark) .col-box-header {
    background: #1e293b;
    border-color: #334155;
  }

  .col-badge {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #1e293b;
  }
  .mode-dark .col-badge,
  :global(body.app-dark) .col-badge { color: #f8fafc; }

  .sidebar-badge { color: #475569; }
  .mode-dark .sidebar-badge,
  :global(body.app-dark) .sidebar-badge { color: #cbd5e1; }
  .col-count { font-size: 0.72rem; color: #64748b; }
  .mode-dark .col-count,
  :global(body.app-dark) .col-count { color: #94a3b8; }

  .section-list {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-height: 50px;
  }

  .empty-col-msg {
    padding: 1rem;
    text-align: center;
    font-size: 0.78rem;
    color: #94a3b8;
    font-style: italic;
  }

  .section-item-card {
    display: flex;
    align-items: center;
    padding: 0.55rem 0.75rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    gap: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    cursor: grab;
    transition: all 0.15s ease;
  }
  .section-item-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }
  .section-item-card.dragging {
    opacity: 0.4;
    cursor: grabbing;
    background: #eff6ff;
  }
  .section-item-card.drag-over {
    border-top: 2px solid #2563eb;
  }

  .mode-dark .section-item-card,
  :global(body.app-dark) .section-item-card {
    background: #1e293b;
    border-color: #334155;
    color: #f8fafc;
  }
  .mode-dark .section-item-card:hover,
  :global(body.app-dark) .section-item-card:hover {
    border-color: #64748b;
    background: #273549;
  }
  .mode-dark .section-item-card.dragging,
  :global(body.app-dark) .section-item-card.dragging {
    background: #172554;
  }
  .mode-dark .section-item-card.drag-over,
  :global(body.app-dark) .section-item-card.drag-over {
    border-top: 2px solid #38bdf8;
  }

  .item-drag-handle {
    color: #94a3b8;
    font-size: 0.85rem;
    cursor: grab;
    user-select: none;
  }
  .mode-dark .item-drag-handle,
  :global(body.app-dark) .item-drag-handle {
    color: #64748b;
  }

  .item-name {
    flex: 1;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: inherit;
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .icon-btn {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    border-radius: 4px;
    padding: 0.2rem 0.35rem;
    font-size: 0.7rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
  }
  .icon-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
  .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .mode-dark .icon-btn,
  :global(body.app-dark) .icon-btn {
    background: #0f172a;
    border-color: #334155;
    color: #cbd5e1;
  }
  .mode-dark .icon-btn:hover:not(:disabled),
  :global(body.app-dark) .icon-btn:hover:not(:disabled) {
    background: #334155;
    color: #ffffff;
  }

  .transfer-btn { color: #2563eb; font-weight: 700; }
  .mode-dark .transfer-btn,
  :global(body.app-dark) .transfer-btn { color: #38bdf8; }
  .remove-btn { color: #ef4444; }
  .mode-dark .remove-btn,
  :global(body.app-dark) .remove-btn { color: #f87171; }

  /* Hidden Tray */
  .hidden-tray {
    padding: 0.75rem;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    background: #fafafa;
  }
  .mode-dark .hidden-tray,
  :global(body.app-dark) .hidden-tray {
    background: #090d16;
    border-color: #334155;
  }

  .hidden-tray-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #64748b;
    display: block;
    margin-bottom: 0.5rem;
  }
  .mode-dark .hidden-tray-title,
  :global(body.app-dark) .hidden-tray-title {
    color: #cbd5e1;
  }

  .hidden-chips {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .hidden-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.6rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #475569;
  }
  .mode-dark .hidden-chip,
  :global(body.app-dark) .hidden-chip {
    background: #1e293b;
    border-color: #334155;
    color: #f8fafc;
  }

  .hidden-chip-actions {
    display: flex;
    gap: 0.3rem;
  }

  .chip-add-btn {
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    border-radius: 4px;
    padding: 0.15rem 0.45rem;
    font-size: 0.68rem;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
  }
  .chip-add-btn:hover { background: #eff6ff; border-color: #93c5fd; }
  .mode-dark .chip-add-btn,
  :global(body.app-dark) .chip-add-btn {
    background: #0f172a;
    border-color: #475569;
    color: #38bdf8;
  }
  .mode-dark .chip-add-btn:hover,
  :global(body.app-dark) .chip-add-btn:hover {
    background: #172554;
    border-color: #38bdf8;
  }

  /* Mode Cards Grid */
  .mode-options-grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .mode-card {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.85rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }
  .mode-card:hover { border-color: #94a3b8; }
  .mode-card.selected { border-color: #2563eb; background: #eff6ff; }

  .mode-dark .mode-card,
  :global(body.app-dark) .mode-card {
    background: #1e293b;
    border-color: #334155;
    color: #f8fafc;
  }
  .mode-dark .mode-card:hover,
  :global(body.app-dark) .mode-card:hover {
    background: #273549;
    border-color: #64748b;
  }
  .mode-dark .mode-card.selected,
  :global(body.app-dark) .mode-card.selected {
    background: #172554;
    border-color: #38bdf8;
  }

  .mode-card-icon { font-size: 1.3rem; }
  .mode-card-text { display: flex; flex-direction: column; gap: 0.15rem; }
  .mode-card-title { font-size: 0.88rem; font-weight: 700; color: inherit; }
  .mode-card-desc { font-size: 0.75rem; color: #64748b; }
  .mode-dark .mode-card-desc,
  :global(body.app-dark) .mode-card-desc { color: #94a3b8; }

  /* ==========================================================================
     SOURCE & GIST STYLES
     ========================================================================== */
  .source-status-card {
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 1.25rem;
    background: #f8fafc;
  }
  .source-status-card.is-gist {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }
  .mode-dark .source-status-card,
  :global(body.app-dark) .source-status-card {
    background: #1e293b;
    border-color: #334155;
  }
  .mode-dark .source-status-card.is-gist,
  :global(body.app-dark) .source-status-card.is-gist {
    background: #062f22;
    border-color: #047857;
  }

  .source-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .source-status-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: #0f172a;
  }
  .is-gist .source-status-badge { color: #166534; }
  .mode-dark .source-status-badge,
  :global(body.app-dark) .source-status-badge { color: #f8fafc; }
  .mode-dark .is-gist .source-status-badge,
  :global(body.app-dark) .is-gist .source-status-badge { color: #86efac; }

  .source-external-link {
    font-size: 0.72rem;
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }
  .source-external-link:hover { text-decoration: underline; }
  .mode-dark .source-external-link,
  :global(body.app-dark) .source-external-link { color: #38bdf8; }

  .source-id-display {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
  }
  .source-id-label { color: #64748b; }
  .mode-dark .source-id-label,
  :global(body.app-dark) .source-id-label { color: #94a3b8; }
  .source-id-val {
    background: #e2e8f0;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.75rem;
    color: #0f172a;
  }
  .mode-dark .source-id-val,
  :global(body.app-dark) .source-id-val {
    background: #0f172a;
    color: #38bdf8;
  }

  .source-demo-desc {
    margin: 0;
    font-size: 0.78rem;
    color: #64748b;
  }
  .mode-dark .source-demo-desc,
  :global(body.app-dark) .source-demo-desc { color: #94a3b8; }
  .source-demo-desc code {
    background: #e2e8f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.72rem;
  }
  .mode-dark .source-demo-desc code,
  :global(body.app-dark) .source-demo-desc code {
    background: #0f172a;
    color: #38bdf8;
  }

  .gist-input-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
  }

  .input-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: inherit;
  }

  .gist-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .gist-text-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    font-size: 0.8rem;
    background: #ffffff;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s;
  }
  .gist-text-input:focus { border-color: #2563eb; }
  .mode-dark .gist-text-input,
  :global(body.app-dark) .gist-text-input {
    background: #1e293b;
    border-color: #334155;
    color: #f8fafc;
  }
  .mode-dark .gist-text-input:focus,
  :global(body.app-dark) .gist-text-input:focus { border-color: #38bdf8; }

  .gist-load-btn {
    padding: 0.5rem 0.9rem;
    background: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .gist-load-btn:hover { background: #1d4ed8; }

  .reset-to-demo-btn {
    align-self: flex-start;
    margin-top: 0.35rem;
    padding: 0.35rem 0.65rem;
    background: transparent;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    color: #64748b;
    font-size: 0.73rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .reset-to-demo-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #94a3b8;
  }
  .mode-dark .reset-to-demo-btn,
  :global(body.app-dark) .reset-to-demo-btn {
    border-color: #334155;
    color: #94a3b8;
  }
  .mode-dark .reset-to-demo-btn:hover,
  :global(body.app-dark) .reset-to-demo-btn:hover {
    background: #1e293b;
    color: #f8fafc;
  }

  .gist-error-msg {
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: 0.2rem;
  }

  .gist-instructions-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.85rem 1rem;
    font-size: 0.75rem;
  }
  .mode-dark .gist-instructions-box,
  :global(body.app-dark) .gist-instructions-box {
    background: #1e293b;
    border-color: #334155;
  }
  .instructions-title {
    margin: 0 0 0.5rem 0;
    font-size: 0.78rem;
    font-weight: 700;
    color: inherit;
  }
  .instructions-list {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    color: #64748b;
  }
  .mode-dark .instructions-list,
  :global(body.app-dark) .instructions-list { color: #94a3b8; }
  .instructions-list a {
    color: #2563eb;
    text-decoration: underline;
  }
  .mode-dark .instructions-list a,
  :global(body.app-dark) .instructions-list a { color: #38bdf8; }

  /* ==========================================================================
     CONFIG & EXPORT TAB STYLES
     ========================================================================== */
  .format-toggle {
    display: inline-flex;
    background: #e2e8f0;
    border-radius: 6px;
    padding: 2px;
  }
  .mode-dark .format-toggle,
  :global(body.app-dark) .format-toggle {
    background: #1e293b;
  }

  .format-btn {
    padding: 0.2rem 0.55rem;
    border: none;
    background: transparent;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
  }
  .format-btn.active {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .mode-dark .format-btn,
  :global(body.app-dark) .format-btn { color: #94a3b8; }
  .mode-dark .format-btn.active,
  :global(body.app-dark) .format-btn.active {
    background: #0f172a;
    color: #38bdf8;
  }

  .config-snippet-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1rem;
    background: #090d16;
  }
  .mode-dark .config-snippet-card,
  :global(body.app-dark) .config-snippet-card {
    border-color: #334155;
  }

  .snippet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.85rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .mode-dark .snippet-header,
  :global(body.app-dark) .snippet-header {
    background: #1e293b;
    border-color: #334155;
  }

  .snippet-title-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.76rem;
    color: inherit;
    flex-wrap: wrap;
  }

  .snippet-badge {
    padding: 0.15rem 0.4rem;
    background: #e2e8f0;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #475569;
  }
  .mode-dark .snippet-badge,
  :global(body.app-dark) .snippet-badge {
    background: #0f172a;
    color: #94a3b8;
  }

  .snippet-sub {
    font-size: 0.7rem;
    color: #64748b;
  }
  .mode-dark .snippet-sub,
  :global(body.app-dark) .snippet-sub { color: #94a3b8; }

  .snippet-copy-btn {
    padding: 0.2rem 0.6rem;
    font-size: 0.72rem;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    cursor: pointer;
  }
  .snippet-copy-btn:hover { background: #f1f5f9; }
  .mode-dark .snippet-copy-btn,
  :global(body.app-dark) .snippet-copy-btn {
    background: #0f172a;
    border-color: #334155;
    color: #38bdf8;
  }

  .recruiter-share-callout {
    display: flex;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    margin-top: 1.25rem;
  }
  .mode-dark .recruiter-share-callout,
  :global(body.app-dark) .recruiter-share-callout {
    background: #052e16;
    border-color: #166534;
  }

  .callout-icon {
    font-size: 1.4rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .callout-body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .callout-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #166534;
  }
  .mode-dark .callout-title,
  :global(body.app-dark) .callout-title { color: #86efac; }

  .callout-desc {
    margin: 0;
    font-size: 0.74rem;
    line-height: 1.4;
    color: #15803d;
  }
  .mode-dark .callout-desc,
  :global(body.app-dark) .callout-desc { color: #a7f3d0; }

  .callout-btn {
    align-self: flex-start;
    margin-top: 0.25rem;
    padding: 0.35rem 0.75rem;
    background: #16a34a;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .callout-btn:hover { background: #15803d; }

  /* YAML Viewer */
  .yaml-viewer {
    background: #090d16;
    color: #38bdf8;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #1e293b;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    overflow-x: auto;
    margin: 0;
  }

  /* ==========================================================================
     RESUME AUDIT & ATS TAB STYLES
     ========================================================================== */
  .tab-score-badge {
    font-size: 0.62rem;
    font-weight: 700;
    color: #ffffff;
    padding: 0.1rem 0.35rem;
    border-radius: 10px;
    margin-left: 0.25rem;
    line-height: 1;
  }

  .audit-grade-pill {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: 20px;
    border: 1px solid currentColor;
    letter-spacing: 0.02em;
  }

  .audit-summary-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.15rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .mode-dark .audit-summary-card,
  :global(body.app-dark) .audit-summary-card {
    background: #181a20;
    border-color: #27272a;
  }

  .audit-score-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .audit-score-val {
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
  }
  .score-max {
    font-size: 1rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .audit-score-meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .audit-score-status {
    font-size: 0.88rem;
    font-weight: 700;
    color: inherit;
  }

  .audit-score-stats {
    font-size: 0.74rem;
    color: #64748b;
  }
  .mode-dark .audit-score-stats,
  :global(body.app-dark) .audit-score-stats { color: #94a3b8; }

  .audit-progress-track {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }
  .mode-dark .audit-progress-track,
  :global(body.app-dark) .audit-progress-track {
    background: #27272a;
  }

  .audit-progress-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .audit-checklist-section {
    margin-bottom: 1.5rem;
  }

  .audit-subheading {
    margin: 0 0 0.75rem 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: inherit;
    letter-spacing: -0.01em;
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
  .mode-dark .audit-item,
  :global(body.app-dark) .audit-item {
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
    color: inherit;
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
  .mode-dark .audit-category-tag,
  :global(body.app-dark) .audit-category-tag {
    background: #27272a;
    color: #94a3b8;
  }

  .audit-item-msg {
    margin: 0;
    font-size: 0.74rem;
    line-height: 1.4;
    color: #64748b;
  }
  .mode-dark .audit-item-msg,
  :global(body.app-dark) .audit-item-msg { color: #a1a1aa; }

  .ats-preview-section {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e2e8f0;
  }
  .mode-dark .ats-preview-section,
  :global(body.app-dark) .ats-preview-section {
    border-color: #27272a;
  }

  .ats-text-viewer {
    max-height: 240px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    color: #e2e8f0;
  }

  /* Drawer Footer */
  .drawer-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }
  .mode-dark .drawer-footer,
  :global(body.app-dark) .drawer-footer {
    background: #090d16;
    border-color: #334155;
  }

  .footer-btn {
    padding: 0.5rem 1.1rem;
    border-radius: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reset-btn {
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #64748b;
  }
  .reset-btn:hover { background: #f1f5f9; color: #0f172a; }
  .mode-dark .reset-btn,
  :global(body.app-dark) .reset-btn {
    border-color: #334155;
    color: #cbd5e1;
  }
  .mode-dark .reset-btn:hover,
  :global(body.app-dark) .reset-btn:hover {
    background: #1e293b;
    color: #f8fafc;
  }

  .close-action-btn {
    background: #0f172a;
    border: 1px solid #0f172a;
    color: #ffffff;
  }
  .close-action-btn:hover { background: #1e293b; }
  .mode-dark .close-action-btn,
  :global(body.app-dark) .close-action-btn {
    background: #2563eb;
    border-color: #2563eb;
  }
  .mode-dark .close-action-btn:hover,
  :global(body.app-dark) .close-action-btn:hover {
    background: #1d4ed8;
  }

  /* Hide completely in Print / PDF mode */
  @media print {
    .floating-controls-wrapper,
    .drawer-backdrop,
    .drawer-panel {
      display: none !important;
    }
  }
</style>
