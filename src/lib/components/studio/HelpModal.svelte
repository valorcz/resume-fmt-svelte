<script>
  import yaml from 'js-yaml';
  import { Marked } from 'marked';

  let {
    isOpen = false,
    initialTab = 'tour',
    colorMode = 'system',
    resume = null,
    onClose = () => {},
    onOpenGistTab = () => {}
  } = $props();

  let dontShowAgain = $state(true);

  // Derive active resume YAML reactively
  let currentResumeYaml = $derived.by(() => {
    if (!resume) return '';
    try {
      return yaml.dump(resume, { lineWidth: -1, noRefs: true });
    } catch {
      return '';
    }
  });

  // Helper to escape HTML attributes and text
  function escapeHtml(str = '') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Transform GitHub alert syntax into styled callout containers
  function renderAlerts(html) {
    return html.replace(
      /<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*(?:<br>)?\s*([\s\S]*?)<\/p>\s*([\s\S]*?)<\/blockquote>/gi,
      (match, type, firstLine, rest) => {
        const t = type.toLowerCase();
        const icons = { note: 'ℹ️', tip: '💡', warning: '⚠️', important: '📌', caution: '🚨' };
        return `<div class="callout-card callout-${t}">
          <div class="callout-header">
            <span class="callout-icon">${icons[t] || 'ℹ️'}</span>
            <span class="callout-title">${escapeHtml(type.toUpperCase())}</span>
          </div>
          <div class="callout-body">
            <p>${firstLine}</p>${rest}
          </div>
        </div>`;
      }
    );
  }

  // Custom marked renderer for interactive codeblocks and copy actions
  const customRenderer = {
    code({ text, lang = '' }) {
      const hasLiveYaml = lang.includes('with-live-yaml');
      const titleMatch = lang.match(/title="([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : '';
      const cleanLang = lang.split(/\s+/)[0] || 'text';

      return `
        <div class="interactive-codeblock" data-has-live-yaml="${hasLiveYaml ? 'true' : 'false'}" data-title="${escapeHtml(title)}">
          <div class="codeblock-header">
            <div class="codeblock-title-group">
              <span class="codeblock-icon">${cleanLang === 'prompt' ? '⚡' : '📄'}</span>
              <span class="codeblock-title">${escapeHtml(title || cleanLang.toUpperCase())}</span>
            </div>
            <div class="codeblock-actions">
              <button type="button" class="handbook-copy-btn" data-copy-type="raw">
                <span class="btn-icon">📋</span> Copy
              </button>
              ${hasLiveYaml ? `
                <button type="button" class="handbook-copy-btn handbook-copy-live-yaml-btn" data-copy-type="live-yaml">
                  <span class="btn-icon">◈</span> Copy Prompt + Live YAML
                </button>
              ` : ''}
            </div>
          </div>
          <pre><code class="language-${escapeHtml(cleanLang)}">${escapeHtml(text)}</code></pre>
        </div>
      `;
    }
  };

  // Parse frontmatter and render markdown
  function parseHandbookFile(filepath, rawContent) {
    const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    let frontmatter = {};
    let body = rawContent;

    if (match) {
      try {
        frontmatter = yaml.load(match[1]) || {};
        body = match[2];
      } catch (err) {
        console.warn(`Failed to parse frontmatter in ${filepath}:`, err);
      }
    }

    const id = frontmatter.id || filepath.split('/').pop().replace(/\.md$/, '').replace(/^\d+-/, '');
    const title = frontmatter.title || id;
    const icon = frontmatter.icon || '📄';
    const order = typeof frontmatter.order === 'number' ? frontmatter.order : 99;
    const badge = frontmatter.badge || null;
    const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : [];
    const summary = frontmatter.summary || '';

    const parser = new Marked();
    parser.use({ renderer: customRenderer });
    const rawHtml = parser.parse(body);
    const html = renderAlerts(rawHtml);

    return {
      id,
      title,
      icon,
      order,
      badge,
      aliases,
      summary,
      html
    };
  }

  // Vite dynamically glob-imports all markdown files from docs/handbook/ at compile time
  const rawHandbookModules = import.meta.glob('../../../../docs/handbook/*.md', {
    query: '?raw',
    eager: true,
    import: 'default'
  });

  const tabs = Object.entries(rawHandbookModules)
    .map(([path, content]) => parseHandbookFile(path, content))
    .sort((a, b) => a.order - b.order);

  // Tab resolution with alias matching
  function resolveTabId(tabIdOrAlias) {
    if (!tabIdOrAlias) return tabs[0]?.id || 'tour';
    const match = tabs.find(t => t.id === tabIdOrAlias || t.aliases.includes(tabIdOrAlias));
    return match ? match.id : (tabs[0]?.id || 'tour');
  }

  let activeTabId = $state(tabs[0]?.id || 'tour');

  $effect(() => {
    if (isOpen && initialTab) {
      activeTabId = resolveTabId(initialTab);
    }
  });

  let currentTab = $derived(tabs.find(t => t.id === activeTabId) || tabs[0]);

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

  // Event delegation click handler for interactive buttons inside markdown prose
  function handleProseClick(e) {
    const btn = e.target.closest('.handbook-copy-btn');
    if (!btn) return;

    const codeContainer = btn.closest('.interactive-codeblock');
    if (!codeContainer) return;

    const codeElement = codeContainer.querySelector('code');
    if (!codeElement) return;

    const rawCode = codeElement.textContent;
    const copyType = btn.dataset.copyType;

    let textToCopy = rawCode;

    if (copyType === 'live-yaml') {
      const yamlBody = currentResumeYaml || '# [NO ACTIVE RESUME LOADED IN STUDIO]';
      const placeholder = '# [PASTE YOUR RESUME YAML HERE OR LOAD A RESUME IN STUDIO TO AUTO-INJECT]';
      if (textToCopy.includes(placeholder)) {
        textToCopy = textToCopy.replace(placeholder, yamlBody);
      } else {
        textToCopy = `${textToCopy}\n\nRESUME YAML:\n\`\`\`yaml\n${yamlBody}\n\`\`\``;
      }
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<span class="btn-icon">✓</span> Copied!`;
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }
</script>

<svelte:window onkeydown={handleBackdropKeydown} />

{#if isOpen}
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="handbook-title">
    <button
      type="button"
      class="popover-backdrop"
      onclick={() => handleDismiss(false)}
      aria-label="Close Handbook"
    ></button>

    <div
      class="modal-dialog"
      class:mode-dark={colorMode === 'dark'}
      class:mode-light={colorMode === 'light'}
    >
      <!-- Modal Header -->
      <header class="modal-header">
        <div class="modal-header-content">
          <div class="modal-eyebrow-row">
            <span class="modal-eyebrow">Documentation & Best Practices</span>
            <span class="modal-version-badge">v1.2</span>
            <span class="modal-privacy-badge">🔒 100% Client-Side Privacy</span>
          </div>
          <h2 id="handbook-title" class="modal-title">Resume Studio Handbook</h2>
        </div>
        <button
          class="modal-close-btn"
          onclick={() => handleDismiss(false)}
          aria-label="Close Handbook"
        >
          ✕
        </button>
      </header>

      <!-- Main Layout: Sidebar Tabs + Scrollable Markdown Content -->
      <div class="modal-layout">
        <!-- Sidebar Navigation -->
        <nav class="handbook-sidebar" aria-label="Handbook Navigation">
          {#each tabs as tab (tab.id)}
            <button
              type="button"
              id="tab-{tab.id}"
              aria-current={activeTabId === tab.id ? 'page' : undefined}
              class="sidebar-tab-btn"
              class:active={activeTabId === tab.id}
              onclick={() => activeTabId = tab.id}
            >
              <span class="tab-icon">{tab.icon}</span>
              <span class="tab-label">{tab.title}</span>
              {#if tab.badge}
                <span class="tab-badge">{tab.badge}</span>
              {/if}
            </button>
          {/each}
        </nav>

        <!-- Markdown Body -->
        <main
          class="handbook-content-scroll"
          id="panel-{currentTab?.id}"
        >
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <article
            class="handbook-prose"
            onclick={handleProseClick}
          >
            {@html currentTab?.html || ''}
          </article>
        </main>
      </div>

      <!-- Footer Bar -->
      <footer class="modal-footer">
        <label class="remember-checkbox">
          <input type="checkbox" bind:checked={dontShowAgain} />
          <span>Don't show this handbook automatically on startup</span>
        </label>
        <div class="footer-buttons">
          <button class="btn btn-secondary" onclick={() => handleDismiss(true)}>
            Open Source / Gist Tab
          </button>
          <button class="btn btn-primary" onclick={() => handleDismiss(false)}>
            Close Handbook
          </button>
        </div>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  }

  .popover-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(4px);
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    cursor: default;
  }

  .modal-dialog {
    position: relative;
    z-index: 10000;
    width: 900px;
    max-width: 96vw;
    height: 84vh;
    max-height: 820px;
    background: #ffffff;
    color: #18181b;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .modal-dialog.mode-dark,
  :global(.mode-dark) .modal-dialog,
  :global(.is-dark) .modal-dialog,
  :global(body.app-dark) .modal-dialog {
    background: #181a20;
    color: #f4f4f5;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  /* Header */
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1rem 1.4rem;
    border-bottom: 1px solid #e4e4e7;
    background: #ffffff;
  }

  .modal-dialog.mode-dark .modal-header,
  :global(.mode-dark) .modal-header,
  :global(.is-dark) .modal-header,
  :global(body.app-dark) .modal-header {
    background: #181a20;
    border-bottom-color: #2e3039;
  }

  .modal-eyebrow-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .modal-eyebrow {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #2563eb;
  }

  .modal-dialog.mode-dark .modal-eyebrow,
  :global(.mode-dark) .modal-eyebrow,
  :global(.is-dark) .modal-eyebrow,
  :global(body.app-dark) .modal-eyebrow {
    color: #60a5fa;
  }

  .modal-version-badge,
  .modal-privacy-badge {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: #f4f4f5;
    color: #52525b;
  }

  .modal-privacy-badge {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }

  .modal-dialog.mode-dark .modal-version-badge,
  :global(.mode-dark) .modal-version-badge,
  :global(.is-dark) .modal-version-badge,
  :global(body.app-dark) .modal-version-badge {
    background: #272a34;
    color: #a1a1aa;
  }

  .modal-dialog.mode-dark .modal-privacy-badge,
  :global(.mode-dark) .modal-privacy-badge,
  :global(.is-dark) .modal-privacy-badge,
  :global(body.app-dark) .modal-privacy-badge {
    background: #064e3b;
    color: #6ee7b7;
    border-color: #047857;
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .modal-close-btn {
    background: transparent;
    border: none;
    font-size: 1.15rem;
    color: #71717a;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .modal-close-btn:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .modal-dialog.mode-dark .modal-close-btn:hover,
  :global(.mode-dark) .modal-close-btn:hover,
  :global(.is-dark) .modal-close-btn:hover,
  :global(body.app-dark) .modal-close-btn:hover {
    background: #272a34;
    color: #ffffff;
  }

  /* Two-column Layout */
  .modal-layout {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* Sidebar Navigation */
  .handbook-sidebar {
    width: 230px;
    flex-shrink: 0;
    border-right: 1px solid #e4e4e7;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    padding: 0.75rem 0.65rem;
    gap: 0.35rem;
    overflow-y: auto;
  }

  .modal-dialog.mode-dark .handbook-sidebar,
  :global(.mode-dark) .handbook-sidebar,
  :global(.is-dark) .handbook-sidebar,
  :global(body.app-dark) .handbook-sidebar {
    background: #14161b;
    border-right-color: #2e3039;
  }

  .sidebar-tab-btn {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #52525b;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .modal-dialog.mode-dark .sidebar-tab-btn,
  :global(.mode-dark) .sidebar-tab-btn,
  :global(.is-dark) .sidebar-tab-btn,
  :global(body.app-dark) .sidebar-tab-btn {
    color: #a1a1aa;
  }

  .sidebar-tab-btn:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .modal-dialog.mode-dark .sidebar-tab-btn:hover,
  :global(.mode-dark) .sidebar-tab-btn:hover,
  :global(.is-dark) .sidebar-tab-btn:hover,
  :global(body.app-dark) .sidebar-tab-btn:hover {
    background: #22252e;
    color: #f4f4f5;
  }

  .sidebar-tab-btn.active {
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 600;
  }

  .modal-dialog.mode-dark .sidebar-tab-btn.active,
  :global(.mode-dark) .sidebar-tab-btn.active,
  :global(.is-dark) .sidebar-tab-btn.active,
  :global(body.app-dark) .sidebar-tab-btn.active {
    background: #1e293b;
    color: #60a5fa;
  }

  .tab-icon {
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .tab-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-badge {
    font-size: 0.62rem;
    font-weight: 700;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    background: #dbeafe;
    color: #1e40af;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .modal-dialog.mode-dark .tab-badge,
  :global(.mode-dark) .tab-badge,
  :global(.is-dark) .tab-badge,
  :global(body.app-dark) .tab-badge {
    background: #1e3a8a;
    color: #93c5fd;
  }

  /* Content Scroll Area */
  .handbook-content-scroll {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 1.5rem 1.85rem;
    background: #ffffff;
  }

  .modal-dialog.mode-dark .handbook-content-scroll,
  :global(.mode-dark) .handbook-content-scroll,
  :global(.is-dark) .handbook-content-scroll,
  :global(body.app-dark) .handbook-content-scroll {
    background: #181a20;
  }

  /* Handbook Prose Styles */
  .handbook-prose {
    font-size: 0.86rem;
    line-height: 1.65;
    color: #374151;
  }

  .modal-dialog.mode-dark .handbook-prose,
  :global(.mode-dark) .handbook-prose,
  :global(.is-dark) .handbook-prose,
  :global(body.app-dark) .handbook-prose {
    color: #d1d5db;
  }

  .handbook-prose :global(h1) {
    font-size: 1.45rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 0.75rem;
    letter-spacing: -0.015em;
    color: #111827;
  }

  .modal-dialog.mode-dark .handbook-prose :global(h1),
  :global(.mode-dark) .handbook-prose :global(h1),
  :global(.is-dark) .handbook-prose :global(h1),
  :global(body.app-dark) .handbook-prose :global(h1) {
    color: #f9fafb;
  }

  .handbook-prose :global(h2) {
    font-size: 1.15rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 0.65rem;
    letter-spacing: -0.01em;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.4rem;
  }

  .modal-dialog.mode-dark .handbook-prose :global(h2),
  :global(.mode-dark) .handbook-prose :global(h2),
  :global(.is-dark) .handbook-prose :global(h2),
  :global(body.app-dark) .handbook-prose :global(h2) {
    color: #f9fafb;
    border-bottom-color: #2e3039;
  }

  .handbook-prose :global(h3) {
    font-size: 0.98rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.45rem;
    color: #1f2937;
  }

  .modal-dialog.mode-dark .handbook-prose :global(h3),
  :global(.mode-dark) .handbook-prose :global(h3),
  :global(.is-dark) .handbook-prose :global(h3),
  :global(body.app-dark) .handbook-prose :global(h3) {
    color: #f3f4f6;
  }

  .handbook-prose :global(p) {
    margin-top: 0;
    margin-bottom: 0.85rem;
  }

  .handbook-prose :global(ul),
  .handbook-prose :global(ol) {
    margin-top: 0;
    margin-bottom: 0.95rem;
    padding-left: 1.35rem;
  }

  .handbook-prose :global(li) {
    margin-bottom: 0.35rem;
  }

  .handbook-prose :global(hr) {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 1.4rem 0;
  }

  .modal-dialog.mode-dark .handbook-prose :global(hr),
  :global(.mode-dark) .handbook-prose :global(hr),
  :global(.is-dark) .handbook-prose :global(hr),
  :global(body.app-dark) .handbook-prose :global(hr) {
    border-top-color: #2e3039;
  }

  .handbook-prose :global(a) {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .modal-dialog.mode-dark .handbook-prose :global(a),
  :global(.mode-dark) .handbook-prose :global(a),
  :global(.is-dark) .handbook-prose :global(a),
  :global(body.app-dark) .handbook-prose :global(a) {
    color: #60a5fa;
  }

  .handbook-prose :global(code:not(pre code)) {
    background: #f3f4f6;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    font-size: 0.78rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: #b91c1c;
  }

  .modal-dialog.mode-dark .handbook-prose :global(code:not(pre code)),
  :global(.mode-dark) .handbook-prose :global(code:not(pre code)),
  :global(.is-dark) .handbook-prose :global(code:not(pre code)),
  :global(body.app-dark) .handbook-prose :global(code:not(pre code)) {
    background: #272a34;
    color: #f87171;
  }

  .handbook-prose :global(kbd) {
    display: inline-block;
    padding: 0.15rem 0.4rem;
    font-size: 0.72rem;
    font-family: inherit;
    line-height: 1;
    color: #374151;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-shadow: 0 1px 0 #9ca3af;
  }

  .modal-dialog.mode-dark .handbook-prose :global(kbd),
  :global(.mode-dark) .handbook-prose :global(kbd),
  :global(.is-dark) .handbook-prose :global(kbd),
  :global(body.app-dark) .handbook-prose :global(kbd) {
    background: #22252e;
    color: #e5e7eb;
    border-color: #3f3f46;
    box-shadow: 0 1px 0 #18181b;
  }

  /* Table styling */
  .handbook-prose :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.1rem 0;
    font-size: 0.8rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }

  .modal-dialog.mode-dark .handbook-prose :global(table),
  :global(.mode-dark) .handbook-prose :global(table),
  :global(.is-dark) .handbook-prose :global(table),
  :global(body.app-dark) .handbook-prose :global(table) {
    border-color: #2e3039;
  }

  .handbook-prose :global(th) {
    background: #f9fafb;
    font-weight: 600;
    text-align: left;
    padding: 0.55rem 0.85rem;
    border-bottom: 1px solid #e5e7eb;
    color: #111827;
  }

  .modal-dialog.mode-dark .handbook-prose :global(th),
  :global(.mode-dark) .handbook-prose :global(th),
  :global(.is-dark) .handbook-prose :global(th),
  :global(body.app-dark) .handbook-prose :global(th) {
    background: #1f222b;
    border-bottom-color: #2e3039;
    color: #f3f4f6;
  }

  .handbook-prose :global(td) {
    padding: 0.55rem 0.85rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .modal-dialog.mode-dark .handbook-prose :global(td),
  :global(.mode-dark) .handbook-prose :global(td),
  :global(.is-dark) .handbook-prose :global(td),
  :global(body.app-dark) .handbook-prose :global(td) {
    border-bottom-color: #272a34;
  }

  /* Callout Cards */
  .handbook-prose :global(.callout-card) {
    border-radius: 8px;
    padding: 0.85rem 1.15rem;
    margin: 1.1rem 0;
    border: 1px solid transparent;
    font-size: 0.84rem;
  }

  .handbook-prose :global(.callout-card p) {
    margin-bottom: 0.45rem;
  }

  .handbook-prose :global(.callout-card p:last-child) {
    margin-bottom: 0;
  }

  .handbook-prose :global(.callout-header) {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 700;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.45rem;
  }

  .handbook-prose :global(.callout-note) {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e3a8a;
  }

  .modal-dialog.mode-dark .handbook-prose :global(.callout-note),
  :global(.mode-dark) .handbook-prose :global(.callout-note),
  :global(.is-dark) .handbook-prose :global(.callout-note),
  :global(body.app-dark) .handbook-prose :global(.callout-note) {
    background: rgba(30, 58, 138, 0.25);
    border-color: #1e40af;
    color: #bfdbfe;
  }

  .handbook-prose :global(.callout-tip) {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #14532d;
  }

  .modal-dialog.mode-dark .handbook-prose :global(.callout-tip),
  :global(.mode-dark) .handbook-prose :global(.callout-tip),
  :global(.is-dark) .handbook-prose :global(.callout-tip),
  :global(body.app-dark) .handbook-prose :global(.callout-tip) {
    background: rgba(20, 83, 45, 0.25);
    border-color: #15803d;
    color: #bbf7d0;
  }

  .handbook-prose :global(.callout-warning) {
    background: #fffbeb;
    border-color: #fde68a;
    color: #78350f;
  }

  .modal-dialog.mode-dark .handbook-prose :global(.callout-warning),
  :global(.mode-dark) .handbook-prose :global(.callout-warning),
  :global(.is-dark) .handbook-prose :global(.callout-warning),
  :global(body.app-dark) .handbook-prose :global(.callout-warning) {
    background: rgba(120, 53, 15, 0.25);
    border-color: #b45309;
    color: #fef3c7;
  }

  /* Interactive Code Blocks */
  .handbook-prose :global(.interactive-codeblock) {
    border: 1px solid #334155;
    border-radius: 8px;
    overflow: hidden;
    margin: 1.25rem 0;
    background: #0f172a;
  }

  .handbook-prose :global(.codeblock-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.45rem 0.85rem;
    background: #1e293b;
    border-bottom: 1px solid #334155;
  }

  .handbook-prose :global(.codeblock-title-group) {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.74rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  .handbook-prose :global(.codeblock-actions) {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .handbook-prose :global(.handbook-copy-btn) {
    padding: 0.28rem 0.65rem;
    border-radius: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #475569;
    background: #334155;
    color: #f1f5f9;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-family: inherit;
    transition: all 0.15s ease;
  }

  .handbook-prose :global(.handbook-copy-btn:hover) {
    background: #475569;
    color: #ffffff;
  }

  .handbook-prose :global(.handbook-copy-live-yaml-btn) {
    background: #2563eb;
    border-color: #3b82f6;
    color: #ffffff;
  }

  .handbook-prose :global(.handbook-copy-live-yaml-btn:hover) {
    background: #1d4ed8;
  }

  .handbook-prose :global(.handbook-copy-btn.copied) {
    background: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
  }

  .handbook-prose :global(pre) {
    margin: 0;
    padding: 0.85rem 1rem;
    max-height: 380px;
    overflow-y: auto;
    font-size: 0.75rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1.55;
    color: #e2e8f0;
    background: #0f172a;
  }

  /* Modal Footer */
  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1.4rem;
    border-top: 1px solid #e4e4e7;
    background: #f8fafc;
  }

  .modal-dialog.mode-dark .modal-footer,
  :global(.mode-dark) .modal-footer,
  :global(.is-dark) .modal-footer,
  :global(body.app-dark) .modal-footer {
    background: #14161b;
    border-top-color: #2e3039;
  }

  .remember-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.76rem;
    color: #71717a;
    cursor: pointer;
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .btn {
    padding: 0.5rem 0.95rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }

  .btn-secondary {
    background: #ffffff;
    border: 1px solid #d4d4d8;
    color: #3f3f46;
  }

  .btn-secondary:hover {
    background: #f4f4f5;
  }

  .modal-dialog.mode-dark .btn-secondary,
  :global(.mode-dark) .btn-secondary,
  :global(.is-dark) .btn-secondary,
  :global(body.app-dark) .btn-secondary {
    background: #272a34;
    border-color: #3f3f46;
    color: #e4e4e7;
  }

  .modal-dialog.mode-dark .btn-secondary:hover,
  :global(.mode-dark) .btn-secondary:hover,
  :global(.is-dark) .btn-secondary:hover,
  :global(body.app-dark) .btn-secondary:hover {
    background: #323642;
  }

  .btn-primary {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  /* Responsive Mobile Adaptation */
  @media (max-width: 768px) {
    .modal-dialog {
      width: 96%;
      height: 92vh;
      max-height: none;
      border-radius: 10px;
    }

    .modal-layout {
      flex-direction: column;
    }

    .handbook-sidebar {
      width: 100%;
      flex-direction: row;
      overflow-x: auto;
      padding: 0.5rem 0.65rem;
      border-right: none;
      border-bottom: 1px solid #e4e4e7;
    }

    .sidebar-tab-btn {
      white-space: nowrap;
      padding: 0.4rem 0.65rem;
      font-size: 0.74rem;
    }

    .handbook-content-scroll {
      padding: 1rem 1.15rem;
    }

    .modal-footer {
      flex-direction: column;
      gap: 0.75rem;
      align-items: stretch;
    }

    .footer-buttons {
      justify-content: flex-end;
    }
  }
</style>
