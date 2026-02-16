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

  // Format Ajv errors nicely (e.g., "/work/0/startDate" -> "work[0].startDate")
  function formatPath(path) {
     if (!path) return "root";
     return path.replace(/\//g, '.').replace(/\.(\d+)/g, '[$1]').replace(/^\./, '');
  }
</script>

{#if data.error}
  <div class="schema-error-container">
    <div class="schema-error-box">
      <h1>⚠ Failed to Load Resume</h1>
      <p class="error-desc">{data.message}</p>

      {#if data.details && data.details.length > 0}
        <div class="error-terminal">
          <div class="terminal-header">Schema Validation Report</div>
          <ul>
            {#each data.details as err}
              <li>
                <span class="err-path">{formatPath(err.instancePath)}</span>
                <span class="err-msg">{err.message}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      <button class="retry-btn" on:click={() => window.location.href = '/'}>Return to Default Resume</button>
    </div>
  </div>
{:else}
  <div class="app-container theme-{activeTheme}">
  <ThemeSwitcher themes={availableThemes} bind:activeTheme={activeTheme} />

  <div class="cv-wrapper">
    
    <header class="cv-header">
      {#if resume.basics.image}
        <img class="cv-image" src={resume.basics.image} alt="Profile" />
      {/if}
      <h1 class="cv-name">{resume.basics.name}</h1>
      <h2 class="cv-title">{resume.basics.label || resume.basics.headline}</h2>
      
      <div class="cv-contact">
        {#if resume.basics.email}<span><a href="mailto:{resume.basics.email}">{resume.basics.email}</a></span>{/if}
        {#if resume.basics.phone}<span>{resume.basics.phone}</span>{/if}
        {#if resume.basics.url}<span><a href={resume.basics.url}>{resume.basics.url}</a></span>{/if}
        <span>{resume.basics.location.city}, {resume.basics.location.countryCode}</span>
        {#if resume.basics.profiles}
           {#each resume.basics.profiles as profile}
             <span><a href={profile.url} target="_blank">{profile.network}</a></span>
           {/each}
	{/if}
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
  </div>
{/if}
