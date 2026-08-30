<script>
  import TimelineSection from '$lib/components/TimelineSection.svelte';
  import SkillsSection from '$lib/components/SkillsSection.svelte';
  import LanguageSection from '$lib/components/LanguageSection.svelte';
  import ReferenceSection from '$lib/components/ReferenceSection.svelte';
  import ConfigDrawer from '$lib/components/ConfigDrawer.svelte';
  import { loadTheme, availableThemes } from '$lib/themeRegistry';
  
  let { data } = $props();
  
  let resume = $derived(data.resume);
  let themesList = $derived(data.availableThemes || availableThemes);

  // User-selected active theme state
  let selectedTheme = $state(null);
  let loadedThemeData = $state(null);

  // Custom accent & layout & mode state
  let customAccent = $state(null);
  let customLayout = $state(null);
  let colorMode = $state('system');

  // Reactively synchronize state when incoming data / urlParams update
  $effect(() => {
    if (data.urlParams?.theme) {
      selectedTheme = data.urlParams.theme;
    }
    if (data.urlParams?.accent) {
      customAccent = data.urlParams.accent;
    }
    if (data.urlParams?.layout) {
      customLayout = data.urlParams.layout;
    }
    if (data.urlParams?.mode) {
      colorMode = data.urlParams.mode;
    }
  });

  let activeTheme = $derived(selectedTheme || data.initialTheme || 'classic');

  // Reactively load theme assets and theme-specific custom layout whenever activeTheme changes
  $effect(() => {
    if (activeTheme) {
      loadTheme(activeTheme).then((themeData) => {
        loadedThemeData = themeData;
      });

      if (typeof window !== 'undefined' && !data.urlParams?.layout) {
        const savedLayout = localStorage.getItem(`resume-layout-${activeTheme}`);
        if (savedLayout) {
          try {
            customLayout = JSON.parse(savedLayout);
          } catch (e) {
            customLayout = null;
          }
        } else {
          customLayout = null;
        }
      }
    }
  });

  // Keep browser URL search parameters synchronized with active settings
  $effect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (activeTheme) {
        url.searchParams.set('theme', activeTheme);
      }
      if (customAccent) {
        url.searchParams.set('accent', customAccent.replace('#', ''));
      } else {
        url.searchParams.delete('accent');
      }
      if (colorMode && colorMode !== 'system') {
        url.searchParams.set('mode', colorMode);
      } else {
        url.searchParams.delete('mode');
      }
      if (customLayout) {
        const enc = (customLayout.main || []).join(',') + '|' + (customLayout.sidebar || []).join(',');
        url.searchParams.set('layout', enc);
      } else {
        url.searchParams.delete('layout');
      }
      window.history.replaceState({}, '', url.toString());
    }
  });

  // Derived active config and CSS
  let activeThemeConfig = $derived(
    (loadedThemeData && loadedThemeData.name === activeTheme)
      ? loadedThemeData.config
      : (data.initialThemeConfig || data.config)
  );

  let activeThemeCss = $derived(
    (loadedThemeData && loadedThemeData.name === activeTheme)
      ? loadedThemeData.css
      : (data.initialThemeCss || '')
  );

  // Reactively calculate layout (customLayout takes precedence if set by viewer) and translations
  let activeLayout = $derived(
    customLayout || activeThemeConfig?.layout || data.config?.layout || { main: [], sidebar: [] }
  );
  let activeI18n = $derived({ ...activeThemeConfig?.i18n, ...data.config?.i18n });

  // The Component Mapping Dictionary
  let sectionRenderer = $derived({
    work: { component: TimelineSection, props: { items: resume?.work, titleKey: 'position', subtitleKey: 'name' } },
    education: { component: TimelineSection, props: { items: resume?.education, titleKey: 'studyType', subtitleKey: 'institution', areaKey: 'area' } },
    volunteer: { component: TimelineSection, props: { items: resume?.volunteer, titleKey: 'position', subtitleKey: 'organization' } },
    projects: { component: TimelineSection, props: { items: resume?.projects, titleKey: 'name', summaryKey: 'description', subtitleKey: null } },
    awards: { component: TimelineSection, props: { items: resume?.awards, titleKey: 'title', subtitleKey: 'awarder', dateKey: 'date', endDateKey: null } },
    publications: { component: TimelineSection, props: { items: resume?.publications, titleKey: 'name', subtitleKey: 'publisher', dateKey: 'releaseDate', endDateKey: null } },
    certificates: { component: TimelineSection, props: { items: resume?.certificates, titleKey: 'name', subtitleKey: 'issuer', dateKey: 'date', endDateKey: null } },
    skills: { component: SkillsSection, props: { items: resume?.skills } },
    interests: { component: SkillsSection, props: { items: resume?.interests } },
    languages: { component: LanguageSection, props: { items: resume?.languages } },
    references: { component: ReferenceSection, props: { items: resume?.references } }
  });

  // Format Ajv errors nicely (e.g., "/work/0/startDate" -> "work[0].startDate")
  function formatPath(path) {
     if (!path) return "root";
     return path.replace(/\//g, '.').replace(/\.(\d+)/g, '[$1]').replace(/^\./, '');
  }
</script>

<svelte:head>
  {#if activeThemeCss}
    {@html `<style id="theme-style">${activeThemeCss}</style>`}
  {/if}

  <!-- App Color Mode (System / Light / Dark) -->
  {#if colorMode === 'dark'}
    {@html `<style id="app-color-mode-style">
      body, .app-container { background-color: #0b0f19 !important; }
    </style>`}
  {:else if colorMode === 'light'}
    {@html `<style id="app-color-mode-style">
      body, .app-container { background-color: #e2e8f0 !important; }
    </style>`}
  {:else}
    {@html `<style id="app-color-mode-style">
      @media (prefers-color-scheme: dark) {
        body, .app-container { background-color: #0b0f19 !important; }
      }
    </style>`}
  {/if}

  <!-- Dynamic Accent Color Override for Screen and Print -->
  {#if customAccent}
    {@html `<style id="custom-accent-style">
      .theme-${activeTheme},
      .theme-${activeTheme} .cv-wrapper,
      .theme-${activeTheme} .cv-header,
      .theme-${activeTheme} .cv-section,
      .theme-${activeTheme} .cv-sidebar,
      .theme-${activeTheme} .cv-main {
        --accent: ${customAccent} !important;
        --accent-light: ${customAccent} !important;
        --item-subtitle-separator-color: ${customAccent} !important;
        --item-subtitle-color: ${customAccent} !important;
        --item-date-color: ${customAccent} !important;
        --section-title-color: ${customAccent} !important;
        --section-icon-color: ${customAccent} !important;
        --contact-icon-color: ${customAccent} !important;
      }

      @media print {
        .theme-${activeTheme},
        .theme-${activeTheme} .cv-wrapper,
        .theme-${activeTheme} .cv-header,
        .theme-${activeTheme} .cv-section,
        .theme-${activeTheme} .cv-sidebar,
        .theme-${activeTheme} .cv-main {
          --accent: ${customAccent} !important;
          --accent-light: ${customAccent} !important;
          --item-subtitle-separator-color: ${customAccent} !important;
          --item-subtitle-color: ${customAccent} !important;
          --item-date-color: ${customAccent} !important;
          --section-title-color: ${customAccent} !important;
          --section-icon-color: ${customAccent} !important;
          --contact-icon-color: ${customAccent} !important;
        }

        .theme-${activeTheme} .section-title,
        .theme-${activeTheme} .section-title::before,
        .theme-${activeTheme} .item-subtitle::before,
        .theme-${activeTheme} .cv-contact .contact-item::before,
        .theme-${activeTheme} .cv-main .item-card::before,
        .theme-${activeTheme} .cv-sidebar .skill-tag {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>`}
  {/if}
</svelte:head>

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
      <button class="retry-btn" onclick={() => window.location.href = '/'}>Return to Default Resume</button>
    </div>
  </div>
{:else}
  <div class="app-container theme-{activeTheme} mode-{colorMode}">
  <ConfigDrawer 
    themes={themesList} 
    bind:activeTheme={selectedTheme} 
    {activeThemeConfig}
    bind:customAccent={customAccent}
    bind:customLayout={customLayout}
    bind:colorMode={colorMode}
    onResetLayout={() => customLayout = null}
    onResetAll={() => { customAccent = null; customLayout = null; colorMode = 'system'; }}
  />

  <div class="cv-wrapper">
    
    <header class="cv-header">
      {#if resume?.basics?.image}
        <img class="cv-image" src={resume.basics.image} alt="Profile" />
      {/if}
      <h1 class="cv-name">{resume?.basics?.name}</h1>
      <h2 class="cv-title">{resume?.basics?.label || resume?.basics?.headline}</h2>
      
      <div class="cv-contact">
        {#if resume?.basics?.location}
          {@const locText = [resume.basics.location.address, resume.basics.location.city, resume.basics.location.region, resume.basics.location.countryCode || resume.basics.location.postalCode].filter(Boolean).join(', ') || [resume.basics.location.city, resume.basics.location.countryCode].filter(Boolean).join(', ')}
          {#if locText}
            <span class="contact-item contact-location" data-type="location">{locText}</span>
          {/if}
        {/if}
        {#if resume?.basics?.email}
          <span class="contact-item contact-email" data-type="email">
            <a href="mailto:{resume.basics.email}">{resume.basics.email}</a>
          </span>
        {/if}
        {#if resume?.basics?.phone}
          <span class="contact-item contact-phone" data-type="phone">
            <a href="tel:{resume.basics.phone}">{resume.basics.phone}</a>
          </span>
        {/if}
        {#if resume?.basics?.url}
          <span class="contact-item contact-url" data-type="url">
            <a href={resume.basics.url} target="_blank" rel="noreferrer">{resume.basics.url.replace(/^https?:\/\//, '')}</a>
          </span>
        {/if}
        {#if resume?.basics?.profiles && resume.basics.profiles.length > 0}
          {#each resume.basics.profiles as profile}
            {@const networkSlug = (profile.network || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}
            <span class="contact-item contact-profile contact-profile-{networkSlug}" data-type="profile" data-network={networkSlug}>
              <a href={profile.url} target="_blank" rel="noreferrer">{profile.network || profile.username}</a>
            </span>
          {/each}
        {/if}
      </div>
      
      {#if resume?.basics?.summary}
        <div class="cv-summary">{@html resume.basics.summary}</div>
      {/if}
    </header>

    <div class="cv-layout">
      
      <main class="cv-main">
        {#each activeLayout.main as sectionKey (sectionKey)}
          {#if sectionRenderer[sectionKey] && sectionRenderer[sectionKey].props.items?.length > 0}
            {@const Renderer = sectionRenderer[sectionKey].component}
            <Renderer 
              {...sectionRenderer[sectionKey].props}
              sectionTitle={activeI18n[sectionKey] || sectionKey} 
              sectionId={sectionKey} 
            />
          {/if}
        {/each}
      </main>

      <aside class="cv-sidebar">
        {#each activeLayout.sidebar as sectionKey (sectionKey)}
          {#if sectionRenderer[sectionKey] && sectionRenderer[sectionKey].props.items?.length > 0}
            {@const Renderer = sectionRenderer[sectionKey].component}
            <Renderer 
              {...sectionRenderer[sectionKey].props}
              sectionTitle={activeI18n[sectionKey] || sectionKey} 
              sectionId={sectionKey} 
            />
          {/if}
        {/each}
      </aside>

    </div>
  </div>
  </div>
{/if}
