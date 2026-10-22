/**
 * Studio utility functions, constants, and helper mappings
 */

export const COLOR_PRESETS = [
  { name: 'Cobalt Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Laser Magenta', hex: '#ff0055' },
  { name: 'Sunset Amber', hex: '#d97706' },
  { name: 'Royal Indigo', hex: '#4f46e5' },
  { name: 'Crimson Ruby', hex: '#dc2626' },
  { name: 'Petrol Teal', hex: '#0d9488' },
  { name: 'Amethyst Violet', hex: '#7c3aed' },
  { name: 'Slate Charcoal', hex: '#334155' },
  { name: 'Steel Sky', hex: '#0284c7' }
];

export const ALL_SECTION_KEYS = [
  'work', 'volunteer', 'projects', 'education', 
  'skills', 'languages', 'certificates', 'awards', 
  'publications', 'interests', 'references'
];

export const THEME_CATEGORIES = [
  { id: 'all', label: 'All Themes' },
  { id: 'classic', label: 'Executive & Classic' },
  { id: 'modern', label: 'Modern & Clean' },
  { id: 'split', label: 'Split Column' },
  { id: 'tech', label: 'Tech & Retro' }
];

export const THEME_CATEGORY_MAP = {
  'classic': 'classic',
  'europass': 'classic',
  'executive-baseline': 'classic',
  'executive-slate': 'classic',
  'gov': 'classic',
  'modern-timeline': 'modern',
  'editorial': 'modern',
  'tailwind-blueprint': 'modern',
  'the-verge': 'modern',
  'bio-vision': 'split',
  'elegant-split': 'split',
  'noir-city': 'split',
  'vibe-glow': 'split',
  'terminal': 'tech',
  'cyber-script': 'tech',
  '8bit-demo': 'tech',
  '16bit-amiga': 'tech'
};

export function formatName(slug) {
  if (!slug) return '';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function extractGistId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/gist\.github(?:usercontent)?\.com\/([^\/]+\/)?([a-f0-9]+)/i);
  if (urlMatch && urlMatch[2]) {
    return urlMatch[2];
  }
  const idMatch = trimmed.match(/^[a-f0-9]+$/i);
  if (idMatch) {
    return trimmed;
  }
  const clean = trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const segments = clean.split('/');
  const last = segments[segments.length - 1];
  return last || null;
}
