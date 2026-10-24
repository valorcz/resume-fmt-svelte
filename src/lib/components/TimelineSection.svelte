<script>
  let {
    items = [],
    sectionTitle = "Section",
    sectionId = "default",
    titleKey = "position",
    subtitleKey = "name",
    dateKey = "startDate",
    endDateKey = "endDate",
    summaryKey = "summary",
    areaKey = null,
    compact = false,
    expandAllHighlights = false
  } = $props();

  function formatYear(val) {
    if (!val) return '';
    const str = String(val).trim();
    return str.length >= 4 ? str.substring(0, 4) : str;
  }
</script>

{#if items && items.length > 0}
  <div class="cv-section section-{sectionId}">
    <h3 class="section-title">{sectionTitle}</h3>
    
    <div class="section-content">
      {#each items as item, idx}
        <div class="item-card">
          <div class="item-header">
            <div class="item-header-primary">
              {#if item[titleKey] || (areaKey && item[areaKey])}
                <span class="item-title">
                  {item[titleKey] || ''}{#if item[titleKey] && areaKey && item[areaKey]} · {item[areaKey]}{/if}
                </span>
              {/if}
              {#if item[subtitleKey]}
                <span class="item-subtitle">{item[subtitleKey]}</span>
              {/if}
            </div>
            
            {#if item[dateKey]}
              <span class="item-date">
                {formatYear(item[dateKey])}{#if item[endDateKey]} — {formatYear(item[endDateKey])}{:else if dateKey === 'startDate'} — Present{/if}
              </span>
            {/if}
          </div>
          
          {#if item[summaryKey]}
            <div class="item-summary">{@html item[summaryKey]}</div>
          {/if}
          
          {#if item.highlights && item.highlights.length > 0}
            {#if compact && idx >= 2 && !expandAllHighlights}
              <details class="highlights-disclosure no-print-details">
                <summary class="highlights-summary">
                  <span>Show {item.highlights.length} achievements</span>
                </summary>
                <ul class="item-highlights">
                  {#each item.highlights as highlight}
                    <li>{@html highlight}</li>
                  {/each}
                </ul>
              </details>

              <!-- For Print: Always render full highlights -->
              <ul class="item-highlights print-only-highlights">
                {#each item.highlights as highlight}
                  <li>{@html highlight}</li>
                {/each}
              </ul>
            {:else}
              <ul class="item-highlights">
                {#each item.highlights as highlight}
                  <li>{@html highlight}</li>
                {/each}
              </ul>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .highlights-disclosure {
    margin-top: 0.45rem;
  }

  .highlights-summary {
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--accent, #2563eb);
    user-select: none;
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: rgba(37, 99, 235, 0.06);
    border: 1px solid rgba(37, 99, 235, 0.15);
    transition: background 0.15s ease;
  }

  .highlights-summary::-webkit-details-marker {
    display: none;
  }

  .highlights-summary::before {
    content: "▸";
    font-size: 0.75rem;
    transition: transform 0.15s ease;
  }

  .highlights-disclosure[open] > .highlights-summary::before {
    transform: rotate(90deg);
  }

  .highlights-summary:hover {
    background: rgba(37, 99, 235, 0.12);
  }

  .print-only-highlights {
    display: none !important;
  }

  @media print {
    .no-print-details {
      display: none !important;
    }
    .print-only-highlights {
      display: block !important;
    }
  }
</style>
