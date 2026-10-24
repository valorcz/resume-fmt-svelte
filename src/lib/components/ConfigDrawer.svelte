<script>
  import { onMount } from 'svelte';
  import { auditResume, generateAtsPlainText } from '$lib/audit/resumeAudit.js';
  import StudioBar from './studio/StudioBar.svelte';
  import StudioDrawer from './studio/StudioDrawer.svelte';

  let {
    themes = [],
    activeTheme = $bindable('classic'),
    activeThemeConfig = {},
    customAccent = $bindable(null),
    customLayout = $bindable(null),
    colorMode = $bindable('system'),
    paperFormat = $bindable('a4'),
    printMargin = $bindable('1.5cm'),
    printScale = $bindable(100),
    showPageGuides = $bindable(false),
    gistId = null,
    resume = null,
    activeI18n = {},
    isOpen = $bindable(false),
    activeTab = $bindable('style'),
    onResetLayout = () => {},
    onResetAll = () => {},
    onOpenGuide = () => {}
  } = $props();

  // Active columns derived from customLayout or activeThemeConfig.layout
  let effectiveLayout = $derived.by(() => {
    if (customLayout) return customLayout;
    return {
      main: [...(activeThemeConfig?.layout?.main || [])],
      sidebar: [...(activeThemeConfig?.layout?.sidebar || [])]
    };
  });

  // Derived audit report and ATS linear plain text
  let auditReport = $derived(auditResume(resume, effectiveLayout));
  let atsPlainText = $derived(generateAtsPlainText(resume, activeI18n));

  let hasCustomizations = $derived(Boolean(customAccent || customLayout));

  function selectTheme(themeName) {
    if (themeName === activeTheme) return;
    activeTheme = themeName;
    if (typeof window !== 'undefined') {
      const savedLayout = localStorage.getItem(`resume-layout-${themeName}`);
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

  function handleResetAccent() {
    customAccent = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resume-accent-color');
    }
  }

  function handleResetLayout() {
    customLayout = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`resume-layout-${activeTheme}`);
    }
    onResetLayout();
  }

  function handleResetAllSettings() {
    handleResetAccent();
    handleResetLayout();
    colorMode = 'system';
    paperFormat = 'a4';
    printMargin = '1.5cm';
    printScale = 100;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resume-color-mode');
      localStorage.removeItem('resume-paper-format');
      localStorage.removeItem('resume-print-margin');
      localStorage.removeItem('resume-print-scale');
      themes.forEach(t => localStorage.removeItem(`resume-layout-${t}`));
    }
    onResetAll();
  }

  function cycleColorMode() {
    if (colorMode === 'system') colorMode = 'light';
    else if (colorMode === 'light') colorMode = 'dark';
    else colorMode = 'system';
  }

  function handlePrint() {
    window.print();
  }

  onMount(() => {
    if (!activeTheme || activeTheme === 'classic') {
      const storedTheme = localStorage.getItem('resume-active-theme');
      if (storedTheme && themes.includes(storedTheme)) {
        activeTheme = storedTheme;
      }
    }

    if (!customAccent) {
      const storedAccent = localStorage.getItem('resume-accent-color');
      if (storedAccent) {
        customAccent = storedAccent;
      }
    }

    if (!colorMode || colorMode === 'system') {
      const storedMode = localStorage.getItem('resume-color-mode');
      if (storedMode && ['system', 'light', 'dark'].includes(storedMode)) {
        colorMode = storedMode;
      }
    }

    const storedFormat = localStorage.getItem('resume-paper-format');
    if (storedFormat && ['a4', 'letter'].includes(storedFormat)) {
      paperFormat = storedFormat;
    }

    const storedMargin = localStorage.getItem('resume-print-margin');
    if (storedMargin && ['1.0cm', '1.5cm', '2.0cm', '0.5in', '0.75in', '1.0in'].includes(storedMargin)) {
      printMargin = storedMargin;
    }

    const storedScale = localStorage.getItem('resume-print-scale');
    if (storedScale) {
      const parsed = parseInt(storedScale, 10);
      if (parsed >= 60 && parsed <= 120) {
        printScale = parsed;
      }
    }

    if (!customLayout) {
      const storedLayout = localStorage.getItem(`resume-layout-${activeTheme}`);
      if (storedLayout) {
        try {
          customLayout = JSON.parse(storedLayout);
        } catch (e) {
          console.error('Failed to parse saved layout', e);
        }
      }
    }
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      if (activeTheme) localStorage.setItem('resume-active-theme', activeTheme);
      if (customAccent) localStorage.setItem('resume-accent-color', customAccent);
      else localStorage.removeItem('resume-accent-color');
      if (customLayout) localStorage.setItem(`resume-layout-${activeTheme}`, JSON.stringify(customLayout));
      if (colorMode) localStorage.setItem('resume-color-mode', colorMode);
      if (paperFormat) localStorage.setItem('resume-paper-format', paperFormat);
      if (printMargin) localStorage.setItem('resume-print-margin', printMargin);
      if (printScale) localStorage.setItem('resume-print-scale', String(printScale));
    }
  });
</script>

<!-- Floating Bar -->
<StudioBar 
  {themes}
  bind:activeTheme
  bind:colorMode
  bind:isOpen
  {gistId}
  {resume}
  {hasCustomizations}
  onCycleMode={cycleColorMode}
  onPrint={handlePrint}
  {onOpenGuide}
  onOpenGistTab={() => { activeTab = 'gist'; isOpen = true; }}
/>

<!-- Sliding Drawer -->
<StudioDrawer 
  bind:isOpen
  bind:activeTab
  {themes}
  bind:activeTheme
  {activeThemeConfig}
  bind:customAccent
  bind:customLayout
  bind:colorMode
  bind:paperFormat
  bind:printMargin
  bind:printScale
  bind:showPageGuides
  {gistId}
  {resume}
  {activeI18n}
  {auditReport}
  {atsPlainText}
  onSelectTheme={selectTheme}
  onResetAccent={handleResetAccent}
  onResetLayout={handleResetLayout}
  onResetAll={handleResetAllSettings}
  {onOpenGuide}
/>
