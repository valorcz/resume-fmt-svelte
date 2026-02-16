<script>
  export let items = [];
  export let sectionTitle = "References";
  export let sectionId = "references";
</script>

{#if items && items.length > 0}
  <div class="cv-section section-{sectionId}">
    <h3 class="section-title">{sectionTitle}</h3>
    
    <div class="section-content">
    {#each items as item}
      <div class="item-card reference-item">
        
        {#if item.reference}
          <blockquote class="item-summary reference-quote" style="margin: 0 0 0.5rem 0; font-style: italic;">
            "{@html item.reference}"
          </blockquote>
        {/if}
        
        {#if item.name}
          <div class="item-title reference-name" style="text-align: right; font-size: 0.95rem;">
            &mdash; {item.name}
          </div>
        {/if}
        
      </div>
    {/each}

    </div>
  </div>
{/if}
