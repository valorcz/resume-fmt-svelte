import yaml from 'js-yaml';

// 1. THIS IS THE MAGIC FIX: Tell Vite to find and bundle every style.css file!
// Using eager: true forces Vite to inject the CSS globally into your app.
import.meta.glob('/src/lib/themes/*/style.css', { eager: true });

// 2. Fetch the YAML configs
const rawConfigs = import.meta.glob('/src/lib/themes/*/config.yaml', { 
  query: '?raw', 
  import: 'default', 
  eager: true 
});

export const themeRegistry = {};

for (const path in rawConfigs) {
  const themeName = path.split('/')[4]; 
  themeRegistry[themeName] = yaml.load(rawConfigs[path]);
}

export const fallbackConfig = {
  theme: 'elegant-split',
  i18n: { work: "Experience", education: "Education", volunteer: "Volunteering", skills: "Skills" },
  layout: { main: ["work", "education", "volunteer"], sidebar: ["skills"] }
};