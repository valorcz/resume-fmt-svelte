<script>
  import { formatName, THEME_CATEGORIES, THEME_CATEGORY_MAP } from '../studioUtils.js';

  let {
    themes = [],
    activeTheme = $bindable('classic'),
    onSelectTheme = () => {}
  } = $props();

  let activeCategory = $state('all');
  let searchQuery = $state('');

  let filteredThemes = $derived.by(() => {
    return themes.filter(t => {
      // Category check
      if (activeCategory !== 'all') {
        const themeCat = THEME_CATEGORY_MAP[t] || 'modern';
        if (themeCat !== activeCategory) return false;
      }
      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const formatted = formatName(t).toLowerCase();
        if (!t.toLowerCase().includes(query) && !formatted.includes(query)) {
          return false;
        }
      }
      return true;
    });
  });
</script>

<div class="section-group">
  <div class="header-flex">
    <h3 class="group-title">Theme Presets</h3>
    <span class="count-badge">{filteredThemes.length} of {themes.length}</span>
  </div>
  <p class="group-desc">
    Select a base typographic, layout, and visual archetype.
  </p>

  <!-- Category Filter Chips -->
  <div class="category-chips">
    {#each THEME_CATEGORIES as cat}
      <button 
        class="chip-btn" 
        class:active={activeCategory === cat.id}
        onclick={() => activeCategory = cat.id}
      >
        {cat.label}
      </button>
    {/each}
  </div>

  <!-- Search Filter -->
  <div class="search-box">
    <input 
      type="text" 
      class="search-input" 
      placeholder="Filter themes..." 
      bind:value={searchQuery}
    />
    {#if searchQuery}
      <button class="clear-search-btn" onclick={() => searchQuery = ''}>✕</button>
    {/if}
  </div>

  <!-- Theme Grid -->
  <div class="theme-grid">
    {#each filteredThemes as theme}
      <button 
        class="theme-card" 
        class:active={activeTheme === theme}
        onclick={() => onSelectTheme(theme)}
      >
        <div class="theme-card-header">
          <span class="theme-name">{formatName(theme)}</span>
          {#if activeTheme === theme}
            <span class="active-badge">Active</span>
          {/if}
        </div>
        <div class="theme-slug">{theme}</div>
      </button>
    {/each}
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

  .count-badge {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
  }
  :global(.mode-dark) .count-badge,
  :global(.is-dark) .count-badge {
    background: #27272a;
    color: #94a3b8;
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

  /* Category Filter Chips */
  .category-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 0.75rem;
  }

  .chip-btn {
    padding: 0.25rem 0.6rem;
    font-size: 0.72rem;
    font-weight: 600;
    font-family: inherit;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  :global(.mode-dark) .chip-btn,
  :global(.is-dark) .chip-btn {
    background: #181a20;
    border-color: #27272a;
    color: #cbd5e1;
  }

  .chip-btn:hover {
    border-color: #cbd5e1;
    color: #1e293b;
  }
  :global(.mode-dark) .chip-btn:hover,
  :global(.is-dark) .chip-btn:hover {
    border-color: #3f3f46;
    color: #ffffff;
  }

  .chip-btn.active {
    background: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
  }

  /* Search Box */
  .search-box {
    position: relative;
    margin-bottom: 1rem;
  }

  .search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.45rem 2rem 0.45rem 0.7rem;
    font-size: 0.78rem;
    font-family: inherit;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s;
  }
  .search-input::placeholder {
    color: #94a3b8;
  }
  :global(.mode-dark) .search-input,
  :global(.is-dark) .search-input {
    background: #181a20;
    border-color: #3f3f46;
    color: #ffffff;
  }
  :global(.mode-dark) .search-input::placeholder,
  :global(.is-dark) .search-input::placeholder {
    color: #71717a;
  }
  .search-input:focus {
    border-color: #2563eb;
  }

  .clear-search-btn {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.2rem;
  }
  :global(.mode-dark) .clear-search-btn,
  :global(.is-dark) .clear-search-btn {
    color: #cbd5e1;
  }

  /* Theme Grid */
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .theme-card {
    text-align: left;
    padding: 0.75rem 0.85rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: #1e293b;
    font-family: inherit;
  }
  :global(.mode-dark) .theme-card,
  :global(.is-dark) .theme-card {
    background: #181a20;
    border-color: #27272a;
    color: #f1f5f9;
  }

  .theme-card:hover {
    border-color: #93c5fd;
    background: #f8fafc;
  }
  :global(.mode-dark) .theme-card:hover,
  :global(.is-dark) .theme-card:hover {
    background: #20222a;
    border-color: #3b82f6;
  }

  .theme-card.active {
    border-color: #2563eb;
    background: #eff6ff;
  }
  :global(.mode-dark) .theme-card.active,
  :global(.is-dark) .theme-card.active {
    background: rgba(37, 99, 235, 0.18);
    border-color: #3b82f6;
  }

  .theme-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.35rem;
  }

  .theme-name {
    font-size: 0.82rem;
    font-weight: 700;
    color: #0f172a;
  }
  :global(.mode-dark) .theme-name,
  :global(.is-dark) .theme-name {
    color: #f8fafc;
  }
  .theme-card.active .theme-name {
    color: #2563eb;
  }
  :global(.mode-dark) .theme-card.active .theme-name,
  :global(.is-dark) .theme-card.active .theme-name {
    color: #ffffff;
  }

  .active-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    background: #2563eb;
    color: #ffffff;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    letter-spacing: 0.02em;
  }

  .theme-slug {
    font-size: 0.7rem;
    color: #64748b;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  :global(.mode-dark) .theme-slug,
  :global(.is-dark) .theme-slug {
    color: #94a3b8;
  }
  .theme-card.active .theme-slug {
    color: #3b82f6;
  }
  :global(.mode-dark) .theme-card.active .theme-slug,
  :global(.is-dark) .theme-card.active .theme-slug {
    color: #93c5fd;
  }
</style>
