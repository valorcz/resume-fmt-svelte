<script>
  import SourceTab from './SourceTab.svelte';
  import ConfigTab from './ConfigTab.svelte';

  let {
    gistId = null,
    activeTheme = 'classic',
    customAccent = null,
    colorMode = 'system',
    effectiveLayout = { main: [], sidebar: [] },
    onOpenGuide = () => {}
  } = $props();
</script>

<div class="gist-tab-container">
  <!-- Load / Active Gist Source -->
  <SourceTab {gistId} {onOpenGuide} />

  <div class="tab-divider"></div>

  <!-- Export Style Configuration to Gist -->
  <ConfigTab {activeTheme} {customAccent} {colorMode} {effectiveLayout} />
</div>

<style>
  .gist-tab-container {
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
