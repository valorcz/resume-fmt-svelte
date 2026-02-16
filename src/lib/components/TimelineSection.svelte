<script>
  export let items = []; 
  export let sectionTitle = "Section"; 
  export let sectionId = "default"; 
  export let location = "main";
  
  export let titleKey = "position"; 
  export let subtitleKey = "name"; 
  export let dateKey = "startDate"; 
  export let endDateKey = "endDate"; 
  export let summaryKey = "summary"; 

  export let areaKey = null;
</script>

{#if items && items.length > 0}
  <div class="cv-section section-{sectionId}">
    <h3 class="section-title">{sectionTitle}</h3>
    
    <div class="section-content">
      {#each items as item}
        <div class="item-card">
          <div class="item-header">
            {#if item[subtitleKey]}<span class="item-subtitle">{item[subtitleKey]}</span>{/if}
            
            {#if item[titleKey] || (areaKey && item[areaKey])}
              <span class="item-title">
                {item[titleKey] || ''}{#if item[titleKey] && areaKey && item[areaKey]} | {/if} {areaKey && item[areaKey] ? item[areaKey] : ''}
              </span>
            {/if}
            
            <span class="item-date">
              {#if item[dateKey]}
                {item[dateKey].substring(0, 4)} 
                {#if item[endDateKey]} — {item[endDateKey].substring(0, 4)}
                {:else if dateKey === 'startDate'} — Present
                {/if}
              {/if}
            </span>
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
