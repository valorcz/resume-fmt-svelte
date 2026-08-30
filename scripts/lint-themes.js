#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEMES_DIR = path.resolve(__dirname, '../src/lib/themes');

const VALID_SECTIONS = new Set([
  'work',
  'education',
  'volunteer',
  'projects',
  'publications',
  'skills',
  'languages',
  'certificates',
  'awards',
  'interests',
  'references'
]);

const RECOMMENDED_TOKENS = [
  '--bg',
  '--ink',
  '--accent',
  '--border',
  '--font-body',
  '--font-heading'
];

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

function log(msg) {
  console.log(msg);
}

function lintTheme(themeName, themeDir) {
  const errors = [];
  const warnings = [];

  const configPath = path.join(themeDir, 'config.yaml');
  const stylePath = path.join(themeDir, 'style.css');

  // 1. Check file existence
  if (!fs.existsSync(configPath)) {
    errors.push('Missing "config.yaml" file.');
  }
  if (!fs.existsSync(stylePath)) {
    errors.push('Missing "style.css" file.');
  }

  let config = null;

  // 2. Validate config.yaml
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      config = yaml.load(raw);

      if (!config || typeof config !== 'object') {
        errors.push('config.yaml is empty or invalid YAML.');
      } else {
        if (!config.theme) {
          warnings.push(`config.yaml missing "theme" field (expected "${themeName}").`);
        } else if (config.theme !== themeName) {
          warnings.push(`config.yaml theme field "${config.theme}" does not match folder name "${themeName}".`);
        }

        if (!config.layout || typeof config.layout !== 'object') {
          errors.push('config.yaml missing "layout" object with "main" array.');
        } else {
          if (!Array.isArray(config.layout.main)) {
            errors.push('"layout.main" must be an array of section names.');
          } else {
            for (const section of config.layout.main) {
              if (!VALID_SECTIONS.has(section)) {
                warnings.push(`Unknown section "${section}" in layout.main.`);
              }
            }
          }

          if (config.layout.sidebar !== undefined) {
            if (!Array.isArray(config.layout.sidebar)) {
              errors.push('"layout.sidebar" must be an array of section names.');
            } else {
              for (const section of config.layout.sidebar) {
                if (!VALID_SECTIONS.has(section)) {
                  warnings.push(`Unknown section "${section}" in layout.sidebar.`);
                }
              }
            }
          }
        }

        if (config.i18n && typeof config.i18n !== 'object') {
          warnings.push('"i18n" field should be an object mapping section IDs to labels.');
        }
      }
    } catch (e) {
      errors.push(`Failed to parse config.yaml: ${e.message}`);
    }
  }

  // 3. Validate style.css
  if (fs.existsSync(stylePath)) {
    const css = fs.readFileSync(stylePath, 'utf8');
    const themeClass = `.theme-${themeName}`;

    // Check 1: Root theme class declaration
    if (!css.includes(themeClass)) {
      errors.push(`style.css does not declare root class "${themeClass}".`);
    }

    // Check 2: Check for design tokens
    const missingTokens = RECOMMENDED_TOKENS.filter(token => !css.includes(token));
    if (missingTokens.length > 2) {
      warnings.push(`Missing recommended design tokens: ${missingTokens.join(', ')}`);
    }

    const lines = css.split('\n');
    let inPrintBlock = false;
    let braceDepth = 0;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Track @media print
      if (trimmed.startsWith('@media print')) {
        inPrintBlock = true;
      }

      // Track braces
      if (trimmed.includes('{')) braceDepth++;
      if (trimmed.includes('}')) {
        braceDepth = Math.max(0, braceDepth - 1);
        if (braceDepth === 0) {
          inPrintBlock = false;
        }
      }

      // Check 3: Non-print !important usage (flag specificity leaks)
      if (!inPrintBlock && trimmed.includes('!important') && !trimmed.startsWith('/*')) {
        warnings.push(`Line ${lineNum}: "!important" detected outside @media print. Use design tokens instead.`);
      }

      // Check 4: Avoid-page breaks on entire item-card in print (causes massive page gaps)
      if (inPrintBlock && (trimmed.includes('break-inside: avoid') || trimmed.includes('page-break-inside: avoid'))) {
        const prevLines = lines.slice(Math.max(0, idx - 5), idx + 1).join(' ');
        if (prevLines.includes('.item-card') && !prevLines.includes('.item-header')) {
          warnings.push(`Line ${lineNum}: Dangerous "break-inside: avoid" on .item-card in print (can cause blank overflow pages).`);
        }
      }

      // Check 5: Unscoped selectors
      if (
        trimmed.startsWith('.cv-') &&
        !trimmed.startsWith('.cv-wrapper') &&
        !trimmed.includes(themeClass) &&
        !trimmed.startsWith('/*')
      ) {
        warnings.push(`Line ${lineNum}: Potentially unscoped selector "${trimmed.split('{')[0].trim()}". Prefix with "${themeClass}".`);
      }
    });

    // Check 6: Check if print styles exist
    if (!css.includes('@media print')) {
      errors.push('Missing @media print rules in style.css. All themes must define print optimization.');
    }

    // Check 7: Check for brand icon font-family overrides (Font Awesome Free vs Brands)
    if (css.includes('contact-profile-github') && !css.includes('Font Awesome 6 Brands') && !css.includes('content: "GitHub"')) {
      warnings.push('GitHub brand icon declared without "Font Awesome 6 Brands" font-family.');
    }
  }

  return { name: themeName, errors, warnings };
}

function run() {
  log(`\n${ANSI.bold}${ANSI.cyan}=== Resume Theme Linter ===${ANSI.reset}\n`);

  if (!fs.existsSync(THEMES_DIR)) {
    log(`${ANSI.red}Error: Themes directory not found at ${THEMES_DIR}${ANSI.reset}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
  const themeDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const dir of themeDirs) {
    const res = lintTheme(dir.name, path.join(THEMES_DIR, dir.name));
    results.push(res);
    totalErrors += res.errors.length;
    totalWarnings += res.warnings.length;
  }

  // Print results
  for (const r of results) {
    const status = r.errors.length > 0 
      ? `${ANSI.red}❌ FAIL${ANSI.reset}` 
      : r.warnings.length > 0 
        ? `${ANSI.yellow}⚠️  WARN${ANSI.reset}` 
        : `${ANSI.green}✅ PASS${ANSI.reset}`;

    log(`${status} ${ANSI.bold}${r.name}${ANSI.reset}`);

    r.errors.forEach(err => log(`   ${ANSI.red}✖ ${err}${ANSI.reset}`));
    r.warnings.forEach(warn => log(`   ${ANSI.yellow}▲ ${warn}${ANSI.reset}`));
  }

  log(`\n${ANSI.gray}--------------------------------------------------${ANSI.reset}`);
  log(`Total themes checked: ${themeDirs.length}`);
  log(`Errors: ${totalErrors > 0 ? ANSI.red + totalErrors + ANSI.reset : ANSI.green + '0' + ANSI.reset}`);
  log(`Warnings: ${totalWarnings > 0 ? ANSI.yellow + totalWarnings + ANSI.reset : ANSI.green + '0' + ANSI.reset}\n`);

  if (totalErrors > 0) {
    log(`${ANSI.red}${ANSI.bold}Theme linting failed with errors.${ANSI.reset}\n`);
    process.exit(1);
  } else {
    log(`${ANSI.green}${ANSI.bold}All themes validated successfully!${ANSI.reset}\n`);
    process.exit(0);
  }
}

run();
