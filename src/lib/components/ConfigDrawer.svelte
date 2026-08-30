<script>
  import { onMount } from 'svelte';

  let {
    themes = [],
    activeTheme = $bindable('classic'),
    activeThemeConfig = {},
    customAccent = $bindable(null),
    customLayout = $bindable(null),
    colorMode = $bindable('system'),
    onResetLayout = () => {},
    onResetAll = () => {}
  } = $props();

  let isOpen = $state(false);
  let activeTab = $state('theme'); // 'theme' | 'colors' | 'layout' | 'mode' | 'yaml'
  let customColorInput = $state('#2563eb');
  let copyFeedback = $state(false);

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

  // 5. Generate config.yaml live text for active theme
  let yamlOutput = $derived.by(() => {
    let lines = [`theme: ${activeTheme}`, 'layout:'];
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

  function copyYaml() {
    navigator.clipboard.writeText(yamlOutput).then(() => {
      copyFeedback = true;
      setTimeout(() => copyFeedback = false, 2000);
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

  let shareFeedback = $state(false);

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

    <!-- Mode Cycle Button (Icon Only) -->
    <button 
      class="bar-btn mode-btn" 
      onclick={cycleColorMode} 
      title="Appearance: {colorMode.toUpperCase()} (Click to toggle)"
      aria-label="Toggle Color Mode"
    >
      {#if colorMode === 'dark'}
        <span class="mode-icon">🌙</span>
      {:else if colorMode === 'light'}
        <span class="mode-icon">☀️</span>
      {:else}
        <span class="mode-icon">💻</span>
      {/if}
    </button>

    <div class="bar-divider"></div>

    <!-- Customize Drawer Trigger Button -->
    <button 
      class="bar-btn" 
      class:active={isOpen}
      onclick={() => isOpen = !isOpen} 
      title="Customize Colors & Layout"
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
        <button class="header-share-btn" onclick={copyShareUrl} title="Copy Shareable URL with current configuration">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>{shareFeedback ? '✓ Copied' : 'Share'}</span>
        </button>
        <button class="drawer-close-btn" onclick={() => isOpen = false} aria-label="Close Panel">✕</button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="drawer-tabs">
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
      <button class="tab-btn" class:active={activeTab === 'yaml'} onclick={() => activeTab = 'yaml'}>YAML</button>
    </nav>

    <!-- Tab Content Area -->
    <div class="drawer-body">
      
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

      <!-- TAB 5: LIVE YAML OUTPUT -->
      {#if activeTab === 'yaml'}
        <div class="section-group">
          <div class="group-header-flex">
            <h3 class="group-title">Generated config.yaml ({formatName(activeTheme)})</h3>
            <button class="text-btn" onclick={copyYaml}>
              {copyFeedback ? '✓ Copied!' : 'Copy YAML'}
            </button>
          </div>
          <p class="group-desc">This configuration is generated in real-time for <strong>{formatName(activeTheme)}</strong>.</p>
          <pre class="yaml-viewer"><code>{yamlOutput}</code></pre>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .floating-bar {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.5rem;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: 50px;
    user-select: none;
    transition: all 0.2s ease;
  }

  .mode-dark .floating-bar,
  :global(body.app-dark) .floating-bar {
    background: rgba(15, 23, 42, 0.92);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .bar-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding-left: 0.6rem;
  }

  .bar-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.8px;
    color: #64748b;
  }

  .mode-dark .bar-label,
  :global(body.app-dark) .bar-label {
    color: #94a3b8;
  }

  .bar-select {
    appearance: none;
    -webkit-appearance: none;
    background-color: transparent;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.4rem center;
    background-size: 0.6rem auto;
    border: none;
    border-radius: 30px;
    padding: 0.25rem 1.6rem 0.25rem 0.5rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    outline: none;
    transition: background 0.15s;
  }
  .bar-select:hover { background-color: #f1f5f9; }

  .mode-dark .bar-select,
  :global(body.app-dark) .bar-select {
    color: #f8fafc;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
  }
  .mode-dark .bar-select:hover,
  :global(body.app-dark) .bar-select:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .bar-divider {
    width: 1px;
    height: 18px;
    background-color: #e2e8f0;
  }
  .mode-dark .bar-divider,
  :global(body.app-dark) .bar-divider {
    background-color: rgba(255, 255, 255, 0.18);
  }

  .bar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: 30px;
    border: 1px solid transparent;
    background: transparent;
    font-size: 0.8rem;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }
  .bar-btn:hover { background-color: #f1f5f9; color: #0f172a; }
  .bar-btn.active { background-color: #0f172a; color: #ffffff; }

  .mode-dark .bar-btn,
  :global(body.app-dark) .bar-btn {
    color: #e2e8f0;
  }
  .mode-dark .bar-btn:hover,
  :global(body.app-dark) .bar-btn:hover {
    background-color: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }
  .mode-dark .bar-btn.active,
  :global(body.app-dark) .bar-btn.active {
    background-color: #2563eb;
    color: #ffffff;
  }

  .mode-btn {
    padding: 0.35rem 0.55rem;
  }
  .mode-icon { font-size: 0.95rem; line-height: 1; }

  .print-btn {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  .print-btn:hover { background-color: #e2e8f0; }

  .mode-dark .print-btn,
  :global(body.app-dark) .print-btn {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    gap: 0.5rem;
  }

  .header-share-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .header-share-btn:hover {
    background: #eff6ff;
    border-color: #93c5fd;
  }
  .mode-dark .header-share-btn,
  :global(body.app-dark) .header-share-btn {
    background: #1e293b;
    border-color: #334155;
    color: #38bdf8;
  }
  .mode-dark .header-share-btn:hover,
  :global(body.app-dark) .header-share-btn:hover {
    background: #172554;
    border-color: #38bdf8;
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
  .mode-dark .tab-indicator,
  :global(body.app-dark) .tab-indicator {
    background-color: #38bdf8;
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
