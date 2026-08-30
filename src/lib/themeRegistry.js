import yaml from 'js-yaml';

// Dynamic lazy glob loaders for configs and styles
const configLoaders = import.meta.glob('/src/lib/themes/*/config.yaml', { 
  query: '?raw', 
  import: 'default'
});

const styleLoaders = import.meta.glob('/src/lib/themes/*/style.css', { 
  query: '?raw', 
  import: 'default'
});

// Statically extract list of available theme names from discovered folders
export const availableThemes = Object.keys(configLoaders)
  .map(path => path.split('/')[4])
  .sort();

export const fallbackConfig = {
  theme: 'classic',
  i18n: { work: "Experience", education: "Education", volunteer: "Volunteering", skills: "Skills" },
  layout: { 
    main: ["work", "education", "volunteer", "projects", "publications", "skills", "languages", "certificates", "awards", "interests", "references"], 
    sidebar: [] 
  }
};

// In-memory cache for loaded themes so switching back is instant and zero-network
const themeCache = new Map();

/**
 * Dynamically loads a theme's config and CSS on demand.
 * Returns cached theme if already fetched.
 * 
 * @param {string} themeName 
 * @returns {Promise<{ name: string, config: object, css: string }>}
 */
export async function loadTheme(themeName) {
  const targetTheme = (themeName && availableThemes.includes(themeName)) 
    ? themeName 
    : (availableThemes.includes('classic') ? 'classic' : availableThemes[0] || 'classic');

  if (themeCache.has(targetTheme)) {
    return themeCache.get(targetTheme);
  }

  const configPath = `/src/lib/themes/${targetTheme}/config.yaml`;
  const stylePath = `/src/lib/themes/${targetTheme}/style.css`;

  const [rawConfig, rawCss] = await Promise.all([
    configLoaders[configPath] ? configLoaders[configPath]() : Promise.resolve(null),
    styleLoaders[stylePath] ? styleLoaders[stylePath]() : Promise.resolve('')
  ]);

  let config = fallbackConfig;
  if (rawConfig) {
    try {
      config = yaml.load(rawConfig) || fallbackConfig;
    } catch (err) {
      console.error(`Failed to parse config for theme "${targetTheme}":`, err);
    }
  }

  const themeData = {
    name: targetTheme,
    config: { ...config, theme: targetTheme },
    css: rawCss || ''
  };

  themeCache.set(targetTheme, themeData);
  return themeData;
}