<script>
  import { formatName, ALL_SECTION_KEYS } from '../studioUtils.js';

  let {
    activeThemeConfig = {},
    customLayout = $bindable(null),
    onResetLayout = () => {}
  } = $props();

  // Active columns derived from customLayout or activeThemeConfig.layout
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
    return ALL_SECTION_KEYS.filter(k => !active.has(k));
  });

  function getSectionLabel(key) {
    const customTitle = activeThemeConfig?.i18n?.[key];
    if (customTitle) return `${customTitle} (${key})`;
    return formatName(key);
  }

  // Drag and Drop state
  let draggedItem = $state(null);
  let dropTarget = $state(null);

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

  function removeSection(fromCol, index) {
    const source = [...effectiveLayout[fromCol]];
    source.splice(index, 1);

    customLayout = {
      ...effectiveLayout,
      [fromCol]: source
    };
  }

  function addSection(key, targetCol = 'main') {
    const dest = [...effectiveLayout[targetCol], key];
    customLayout = {
      ...effectiveLayout,
      [targetCol]: dest
    };
  }

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

    if (sourceCol === 'main') {
      newMain.splice(sourceIndex, 1);
    } else {
      newSidebar.splice(sourceIndex, 1);
    }

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
</script>

<div class="section-group">
  <div class="header-flex">
    <h3 class="group-title">Section Layout & Columns</h3>
    {#if customLayout}
      <button class="reset-link" onclick={onResetLayout}>Reset Layout</button>
    {/if}
  </div>
  <p class="group-desc">
    Reorder sections, drag between columns, or hide unneeded sections.
  </p>

  <!-- MAIN COLUMN -->
  <div class="column-card">
    <div class="col-header">
      <span class="col-title">Main Content Column</span>
      <span class="col-count">{effectiveLayout.main.length}</span>
    </div>

    <div 
      class="dnd-dropzone"
      class:is-active-target={dropTarget?.col === 'main' && dropTarget?.index === null}
      ondragover={(e) => handleDragOver(e, 'main', null)}
      ondrop={(e) => handleDrop(e, 'main', null)}
      role="region"
      aria-label="Main content dropzone"
    >
      {#if effectiveLayout.main.length === 0}
        <div class="dropzone-empty">No sections in main column. Drag items here.</div>
      {:else}
        {#each effectiveLayout.main as item, idx (item)}
          <div 
            class="dnd-item"
            class:is-dragging={draggedItem?.key === item}
            draggable="true"
            ondragstart={(e) => handleDragStart(e, 'main', idx, item)}
            ondragover={(e) => { e.stopPropagation(); handleDragOver(e, 'main', idx); }}
            ondrop={(e) => { e.stopPropagation(); handleDrop(e, 'main', idx); }}
            ondragend={handleDragEnd}
            role="listitem"
          >
            <div class="dnd-drag-handle" title="Drag to reorder">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/>
                <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
                <circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/>
              </svg>
            </div>
            <span class="dnd-item-label">{getSectionLabel(item)}</span>

            <div class="dnd-actions">
              <button 
                class="icon-action-btn" 
                disabled={idx === 0} 
                onclick={() => moveSection('main', idx, -1)}
                title="Move up"
              >↑</button>
              <button 
                class="icon-action-btn" 
                disabled={idx === effectiveLayout.main.length - 1} 
                onclick={() => moveSection('main', idx, 1)}
                title="Move down"
              >↓</button>
              <button 
                class="icon-action-btn transfer-btn" 
                onclick={() => transferSection('main', 'sidebar', idx)}
                title="Move to Sidebar"
              >→</button>
              <button 
                class="icon-action-btn remove-btn" 
                onclick={() => removeSection('main', idx)}
                title="Hide Section"
              >✕</button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- SIDEBAR COLUMN -->
  <div class="column-card">
    <div class="col-header">
      <span class="col-title">Sidebar Column</span>
      <span class="col-count">{effectiveLayout.sidebar.length}</span>
    </div>

    <div 
      class="dnd-dropzone"
      class:is-active-target={dropTarget?.col === 'sidebar' && dropTarget?.index === null}
      ondragover={(e) => handleDragOver(e, 'sidebar', null)}
      ondrop={(e) => handleDrop(e, 'sidebar', null)}
      role="region"
      aria-label="Sidebar dropzone"
    >
      {#if effectiveLayout.sidebar.length === 0}
        <div class="dropzone-empty">No sections in sidebar (single column mode).</div>
      {:else}
        {#each effectiveLayout.sidebar as item, idx (item)}
          <div 
            class="dnd-item"
            class:is-dragging={draggedItem?.key === item}
            draggable="true"
            ondragstart={(e) => handleDragStart(e, 'sidebar', idx, item)}
            ondragover={(e) => { e.stopPropagation(); handleDragOver(e, 'sidebar', idx); }}
            ondrop={(e) => { e.stopPropagation(); handleDrop(e, 'sidebar', idx); }}
            ondragend={handleDragEnd}
            role="listitem"
          >
            <div class="dnd-drag-handle" title="Drag to reorder">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/>
                <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
                <circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/>
              </svg>
            </div>
            <span class="dnd-item-label">{getSectionLabel(item)}</span>

            <div class="dnd-actions">
              <button 
                class="icon-action-btn" 
                disabled={idx === 0} 
                onclick={() => moveSection('sidebar', idx, -1)}
                title="Move up"
              >↑</button>
              <button 
                class="icon-action-btn" 
                disabled={idx === effectiveLayout.sidebar.length - 1} 
                onclick={() => moveSection('sidebar', idx, 1)}
                title="Move down"
              >↓</button>
              <button 
                class="icon-action-btn transfer-btn" 
                onclick={() => transferSection('sidebar', 'main', idx)}
                title="Move to Main"
              >←</button>
              <button 
                class="icon-action-btn remove-btn" 
                onclick={() => removeSection('sidebar', idx)}
                title="Hide Section"
              >✕</button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- HIDDEN SECTIONS -->
  {#if hiddenSections.length > 0}
    <div class="hidden-sections-card">
      <div class="hidden-title">Hidden / Available Sections ({hiddenSections.length})</div>
      <div class="hidden-chips">
        {#each hiddenSections as item}
          <div class="hidden-chip">
            <span>{formatName(item)}</span>
            <div class="hidden-add-btns">
              <button class="add-btn" onclick={() => addSection(item, 'main')} title="Add to Main">+ Main</button>
              <button class="add-btn" onclick={() => addSection(item, 'sidebar')} title="Add to Sidebar">+ Side</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
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

  .reset-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.72rem;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    text-decoration: underline;
    font-family: inherit;
  }
  :global(.mode-dark) .reset-link,
  :global(.is-dark) .reset-link {
    color: #60a5fa;
  }

  .column-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  :global(.mode-dark) .column-card,
  :global(.is-dark) .column-card {
    background: #181a20;
    border-color: #27272a;
  }

  .col-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .col-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  :global(.mode-dark) .col-title,
  :global(.is-dark) .col-title {
    color: #f1f5f9;
  }

  .col-count {
    font-size: 0.7rem;
    font-weight: 600;
    background: #e2e8f0;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    color: #475569;
  }
  :global(.mode-dark) .col-count,
  :global(.is-dark) .col-count {
    background: #27272a;
    color: #94a3b8;
  }

  .dnd-dropzone {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-height: 48px;
    border-radius: 6px;
    transition: background 0.15s;
  }

  .dnd-dropzone.is-active-target {
    background: rgba(37, 99, 235, 0.05);
    outline: 2px dashed #3b82f6;
  }

  .dropzone-empty {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: center;
    padding: 1rem;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
  }
  :global(.mode-dark) .dropzone-empty,
  :global(.is-dark) .dropzone-empty {
    border-color: #3f3f46;
  }

  .dnd-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.6rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.78rem;
    cursor: grab;
    color: #1e293b;
    transition: all 0.15s ease;
  }
  :global(.mode-dark) .dnd-item,
  :global(.is-dark) .dnd-item {
    background: #20222a;
    border-color: #2e3039;
    color: #f1f5f9;
  }

  .dnd-item.is-dragging {
    opacity: 0.4;
    border: 1px dashed #2563eb;
  }

  .dnd-drag-handle {
    color: #94a3b8;
    cursor: grab;
    display: flex;
    align-items: center;
  }

  .dnd-item-label {
    flex: 1;
    font-weight: 600;
    color: #0f172a;
  }
  :global(.mode-dark) .dnd-item-label,
  :global(.is-dark) .dnd-item-label {
    color: #f8fafc;
  }

  .dnd-actions {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .icon-action-btn {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 0.7rem;
    font-family: inherit;
    color: #475569;
    cursor: pointer;
    transition: all 0.1s;
    padding: 0;
  }
  :global(.mode-dark) .icon-action-btn,
  :global(.is-dark) .icon-action-btn {
    background: #27272a;
    border-color: #3f3f46;
    color: #cbd5e1;
  }

  .icon-action-btn:hover:not(:disabled) {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
  }

  .icon-action-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .transfer-btn:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
    color: #ffffff;
  }

  .remove-btn:hover:not(:disabled) {
    background: #ef4444;
    border-color: #ef4444;
    color: #ffffff;
  }

  /* Hidden Sections */
  .hidden-sections-card {
    background: #f1f5f9;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    padding: 0.75rem;
  }
  :global(.mode-dark) .hidden-sections-card,
  :global(.is-dark) .hidden-sections-card {
    background: #181a20;
    border-color: #3f3f46;
  }

  .hidden-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }
  :global(.mode-dark) .hidden-title,
  :global(.is-dark) .hidden-title {
    color: #94a3b8;
  }

  .hidden-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .hidden-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #1e293b;
  }
  :global(.mode-dark) .hidden-chip,
  :global(.is-dark) .hidden-chip {
    background: #20222a;
    border-color: #2e3039;
    color: #f1f5f9;
  }

  .hidden-add-btns {
    display: flex;
    gap: 0.2rem;
  }

  .add-btn {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #2563eb;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
  }
  :global(.mode-dark) .add-btn,
  :global(.is-dark) .add-btn {
    background: rgba(37, 99, 235, 0.2);
    border-color: #3b82f6;
    color: #93c5fd;
  }
  .add-btn:hover {
    background: #2563eb;
    color: #ffffff;
  }
</style>
