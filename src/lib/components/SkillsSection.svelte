<script>
  export let items = [];
  export let sectionTitle = "Skills";
  export let sectionId = "skills"; // 👈 Add the prop
</script>

{#if items && items.length > 0}
  <div class="cv-section section-{sectionId}">
    <h3 class="section-title">{sectionTitle}</h3>
    
    <div class="section-content"> 
      {#each items as group}
        <div class="skill-group">
          {#if group.name}<h4 class="skill-name">{group.name}</h4>{/if}
          {#if group.keywords && group.keywords.length > 0}
            <div class="skill-keywords">
              {#each group.keywords as keyword}
                <span class="skill-tag">{keyword}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}