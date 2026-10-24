<script>
  import { onMount } from 'svelte';
  import yaml from 'js-yaml';
  import TimelineSection from '$lib/components/TimelineSection.svelte';
  import SkillsSection from '$lib/components/SkillsSection.svelte';
  import LanguageSection from '$lib/components/LanguageSection.svelte';
  import ReferenceSection from '$lib/components/ReferenceSection.svelte';
  import ConfigDrawer from '$lib/components/ConfigDrawer.svelte';
  import HelpModal from '$lib/components/studio/HelpModal.svelte';
  import YamlSourceModal from '$lib/components/studio/YamlSourceModal.svelte';
  import { downloadStandaloneHtml } from '$lib/export/htmlBundleExporter.js';
  import PageBreakGuide from '$lib/components/studio/PageBreakGuide.svelte';
  import ZoomControls from '$lib/components/studio/ZoomControls.svelte';
  import ExecutiveSummaryCard from '$lib/components/recruiter/ExecutiveSummaryCard.svelte';
  import RecruiterStickyBar from '$lib/components/recruiter/RecruiterStickyBar.svelte';
  import { loadTheme, availableThemes } from '$lib/themeRegistry';

  let { data } = $props();

  let resume = $derived(data.resume);
  let themesList = $derived(data.availableThemes || availableThemes);
  let isRecruiterView = $derived(data.isRecruiterView || false);
  let gistId = $derived(data.gistId || null);

  // Mobile & Recruiter Mode state
  let isMobileScreen = $state(false);
  let compactHighlights = $state(true);
  let showBriefing = $state(true);

  let isRecruiterModeActive = $derived(
    isRecruiterView || isMobileScreen
  );

  // User-selected active theme state
  let selectedTheme = $state(null);
  let loadedThemeData = $state(null);

  // Custom accent & layout & mode & paper format state
  let customAccent = $state(null);
  let customLayout = $state(null);
  let colorMode = $state('system');
  let paperFormat = $state('a4');
  let printMargin = $state('1.5cm');
  let printScale = $state(100);
  let annexBreak = $state(false);
  let screenZoom = $state(1.0);
  let showPageGuides = $state(false);

  // Sync initial URL print params reactively
  $effect(() => {
    if (data.urlParams?.format) paperFormat = data.urlParams.format;
    if (data.urlParams?.margin) printMargin = data.urlParams.margin;
    if (data.urlParams?.scale) printScale = data.urlParams.scale;
    if (data.urlParams?.annex !== null && data.urlParams?.annex !== undefined) {
      annexBreak = data.urlParams.annex;
    }
  });

  // Welcome modal, YAML source modal, and Drawer controls
  let showWelcomeModal = $state(false);
  let showYamlModal = $state(false);
  let handbookInitialTab = $state('tour');
  let isDrawerOpen = $state(false);
  let drawerActiveTab = $state('style');
  let isSystemDark = $state(false);

  function openHandbook(tab = 'tour') {
    handbookInitialTab = typeof tab === 'string' ? tab : 'tour';
    showWelcomeModal = true;
  }

  function downloadResumeYaml() {
    if (!resume) return;
    try {
      const yamlStr = yaml.dump(resume, { lineWidth: -1, noRefs: true });
      const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = resume.basics?.name
        ? `${resume.basics.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-resume.yaml`
        : 'resume.yaml';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export resume YAML:', err);
    }
  }

  function handleExportStandaloneHtml() {
    downloadStandaloneHtml({
      resume,
      activeTheme,
      activeThemeCss,
      colorMode,
      paperFormat,
      printMargin,
      printScale,
      customAccent,
      effectiveLayout,
      includeBriefingCard: true,
      includeStudioConfig: true
    });
  }

  let isDarkActive = $derived(
    colorMode === 'dark' || (colorMode === 'system' && isSystemDark)
  );

  onMount(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      isSystemDark = mediaQuery.matches;
      const themeHandler = (e) => { isSystemDark = e.matches; };
      mediaQuery.addEventListener('change', themeHandler);

      const mobileQuery = window.matchMedia('(max-width: 768px)');
      isMobileScreen = mobileQuery.matches;
      const mobileHandler = (e) => { isMobileScreen = e.matches; };
      mobileQuery.addEventListener('change', mobileHandler);

      function handleGlobalKeydown(e) {
        // Intercept Ctrl+S / Cmd+S globally to export and download active resume YAML
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          downloadResumeYaml();
          return;
        }

        // Ignore single-key shortcuts when typing in inputs, textareas, selects, or editable fields
        const target = e.target;
        const isInput = target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        );

        if (isInput) return;

        if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
          e.preventDefault();
          showWelcomeModal = !showWelcomeModal;
        } else if (e.key === '/' && !e.shiftKey) {
          e.preventDefault();
          showYamlModal = !showYamlModal;
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          showPageGuides = !showPageGuides;
        } else if (e.key === 'Escape') {
          if (showYamlModal) showYamlModal = false;
          if (showWelcomeModal) showWelcomeModal = false;
        }
      }

      window.addEventListener('keydown', handleGlobalKeydown);

      const isCustomOrTestUrl = Boolean(
        data.urlParams?.format || 
        data.urlParams?.scale || 
        (typeof window !== 'undefined' && window.location.search.includes('src='))
      );

      if (!isRecruiterView && !isCustomOrTestUrl) {
        const hasSeen = localStorage.getItem('resume-has-seen-welcome');
        if (!hasSeen) {
          showWelcomeModal = true;
        }
      }

      return () => {
        mediaQuery.removeEventListener('change', themeHandler);
        mobileQuery.removeEventListener('change', mobileHandler);
        window.removeEventListener('keydown', handleGlobalKeydown);
      };
    }
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('app-dark', isDarkActive);
    }
  });

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

  // Keep browser URL search parameters synchronized with active settings (disabled in clean recruiter view)
  $effect(() => {
    if (typeof window !== 'undefined' && !isRecruiterView) {
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
  let effectiveLayout = $derived(activeLayout);
  let activeI18n = $derived({ ...activeThemeConfig?.i18n, ...data.config?.i18n });

  // The Component Mapping Dictionary
  let sectionRenderer = $derived({
    work: { component: TimelineSection, props: { items: resume?.work, titleKey: 'position', subtitleKey: 'name', compact: isRecruiterModeActive, expandAllHighlights: !compactHighlights } },
    education: { component: TimelineSection, props: { items: resume?.education, titleKey: 'studyType', subtitleKey: 'institution', areaKey: 'area' } },
    volunteer: { component: TimelineSection, props: { items: resume?.volunteer, titleKey: 'position', subtitleKey: 'organization' } },
    projects: { component: TimelineSection, props: { items: resume?.projects, titleKey: 'name', summaryKey: 'description', subtitleKey: null, compact: isRecruiterModeActive, expandAllHighlights: !compactHighlights } },
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

  // Reactive page title
  let pageTitle = $derived(
    data.error
      ? 'Error | Resume Studio'
      : resume?.basics?.name
        ? `${resume.basics.name} — Resume Studio`
        : 'Resume Studio'
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>

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

  <!-- Dynamic Paper Size & Margin Rules -->
  {@html `<style id="print-paper-format-style">
    @media print {
      @page {
        size: ${paperFormat === 'letter' ? 'letter' : 'A4'};
        margin: ${printMargin};
      }
      .cv-wrapper {
        zoom: ${printScale / 100} !important;
        -moz-transform: scale(${printScale / 100}) !important;
        -moz-transform-origin: top center !important;
      }
    }
  </style>`}
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
  <!-- Comprehensive User Guide & Authoring Handbook -->
  <HelpModal
    isOpen={showWelcomeModal}
    initialTab={handbookInitialTab}
    {colorMode}
    {resume}
    onClose={() => showWelcomeModal = false}
    onOpenGistTab={() => {
      showWelcomeModal = false;
      drawerActiveTab = 'gist';
      isDrawerOpen = true;
    }}
  />

  <!-- Dedicated YAML Source Viewer & Copier -->
  <YamlSourceModal
    isOpen={showYamlModal}
    {resume}
    {colorMode}
    {activeTheme}
    {customAccent}
    {effectiveLayout}
    onExportHtml={handleExportStandaloneHtml}
    onClose={() => showYamlModal = false}
  />

  {#if isRecruiterModeActive}
    <RecruiterStickyBar
      {resume}
      {colorMode}
      isDark={isDarkActive}
      bind:compactHighlights
      bind:showBriefing
    />
  {/if}

  <div
    class="app-container theme-{activeTheme} mode-{colorMode} {isRecruiterModeActive ? 'recruiter-view' : ''}"
    class:is-dark={isDarkActive}
    class:mode-dark={isDarkActive}
    class:drawer-open={isDrawerOpen && !isRecruiterModeActive}
    style="--screen-zoom: {screenZoom};"
  >
  {#if !isRecruiterModeActive}
    <ConfigDrawer
      themes={themesList}
      bind:activeTheme={selectedTheme}
      {activeThemeConfig}
      bind:customAccent={customAccent}
      bind:customLayout={customLayout}
      bind:colorMode={colorMode}
      bind:paperFormat={paperFormat}
      bind:printMargin={printMargin}
      bind:printScale={printScale}
      bind:annexBreak={annexBreak}
      bind:showPageGuides={showPageGuides}
      {gistId}
      {resume}
      {activeI18n}
      bind:isOpen={isDrawerOpen}
      bind:activeTab={drawerActiveTab}
      onResetLayout={() => customLayout = null}
      onResetAll={() => { customAccent = null; customLayout = null; colorMode = 'system'; paperFormat = 'a4'; printMargin = '1.5cm'; printScale = 100; annexBreak = false; }}
      onOpenGuide={openHandbook}
      onExportHtml={handleExportStandaloneHtml}
    />

    <!-- Canvas Zoom Controls -->
    <ZoomControls bind:zoom={screenZoom} />
  {/if}

  <div class="cv-wrapper paper-{paperFormat}">
    <!-- Non-printing Page Boundary & Straddle Guides -->
    {#if !isRecruiterModeActive}
      <PageBreakGuide
        {paperFormat}
        {printMargin}
        bind:printScale={printScale}
        showGuides={showPageGuides}
        workCount={resume?.work?.length || 0}
      />
    {/if}

    <!-- Distinct Executive Briefing Card (Dismissible and toggleable from top bar) -->
    {#if isRecruiterModeActive && showBriefing}
      <ExecutiveSummaryCard
        {resume}
        isDark={isDarkActive}
        onClose={() => showBriefing = false}
      />
    {/if}

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
        {#each activeLayout.main as sectionKey, sIdx (sectionKey)}
          {#if sectionRenderer[sectionKey] && sectionRenderer[sectionKey].props.items?.length > 0}
            {@const Renderer = sectionRenderer[sectionKey].component}
            {@const isAnnexSection = ['projects', 'publications', 'volunteer', 'awards'].includes(sectionKey)}
            {@const isFirstAnnex = annexBreak && isAnnexSection && !activeLayout.main.slice(0, sIdx).some(k => ['projects', 'publications', 'volunteer', 'awards'].includes(k))}
            <div class={isFirstAnnex ? 'cv-annex-break print-break-before-page' : ''}>
              <Renderer
                {...sectionRenderer[sectionKey].props}
                sectionTitle={activeI18n[sectionKey] || sectionKey}
                sectionId={sectionKey}
              />
            </div>
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
