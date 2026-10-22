<script>
  import { onMount } from 'svelte';

  let {
    paperFormat = 'a4',
    printMargin = '1.5cm',
    printScale = 100,
    showGuides = true,
    targetSelector = '.cv-wrapper'
  } = $props();

  let targetElement = $state(null);
  let totalHeight = $state(0);
  let straddleWarning = $state('');

  // Calculate printable page height in screen pixels (96 DPI)
  let pageHeightPx = $derived.by(() => {
    let marginMm = 15;
    const marginStr = String(printMargin || '').toLowerCase().trim();
    if (marginStr.endsWith('in')) {
      const inches = parseFloat(marginStr) || 0.75;
      marginMm = inches * 25.4;
    } else {
      const cm = parseFloat(marginStr) || 1.5;
      marginMm = cm * 10;
    }
    const paperHeightMm = paperFormat === 'letter' ? 279.4 : 297.0;
    const printableMm = paperHeightMm - (2 * marginMm);
    // 96 DPI: 1 inch = 25.4 mm => 96 / 25.4 = 3.779527559 pixels per mm
    const baseHeightPx = printableMm * 3.779528;
    const scaleFactor = (printScale || 100) / 100;
    return Math.round(baseHeightPx / scaleFactor);
  });

  // Calculate boundary positions
  let page1Boundary = $derived(pageHeightPx);
  let page2Boundary = $derived(pageHeightPx * 2);

  let hasPage1Break = $derived(totalHeight > page1Boundary);
  let hasPage2Break = $derived(totalHeight > page2Boundary);

  function checkStraddle() {
    if (!targetElement) return;
    totalHeight = targetElement.offsetHeight;

    if (totalHeight <= page1Boundary) {
      straddleWarning = '';
      return;
    }

    const items = targetElement.querySelectorAll('.cv-timeline-item, .cv-card, .cv-section, .cv-project-card');
    let straddlingItem = null;

    const wrapperRect = targetElement.getBoundingClientRect();

    for (const el of items) {
      const rect = el.getBoundingClientRect();
      const topRel = rect.top - wrapperRect.top;
      const bottomRel = rect.bottom - wrapperRect.top;

      if (topRel < page1Boundary && bottomRel > page1Boundary) {
        const titleEl = el.querySelector('h3, h4, .position, .role, .company, .name');
        const name = titleEl?.textContent?.trim() || 'A work/education entry';
        straddlingItem = name;
        break;
      }
    }

    if (straddlingItem) {
      straddleWarning = `"${straddlingItem}" crosses the ${paperFormat.toUpperCase()} page boundary and may jump to Page 2 in print.`;
    } else {
      straddleWarning = '';
    }
  }

  onMount(() => {
    targetElement = document.querySelector(targetSelector);
    checkStraddle();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && targetElement) {
      resizeObserver = new ResizeObserver(() => checkStraddle());
      resizeObserver.observe(targetElement);
    }

    const interval = setInterval(checkStraddle, 1000);

    return () => {
      clearInterval(interval);
      if (resizeObserver) resizeObserver.disconnect();
    };
  });

  $effect(() => {
    // Re-check on props change
    if (paperFormat || printMargin || showGuides) {
      checkStraddle();
    }
  });
</script>

{#if showGuides && targetElement}
  <div class="page-break-container" aria-hidden="true">
    <!-- Page 1 Boundary Guide -->
    {#if hasPage1Break}
      <div class="guide-line guide-line-1" style="top: {page1Boundary}px;">
        <div class="guide-badge">
          <span class="guide-icon">📄</span>
          <span>{paperFormat.toUpperCase()} Page 1 End ({printMargin}{printScale !== 100 ? ` · ${printScale}% scale` : ''})</span>
        </div>
      </div>
    {/if}

    <!-- Page 2 Boundary Guide -->
    {#if hasPage2Break}
      <div class="guide-line guide-line-2" style="top: {page2Boundary}px;">
        <div class="guide-badge">
          <span class="guide-icon">📄</span>
          <span>{paperFormat.toUpperCase()} Page 2 End</span>
        </div>
      </div>
    {/if}

    <!-- Straddle Warning Notice -->
    {#if straddleWarning}
      <div class="straddle-warning-pill" style="top: {page1Boundary + 12}px;">
        <span class="pill-icon">⚠️</span>
        <span>{straddleWarning}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .page-break-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 50;
    overflow: visible;
  }

  .guide-line {
    position: absolute;
    left: -20px;
    right: -20px;
    height: 1px;
    border-top: 2px dashed #3b82f6;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .guide-badge {
    position: absolute;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: #2563eb;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: 700;
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    letter-spacing: 0.02em;
    pointer-events: auto;
  }

  .guide-icon {
    font-size: 0.75rem;
  }

  .straddle-warning-pill {
    position: absolute;
    right: 0;
    max-width: 420px;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
    font-size: 0.72rem;
    font-weight: 600;
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15);
    line-height: 1.4;
    pointer-events: auto;
  }
  :global(.mode-dark) .straddle-warning-pill,
  :global(.is-dark) .straddle-warning-pill,
  :global(body.app-dark) .straddle-warning-pill {
    background: #272115;
    border-color: #78350f;
    color: #fde68a;
  }

  @media print {
    .page-break-container {
      display: none !important;
    }
  }
</style>
