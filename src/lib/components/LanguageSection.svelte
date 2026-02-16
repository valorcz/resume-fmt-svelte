<script>
  export let items = [];
  export let sectionTitle = "Languages";
  export let sectionId = "languages";
</script>

{#if items && items.length > 0}
  <div class="cv-section section-{sectionId}">
    <h3 class="section-title">{sectionTitle}</h3>

    <div class="section-content">
    
    <div class="languages-list">
      {#each items as item}
        <div class="item-card language-item" style="margin-bottom: 0.8rem;">
          <div class="item-header" style="margin-bottom: 0;">
            {#if item.language}
              <span class="item-title" style="margin-right: 0.5rem; font-weight: bold;">
                {item.language}
              </span>
            {/if}
            
            {#if item.fluency}
              <span class="item-summary fluency-text">
                {item.fluency}
              </span>
            {/if}
          </div>
        </div>
      {/each}

      </div>
    </div>
  </div>
{/if}
