<script>
  import { onMount } from 'svelte';

  let {
    themes = [],
    activeTheme = $bindable(''),
    currentTheme = 'classic'
  } = $props();

  // Helper function to format 'elegant-split' into 'Elegant Split'
  function formatName(slug) {
    if (!slug) return '';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // 1. Read from localStorage when the component mounts in the browser
  onMount(() => {
    const storedTheme = localStorage.getItem('resume-active-theme');
    if (storedTheme && themes.includes(storedTheme)) {
      activeTheme = storedTheme;
    }
  });

  // 2. Save to localStorage whenever activeTheme changes
  $effect(() => {
    if (typeof window !== 'undefined' && activeTheme) {
      localStorage.setItem('resume-active-theme', activeTheme);
    }
  });
</script>

<div class="theme-switcher-wrapper">
  <div class="theme-switcher">
    <span class="switcher-label">STYLE</span>
    
    <select 
      class="switcher-select" 
      value={activeTheme || currentTheme} 
      onchange={(e) => activeTheme = e.currentTarget.value} 
      title="Select a resume theme"
    >
      {#each themes as theme}
        <option value={theme}>
          {formatName(theme)}
        </option>
      {/each}
    </select>
  </div>
</div>

<style>
  .theme-switcher-wrapper {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
  }

  .theme-switcher {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem 0.4rem 1rem;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border-radius: 50px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    user-select: none;
  }

  .switcher-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: #9ca3af;
  }

  /* Custom styled select dropdown to maintain the glassmorphic aesthetic */
  .switcher-select {
    appearance: none;
    -webkit-appearance: none;
    background-color: transparent;
    /* Custom SVG chevron for the dropdown arrow */
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234b5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 0.65rem auto;
    border: none;
    border-radius: 50px;
    padding: 0.3rem 2rem 0.3rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
  }

  .switcher-select:hover {
    background-color: #f3f4f6;
  }

  .switcher-select:focus {
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }

  /* Prevent the dropdown from printing */
  @media print {
    .theme-switcher-wrapper {
      display: none !important;
    }
  }
</style>
