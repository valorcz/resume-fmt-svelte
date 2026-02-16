<script>
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  
  export let data;
  const { resume, error, message, details } = data;

  const themeFiles = import.meta.glob('/src/lib/styles/themes/*.css', { eager: true });
  const themes = Object.keys(themeFiles).map((path, index) => {
    const filename = path.split('/').pop().replace('.css', '');
    const prettyName = filename.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return { id: `theme-${filename}`, label: `${index + 1}`, name: prettyName };
  });

  let currentTheme = themes.length > 0 ? themes[0].id : '';

  function getYear(dateString) {
    if (!dateString) return 'Present';
    return new Date(dateString).getFullYear();
  }

  // Format Ajv errors nicely (e.g., "/work/0/startDate" -> "work[0].startDate")
  function formatPath(path) {
    if (!path) return "root";
    return path.replace(/\//g, '.').replace(/\.(\d+)/g, '[$1]').replace(/^\./, '');
  }
</script>

<svelte:head>
  <title>{error ? 'Error Loading Resume' : `Resume - ${resume.basics.name}`}</title>
</svelte:head>

{#if error}
  <div class="schema-error-container">
    <div class="schema-error-box">
      <h1>⚠️ Failed to Load Resume</h1>
      <p class="error-desc">{message}</p>
      
      {#if details && details.length > 0}
        <div class="error-terminal">
          <div class="terminal-header">Schema Validation Report</div>
          <ul>
            {#each details as err}
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

<div class="app-container {currentTheme}">
  <ThemeSwitcher bind:currentTheme {themes} />

  <div class="cv-wrapper">
    <header class="cv-header">
      <h1 class="cv-name">{resume.basics.name}</h1>
      <h2 class="cv-title">{resume.basics.label}</h2>
      
      <div class="cv-contact">
        <span>{resume.basics.location.city}, {resume.basics.location.countryCode}</span>
        <span>{resume.basics.phone}</span>
        <span><a href="mailto:{resume.basics.email}">{resume.basics.email}</a></span>
        {#if resume.basics.profiles}
          {#each resume.basics.profiles as profile}
            <span><a href={profile.url} target="_blank">{profile.network}</a></span>
          {/each}
        {/if}
      </div>

      <div class="cv-summary"><p>{resume.basics.summary}</p></div>
    </header>

    <div class="cv-layout">
      <main class="cv-main">
        <section class="cv-section section-experience">
          <h3 class="section-title">Experience</h3>
          <div class="section-content">
            {#each resume.work as job}
              <article class="item-card">
                <div class="item-header">
                  <h4 class="item-title">{job.position}</h4>
                  <div class="item-subtitle">{job.name}</div>
                  <div class="item-date">{getYear(job.startDate)} — {getYear(job.endDate)}</div>
                </div>
                <div class="item-body">
                  <p class="item-summary">{job.summary}</p>
                  {#if job.highlights}
                    <ul class="item-highlights">
                      {#each job.highlights as highlight}
                        <li>{highlight}</li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        </section>

        {#if resume.projects}
          <section class="cv-section section-projects">
            <h3 class="section-title">Selected Projects</h3>
            <div class="section-content projects-grid">
              {#each resume.projects as proj}
                <article class="item-card project-card">
                  <h4 class="item-title">{proj.name}</h4>
                  <p class="item-summary">{proj.description}</p>
                  {#if proj.highlights}
                    <ul class="item-highlights">
                      {#each proj.highlights as highlight}<li>{highlight}</li>{/each}
                    </ul>
                  {/if}
                </article>
              {/each}
            </div>
          </section>
        {/if}
      </main>

      <aside class="cv-sidebar">
        {#if resume.skills}
          <section class="cv-section section-skills">
            <h3 class="section-title">Skills</h3>
            <div class="section-content">
              {#each resume.skills as skillGroup}
                <div class="skill-group">
                  <strong class="skill-name">{skillGroup.name}</strong>
                  <div class="skill-keywords">
                    {#each skillGroup.keywords as kw}<span class="skill-tag">{kw}</span>{/each}
                  </div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if resume.languages}
          <section class="cv-section section-languages">
            <h3 class="section-title">Languages</h3>
            <div class="section-content">
              {#each resume.languages as lang}
                <div class="side-item" style="margin-bottom: 0.75rem;">
                  <div class="item-title">{lang.language}</div>
                  <div class="item-subtitle">{lang.fluency}</div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if resume.certificates}
          <section class="cv-section section-certs">
            <h3 class="section-title">Certifications</h3>
            <div class="section-content">
              {#each resume.certificates as cert}
                <div class="side-item">
                  <div class="item-title">{cert.name}</div>
                  <div class="item-date">{getYear(cert.date)} // {cert.issuer}</div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if resume.education}
          <section class="cv-section section-education">
            <h3 class="section-title">Education</h3>
            <div class="section-content">
              {#each resume.education as edu}
                <div class="side-item">
                  <div class="item-title">{edu.studyType} in {edu.area}</div>
                  <div class="item-subtitle">{edu.institution}</div>
                  <div class="item-date">{getYear(edu.startDate)} — {getYear(edu.endDate)}</div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if resume.volunteer}
          <section class="cv-section section-volunteer">
            <h3 class="section-title">Teaching</h3>
            <div class="section-content">
              {#each resume.volunteer as vol}
                <div class="side-item">
                  <div class="item-title">{vol.position}</div>
                  <div class="item-subtitle">{vol.organization}</div>
                  <div class="item-date">{getYear(vol.startDate)} — {getYear(vol.endDate)}</div>
                  <p class="item-summary" style="font-weight:normal;">{vol.summary}</p>
                </div>
              {/each}
            </div>
          </section>
        {/if}
      </aside>
    </div>

<!--
   <div class="print-footer no-screen">
      <span>{resume.basics.name}</span>
      <span class="footer-separator">•</span>
      <span>Curriculum Vitae</span>
      <span class="footer-separator">•</span>
      <span>{resume.basics.email}</span>
    </div>
-->
  </div>
</div>

{/if}
