<script>
  export let themes = [];
  export let activeTheme = '';

  // Helper function to format 'elegant-split' into 'Elegant Split' for the tooltip
  function formatName(slug) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
</script>

<div class="theme-switcher-wrapper">
  <div class="theme-switcher">
    <span class="switcher-label">STYLE</span>
    {#each themes as theme, index}
      <button 
        class="switcher-btn" 
        class:active={activeTheme === theme} 
        on:click={() => activeTheme = theme}
        title={formatName(theme)} 
      >
        {index + 1}
      </button>
    {/each}
  </div>
</div>

<style>
  /* All your previous styles stay exactly the same */
  .theme-switcher-wrapper {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
  }

  .theme-switcher {
    display: flex;
    align-items: center;
    background: white;
    padding: 0.4rem 0.8rem;
    border-radius: 50px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border: 1px solid #e5e7eb;
    gap: 0.5rem;
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
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: #9ca3af;
    margin-right: 0.5rem;
  }

  .switcher-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
    padding: 0.3rem 0.6rem;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .switcher-btn:hover {
    background: #f3f4f6;
  }

  .switcher-btn.active {
    background: #111827;
    color: white;
  }

  @media print {
    .theme-switcher-wrapper {
      display: none !important;
    }
  }
</style>
