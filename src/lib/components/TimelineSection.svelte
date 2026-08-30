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
    areaKey = null
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
      {#each items as item}
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
            <ul class="item-highlights">
              {#each item.highlights as highlight}
                <li>{@html highlight}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}
