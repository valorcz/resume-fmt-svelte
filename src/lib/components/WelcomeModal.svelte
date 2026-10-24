<script>
  let {
    isOpen = false,
    colorMode = 'system',
    onClose = () => {},
    onOpenGistTab = () => {}
  } = $props();

  let dontShowAgain = $state(true);

  function handleDismiss(openSourceTab = false) {
    if (typeof window !== 'undefined' && dontShowAgain) {
      localStorage.setItem('resume-has-seen-welcome', 'true');
    }
    if (openSourceTab) {
      onOpenGistTab();
    } else {
      onClose();
    }
  }

  function handleBackdropKeydown(e) {
    if (e.key === 'Escape') {
      handleDismiss(false);
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div 
    class="modal-backdrop"
    onclick={() => handleDismiss(false)}
    onkeydown={handleBackdropKeydown}
    role="button"
    tabindex="0"
    aria-label="Close welcome guide"
  ></div>

  <!-- Modal Dialog -->
  <div 
    class="modal-dialog mode-{colorMode}" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="welcome-modal-title"
    tabindex="-1"
  >
    <!-- Modal Header -->
    <div class="modal-header">
      <div class="modal-header-text">
        <div class="modal-eyebrow-row">
          <span class="modal-eyebrow">Quick Guide</span>
          <span class="modal-version-badge">v1.2.0</span>
          <span class="modal-privacy-badge">🔒 Privacy First</span>
        </div>
        <h2 id="welcome-modal-title" class="modal-title">Welcome to Resume Studio</h2>
      </div>
      <button class="modal-close-btn" onclick={() => handleDismiss(false)} aria-label="Close guide" title="Close (Esc)">
        ✕
      </button>
    </div>

    <!-- Modal Body -->
    <div class="modal-body">
      <p class="modal-lead">
        A private, printable CV builder and viewer conforming to the <strong>JSON Resume standard</strong>. Render themes, audit ATS quality, and share clean recruiter links effortlessly.
      </p>

      <!-- Privacy-First & Zero-Backend Architecture Callout -->
      <div class="privacy-callout">
        <div class="privacy-callout-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="privacy-callout-body">
          <div class="privacy-callout-header">
            <span class="privacy-callout-title">100% Client-Side & Privacy-First Architecture</span>
            <span class="privacy-callout-pill">Zero Tracking</span>
          </div>
          <p class="privacy-callout-text">
            Your data belongs to you alone. There are <strong>no server databases</strong>, <strong>no tracking cookies</strong>, <strong>no telemetry</strong>, and <strong>no intermediary servers</strong> collecting your personal contact details or employment history. Everything is parsed, styled, and audited directly in your browser. When loading a public GitHub Gist, requests connect directly between your browser and GitHub's API.
          </p>
        </div>
      </div>

      <!-- 5-Step Structured Flow -->
      <div class="guide-steps">
        <!-- Step 1: Resume Data & Gist -->
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-content">
            <h3 class="step-title">Open Standards & GitHub Gist Hosting</h3>
            <p class="step-text">
              Write your resume using the open JSON Resume v1.0.0 schema in <code>resume.yaml</code> or <code>resume.json</code>. You own your raw text forever with zero proprietary lock-in. Preview bundled local data or load your public GitHub Gist via the <strong>Gist</strong> tab or by appending <code>?gist=YOUR_GIST_ID</code> to the URL.
            </p>
          </div>
        </div>

        <!-- Step 2: Themes & Studio -->
        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-content">
            <h3 class="step-title">18 Themes & Ergonomic Studio</h3>
            <p class="step-text">
              Switch across 18 responsive themes, pick custom accent colors, toggle dark or light modes, and reorder layout sections between main and sidebar columns using drag-and-drop. Opening the customizer automatically shifts the document into an unobstructed split view on desktop.
            </p>
          </div>
        </div>

        <!-- Step 3: Quality Audit & ATS Checker -->
        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-content">
            <h3 class="step-title">Quality Audit & ATS Readiness Checker</h3>
            <p class="step-text">
              Open the <strong>Check</strong> tab in Studio to get a real-time 0–100% quality score. It checks contact reachability, flags passive bullet points lacking strong action verbs, verifies keyword density, and generates a linear <em>"What the Robot Sees"</em> plain-text version to copy into job application portals.
            </p>
          </div>
        </div>

        <!-- Step 4: Paper Format, Boundary Guides & Print Scale -->
        <div class="step-card">
          <div class="step-num">04</div>
          <div class="step-content">
            <h3 class="step-title">Paper Format, Boundary Guides & Print Squeeze</h3>
            <p class="step-text">
              In the <strong>Format</strong> tab, switch between <strong>A4</strong> and <strong>US Letter</strong> paper standards with unit-aware margins (cm/in). Turn on non-printing Page Break Guides (<kbd>B</kbd>) to preview where physical pages break, and use the <strong>Print Scale Squeeze</strong> (75%–100%) to compress trailing lines onto a single page.
            </p>
          </div>
        </div>

        <!-- Step 5: Clean Recruiter Sharing & Gist Sync -->
        <div class="step-card">
          <div class="step-num">05</div>
          <div class="step-content">
            <h3 class="step-title">Distraction-Free Recruiter View & Style Sync</h3>
            <p class="step-text">
              Share clean, distraction-free links using <code>?view=recruiter</code> (or click <strong>Recruiter Link</strong> in Studio) which hides all floating toolbars. To permanently lock your chosen theme, accent, and layout into your Gist, copy the ready-to-use <code>meta.studio</code> snippet from the <strong>Gist</strong> tab.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Shortcuts Banner -->
      <div class="shortcuts-banner">
        <div class="shortcut-item">
          <kbd class="keycap">?</kbd>
          <span>Open guide</span>
        </div>
        <div class="shortcut-divider"></div>
        <div class="shortcut-item">
          <kbd class="keycap">B</kbd>
          <span>Page guides</span>
        </div>
        <div class="shortcut-divider"></div>
        <div class="shortcut-item">
          <kbd class="keycap">Cmd</kbd> + <kbd class="keycap">P</kbd>
          <span>Print / Save PDF</span>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="modal-footer">
      <label class="remember-checkbox">
        <input 
          id="welcome-dont-show-again" 
          name="dont_show_again" 
          type="checkbox" 
          bind:checked={dontShowAgain} 
        />
        <span>Don't show this guide on startup</span>
      </label>

      <div class="footer-buttons">
        <button class="btn btn-secondary" onclick={() => handleDismiss(false)}>
          Explore Demo Resume
        </button>
        <button class="btn btn-primary" onclick={() => handleDismiss(true)}>
          Load Custom Gist →
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    z-index: 9998;
    animation: fadeIn 0.18s ease-out;
  }

  .modal-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 92%;
    max-width: 720px;
    max-height: 88vh;
    background: #ffffff;
    color: #18181b;
    border-radius: 14px;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Dark mode */
  .mode-dark.modal-dialog,
  :global(body.app-dark) .modal-dialog {
    background: #12141a;
    color: #f4f4f5;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    .mode-system.modal-dialog {
      background: #12141a;
      color: #f4f4f5;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  }

  /* Header */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.75rem 2rem 0.75rem 2rem;
  }

  .modal-header-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .modal-eyebrow-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .modal-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #2563eb;
  }
  .mode-dark .modal-eyebrow,
  :global(body.app-dark) .modal-eyebrow {
    color: #60a5fa;
  }

  .modal-version-badge {
    font-size: 0.65rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    background: #eff6ff;
    color: #2563eb;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  .mode-dark .modal-version-badge,
  :global(body.app-dark) .modal-version-badge {
    background: rgba(37, 99, 235, 0.2);
    color: #93c5fd;
  }

  .modal-privacy-badge {
    font-size: 0.65rem;
    font-weight: 700;
    background: #ecfdf5;
    color: #059669;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  .mode-dark .modal-privacy-badge,
  :global(body.app-dark) .modal-privacy-badge {
    background: rgba(5, 150, 105, 0.15);
    color: #34d399;
  }

  .modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: inherit;
    line-height: 1.25;
  }

  .modal-close-btn {
    background: transparent;
    border: none;
    font-size: 1.1rem;
    color: #71717a;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.15s ease;
  }
  .modal-close-btn:hover {
    background: #f4f4f5;
    color: #18181b;
  }
  .mode-dark .modal-close-btn:hover,
  :global(body.app-dark) .modal-close-btn:hover {
    background: #27272a;
    color: #f4f4f5;
  }

  /* Body */
  .modal-body {
    padding: 0.5rem 2rem 1.5rem 2rem;
    overflow-y: auto;
  }

  .modal-lead {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: #52525b;
  }
  .mode-dark .modal-lead,
  :global(body.app-dark) .modal-lead {
    color: #a1a1aa;
  }

  /* Privacy Callout */
  .privacy-callout {
    display: flex;
    gap: 0.85rem;
    padding: 0.85rem 1rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    margin-bottom: 1.25rem;
    align-items: flex-start;
  }
  .mode-dark .privacy-callout,
  :global(body.app-dark) .privacy-callout {
    background: rgba(5, 150, 105, 0.1);
    border-color: rgba(5, 150, 105, 0.25);
  }

  .privacy-callout-icon {
    color: #059669;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
  .mode-dark .privacy-callout-icon,
  :global(body.app-dark) .privacy-callout-icon {
    color: #34d399;
  }

  .privacy-callout-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .privacy-callout-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .privacy-callout-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #065f46;
    letter-spacing: -0.01em;
  }
  .mode-dark .privacy-callout-title,
  :global(body.app-dark) .privacy-callout-title {
    color: #6ee7b7;
  }

  .privacy-callout-pill {
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    background: #059669;
    color: #ffffff;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    letter-spacing: 0.03em;
    line-height: 1;
  }

  .privacy-callout-text {
    margin: 0;
    font-size: 0.78rem;
    line-height: 1.45;
    color: #14532d;
  }
  .mode-dark .privacy-callout-text,
  :global(body.app-dark) .privacy-callout-text {
    color: #a7f3d0;
  }
  .privacy-callout-text strong {
    color: inherit;
    font-weight: 700;
  }

  /* 4-Step Structured Flow */
  .guide-steps {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-bottom: 1.5rem;
  }

  .step-card {
    display: flex;
    gap: 1.1rem;
    padding: 1rem 1.15rem;
    background: #fbfbfb;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    transition: border-color 0.15s ease;
  }
  .mode-dark .step-card,
  :global(body.app-dark) .step-card {
    background: #181a20;
    border-color: #27272a;
  }

  .step-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    font-weight: 700;
    color: #2563eb;
    background: #eff6ff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .mode-dark .step-num,
  :global(body.app-dark) .step-num {
    background: #1e293b;
    color: #60a5fa;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .step-title {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: inherit;
    letter-spacing: -0.01em;
  }

  .step-text {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.5;
    color: #52525b;
  }
  .mode-dark .step-text,
  :global(body.app-dark) .step-text {
    color: #a1a1aa;
  }

  .step-text code {
    background: #e4e4e7;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.76rem;
    color: #18181b;
  }
  .mode-dark .step-text code,
  :global(body.app-dark) .step-text code {
    background: #27272a;
    color: #38bdf8;
  }

  /* Shortcuts Banner */
  .shortcuts-banner {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0.85rem 1.25rem;
    background: #f4f4f5;
    border: 1px solid #e4e4e7;
    border-radius: 10px;
    font-size: 0.8rem;
    color: #52525b;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .mode-dark .shortcuts-banner,
  :global(body.app-dark) .shortcuts-banner {
    background: #181a20;
    border-color: #27272a;
    color: #a1a1aa;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .shortcut-divider {
    width: 1px;
    height: 16px;
    background: #d4d4d8;
  }
  .mode-dark .shortcut-divider,
  :global(body.app-dark) .shortcut-divider {
    background: #3f3f46;
  }

  .keycap {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    font-size: 0.72rem;
    font-weight: 700;
    background: #ffffff;
    border: 1px solid #d4d4d8;
    border-bottom: 2px solid #a1a1aa;
    border-radius: 5px;
    font-family: 'JetBrains Mono', monospace;
    color: #18181b;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  }
  .mode-dark .keycap,
  :global(body.app-dark) .keycap {
    background: #27272a;
    border-color: #3f3f46;
    border-bottom-color: #52525b;
    color: #f4f4f5;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 2rem;
    background: #fafafa;
    border-top: 1px solid #e4e4e7;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .mode-dark .modal-footer,
  :global(body.app-dark) .modal-footer {
    background: #0f1015;
    border-color: #27272a;
  }

  .remember-checkbox {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.82rem;
    color: #71717a;
    cursor: pointer;
    user-select: none;
  }
  .mode-dark .remember-checkbox,
  :global(body.app-dark) .remember-checkbox {
    color: #a1a1aa;
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.55rem 1.15rem;
    border-radius: 8px;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
  }

  .btn-secondary {
    background: #e4e4e7;
    color: #27272a;
  }
  .btn-secondary:hover {
    background: #d4d4d8;
  }
  .mode-dark .btn-secondary,
  :global(body.app-dark) .btn-secondary {
    background: #27272a;
    color: #e4e4e7;
  }
  .mode-dark .btn-secondary:hover,
  :global(body.app-dark) .btn-secondary:hover {
    background: #3f3f46;
  }

  .btn-primary {
    background: #2563eb;
    color: #ffffff;
  }
  .btn-primary:hover {
    background: #1d4ed8;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes popIn {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
</style>
