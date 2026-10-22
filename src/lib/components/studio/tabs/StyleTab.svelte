<script>
  import AccentTab from './AccentTab.svelte';
  import ThemesTab from './ThemesTab.svelte';

  let {
    themes = [],
    activeTheme = $bindable('classic'),
    customAccent = $bindable(null),
    onSelectTheme = () => {},
    onResetAccent = () => {}
  } = $props();
</script>

<div class="style-tab-container">
  <!-- Accent Color Section -->
  <AccentTab bind:customAccent {onResetAccent} />

  <div class="tab-divider"></div>

  <!-- Theme Archetypes Section -->
  <ThemesTab {themes} bind:activeTheme {onSelectTheme} />
</div>

<style>
  .style-tab-container {
    display: flex;
    flex-direction: column;
  }

  .tab-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0.5rem 0 1.5rem 0;
  }
  :global(.mode-dark) .tab-divider,
  :global(.is-dark) .tab-divider,
  :global(body.app-dark) .tab-divider {
    background: #27272a;
  }
</style>
