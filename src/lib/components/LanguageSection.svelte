<script>
  export let items = [];
  export let sectionTitle = "Languages";
  export let sectionId = "languages";
</script>

{#if items && items.length > 0}
  <div class="cv-section section-{sectionId}">
    <h3 class="section-title">{sectionTitle}</h3>

    <div class="section-content">
    
      {#each items as item}
        <div class="item-card">
            {#if item.language}
              <div class="item-title">{item.language}</div>
            {/if}
            
            {#if item.fluency}
              <div class="item-subtitle">{item.fluency}</div>
            {/if}
        </div>
      {/each}

    </div>
  </div>
{/if}
