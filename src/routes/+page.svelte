<script>
  import TimelineSection from '$lib/components/TimelineSection.svelte';
  import SkillsSection from '$lib/components/SkillsSection.svelte';
  import LanguageSection from '$lib/components/LanguageSection.svelte';
  import ReferenceSection from '$lib/components/ReferenceSection.svelte';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import { themeRegistry } from '$lib/themeRegistry';
  
  export let data;
  $: resume = data.resume;

  // Extract the list of available themes dynamically from the registry folders
  const availableThemes = Object.keys(themeRegistry);

  // Set the initial theme based on the user's config, or default to elegant-split
  let activeTheme = data.config?.theme || 'elegant-split';

  // REACTIVE MAGIC: Whenever activeTheme changes, instantly recalculate the layout and translations!
  $: activeLayout = themeRegistry[activeTheme]?.layout || data.config.layout;
  
  // We merge the theme's default i18n with any custom overrides the user provided in their config
  $: activeI18n = { ...themeRegistry[activeTheme]?.i18n, ...data.config?.i18n };

  // The Component Mapping Dictionary
  $: sectionRenderer = {
    work: { component: TimelineSection, props: { items: resume?.work, titleKey: 'position', subtitleKey: 'name' } },
    education: { component: TimelineSection, props: { items: resume?.education, titleKey: 'degree', subtitleKey: 'institution' } },
    volunteer: { component: TimelineSection, props: { items: resume?.volunteer, titleKey: 'position', subtitleKey: 'organization' } },
    projects: { component: TimelineSection, props: { items: resume?.projects, titleKey: 'name', summaryKey: 'description' } },
    awards: { component: TimelineSection, props: { items: resume?.awards, titleKey: 'title', subtitleKey: 'awarder', dateKey: 'date', endDateKey: null } },
    publications: { component: TimelineSection, props: { items: resume?.publications, titleKey: 'name', subtitleKey: 'publisher', dateKey: 'releaseDate', endDateKey: null } },
    certificates: { component: TimelineSection, props: { items: resume?.certificates, titleKey: 'name', subtitleKey: 'issuer', dateKey: 'date', endDateKey: null } },
    skills: { component: SkillsSection, props: { items: resume?.skills } },
    interests: { component: SkillsSection, props: { items: resume?.interests } },
    languages: { component: LanguageSection, props: { items: resume?.languages } },
    references: { component: ReferenceSection, props: { items: resume?.references } }
  };
</script>

{#if data.error}
  <div class="error-banner">
    <h2>Error loading resume</h2>
    <p>{data.message}</p>
  </div>
{:else}
  <ThemeSwitcher themes={availableThemes} bind:activeTheme={activeTheme} />

  <div class="cv-wrapper theme-{activeTheme}">
    
    <header class="cv-header">
      {#if resume.basics.image}
        <img class="cv-image" src={resume.basics.image} alt="Profile" />
      {/if}
      <h1 class="cv-name">{resume.basics.name}</h1>
      <h2 class="cv-title">{resume.basics.label || resume.basics.headline}</h2>
      
      <div class="cv-contact">
        {#if resume.basics.email}<span>{resume.basics.email}</span>{/if}
        {#if resume.basics.phone}<span>{resume.basics.phone}</span>{/if}
        {#if resume.basics.url}<span><a href={resume.basics.url}>{resume.basics.url}</a></span>{/if}
      </div>
      
      {#if resume.basics.summary}
        <div class="cv-summary">{@html resume.basics.summary}</div>
      {/if}
    </header>

    <div class="cv-layout">
      
	<main class="cv-main">
	  {#each activeLayout.main as sectionKey (sectionKey)}
	    {#if sectionRenderer[sectionKey] && sectionRenderer[sectionKey].props.items?.length > 0}
	      <svelte:component 
		this={sectionRenderer[sectionKey].component} 
		{...sectionRenderer[sectionKey].props}
		sectionTitle={activeI18n[sectionKey] || sectionKey} 
		sectionId={sectionKey} />
	    {/if}
	  {/each}
	</main>

      <aside class="cv-sidebar">
        {#each activeLayout.sidebar as sectionKey (sectionKey)}
          {#if sectionRenderer[sectionKey] && sectionRenderer[sectionKey].props.items?.length > 0}
	      <svelte:component 
		this={sectionRenderer[sectionKey].component} 
		{...sectionRenderer[sectionKey].props}
		sectionTitle={activeI18n[sectionKey] || sectionKey} 
		sectionId={sectionKey} />
          {/if}
        {/each}
      </aside>

    </div>
  </div>
{/if}
