<script>
  let {
    zoom = $bindable(1.0),
    targetSelector = '.cv-wrapper'
  } = $props();

  let isFitActive = $state(false);

  function setZoom(val) {
    isFitActive = false;
    zoom = Math.max(0.5, Math.min(1.5, Math.round(val * 100) / 100));
  }

  function zoomIn() {
    setZoom(zoom + 0.1);
  }

  function zoomOut() {
    setZoom(zoom - 0.1);
  }

  function resetZoom() {
    isFitActive = false;
    zoom = 1.0;
  }

  function fitToPage() {
    if (typeof window === 'undefined') return;
    const el = document.querySelector(targetSelector);
    if (!el) return;

    // Available viewport height minus margins/paddings (~80px)
    const availableHeight = window.innerHeight - 80;
    const contentHeight = el.offsetHeight || 1100;

    const fitRatio = Math.max(0.5, Math.min(1.0, availableHeight / contentHeight));
    zoom = Math.round(fitRatio * 100) / 100;
    isFitActive = true;
  }
</script>

<div class="floating-zoom-wrapper" aria-label="Canvas Zoom Controls">
  <div class="zoom-pill">
    <!-- Zoom Out -->
    <button 
      class="zoom-btn" 
      onclick={zoomOut} 
      disabled={zoom <= 0.5}
      title="Zoom Out (Ctrl -)"
      aria-label="Zoom Out"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Percentage Display / Reset -->
    <button 
      class="zoom-val-btn" 
      onclick={resetZoom} 
      title="Click to reset to 100%"
    >
      {Math.round(zoom * 100)}%
    </button>

    <!-- Zoom In -->
    <button 
      class="zoom-btn" 
      onclick={zoomIn} 
      disabled={zoom >= 1.5}
      title="Zoom In (Ctrl +)"
      aria-label="Zoom In"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <div class="zoom-divider"></div>

    <!-- Fit to Height Button -->
    <button 
      class="fit-btn" 
      class:active={isFitActive}
      onclick={fitToPage} 
      title="Fit resume page to current screen height"
    >
      Fit
    </button>
  </div>
</div>

<style>
  .floating-zoom-wrapper {
    position: fixed;
    bottom: 1.25rem;
    left: 1.25rem;
    z-index: 9980;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  }

  .zoom-pill {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.25rem 0.35rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
    color: #1e293b;
  }
  :global(.mode-dark) .zoom-pill,
  :global(.is-dark) .zoom-pill,
  :global(body.app-dark) .zoom-pill {
    background: #181a20;
    border-color: #2e3039;
    color: #f1f5f9;
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4);
  }

  .zoom-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;
    padding: 0;
  }
  .zoom-btn:hover:not(:disabled) {
    background: #f1f5f9;
  }
  :global(.mode-dark) .zoom-btn:hover:not(:disabled),
  :global(.is-dark) .zoom-btn:hover:not(:disabled),
  :global(body.app-dark) .zoom-btn:hover:not(:disabled) {
    background: #27272a;
    color: #ffffff;
  }
  .zoom-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .zoom-val-btn {
    padding: 0.15rem 0.35rem;
    background: none;
    border: none;
    color: inherit;
    font-size: 0.73rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    border-radius: 4px;
    min-width: 38px;
    text-align: center;
    font-feature-settings: 'tnum';
  }
  .zoom-val-btn:hover {
    background: #f1f5f9;
  }
  :global(.mode-dark) .zoom-val-btn:hover,
  :global(.is-dark) .zoom-val-btn:hover,
  :global(body.app-dark) .zoom-val-btn:hover {
    background: #27272a;
    color: #ffffff;
  }

  .zoom-divider {
    width: 1px;
    height: 14px;
    background: #e2e8f0;
    margin: 0 0.1rem;
  }
  :global(.mode-dark) .zoom-divider,
  :global(.is-dark) .zoom-divider,
  :global(body.app-dark) .zoom-divider {
    background: #2e3039;
  }

  .fit-btn {
    padding: 0.2rem 0.45rem;
    background: none;
    border: 1px solid transparent;
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
  }
  :global(.mode-dark) .fit-btn,
  :global(.is-dark) .fit-btn,
  :global(body.app-dark) .fit-btn {
    color: #94a3b8;
  }
  .fit-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  :global(.mode-dark) .fit-btn:hover,
  :global(.is-dark) .fit-btn:hover,
  :global(body.app-dark) .fit-btn:hover {
    background: #27272a;
    color: #ffffff;
  }
  .fit-btn.active {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #2563eb;
  }
  :global(.mode-dark) .fit-btn.active,
  :global(.is-dark) .fit-btn.active,
  :global(body.app-dark) .fit-btn.active {
    background: rgba(37, 99, 235, 0.15);
    border-color: rgba(37, 99, 235, 0.3);
    color: #93c5fd;
  }

  @media print {
    .floating-zoom-wrapper {
      display: none !important;
    }
  }
</style>
