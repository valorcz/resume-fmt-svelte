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
        <span class="modal-eyebrow">Quick Guide</span>
        <h2 id="welcome-modal-title" class="modal-title">Welcome to Resume Studio</h2>
      </div>
      <button class="modal-close-btn" onclick={() => handleDismiss(false)} aria-label="Close guide" title="Close (Esc)">
        ✕
      </button>
    </div>

    <!-- Modal Body -->
    <div class="modal-body">
      <p class="modal-lead">
        A clean, printable CV viewer conforming to the <strong>JSON Resume standard</strong>. Render, customize themes, and share clean recruiter links effortlessly.
      </p>

      <!-- 5-Step Structured Flow -->
      <div class="guide-steps">
        <!-- Step 1: Resume Data & Gist -->
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-content">
            <h3 class="step-title">Resume Data & GitHub Gist</h3>
            <p class="step-text">
              Write your resume using standard JSON Resume in <code>resume.yaml</code> or <code>resume.json</code>. You can preview bundled local sample data, or load your own public GitHub Gist via the <strong>Source</strong> tab or by appending <code>?gist=YOUR_GIST_ID</code> to the URL.
            </p>
          </div>
        </div>

        <!-- Step 2: Themes & Studio -->
        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-content">
            <h3 class="step-title">Themes & Column Customizer</h3>
            <p class="step-text">
              Switch across 18 responsive themes, pick custom accent colors, toggle dark or light modes, and reorder layout sections between main and sidebar columns using drag-and-drop.
            </p>
          </div>
        </div>

        <!-- Step 3: Quality Audit & ATS Checker -->
        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-content">
            <h3 class="step-title">Quality Audit & ATS Checker</h3>
            <p class="step-text">
              Open the <strong>Check</strong> tab in Studio to get a real-time 0–100% quality score. It checks contact reachability, flags passive bullet points lacking strong action verbs, verifies keyword density, and generates a linear <em>"What the Robot Sees"</em> plain-text version to copy into job application portals.
            </p>
          </div>
        </div>

        <!-- Step 4: Style Preservation in Gist -->
        <div class="step-card">
          <div class="step-num">04</div>
          <div class="step-content">
            <h3 class="step-title">Preserve Your Styling in Gist</h3>
            <p class="step-text">
              Lock in your theme, accent color, and layout directly in your Gist. Embed a <code>_config:</code> block in your resume or add a standalone <code>config.yaml</code>. Studio generates copy-paste ready YAML and JSON snippets in the <strong>Config</strong> tab.
            </p>
          </div>
        </div>

        <!-- Step 5: Clean Recruiter Sharing -->
        <div class="step-card">
          <div class="step-num">05</div>
          <div class="step-content">
            <h3 class="step-title">Distraction-Free Recruiter View</h3>
            <p class="step-text">
              When applying for jobs, share clean links using <code>?view=recruiter</code> (or click <strong>Recruiter Link</strong> in Studio). All floating toolbars and editor controls are hidden, providing a polished document view.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Shortcuts Banner -->
      <div class="shortcuts-banner">
        <div class="shortcut-item">
          <kbd class="keycap">?</kbd>
          <span>Press anytime to reopen this guide</span>
        </div>
        <div class="shortcut-divider"></div>
        <div class="shortcut-item">
          <kbd class="keycap">Cmd</kbd> + <kbd class="keycap">P</kbd>
          <span>Print or save to PDF with tailored page-break styles</span>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="modal-footer">
      <label class="remember-checkbox">
        <input type="checkbox" bind:checked={dontShowAgain} />
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
    margin: 0 0 1.5rem 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: #52525b;
  }
  .mode-dark .modal-lead,
  :global(body.app-dark) .modal-lead {
    color: #a1a1aa;
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
