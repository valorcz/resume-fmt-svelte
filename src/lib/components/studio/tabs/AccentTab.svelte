<script>
  import { COLOR_PRESETS } from '../studioUtils.js';

  let {
    customAccent = $bindable(null),
    onResetAccent = () => {}
  } = $props();

  let customColorInput = $state(customAccent || '#2563eb');

  $effect(() => {
    if (customAccent) {
      customColorInput = customAccent;
    }
  });

  function selectColor(hex) {
    customAccent = hex;
    customColorInput = hex;
  }
</script>

<div class="section-group">
  <div class="header-flex">
    <h3 class="group-title">Accent Color</h3>
    {#if customAccent}
      <button class="reset-link" onclick={onResetAccent}>Reset to Theme Default</button>
    {/if}
  </div>
  <p class="group-desc">
    Overrides headings, timeline dots, badges, and icon highlights across all themes.
  </p>

  <div class="palette-grid">
    {#each COLOR_PRESETS as color}
      <button 
        class="swatch-btn" 
        class:active={customAccent === color.hex}
        style="--swatch-color: {color.hex}"
        onclick={() => selectColor(color.hex)}
        title={color.name}
        aria-label="Select {color.name} accent"
      >
        <span class="swatch-circle"></span>
        <span class="swatch-name">{color.name}</span>
      </button>
    {/each}
  </div>

  <div class="custom-color-row">
    <label class="color-picker-label" for="accent-picker">Custom HEX:</label>
    <div class="custom-color-inputs">
      <input 
        id="accent-picker"
        name="accent_picker"
        type="color" 
        class="native-color-picker" 
        bind:value={customColorInput} 
        oninput={(e) => selectColor(e.currentTarget.value)}
        aria-label="Custom color picker"
      />
      <input 
        id="accent-hex-input"
        name="accent_hex"
        type="text" 
        class="hex-text-input" 
        bind:value={customColorInput}
        onchange={(e) => selectColor(e.currentTarget.value)}
        placeholder="#2563eb"
        maxlength="7"
        autocomplete="off"
        aria-label="Hex color value"
      />
    </div>
  </div>
</div>

<style>
  .section-group {
    margin-bottom: 2rem;
  }

  .header-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.35rem;
  }

  .group-title {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
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

  .reset-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.72rem;
    font-weight: 600;
    color: #2563eb;
    cursor: pointer;
    text-decoration: underline;
    font-family: inherit;
  }
  :global(.mode-dark) .reset-link,
  :global(.is-dark) .reset-link {
    color: #60a5fa;
  }

  .palette-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .swatch-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.65rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    color: #1e293b;
    transition: all 0.15s ease;
  }
  :global(.mode-dark) .swatch-btn,
  :global(.is-dark) .swatch-btn {
    background: #181a20;
    border-color: #27272a;
    color: #f1f5f9;
  }

  .swatch-btn:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
  :global(.mode-dark) .swatch-btn:hover,
  :global(.is-dark) .swatch-btn:hover {
    background: #20222a;
    border-color: #3f3f46;
  }

  .swatch-btn.active {
    border-color: var(--swatch-color);
    background: #f0fdf4;
    box-shadow: 0 0 0 1px var(--swatch-color);
  }
  :global(.mode-dark) .swatch-btn.active,
  :global(.is-dark) .swatch-btn.active {
    background: rgba(255, 255, 255, 0.08);
  }

  .swatch-circle {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: var(--swatch-color);
    flex-shrink: 0;
  }

  .swatch-name {
    font-size: 0.76rem;
    font-weight: 600;
    color: #0f172a;
  }
  :global(.mode-dark) .swatch-name,
  :global(.is-dark) .swatch-name {
    color: #f8fafc;
  }

  .custom-color-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.85rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
  :global(.mode-dark) .custom-color-row,
  :global(.is-dark) .custom-color-row {
    background: #181a20;
    border-color: #27272a;
  }

  .color-picker-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: #1e293b;
  }
  :global(.mode-dark) .color-picker-label,
  :global(.is-dark) .color-picker-label {
    color: #e2e8f0;
  }

  .custom-color-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .native-color-picker {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    background: none;
  }
  :global(.mode-dark) .native-color-picker,
  :global(.is-dark) .native-color-picker {
    border-color: #3f3f46;
  }

  .hex-text-input {
    width: 80px;
    padding: 0.35rem 0.5rem;
    font-size: 0.78rem;
    font-family: ui-monospace, monospace;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #ffffff;
    color: inherit;
    outline: none;
    text-transform: uppercase;
  }
  :global(.mode-dark) .hex-text-input,
  :global(.is-dark) .hex-text-input {
    background: #27272a;
    border-color: #3f3f46;
    color: #ffffff;
  }
  .hex-text-input:focus {
    border-color: #2563eb;
  }
</style>
