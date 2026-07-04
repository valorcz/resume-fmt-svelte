import Ajv from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import { base } from '$app/paths';
import { themeRegistry, fallbackConfig } from '$lib/themeRegistry';

function mergeConfigs(serverConfig, userConfig) {
  if (!userConfig) return serverConfig;
  return {
    theme: userConfig.theme || serverConfig.theme,
    i18n: { ...serverConfig.i18n, ...userConfig.i18n },
    layout: userConfig.layout || serverConfig.layout
  };
}

export async function load({ fetch, url }) {
  const gistId = url.searchParams.get('gist');
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

    // 4. Resolve Theme Config
    const requestedTheme = userConfig?.theme || 'elegant-split';
    const serverConfig = themeRegistry[requestedTheme] || fallbackConfig;
    const finalConfig = mergeConfigs(serverConfig, userConfig);

    // 5. Schema Validation
    const schemaRes = await fetch('https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json');
    const schema = await schemaRes.json();
    delete schema.$schema; 

    const ajv = new Ajv({ strict: false, allErrors: true }); 
    addFormats(ajv);
    
    if (!ajv.validate(schema, resume)) {
      return { error: true, message: "Invalid JSON Resume schema.", details: ajv.errors };
    }

    return { resume, config: finalConfig, error: false };

  } catch (err) {
    return { error: true, message: err.message, details: [] };
  }
}
