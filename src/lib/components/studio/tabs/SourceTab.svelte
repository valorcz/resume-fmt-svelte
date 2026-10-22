<script>
  import { extractGistId } from '../studioUtils.js';

  let {
    gistId = null,
    onOpenGuide = () => {}
  } = $props();

  let gistInput = $state('');
  let gistError = $state('');

  $effect(() => {
    gistInput = gistId || '';
  });

  function handleLoadGist() {
    const id = extractGistId(gistInput);
    if (!id) {
      gistError = 'Please enter a valid GitHub Gist ID or URL.';
      return;
    }
    gistError = '';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('gist', id);
      window.location.href = url.toString();
    }
  }

  function handleResetToDemo() {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('gist');
      window.location.href = url.toString();
    }
  }
</script>

<div class="section-group">
  <h3 class="group-title">Resume Source</h3>
  <p class="group-desc">
    Load your own resume from any public GitHub Gist containing <code>resume.yaml</code> or <code>resume.json</code>.
  </p>

  <div class="source-card">
    <div class="source-status-badge">
      <span class="status-indicator {gistId ? 'is-gist' : 'is-demo'}"></span>
      <span class="status-text">
        {gistId ? `Loaded from Gist: ${gistId}` : 'Using bundled local sample resume'}
      </span>
    </div>

    <div class="gist-input-row">
      <input 
        type="text" 
        class="gist-input-field" 
        placeholder="Paste Gist ID or full GitHub Gist URL..." 
        bind:value={gistInput}
        onkeydown={(e) => e.key === 'Enter' && handleLoadGist()}
      />
      <button class="btn btn-primary" onclick={handleLoadGist}>
        Load
      </button>
    </div>

    {#if gistError}
      <p class="gist-error-msg">{gistError}</p>
    {/if}

    {#if gistId}
      <div class="gist-actions-row">
        <a 
          href="https://gist.github.com/{gistId}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-link"
        >
          View Gist on GitHub ↗
        </a>
        <button class="text-btn danger-link" onclick={handleResetToDemo}>
          Reset to Demo Resume
        </button>
      </div>
    {/if}
  </div>

  <div class="info-callout">
    <div class="callout-title">How to host your own resume on Gist</div>
    <ol class="callout-list">
      <li>Create a new public Gist at <strong>gist.github.com</strong>.</li>
      <li>Name the file <code>resume.yaml</code> (or <code>resume.json</code>).</li>
      <li>Paste your JSON Resume standard data.</li>
      <li>Copy the Gist URL or ID into the box above.</li>
    </ol>
    <button class="callout-guide-btn" onclick={onOpenGuide}>
      Open Quick Guide modal for step-by-step instructions →
    </button>
  </div>
</div>

<style>
  .section-group {
    margin-bottom: 2rem;
  }

  .group-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0 0 0.35rem 0;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  :global(.mode-dark) .group-title,
  :global(.is-dark) .group-title {
    color: #f8fafc;
  }

  .group-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 1rem 0;
    line-height: 1.45;
  }
  :global(.mode-dark) .group-desc,
  :global(.is-dark) .group-desc {
    color: #94a3b8;
  }

  .source-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.25rem;
  }
  :global(.mode-dark) .source-card,
  :global(.is-dark) .source-card {
    background: #181a20;
    border-color: #27272a;
  }

  .source-status-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #0f172a;
  }
  :global(.mode-dark) .source-status-badge,
  :global(.is-dark) .source-status-badge {
    color: #f1f5f9;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .status-indicator.is-gist {
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  .status-indicator.is-demo {
    background: #64748b;
  }

  .gist-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .gist-input-field {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    font-family: inherit;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #ffffff;
    color: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  :global(.mode-dark) .gist-input-field,
  :global(.is-dark) .gist-input-field {
    background: #27272a;
    border-color: #3f3f46;
    color: #ffffff;
  }
  .gist-input-field:focus {
    border-color: #2563eb;
  }

  .btn {
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
    font-weight: 600;
    font-family: inherit;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    transition: background-color 0.15s;
  }
  .btn-primary {
    background: #2563eb;
    color: #ffffff;
  }
  .btn-primary:hover {
    background: #1d4ed8;
  }

  .gist-error-msg {
    color: #ef4444;
    font-size: 0.75rem;
    margin: 0.5rem 0 0 0;
  }

  .gist-actions-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e2e8f0;
    font-size: 0.78rem;
  }
  :global(.mode-dark) .gist-actions-row,
  :global(.is-dark) .gist-actions-row {
    border-color: #27272a;
  }

  .text-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
  }
  .text-link:hover {
    text-decoration: underline;
  }

  .text-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.78rem;
    font-family: inherit;
    cursor: pointer;
    font-weight: 500;
  }
  .danger-link {
    color: #ef4444;
  }
  .danger-link:hover {
    text-decoration: underline;
  }

  .info-callout {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 0.85rem 1rem;
    font-size: 0.78rem;
    line-height: 1.5;
    color: #1e40af;
  }
  :global(.mode-dark) .info-callout,
  :global(.is-dark) .info-callout {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.25);
    color: #93c5fd;
  }

  .callout-title {
    font-weight: 700;
    margin-bottom: 0.35rem;
  }

  .callout-list {
    margin: 0 0 0.5rem 1.1rem;
    padding: 0;
  }
  .callout-list li {
    margin-bottom: 0.2rem;
  }

  .callout-guide-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.75rem;
    font-family: inherit;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    text-decoration: underline;
  }
  :global(.mode-dark) .callout-guide-btn,
  :global(.is-dark) .callout-guide-btn {
    color: #60a5fa;
  }
</style>
