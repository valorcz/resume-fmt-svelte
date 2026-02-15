<script>
  export let currentTheme;
  export let themes;
</script>

<nav class="app-theme-switcher no-print">
  <span class="switcher-label">STYLE</span>
  <div class="switcher-toggles">
    {#each themes as theme, index}
      <button 
        class="switcher-btn {currentTheme === theme.id ? 'active' : ''}" 
        on:click={() => currentTheme = theme.id}
        title={theme.name}
      >
        {theme.label}
      </button>
      {#if index < themes.length - 1}
        <span class="separator">|</span>
      {/if}
    {/each}
  </div>
</nav>

<style>
  /* Unified, app-driven style independent of the resume themes */
  .app-theme-switcher {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1.25rem;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border-radius: 50px; /* Pill shape */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    user-select: none;
    color: #333;
  }

  .switcher-label {
    font-weight: 700;
    font-size: 0.7rem;
    letter-spacing: 1px;
    color: #666;
  }

  .switcher-toggles {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .switcher-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.3rem 0.6rem;
    border-radius: 20px;
    color: #666;
    transition: all 0.2s ease;
  }

  .switcher-btn:hover { color: #000; background: rgba(0,0,0,0.05); }
  .switcher-btn.active { color: #fff; background: #0f172a; } /* Slate 900 active state */
  .separator { color: #ccc; font-size: 0.8rem; }
</style>