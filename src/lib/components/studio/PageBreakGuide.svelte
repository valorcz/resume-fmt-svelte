<script>
  import { onMount } from 'svelte';

  let {
    paperFormat = 'a4',
    printMargin = '1.5cm',
    printScale = $bindable(100),
    showGuides = true,
    workCount = 0,
    targetSelector = '.cv-wrapper'
  } = $props();

  let targetElement = $state(null);
  let totalHeight = $state(0);
  let straddleWarning = $state('');
  let widowWarning = $state('');

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

  let exactPages = $derived(pageHeightPx > 0 ? (totalHeight / pageHeightPx) : 1);
  let formattedPages = $derived(exactPages.toFixed(1));
  let isSlightSpillover = $derived(exactPages > 2.0 && exactPages <= 2.25);

  let seniorGuidance = $derived(
    workCount >= 6 && exactPages > 2.0
      ? 'Senior Profile Tip: 6+ roles may crowd out skills. Summarizing earlier roles helps maintain the 2-page golden ratio.'
      : ''
  );

  function autoFitToTwoPages() {
    if (printScale > 90) {
      printScale = 95;
    } else if (printScale > 85) {
      printScale = 90;
    } else {
      printScale = 85;
    }
    setTimeout(checkStraddle, 150);
  }

  function checkStraddle() {
    if (!targetElement) return;
    totalHeight = targetElement.offsetHeight;

    if (totalHeight <= page1Boundary) {
      straddleWarning = '';
      return;
    }

    const items = targetElement.querySelectorAll('.item-card, .side-item, .cv-section, .skill-group, .cv-timeline-item');
    let straddlingItem = null;

    const wrapperRect = targetElement.getBoundingClientRect();

    for (const el of items) {
      const rect = el.getBoundingClientRect();
      const topRel = rect.top - wrapperRect.top;
      const bottomRel = rect.bottom - wrapperRect.top;

      // Check Page 1 boundary
      if (topRel < page1Boundary && bottomRel > page1Boundary) {
        const titleEl = el.querySelector('h3, h4, .item-title, .position, .role, .company, .name');
        const name = titleEl?.textContent?.trim() || 'A work/education entry';
        straddlingItem = `${name} (crosses Page 1 boundary)`;
        break;
      }

      // Check Page 2 boundary
      if (topRel < page2Boundary && bottomRel > page2Boundary) {
        const titleEl = el.querySelector('h3, h4, .item-title, .position, .role, .company, .name');
        const name = titleEl?.textContent?.trim() || 'A work/project entry';
        straddlingItem = `${name} (crosses Page 2 boundary)`;
        break;
      }
    }

    if (straddlingItem) {
      straddleWarning = `"${straddlingItem}" crosses the ${paperFormat.toUpperCase()} page boundary and may jump in print.`;
    } else {
      straddleWarning = '';
    }

    // Check for widowed headings (heading sitting within 45px above a page cutline with no room for body text)
    const headings = targetElement.querySelectorAll('.section-title, .item-header, h2, h3');
    let foundWidowed = null;

    for (const h of headings) {
      const hRect = h.getBoundingClientRect();
      const hTop = hRect.top - wrapperRect.top;

      if (hTop > page1Boundary - 50 && hTop < page1Boundary) {
        const text = h.textContent?.trim().slice(0, 32) || 'Heading';
        foundWidowed = `"${text}" sits at the bottom of Page 1`;
        break;
      }
      if (hTop > page2Boundary - 50 && hTop < page2Boundary) {
        const text = h.textContent?.trim().slice(0, 32) || 'Heading';
        foundWidowed = `"${text}" sits at the bottom of Page 2`;
        break;
      }
    }

    if (foundWidowed) {
      widowWarning = `⚠️ Widowed Heading Risk: ${foundWidowed} and may detach from content in print.`;
    } else {
      widowWarning = '';
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
    if (paperFormat || printMargin || printScale || showGuides) {
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

    <!-- Page 2 Boundary Guide & Squeeze Advisor -->
    {#if hasPage2Break}
      <div class="guide-line guide-line-2" class:spillover={isSlightSpillover} style="top: {page2Boundary}px;">
        <div class="guide-actions-row">
          {#if isSlightSpillover}
            <button type="button" class="btn-autofit" onclick={autoFitToTwoPages}>
              ⚡ Auto-Fit to 2 Pages ({printScale > 90 ? '95%' : '90%'})
            </button>
          {/if}
          <div class="guide-badge" class:badge-spillover={isSlightSpillover}>
            <span class="guide-icon">📄</span>
            <span>{paperFormat.toUpperCase()} Page 2 End · {formattedPages} pgs {isSlightSpillover ? '(⚠️ Spillover)' : ''}</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Guidance, Widow & Straddle Warning Notices -->
    {#if straddleWarning || widowWarning || seniorGuidance}
      <div class="notices-container" style="top: {page1Boundary + 12}px;">
        {#if widowWarning}
          <div class="straddle-warning-pill widow-pill">
            <span class="pill-icon">⚠️</span>
            <span>{widowWarning}</span>
          </div>
        {/if}
        {#if straddleWarning}
          <div class="straddle-warning-pill">
            <span class="pill-icon">⚠️</span>
            <span>{straddleWarning}</span>
          </div>
        {/if}
        {#if seniorGuidance}
          <div class="straddle-warning-pill guidance-pill">
            <span class="pill-icon">💡</span>
            <span>{seniorGuidance}</span>
          </div>
        {/if}
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

  .guide-line.spillover {
    border-top-color: #f59e0b;
  }

  .guide-actions-row {
    position: absolute;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    pointer-events: auto;
  }

  .btn-autofit {
    background: #f59e0b;
    color: #ffffff;
    border: none;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
    transition: background 0.15s ease, transform 0.1s ease;
  }
  .btn-autofit:hover {
    background: #d97706;
    transform: scale(1.02);
  }

  .guide-badge {
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

  .guide-badge.badge-spillover {
    background: #d97706;
    box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);
  }

  .guide-icon {
    font-size: 0.75rem;
  }

  .notices-container {
    position: absolute;
    right: 0;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    pointer-events: auto;
  }

  .straddle-warning-pill {
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
  }

  .guidance-pill {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.12);
  }

  .widow-pill {
    background: #fef2f2;
    border-color: #fecaca;
    color: #991b1b;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
  }

  :global(.mode-dark) .widow-pill,
  :global(.is-dark) .widow-pill,
  :global(body.app-dark) .widow-pill {
    background: #2a1215;
    border-color: #991b1b;
    color: #fca5a5;
  }

  :global(.mode-dark) .straddle-warning-pill,
  :global(.is-dark) .straddle-warning-pill,
  :global(body.app-dark) .straddle-warning-pill {
    background: #272115;
    border-color: #78350f;
    color: #fde68a;
  }

  :global(.mode-dark) .guidance-pill,
  :global(.is-dark) .guidance-pill,
  :global(body.app-dark) .guidance-pill {
    background: #172554;
    border-color: #1e40af;
    color: #bfdbfe;
  }

  @media print {
    .page-break-container {
      display: none !important;
    }
  }
</style>
