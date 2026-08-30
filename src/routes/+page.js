import Ajv from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import { base } from '$app/paths';
import { loadTheme, fallbackConfig, availableThemes } from '$lib/themeRegistry';
import resumeSchemaRaw from '$lib/schema/resume.schema.json';

// Precompile schema validator locally
const schema = { ...resumeSchemaRaw };
delete schema.$schema;
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const validateResume = ajv.compile(schema);

function mergeConfigs(serverConfig, userConfig) {
  if (!userConfig) return serverConfig;
  return {
    theme: userConfig.theme || serverConfig.theme,
    i18n: { ...serverConfig.i18n, ...userConfig.i18n },
    layout: userConfig.layout || serverConfig.layout
  };
}

function decodeLayout(layoutStr) {
  if (!layoutStr || !layoutStr.includes('|')) return null;
  const [mainPart, sidePart] = layoutStr.split('|');
  return {
    main: mainPart ? mainPart.split(',').filter(Boolean) : [],
    sidebar: sidePart ? sidePart.split(',').filter(Boolean) : []
  };
}

export async function load({ fetch, url }) {
  const gistId = url.searchParams.get('gist');
  const urlTheme = url.searchParams.get('theme');
  const urlAccentRaw = url.searchParams.get('accent');
  const urlAccent = urlAccentRaw ? (urlAccentRaw.startsWith('#') ? urlAccentRaw : `#${urlAccentRaw}`) : null;
  const urlMode = url.searchParams.get('mode');
  const urlLayoutRaw = url.searchParams.get('layout');
  const urlLayout = urlLayoutRaw ? decodeLayout(urlLayoutRaw) : null;

  let resume = null;
  let userConfig = null;

  try {
    if (gistId) {
      const res = await fetch(`https://api.github.com/gists/${gistId}`);
      if (!res.ok) throw new Error("Gist not found");
      const gistData = await res.json();
      
      // 1. Fetch Resume
      const resumeFile = Object.keys(gistData.files).find(k => k.match(/resume\.(ya?ml|json)$/i)) || Object.keys(gistData.files)[0];
      const rawResume = gistData.files[resumeFile].content;
      resume = resumeFile.endsWith('.json') ? JSON.parse(rawResume) : yaml.load(rawResume);

      // 2. Fetch Optional Standalone Config (For strict JSON Resume users)
      const configFile = Object.keys(gistData.files).find(k => k.match(/config\.(ya?ml|json)$/i));
      if (configFile) {
        const rawConfig = gistData.files[configFile].content;
        userConfig = configFile.endsWith('.json') ? JSON.parse(rawConfig) : yaml.load(rawConfig);
      }
    } else {
      // Local fallback
      const res = await fetch(`${base}/resume.yaml`); 
      resume = yaml.load(await res.text());
    }

    // 3. Extract embedded _config (and strip it for validation)
    if (resume._config) {
      if (!userConfig) userConfig = resume._config;
      delete resume._config; 
    }

    // 4. Resolve Theme & Load dynamically (URL param takes precedence)
    const validTheme = (urlTheme && availableThemes.includes(urlTheme)) ? urlTheme : null;
    const requestedTheme = validTheme || userConfig?.theme || 'classic';
    const initialThemeData = await loadTheme(requestedTheme);
    const finalConfig = mergeConfigs(initialThemeData.config, userConfig);

    // 5. Schema Validation using precompiled local validator
    if (!validateResume(resume)) {
      return { error: true, message: "Invalid JSON Resume schema.", details: validateResume.errors };
    }

    return { 
      resume, 
      config: finalConfig, 
      initialTheme: initialThemeData.name,
      initialThemeCss: initialThemeData.css,
      initialThemeConfig: initialThemeData.config,
      urlParams: {
        theme: validTheme,
        accent: urlAccent,
        mode: ['system', 'light', 'dark'].includes(urlMode) ? urlMode : null,
        layout: urlLayout
      },
      availableThemes,
      error: false 
    };

  } catch (err) {
    return { error: true, message: err.message, details: [] };
  }
}

