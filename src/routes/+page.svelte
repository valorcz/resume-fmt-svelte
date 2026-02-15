<script>
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  
  // Data comes from +page.js
  export let data;
  const resume = data.resume;

  // Theme State
  let currentTheme = 'theme-gov'; 
  const themes = [
    { id: 'theme-verge', label: '1', name: 'The Verge' },
    { id: 'theme-editorial', label: '2', name: 'Editorial' },
    { id: 'theme-terminal', label: '3', name: 'Terminal' },
    { id: 'theme-gov', label: '4', name: 'Federal Dossier' },
    { id: 'theme-classic', label: '4', name: 'Classic' },
  ];

  function getYear(dateString) {
    if (!dateString) return 'Present';
    return new Date(dateString).getFullYear();
  }
</script>

<svelte:head>
  <title>Resume - {resume.basics.name}</title>
</svelte:head>

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
                  <p class="item-summary" style="font-weight:normal;">{vol.summary}</p>
                </div>
              {/each}
            </div>
          </section>
        {/if}
      </aside>
    </div>
  </div>
</div>
